import { useMemo, useState } from "react";
import { ArrowDownUp, Boxes, Eye, EyeOff, FolderTree, Pencil, Plus, ShoppingCart, SlidersHorizontal, Trash2, UsersRound, Warehouse } from "lucide-react";
import type { Category, Customer, Order, OrderStatus, Product } from "../data";
import { fmtDate, fmtDateTime, fmtMoney, newId, productStockState, useAdmin } from "../store";
import { RowMenu } from "../RowMenu";
import {
  ActivityItem, Button, ConfirmDialog, DataTable, DemoTag, EmptyState, Field, FilterBar, Forbidden, Modal, PageHeader, Panel,
  SearchInput, Select, StatCard, StatusBadge, Tabs, inputCls, type Column,
} from "../ui";
import { cn } from "../../utils/cn";

/* ─────────── Categories ─────────── */

export function CategoriesPage() {
  const { data, mutate, can, toast } = useAdmin();
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [error, setError] = useState("");
  if (!can("categories.view")) return <Forbidden permission="categories.view" />;
  const count = (id: string) => data.products.filter((p) => p.category === id).length;

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) { setError("Category name is required."); return; }
    const exists = data.categories.some((c) => c.id === editing.id);
    mutate("categories", (l) => exists ? l.map((c) => c.id === editing.id ? editing : c) : [...l, editing], { action: exists ? "Updated category" : "Created category", module: "Categories", target: editing.name });
    toast(exists ? "Category updated." : "Category created.");
    setEditing(null);
  };

  const columns: Column<Category>[] = [
    { key: "name", header: "Category", render: (c) => <div><div className="flex items-center gap-2 font-semibold">{c.name}{c.demo && <DemoTag />}</div><div className="mt-0.5 text-xs text-steel">{c.description || "No description"}</div></div> },
    { key: "products", header: "Products", render: (c) => <span className="tabular-nums">{count(c.id)}</span> },
    { key: "id", header: "Identifier", render: (c) => <span className="font-mono text-xs text-steel">{c.id}</span> },
  ];

  return (
    <>
      <PageHeader eyebrow="Commerce" title="Categories" description="Organize products into catalog categories."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Categories" }]}
        actions={can("categories.create") && <Button variant="primary" icon={Plus} onClick={() => { setError(""); setEditing({ id: newId("cat"), name: "", description: "", demo: false }); }}>New category</Button>} />
      <Panel padded={false}>
        <DataTable caption="Categories" columns={columns} rows={data.categories} getKey={(c) => c.id}
          empty={<EmptyState icon={FolderTree} title="No categories yet." description="Create a category to organize products." />}
          rowActions={(c) => <RowMenu actions={[
            { label: "Edit", icon: Pencil, onClick: () => { setError(""); setEditing({ ...c }); }, hidden: !can("categories.edit") },
            { label: "Delete", icon: Trash2, danger: true, onClick: () => count(c.id) ? toast(`Move the ${count(c.id)} product(s) out of “${c.name}” before deleting it.`, "error") : setToDelete(c), hidden: !can("categories.delete") },
          ]} />} />
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && data.categories.some((c) => c.id === editing.id) ? "Edit category" : "New category"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save}>Save category</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Name" htmlFor="cat-name" error={error}><input id="cat-name" autoFocus className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Description" htmlFor="cat-desc"><textarea id="cat-desc" rows={3} className={cn(inputCls, "h-auto py-2")} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete category" message={`Are you sure you want to delete the category “${toDelete?.name}”?`}
        onConfirm={() => { if (!toDelete) return; mutate("categories", (l) => l.filter((c) => c.id !== toDelete.id), { action: "Deleted category", module: "Categories", target: toDelete.name }); toast("Category deleted."); }} />
    </>
  );
}

/* ─────────── Inventory ─────────── */

const movementTypes = ["Stock in", "Stock out", "Correction"];

