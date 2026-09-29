import { useMemo, useState } from "react";
import { Archive, ArchiveRestore, Copy, ImagePlus, Package, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { Product, ProductStatus, Spec } from "../data";
import { fmtDate, fmtMoney, newId, productDisplayStatus, productStockState, useAdmin } from "../store";
import { RowMenu } from "../RowMenu";
import { Button, ConfirmDialog, DataTable, DemoTag, EmptyState, Field, FilterBar, Forbidden, PageHeader, Panel, SearchInput, Select, StatusBadge, inputCls, type Column } from "../ui";
import { cn } from "../../utils/cn";

const DAY = 86400000;

export function ProductsPage() {
  const { data, mutate, navigate, can, toast } = useAdmin();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [stock, setStock] = useState("all");
  const [price, setPrice] = useState("all");
  const [date, setDate] = useState("all");
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const rows = useMemo(() => data.products.filter((p) => {
    const text = `${p.name} ${p.sku} ${p.brand}`.toLowerCase();
    const display = productDisplayStatus(p);
    const now = Date.now();
    return (!q || text.includes(q.toLowerCase())) &&
      (category === "all" || p.category === category) &&
      (status === "all" || display === status) &&
      (stock === "all" || productStockState(p) === stock) &&
      (price === "all" || (price === "set" ? p.price !== null : p.price === null)) &&
      (date === "all" || now - new Date(p.updated).getTime() <= Number(date) * DAY);
  }), [data.products, q, category, status, stock, price, date]);

  if (!can("products.view")) return <Forbidden permission="products.view" />;

  const duplicate = (p: Product) => {
    const copy: Product = { ...p, id: newId("p"), name: `${p.name} (copy)`, sku: `${p.sku}-COPY`, status: "Draft", updated: new Date().toISOString(), demo: false, slug: `${p.slug}-copy` };
    mutate("products", (list) => [copy, ...list], { action: "Duplicated product", module: "Products", target: p.name });
    toast(`Duplicated “${p.name}” as a draft.`);
  };
  const setProductStatus = (p: Product, s: ProductStatus) => {
    mutate("products", (list) => list.map((x) => x.id === p.id ? { ...x, status: s, updated: new Date().toISOString() } : x), { action: s === "Archived" ? "Archived product" : "Changed product status", module: "Products", target: p.name });
    toast(`“${p.name}” is now ${s.toLowerCase()}.`);
  };

  const columns: Column<Product>[] = [
    { key: "product", header: "Product", render: (p) => (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-obsidian text-steel"><Package className="h-4 w-4" aria-hidden /></div>
        <div className="min-w-0"><div className="truncate font-semibold text-snow">{p.name}</div><div className="mt-0.5 flex items-center gap-2 text-[11px] text-steel">{p.brand}{p.demo && <DemoTag />}</div></div>
      </div>
    ) },
    { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs text-steel">{p.sku}</span> },
    { key: "category", header: "Category", render: (p) => catName(p.category) },
    { key: "price", header: "Price", render: (p) => <span className={p.price === null ? "text-steel" : ""}>{fmtMoney(p.price, data.settings.currency)}</span> },
    { key: "stock", header: "Stock", render: (p) => p.stock === null ? <span className="text-steel">Digital</span> : <span className={cn("tabular-nums", productStockState(p) !== "In stock" && "text-amber-100")}>{p.stock}</span> },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={productDisplayStatus(p)} /> },
    { key: "updated", header: "Updated", render: (p) => <span className="text-xs text-steel">{fmtDate(p.updated)}</span>, hideOnMobile: true },
  ];

  const filtersActive = q || [category, status, stock, price, date].some((v) => v !== "all");

  return (
    <>
      <PageHeader eyebrow="Commerce" title="Products" description="Physical and digital catalog items managed by InfiniHon."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Products" }]}
        actions={can("products.create") && <Button variant="primary" icon={Plus} onClick={() => navigate("/admin/products/new")}>Create product</Button>} />
      <Panel padded={false}>
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, SKU or brand" label="Search products" />
          <Select label="Category" value={category} onChange={setCategory} options={[{ value: "all", label: "All categories" }, ...data.categories.map((c) => ({ value: c.id, label: c.name }))]} className="sm:w-40" />
          <Select label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, "Active", "Draft", "Archived", "Out of stock"]} className="sm:w-36" />
          <Select label="Stock" value={stock} onChange={setStock} options={[{ value: "all", label: "Any stock" }, "In stock", "Low stock", "Out of stock", "Digital"]} className="sm:w-36" />
          <Select label="Price" value={price} onChange={setPrice} options={[{ value: "all", label: "Any price" }, { value: "set", label: "Price set" }, { value: "unset", label: "Price not set" }]} className="sm:w-36" />
          <Select label="Updated" value={date} onChange={setDate} options={[{ value: "all", label: "Any date" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} className="sm:w-36" />
          {filtersActive && <Button variant="ghost" size="sm" icon={X} onClick={() => { setQ(""); setCategory("all"); setStatus("all"); setStock("all"); setPrice("all"); setDate("all"); }}>Clear</Button>}
        </FilterBar>
        <DataTable caption="Products" columns={columns} rows={rows} getKey={(p) => p.id}
          onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          empty={data.products.length
            ? <EmptyState title="No products match these filters." description="Try adjusting or clearing the filters." />
            : <EmptyState icon={Package} title="No products yet." description="Create your first product to get started." action={can("products.create") && <Button variant="primary" icon={Plus} onClick={() => navigate("/admin/products/new")}>Create product</Button>} />}
          rowActions={(p) => (
            <RowMenu label={`Actions for ${p.name}`} actions={[
              { label: "Edit", icon: Pencil, onClick: () => navigate(`/admin/products/${p.id}`), hidden: !can("products.edit") },
              { label: "Duplicate", icon: Copy, onClick: () => duplicate(p), hidden: !can("products.create") },
              p.status === "Archived"
                ? { label: "Restore as draft", icon: ArchiveRestore, onClick: () => setProductStatus(p, "Draft"), hidden: !can("products.edit") }
                : { label: "Archive", icon: Archive, onClick: () => setProductStatus(p, "Archived"), hidden: !can("products.edit") },
              { label: "Delete", icon: Trash2, onClick: () => setToDelete(p), danger: true, hidden: !can("products.delete") },
            ]} />
          )} />
      </Panel>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete product"
        message={`Are you sure you want to delete “${toDelete?.name}”? This removes it from the catalog. Consider archiving instead if it may return.`}
        onConfirm={() => { if (!toDelete) return; mutate("products", (l) => l.filter((x) => x.id !== toDelete.id), { action: "Deleted product", module: "Products", target: toDelete.name }); toast(`Deleted “${toDelete.name}”.`); }} />
    </>
  );
}

/* ─────────── Editor ─────────── */

const blank = (): Product => ({
  id: newId("p"), name: "", sku: "", category: "", brand: "", description: "", price: null, cost: null, discount: null, tax: null,
  stock: 0, minStock: 0, warehouse: "Main warehouse", status: "Draft", specs: [], images: 0, seoTitle: "", seoDescription: "", slug: "",
  updated: new Date().toISOString(), demo: false,
});
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const sections = ["General", "Pricing", "Inventory", "Media", "Specifications", "SEO", "Visibility"];

function NumberInput({ id, value, onChange, disabled, placeholder = "Not set" }: { id: string; value: number | null; onChange: (v: number | null) => void; disabled?: boolean; placeholder?: string }) {
  return <input id={id} type="number" min={0} step="any" inputMode="decimal" disabled={disabled} className={inputCls} placeholder={placeholder}
    value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
}

export function ProductEditor({ id }: { id: string }) {
  const { data, mutate, navigate, can, toast } = useAdmin();
  const existing = data.products.find((p) => p.id === id);
  const isNew = id === "new";
  const [form, setForm] = useState<Product>(() => existing ?? blank());
  const [errors, setErrors] = useState<Partial<Record<"name" | "sku" | "category", string>>>({});
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isNew && !existing) return <Panel><EmptyState icon={Package} title="Product not found." description="It may have been deleted." action={<Button onClick={() => navigate("/admin/products")}>Back to products</Button>} /></Panel>;
  const canEdit = isNew ? can("products.create") : can("products.edit");
  if (!can("products.view")) return <Forbidden permission="products.view" />;

  const set = <K extends keyof Product>(k: K, v: Product[K]) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };
  const catName = data.categories.find((c) => c.id === form.category)?.name;

  const save = (status?: ProductStatus) => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.sku.trim()) e.sku = "SKU is required.";
    else if (data.products.some((p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase() && p.id !== form.id)) e.sku = "This SKU is already used by another product.";
    if (!form.category) e.category = "Choose a category.";
    setErrors(e);
    if (Object.keys(e).length) { toast("Review the highlighted fields before saving.", "error"); document.getElementById(`pe-${Object.keys(e)[0]}`)?.focus(); return; }
    const next: Product = { ...form, name: form.name.trim(), sku: form.sku.trim(), slug: form.slug || slugify(form.name), status: status ?? form.status, updated: new Date().toISOString() };
    mutate("products", (list) => isNew ? [next, ...list] : list.map((p) => p.id === next.id ? next : p),
      { action: isNew ? "Created product" : status === "Archived" ? "Archived product" : "Updated product", module: "Products", target: next.name });
    setForm(next); setDirty(false);
    toast(isNew ? `Created “${next.name}”.` : status === "Draft" ? "Saved as draft." : status === "Archived" ? "Product archived." : "Changes saved.");
    if (isNew) navigate(`/admin/products/${next.id}`);
  };

  const specsSet = (i: number, patch: Partial<Spec>) => set("specs", form.specs.map((s, j) => j === i ? { ...s, ...patch } : s));
  const margin = form.price !== null && form.cost !== null && form.price > 0 ? Math.round(((form.price - form.cost) / form.price) * 100) : null;

  return (
    <>
      <PageHeader eyebrow={isNew ? "New product" : "Product editor"} title={isNew ? "Create product" : form.name || "Untitled product"}
        breadcrumbs={[{ label: "Products", to: "/admin/products" }, ...(catName ? [{ label: catName }] : []), { label: isNew ? "New" : existing!.name }]}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={productDisplayStatus(form)} />{form.demo && <DemoTag />}{dirty && <span className="text-xs text-amber-100">Unsaved changes</span>}</span>}
        actions={canEdit && (
          <>
            {!isNew && form.status !== "Archived" && <Button icon={Archive} onClick={() => save("Archived")}>Archive</Button>}
            <Button onClick={() => save("Draft")}>Save as draft</Button>
            <Button variant="primary" icon={Save} onClick={() => save(isNew ? "Active" : undefined)}>{isNew ? "Save & publish" : "Save changes"}</Button>
          </>
        )} />
      {!canEdit && <p className="mb-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-steel">Read-only: your role cannot edit products.</p>}

      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <nav className="hidden lg:block" aria-label="Editor sections">
          <ul className="sticky top-24 space-y-0.5 border-l border-white/[0.07]">
            {sections.map((s) => <li key={s}><a href={`#sec-${s}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-steel hover:border-volt hover:text-snow">{s}</a></li>)}
          </ul>
        </nav>

        <fieldset disabled={!canEdit} className="min-w-0 space-y-4">
          <Panel title="General" className="scroll-mt-24" description="Core product information."><div id="sec-General" className="-mt-24 pt-24" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name" htmlFor="pe-name" error={errors.name}><input id="pe-name" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Edge router" /></Field>
              <Field label="SKU" htmlFor="pe-sku" error={errors.sku} hint="Unique internal identifier."><input id="pe-sku" className={cn(inputCls, "font-mono")} value={form.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} placeholder="INH-NET-000" /></Field>
              <Field label="Category" htmlFor="pe-category" error={errors.category}>
                <select id="pe-category" className={cn(inputCls, "[&>option]:bg-ink")} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select a category</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Brand" htmlFor="pe-brand"><input id="pe-brand" className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Manufacturer or brand" /></Field>
              <div className="md:col-span-2"><Field label="Description" htmlFor="pe-desc"><textarea id="pe-desc" rows={4} className={cn(inputCls, "h-auto py-2")} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
            </div>
          </Panel>

          <Panel title="Pricing" description="Leave empty until commercial pricing is confirmed."><div id="sec-Pricing" className="-mt-24 pt-24" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label={`Price${data.settings.currency ? ` (${data.settings.currency})` : ""}`} htmlFor="pe-price"><NumberInput id="pe-price" value={form.price} onChange={(v) => set("price", v)} /></Field>
              <Field label="Cost" htmlFor="pe-cost" hint={margin !== null ? `Margin ${margin}%` : undefined}><NumberInput id="pe-cost" value={form.cost} onChange={(v) => set("cost", v)} /></Field>
              <Field label="Discount (%)" htmlFor="pe-discount"><NumberInput id="pe-discount" value={form.discount} onChange={(v) => set("discount", v)} placeholder="0" /></Field>
              <Field label="Tax (%)" htmlFor="pe-tax"><NumberInput id="pe-tax" value={form.tax} onChange={(v) => set("tax", v)} placeholder="Use default" /></Field>
            </div>
            {!data.settings.currency && <p className="mt-3 text-[11px] text-steel">No store currency configured yet — set it in Settings → Commerce.</p>}
          </Panel>

          <Panel title="Inventory"><div id="sec-Inventory" className="-mt-24 pt-24" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Stock" htmlFor="pe-stock" hint={isNew ? undefined : "Use Inventory → Adjust to record movements."}><NumberInput id="pe-stock" value={form.stock} onChange={(v) => set("stock", v)} placeholder="Digital / none" /></Field>
              <Field label="Minimum stock" htmlFor="pe-min"><NumberInput id="pe-min" value={form.minStock} onChange={(v) => set("minStock", v ?? 0)} placeholder="0" /></Field>
              <Field label="Warehouse" htmlFor="pe-wh"><input id="pe-wh" className={inputCls} value={form.warehouse} onChange={(e) => set("warehouse", e.target.value)} /></Field>
              <Field label="Availability" htmlFor="pe-av"><div id="pe-av" className="flex h-10 items-center"><StatusBadge status={productStockState(form)} /></div></Field>
            </div>
          </Panel>

          <Panel title="Media" description="Product images and gallery."><div id="sec-Media" className="-mt-24 pt-24" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-obsidian/40 text-center text-[11px] text-steel">
                  <ImagePlus className="h-5 w-5" aria-hidden />{i === 0 ? "Primary image" : `Gallery ${i}`}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-steel">Uploads require an object storage integration. <span className="text-snow/80">Status: Not configured.</span></p>
          </Panel>

          <Panel title="Specifications" description="Only publish specifications confirmed by the real catalog."
            action={<Button size="sm" icon={Plus} onClick={() => set("specs", [...form.specs, { key: "", value: "" }])}>Add field</Button>}><div id="sec-Specifications" className="-mt-24 pt-24" />
            {form.specs.length ? (
              <div className="space-y-2">
                {form.specs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input aria-label={`Specification ${i + 1} name`} className={inputCls} placeholder="e.g. Interfaces" value={s.key} onChange={(e) => specsSet(i, { key: e.target.value })} />
                    <input aria-label={`Specification ${i + 1} value`} className={inputCls} placeholder="Value" value={s.value} onChange={(e) => specsSet(i, { value: e.target.value })} />
                    <Button variant="ghost" icon={X} aria-label={`Remove specification ${i + 1}`} onClick={() => set("specs", form.specs.filter((_, j) => j !== i))} />
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-steel">No specifications yet.</p>}
          </Panel>

          <Panel title="SEO"><div id="sec-SEO" className="-mt-24 pt-24" />
            <div className="grid gap-4">
              <Field label="SEO title" htmlFor="pe-seot" hint={`${form.seoTitle.length}/60`}><input id="pe-seot" className={inputCls} maxLength={70} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={form.name} /></Field>
              <Field label="SEO description" htmlFor="pe-seod" hint={`${form.seoDescription.length}/160`}><textarea id="pe-seod" rows={2} maxLength={180} className={cn(inputCls, "h-auto py-2")} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></Field>
              <Field label="Slug" htmlFor="pe-slug"><div className="flex"><span className="flex items-center rounded-l-md border border-r-0 border-white/10 bg-white/[0.03] px-3 font-mono text-xs text-steel">/store/</span><input id="pe-slug" className={cn(inputCls, "rounded-l-none font-mono")} value={form.slug} placeholder={slugify(form.name) || "product-slug"} onChange={(e) => set("slug", slugify(e.target.value))} /></div></Field>
            </div>
          </Panel>

          <Panel title="Visibility"><div id="sec-Visibility" className="-mt-24 pt-24" />
            <div role="radiogroup" aria-label="Visibility" className="grid gap-2 sm:grid-cols-3">
              {(["Active", "Draft", "Archived"] as ProductStatus[]).map((s) => (
                <button key={s} type="button" role="radio" aria-checked={form.status === s} onClick={() => set("status", s)}
                  className={cn("rounded-lg border p-3 text-left transition-colors", form.status === s ? "border-tech bg-tech/10" : "border-white/10 hover:border-white/20")}>
                  <div className="text-sm font-semibold">{s === "Active" ? "Published" : s}</div>
                  <div className="mt-0.5 text-[11px] text-steel">{s === "Active" ? "Visible in the store." : s === "Draft" ? "Hidden, still editable." : "Retired from catalog."}</div>
                </button>
              ))}
            </div>
          </Panel>

          {!isNew && can("products.delete") && (
            <Panel title="Danger zone">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-steel">Deleting removes the product permanently from the catalog.</p>
                <Button variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete product</Button>
              </div>
            </Panel>
          )}
        </fieldset>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete product" message={`Are you sure you want to delete “${form.name}”?`}
        onConfirm={() => { mutate("products", (l) => l.filter((p) => p.id !== form.id), { action: "Deleted product", module: "Products", target: form.name }); toast("Product deleted."); navigate("/admin/products"); }} />
    </>
  );
}
