import { useState } from "react";
import { Activity as ActivityIcon, ArrowUpRight, BarChart3, Boxes, CircleDollarSign, Network, Package, Plus, ShoppingCart, Users, UsersRound } from "lucide-react";
import { useAdmin, productStockState } from "../store";
import { ActivityItem, Button, ChartCard, DemoTag, EmptyState, NoData, PageHeader, Panel, Select, StatCard, StatusBadge } from "../ui";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning." : h < 19 ? "Good afternoon." : "Good evening.";
}

const layers = ["Network", "Servers", "Cloud", "Applications", "Monitoring"];

function SystemDiagram() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-ink/80">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(139,150,165,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,150,165,.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_70%_50%,#000,transparent_75%)]" aria-hidden />
      <div className="relative grid gap-6 p-5 lg:grid-cols-[260px_1fr] lg:p-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-volt">INFINIHON Control Center</div>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">System</div>
          <div className="mt-2 h-px bg-white/[0.08]" />
          <ul className="mt-2">
            {layers.map((l) => (
              <li key={l} className="flex items-center justify-between border-b border-dashed border-white/[0.06] py-2 text-sm">
                <span className="text-snow/90">{l}</span>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-steel">
                  Not monitored <span className="h-2 w-2 rounded-full border border-steel/60" aria-hidden />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-steel">Conceptual view. Live status requires a monitoring integration.</p>
        </div>
        <svg viewBox="0 0 640 220" className="h-auto w-full" role="img" aria-label="Conceptual diagram: users connect through network to servers, which host applications, database and storage, observed by monitoring">
          <defs>
            <linearGradient id="ov-line" x1="0" x2="1"><stop stopColor="#003B73" /><stop offset=".5" stopColor="#0066FF" /><stop offset="1" stopColor="#003B73" /></linearGradient>
          </defs>
          {[
            "M70 110 H170", "M250 110 H330", "M410 110 C440 110 440 45 470 45", "M410 110 H470", "M410 110 C440 110 440 175 470 175",
          ].map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke="#1d3a57" />
              <path d={d} fill="none" stroke="url(#ov-line)" strokeWidth="1.2" className="admin-flow" style={{ animationDelay: `${i * -1.1}s` }} />
            </g>
          ))}
          <path d="M370 140 V195 H600 V175" fill="none" stroke="#1d3a57" strokeDasharray="3 5" />
          {[
            { x: 20, y: 90, w: 50, label: "USERS" },
            { x: 170, y: 90, w: 80, label: "NETWORK" },
            { x: 330, y: 80, w: 80, h: 60, label: "SERVERS", core: true },
            { x: 470, y: 25, w: 130, label: "APPLICATIONS" },
            { x: 470, y: 90, w: 130, label: "DATABASE" },
            { x: 470, y: 155, w: 130, label: "STORAGE" },
          ].map((n) => (
            <g key={n.label} transform={`translate(${n.x} ${n.y})`}>
              <rect width={n.w} height={n.h ?? 40} rx="5" fill="#070b10" stroke={n.core ? "#0066FF" : "#284662"} />
              <circle cx="10" cy="10" r="2.2" fill={n.core ? "#00A8FF" : "#8B96A5"} className={n.core ? "admin-pulse" : ""} />
              <text x={n.w / 2} y={(n.h ?? 40) / 2 + 3.5} textAnchor="middle" fill="#D5E1EE" fontSize="9.5" letterSpacing="1.4" fontFamily="JetBrains Mono, monospace">{n.label}</text>
            </g>
          ))}
          <text x="485" y="212" fill="#8B96A5" fontSize="8.5" letterSpacing="1.4" fontFamily="JetBrains Mono, monospace">MONITORING · OBSERVES ALL LAYERS</text>
        </svg>
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { data, navigate, can } = useAdmin();
  const lowStock = data.products.filter((p) => ["Low stock", "Out of stock"].includes(productStockState(p)) && p.status !== "Archived");
  const pending = data.orders.filter((o) => o.status === "Pending" || o.status === "Processing");

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={greeting()}
        description="Here's what's happening across InfiniHon."
        actions={
          <>
            {can("products.create") && <Button variant="primary" icon={Plus} onClick={() => navigate("/admin/products/new")}>New product</Button>}
            {can("analytics.view") && <Button icon={BarChart3} onClick={() => navigate("/admin/analytics")}>Analytics</Button>}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Products" value={data.products.length} period="Catalog records" icon={Package} demo onClick={can("products.view") ? () => navigate("/admin/products") : undefined} />
        <StatCard label="Orders today" value="—" period="No order backend" icon={ShoppingCart} status="Not connected" />
        <StatCard label="Active customers" value={data.customers.filter((c) => c.status === "Active").length} period="Sample records" icon={UsersRound} demo />
        <StatCard label="Revenue" value="—" period="No payment data" icon={CircleDollarSign} status="No data" />
        <StatCard label="Infrastructure" value="—" period="System status" icon={Network} status="Not connected" onClick={can("infrastructure.view") ? () => navigate("/admin/infrastructure") : undefined} />
        <StatCard label="Active users" value={data.users.filter((u) => u.status === "Active").length} period="Sample records" icon={Users} demo />
      </div>

      <div className="mt-4"><SystemDiagram /></div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Recent Activity" description="Administrative actions across modules."
          action={can("activity.view") ? <Button size="sm" variant="ghost" icon={ArrowUpRight} onClick={() => navigate("/admin/activity")}>View log</Button> : undefined}>
          {data.activity.length ? (
            <ul>{data.activity.slice(0, 6).map((a) => <ActivityItem key={a.id} {...a} />)}</ul>
          ) : <EmptyState icon={ActivityIcon} title="No activity yet." />}
        </Panel>

        <div className="space-y-4">
          <Panel title="Needs attention" description="Derived from current records." action={<DemoTag />}>
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <button onClick={() => navigate("/admin/inventory")} className="flex w-full items-center justify-between gap-3 text-left">
                    <span className="flex min-w-0 items-center gap-2 text-sm"><Boxes className="h-4 w-4 shrink-0 text-steel" aria-hidden /><span className="truncate">{p.name}</span></span>
                    <StatusBadge status={productStockState(p)} />
                  </button>
                </li>
              ))}
              {pending.map((o) => (
                <li key={o.id}>
                  <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="flex w-full items-center justify-between gap-3 text-left">
                    <span className="flex items-center gap-2 font-mono text-sm"><ShoppingCart className="h-4 w-4 text-steel" aria-hidden />{o.id}</span>
                    <StatusBadge status={o.status} />
                  </button>
                </li>
              ))}
              {!lowStock.length && !pending.length && <li className="text-sm text-steel">Nothing needs attention.</li>}
            </ul>
          </Panel>
          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Adjust inventory", to: "/admin/inventory", p: "inventory.adjust" },
                { label: "Add administrator", to: "/admin/administrators", p: "administrators.create" },
                { label: "Edit content", to: "/admin/content", p: "content.edit" },
                { label: "Review security", to: "/admin/security", p: "security.view" },
              ].filter((a) => can(a.p)).map((a) => (
                <button key={a.label} onClick={() => navigate(a.to)} className="rounded-md border border-white/[0.07] bg-obsidian/50 px-3 py-3 text-left text-xs font-medium text-snow/90 transition-colors hover:border-tech/40 hover:text-snow">{a.label}</button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState("Last 30 days");
  const metrics = ["Sales", "Orders", "Customers", "Products", "Traffic", "Conversion", "Service requests"];
  return (
    <>
      <PageHeader eyebrow="Principal" title="Analytics" description="Business and platform metrics. Charts populate automatically once analytics and order data sources are connected."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Analytics" }]}
        actions={<Select label="Date range" value={range} onChange={setRange} options={["Last 7 days", "Last 30 days", "Last 90 days", "This year"]} className="w-44" />} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {metrics.map((m) => (
          <div key={m} className="rounded-xl border border-white/[0.07] bg-ink/80 p-4">
            <div className="text-xs text-steel">{m}</div>
            <div className="mt-2 text-2xl font-extrabold text-snow/40">—</div>
            <div className="mt-2 font-mono text-[10px] text-steel">{range}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue over time" description="Requires payment data."><NoData /></ChartCard>
        <ChartCard title="Orders over time" description="Requires order backend."><NoData /></ChartCard>
        <ChartCard title="Product performance" description="Requires order line items."><NoData /></ChartCard>
        <ChartCard title="Customer growth" description="Requires customer accounts."><NoData /></ChartCard>
      </div>
    </>
  );
}