export function InventoryPage() {
  const { data, mutate, notify, can, toast, navigate } = useAdmin();
  const [q, setQ] = useState("");
  const [state, setState] = useState("all");
  const [adjusting, setAdjusting] = useState(false);
  const [form, setForm] = useState({ productId: "", quantity: "", type: "Stock in", reason: "", location: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const tracked = data.products.filter((p) => p.stock !== null);
  const rows = useMemo(() => tracked.filter((p) => (!q || `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) && (state === "all" || productStockState(p) === state)), [tracked, q, state]);
  if (!can("inventory.view")) return <Forbidden permission="inventory.view" />;

  const open = (productId = "") => {
    const p = data.products.find((x) => x.id === productId);
    setErrors({});
    setForm({ productId, quantity: "", type: "Stock in", reason: "", location: p?.warehouse ?? "", notes: "" });
    setAdjusting(true);
  };
  const apply = () => {
    const e: Record<string, string> = {};
    const p = data.products.find((x) => x.id === form.productId);
    const qty = Number(form.quantity);
    if (!p) e.productId = "Select a product.";
    if (!form.quantity || !Number.isInteger(qty) || qty < 0 || (form.type !== "Correction" && qty === 0)) e.quantity = form.type === "Correction" ? "Enter the counted quantity (0 or more)." : "Enter a whole number greater than 0.";
    if (!form.reason.trim()) e.reason = "A reason is required for the audit trail.";
    if (p && form.type === "Stock out" && qty > (p.stock ?? 0)) e.quantity = `Only ${p.stock} unit(s) available.`;
    setErrors(e);
    if (Object.keys(e).length || !p) return;
    const newStock = form.type === "Stock in" ? (p.stock ?? 0) + qty : form.type === "Stock out" ? (p.stock ?? 0) - qty : qty;
    mutate("products", (l) => l.map((x) => x.id === p.id ? { ...x, stock: newStock, warehouse: form.location || x.warehouse, updated: new Date().toISOString() } : x),
      { action: `Adjusted inventory (${form.type.toLowerCase()})`, module: "Inventory", target: p.name });
    mutate("movements", (l) => [{ id: newId("mv"), productId: p.id, quantity: form.type === "Stock out" ? -qty : form.type === "Correction" ? newStock - (p.stock ?? 0) : qty, type: form.type, reason: form.reason, location: form.location, notes: form.notes, date: new Date().toISOString() }, ...l]);
    if (data.settings.lowStockAlerts && newStock <= p.minStock) notify({ title: `${p.name} is ${newStock === 0 ? "out of stock" : "below minimum stock"} (${newStock}/${p.minStock}).`, type: "Inventory" });
    toast(`Inventory updated: ${p.name} → ${newStock} unit(s).`);
    setAdjusting(false);
  };

  const warehouses = [...new Set(tracked.map((p) => p.warehouse))];
  const columns: Column<Product>[] = [
    { key: "product", header: "Product", render: (p) => <div className="flex items-center gap-2"><span className="font-semibold">{p.name}</span>{p.demo && <DemoTag />}</div> },
    { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs text-steel">{p.sku}</span> },
    { key: "stock", header: "Current stock", render: (p) => (
      <div className="flex items-center gap-3">
        <span className="w-6 tabular-nums">{p.stock}</span>
        <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/[0.06] lg:block" aria-hidden><span className={cn("block h-full", productStockState(p) === "In stock" ? "bg-tech" : "bg-amber-200/70")} style={{ width: `${Math.min(100, ((p.stock ?? 0) / Math.max(1, p.minStock * 3)) * 100)}%` }} /></span>
      </div>
    ) },
    { key: "min", header: "Minimum", render: (p) => <span className="tabular-nums text-steel">{p.minStock}</span> },
    { key: "loc", header: "Location", render: (p) => p.warehouse },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={productStockState(p)} /> },
  ];

  return (
    <>
      <PageHeader eyebrow="Commerce" title="Inventory" description="Stock levels, locations and an auditable record of every movement."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Inventory" }]}
        actions={can("inventory.adjust") && <Button variant="primary" icon={SlidersHorizontal} onClick={() => open()}>Adjust Inventory</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total stock" value={tracked.reduce((s, p) => s + (p.stock ?? 0), 0)} period="Units" icon={Boxes} demo />
        <StatCard label="Low stock" value={tracked.filter((p) => productStockState(p) === "Low stock").length} period="At or below min." icon={ArrowDownUp} demo />
        <StatCard label="Out of stock" value={tracked.filter((p) => p.stock === 0).length} period="Products" icon={Boxes} demo />
        <StatCard label="Warehouses" value={warehouses.length} period="Locations" icon={Warehouse} demo />
        <StatCard label="Stock movements" value={data.movements.length} period="This session" icon={ArrowDownUp} />
      </div>
      <Panel className="mt-4" padded={false}>
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Search product or SKU" label="Search inventory" />
          <Select label="Stock status" value={state} onChange={setState} options={[{ value: "all", label: "All levels" }, "In stock", "Low stock", "Out of stock"]} className="sm:w-40" />
        </FilterBar>
        <DataTable caption="Inventory" columns={columns} rows={rows} getKey={(p) => p.id}
          empty={<EmptyState icon={Boxes} title="No inventory records." description="Products with tracked stock appear here." />}
          rowActions={(p) => <RowMenu actions={[
            { label: "Adjust stock", icon: SlidersHorizontal, onClick: () => open(p.id), hidden: !can("inventory.adjust") },
            { label: "Open product", icon: Eye, onClick: () => navigate(`/admin/products/${p.id}`), hidden: !can("products.view") },
          ]} />} />
      </Panel>

      <Panel className="mt-4" title="Stock movements" description="Every adjustment made in this session is recorded with its reason." padded={false}>
        {data.movements.length ? (
          <ul className="divide-y divide-white/[0.05]">
            {data.movements.map((m) => {
              const p = data.products.find((x) => x.id === m.productId);
              return (
                <li key={m.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <span className={cn("w-14 font-mono text-sm tabular-nums", m.quantity >= 0 ? "text-[#9cc6ff]" : "text-amber-100")}>{m.quantity >= 0 ? "+" : ""}{m.quantity}</span>
                  <span className="flex-1 text-sm"><span className="font-semibold">{p?.name ?? "Deleted product"}</span> <span className="text-steel">· {m.type} · {m.reason}</span>{m.notes && <span className="block text-xs text-steel">{m.notes}</span>}</span>
                  <span className="text-xs text-steel">{m.location || "—"} · {fmtDateTime(m.date)}</span>
                </li>
              );
            })}
          </ul>
        ) : <EmptyState icon={ArrowDownUp} title="No stock movements yet." description="Adjustments will be logged here with quantity, reason and location." />}
      </Panel>

      <Modal open={adjusting} onClose={() => setAdjusting(false)} title="Adjust Inventory" description="Record a stock movement. The reason is stored in the audit trail."
        footer={<><Button variant="ghost" onClick={() => setAdjusting(false)}>Cancel</Button><Button variant="primary" onClick={apply}>Apply adjustment</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Product" htmlFor="adj-p" error={errors.productId}>
            <select id="adj-p" className={cn(inputCls, "[&>option]:bg-ink")} value={form.productId} onChange={(e) => { const p = data.products.find((x) => x.id === e.target.value); setForm({ ...form, productId: e.target.value, location: p?.warehouse ?? form.location }); }}>
              <option value="">Select a product</option>{tracked.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.stock} in stock</option>)}
            </select></Field></div>
          <Field label="Movement type" htmlFor="adj-t"><select id="adj-t" className={cn(inputCls, "[&>option]:bg-ink")} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{movementTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label={form.type === "Correction" ? "Counted quantity" : "Quantity"} htmlFor="adj-q" error={errors.quantity}><input id="adj-q" type="number" min={0} step={1} inputMode="numeric" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
          <Field label="Reason" htmlFor="adj-r" error={errors.reason}><input id="adj-r" className={inputCls} placeholder="e.g. Supplier delivery" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
          <Field label="Location" htmlFor="adj-l"><input id="adj-l" className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Notes" htmlFor="adj-n"><textarea id="adj-n" rows={2} className={cn(inputCls, "h-auto py-2")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
        </div>
      </Modal>
    </>
  );
}

/* ─────────── Orders ─────────── */

const orderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];

function useOrderHelpers() {
  const { data } = useAdmin();
  const customer = (id: string) => data.customers.find((c) => c.id === id);
  const itemCount = (o: Order) => o.items.reduce((s, i) => s + i.qty, 0);
  const total = (o: Order) => {
    const prices = o.items.map((i) => { const p = data.products.find((x) => x.id === i.productId); return p?.price == null ? null : p.price * i.qty; });
    return prices.some((p) => p === null) ? null : prices.reduce<number>((s, p) => s + (p ?? 0), 0);
  };
  return { customer, itemCount, total };
}

export function OrdersPage() {
  const { data, navigate, can } = useAdmin();
  const { customer, itemCount, total } = useOrderHelpers();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => data.orders.filter((o) => (status === "all" || o.status === status) && (!q || `${o.id} ${customer(o.customerId)?.name ?? ""}`.toLowerCase().includes(q.toLowerCase()))), [data.orders, q, status]); // eslint-disable-line
  if (!can("orders.view")) return <Forbidden permission="orders.view" />;

  const columns: Column<Order>[] = [
    { key: "id", header: "Order ID", render: (o) => <div className="flex items-center gap-2"><span className="font-mono font-semibold">{o.id}</span>{o.demo && <DemoTag />}</div> },
    { key: "customer", header: "Customer", render: (o) => customer(o.customerId)?.name ?? "Unknown customer" },
    { key: "items", header: "Items", render: (o) => <span className="tabular-nums">{itemCount(o)}</span> },
    { key: "total", header: "Total", render: (o) => <span className="text-steel">{total(o) === null ? "Pending pricing" : fmtMoney(total(o), data.settings.currency)}</span> },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "date", header: "Date", render: (o) => <span className="text-xs text-steel">{fmtDate(o.date)}</span> },
  ];
  return (
    <>
      <PageHeader eyebrow="Commerce" title="Orders" description="Order requests and fulfillment. Payment and shipping integrations are not configured."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Orders" }]} />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {["all", ...orderStatuses].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={cn("whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors", status === s ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow")}>
            {s === "all" ? "All" : s} <span className="ml-1 font-mono text-[10px] text-steel">{s === "all" ? data.orders.length : data.orders.filter((o) => o.status === s).length}</span>
          </button>
        ))}
      </div>
      <Panel padded={false}>
        <FilterBar><SearchInput value={q} onChange={setQ} placeholder="Search order ID or customer" label="Search orders" /></FilterBar>
        <DataTable caption="Orders" columns={columns} rows={rows} getKey={(o) => o.id} onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
          empty={<EmptyState icon={ShoppingCart} title={data.orders.length ? "No orders match these filters." : "No orders yet."} description="Orders will appear here once the store checkout is connected." />} />
      </Panel>
    </>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const { data, mutate, navigate, can, toast } = useAdmin();
  const { customer, itemCount, total } = useOrderHelpers();
  const order = data.orders.find((o) => o.id === id);
  if (!can("orders.view")) return <Forbidden permission="orders.view" />;
  if (!order) return <Panel><EmptyState icon={ShoppingCart} title="Order not found." action={<Button onClick={() => navigate("/admin/orders")}>Back to orders</Button>} /></Panel>;
  const c = customer(order.customerId);
  const history = data.activity.filter((a) => a.module === "Orders" && a.target === order.id);

  const setStatus = (s: string) => {
    mutate("orders", (l) => l.map((o) => o.id === order.id ? { ...o, status: s as OrderStatus } : o), { action: `Changed order status to ${s}`, module: "Orders", target: order.id });
    toast(`Order ${order.id} marked as ${s.toLowerCase()}.`);
  };

  return (
    <>
      <PageHeader eyebrow="Order" title={order.id} breadcrumbs={[{ label: "Orders", to: "/admin/orders" }, { label: order.id }]}
        description={<span className="flex items-center gap-2"><StatusBadge status={order.status} />{order.demo && <DemoTag />}</span>}
        actions={<>
          {can("orders.edit") && <Select label="Update status" value={order.status} onChange={setStatus} options={orderStatuses} className="w-40" />}
          {can("orders.refund") && <Button disabled title="Payments are not integrated">Refund</Button>}
        </>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Products" padded={false}>
            <ul className="divide-y divide-white/[0.05]">
              {order.items.map((i) => {
                const p = data.products.find((x) => x.id === i.productId);
                return (
                  <li key={i.productId} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <button className="truncate text-left text-sm font-semibold hover:text-volt" onClick={() => p && navigate(`/admin/products/${p.id}`)}>{p?.name ?? "Deleted product"}</button>
                      <div className="font-mono text-[11px] text-steel">{p?.sku}</div>
                    </div>
                    <div className="text-right text-sm"><div className="tabular-nums">× {i.qty}</div><div className="text-xs text-steel">{fmtMoney(p?.price ?? null, data.settings.currency)}</div></div>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between border-t border-white/[0.06] px-5 py-3 text-sm"><span className="text-steel">{itemCount(order)} item(s) · Total</span><span className="font-semibold">{total(order) === null ? "Pending pricing" : fmtMoney(total(order), data.settings.currency)}</span></div>
          </Panel>
          <Panel title="Timeline">
            <ul>
              {history.map((a) => <ActivityItem key={a.id} {...a} />)}
              <ActivityItem actor={c?.name ?? "Customer"} action="Placed order" target={order.id} module="Orders" date={order.date} demo={order.demo} />
            </ul>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Order information">
            <dl className="space-y-2.5 text-sm">
              {[["Order ID", order.id], ["Placed", fmtDateTime(order.date)], ["Status", order.status]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-steel">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
          </Panel>
          <Panel title="Customer" action={c && can("customers.view") ? <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/customers/${c.id}`)}>View</Button> : undefined}>
            {c ? <div className="text-sm"><div className="font-semibold">{c.name}</div><div className="mt-0.5 text-steel">{c.email}</div></div> : <p className="text-sm text-steel">Customer record not found.</p>}
          </Panel>
          <Panel title="Payment status"><StatusBadge status="Not integrated" /><p className="mt-2 text-xs text-steel">No payment provider is connected. Payment state cannot be verified.</p></Panel>
          <Panel title="Shipping"><StatusBadge status="Not configured" /><p className="mt-2 text-xs text-steel">Shipping carriers and rates are not configured.</p></Panel>
        </div>
      </div>
    </>
  );
}

/* ─────────── Customers ─────────── */

const maskEmail = (e: string) => { const [u, d] = e.split("@"); return `${u.slice(0, 2)}${"•".repeat(Math.max(2, u.length - 2))}@${d}`; };

export function CustomersPage() {
  const { data, navigate, can } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const rows = data.customers.filter((c) => (status === "all" || c.status === status) && (!q || `${c.name} ${c.email}`.toLowerCase().includes(q.toLowerCase())));
  if (!can("customers.view")) return <Forbidden permission="customers.view" />;
  const columns: Column<Customer>[] = [
    { key: "name", header: "Customer", render: (c) => <div className="flex items-center gap-2"><span className="font-semibold">{c.name}</span>{c.demo && <DemoTag />}</div> },
    { key: "email", header: "Email", render: (c) => <span className="text-steel">{maskEmail(c.email)}</span> },
    { key: "orders", header: "Orders", render: (c) => <span className="tabular-nums">{data.orders.filter((o) => o.customerId === c.id).length}</span> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "created", header: "Created", render: (c) => <span className="text-xs text-steel">{fmtDate(c.created)}</span> },
  ];
  return (
    <>
      <PageHeader eyebrow="Commerce" title="Customers" description="Store customers. Email addresses are masked in lists to limit exposure."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Customers" }]} />
      <Panel padded={false}>
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name or email" label="Search customers" />
          <Select label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, "Active", "Inactive"]} className="sm:w-36" />
        </FilterBar>
        <DataTable caption="Customers" columns={columns} rows={rows} getKey={(c) => c.id} onRowClick={(c) => navigate(`/admin/customers/${c.id}`)}
          empty={<EmptyState icon={UsersRound} title="No customers yet." description="Customer accounts will appear here once registration is enabled." />} />
      </Panel>
    </>
  );
}

export function CustomerDetail({ id }: { id: string }) {
  const { data, mutate, navigate, can, toast } = useAdmin();
  const c = data.customers.find((x) => x.id === id);
  const [tab, setTab] = useState("Overview");
  const [reveal, setReveal] = useState(false);
  const [notes, setNotes] = useState(c?.notes ?? "");
  if (!can("customers.view")) return <Forbidden permission="customers.view" />;
  if (!c) return <Panel><EmptyState icon={UsersRound} title="Customer not found." action={<Button onClick={() => navigate("/admin/customers")}>Back to customers</Button>} /></Panel>;
  const orders = data.orders.filter((o) => o.customerId === c.id);
  const activity = data.activity.filter((a) => a.target === c.name || orders.some((o) => o.id === a.target));

  return (
    <>
      <PageHeader eyebrow="Customer" title={c.name} breadcrumbs={[{ label: "Customers", to: "/admin/customers" }, { label: c.name }]}
        description={<span className="flex items-center gap-2"><StatusBadge status={c.status} />{c.demo && <DemoTag />}</span>} />
      <Tabs tabs={["Overview", "Orders", "Activity", "Addresses", "Notes"]} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "Overview" && (
          <Panel title="Basic information">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-steel">Email</dt><dd className="mt-1 flex items-center gap-2">{reveal ? c.email : maskEmail(c.email)}
                <button className="text-steel hover:text-snow" onClick={() => { setReveal(!reveal); if (!reveal) mutate("activity", (l) => l, { action: "Viewed customer email", module: "Customers", target: c.name }); }} aria-label={reveal ? "Hide email" : "Reveal email"}>{reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></dd></div>
              <div><dt className="text-xs text-steel">Customer since</dt><dd className="mt-1">{fmtDate(c.created)}</dd></div>
              <div><dt className="text-xs text-steel">Orders</dt><dd className="mt-1 tabular-nums">{orders.length}</dd></div>
              <div><dt className="text-xs text-steel">Location</dt><dd className="mt-1">{c.city}</dd></div>
            </dl>
            <p className="mt-4 text-[11px] text-steel">Revealing contact data is recorded in the activity log.</p>
          </Panel>
        )}
        {tab === "Orders" && (
          <Panel padded={false}>
            {orders.length ? <ul className="divide-y divide-white/[0.05]">{orders.map((o) => (
              <li key={o.id}><button onClick={() => navigate(`/admin/orders/${o.id}`)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-white/[0.02]"><span className="font-mono text-sm">{o.id}</span><span className="flex items-center gap-3 text-xs text-steel">{fmtDate(o.date)}<StatusBadge status={o.status} /></span></button></li>
            ))}</ul> : <EmptyState icon={ShoppingCart} title="No orders for this customer." />}
          </Panel>
        )}
        {tab === "Activity" && <Panel>{activity.length ? <ul>{activity.map((a) => <ActivityItem key={a.id} {...a} />)}</ul> : <EmptyState title="No activity recorded." />}</Panel>}
        {tab === "Addresses" && <Panel><EmptyState title="No addresses on file." description="Shipping addresses are stored once checkout is connected." /></Panel>}
        {tab === "Notes" && (
          <Panel title="Administrative notes" description="Internal only. Never visible to the customer.">
            <textarea aria-label="Administrative notes" rows={5} className={cn(inputCls, "h-auto py-2")} value={notes} disabled={!can("customers.edit")} onChange={(e) => setNotes(e.target.value)} placeholder="Add context for your team…" />
            {can("customers.edit") && <div className="mt-3 flex justify-end"><Button variant="primary" onClick={() => { mutate("customers", (l) => l.map((x) => x.id === c.id ? { ...x, notes } : x), { action: "Updated customer notes", module: "Customers", target: c.name }); toast("Notes saved."); }}>Save notes</Button></div>}
          </Panel>
        )}
      </div>
    </>
  );
}
