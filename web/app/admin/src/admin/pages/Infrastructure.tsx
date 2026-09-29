import { Activity, Cloud, Cpu, Database, GitBranch, Gauge, HardDrive, MemoryStick, Network, Plug, Server, Timer, Wifi } from "lucide-react";
import { integrations } from "../data";
import { useAdmin } from "../store";
import { Button, EmptyState, Forbidden, PageHeader, Panel, StatusBadge } from "../ui";
import { cn } from "../../utils/cn";

const submodules = [
  { label: "Servers", to: "/admin/infrastructure/servers", icon: Server, text: "Physical and virtual hosts." },
  { label: "Cloud", to: "/admin/infrastructure/cloud", icon: Cloud, text: "Cloud accounts and resources." },
  { label: "Networks", to: "/admin/infrastructure", icon: Network, text: "Topology, links and segments." },
  { label: "Monitoring", to: "/admin/infrastructure/monitoring", icon: Gauge, text: "Health, metrics and uptime." },
  { label: "Deployments", to: "/admin/infrastructure", icon: GitBranch, text: "Release history and pipelines." },
  { label: "Integrations", to: "/admin/integrations", icon: Plug, text: "Connected data sources." },
];

function Topology() {
  const nodes = [
    { id: "users", label: "USERS", x: 260, y: 20 },
    { id: "network", label: "NETWORK", x: 260, y: 95 },
    { id: "servers", label: "SERVERS", x: 260, y: 170, core: true },
    { id: "apps", label: "APPLICATIONS", x: 80, y: 260 },
    { id: "db", label: "DATABASE", x: 260, y: 260 },
    { id: "storage", label: "STORAGE", x: 440, y: 260 },
    { id: "monitoring", label: "MONITORING", x: 260, y: 350 },
  ];
  const links = [
    "M320 60 V95", "M320 135 V170", "M300 215 C300 240 140 235 140 260", "M320 215 V260", "M340 215 C340 240 500 235 500 260",
    "M140 300 C140 330 300 325 300 350", "M320 300 V350", "M500 300 C500 330 340 325 340 350",
  ];
  return (
    <svg viewBox="0 0 640 400" className="mx-auto h-auto w-full max-w-2xl" role="img" aria-label="Reference architecture: users, network, servers, then applications, database and storage, all observed by monitoring">
      <defs><linearGradient id="inf-g" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0066FF" /><stop offset="1" stopColor="#003B73" /></linearGradient></defs>
      {links.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#1b344f" strokeWidth="1" />
          <path d={d} fill="none" stroke="url(#inf-g)" strokeWidth="1.4" className="admin-flow" style={{ animationDelay: `${i * -0.8}s` }} />
        </g>
      ))}
      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <rect width="120" height="40" rx="6" fill="#070b10" stroke={n.core ? "#0066FF" : "#284662"} />
          <path d="M0 10V0h10M120 30v10h-10" fill="none" stroke="#0066FF" strokeOpacity=".7" />
          <circle cx="12" cy="20" r="3" fill="none" stroke="#8B96A5" />
          <text x="66" y="24" textAnchor="middle" fill="#D5E1EE" fontSize="10" letterSpacing="1.4" fontFamily="JetBrains Mono, monospace">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function InfrastructurePage() {
  const { can, navigate } = useAdmin();
  if (!can("infrastructure.view")) return <Forbidden permission="infrastructure.view" />;
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="Infrastructure" description="The operational layer behind InfiniHon. Live resources appear here once a monitoring or cloud integration is connected."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Infrastructure" }]}
        actions={can("integrations.view") && <Button variant="primary" icon={Plug} onClick={() => navigate("/admin/integrations")}>Connect a source</Button>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel title="Reference architecture" description="Conceptual diagram — not a representation of discovered resources." action={<StatusBadge status="Not connected" />}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(139,150,165,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,150,165,.05)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse,#000,transparent_70%)]" aria-hidden />
            <Topology />
          </div>
        </Panel>
        <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {submodules.map((m) => (
            <button key={m.label} onClick={() => navigate(m.to)} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-ink/80 p-4 text-left transition-colors hover:border-tech/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-obsidian text-steel group-hover:text-volt"><m.icon className="h-4 w-4" aria-hidden /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{m.label}</span><span className="block text-xs text-steel">{m.text}</span></span>
              <span className="font-mono text-[10px] text-steel">0 resources</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ResourcePage({ title, icon: Icon, description, source }: { title: string; icon: typeof Server; description: string; source: string }) {
  const { can, navigate } = useAdmin();
  if (!can("infrastructure.view")) return <Forbidden permission="infrastructure.view" />;
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title={title} description={description}
        breadcrumbs={[{ label: "Infrastructure", to: "/admin/infrastructure" }, { label: title }]} />
      <Panel>
        <EmptyState icon={Icon} title={`No ${title.toLowerCase()} connected.`}
          description={`${title} are discovered from a ${source}. InfiniHon does not simulate resources that aren't connected.`}
          action={can("integrations.view") && <Button variant="primary" icon={Plug} onClick={() => navigate("/admin/integrations")}>Configure integration</Button>} />
      </Panel>
    </>
  );
}

export const ServersPage = () => <ResourcePage title="Servers" icon={Server} description="Physical hosts, virtual machines and edge nodes." source="metrics agent or hypervisor integration" />;
export const CloudPage = () => <ResourcePage title="Cloud resources" icon={Cloud} description="Accounts, regions and resources across cloud providers." source="cloud provider integration" />;

const indicators = [
  { label: "CPU", icon: Cpu }, { label: "Memory", icon: MemoryStick }, { label: "Storage", icon: HardDrive },
  { label: "Network", icon: Wifi }, { label: "Uptime", icon: Timer }, { label: "Services", icon: Activity },
];

export function MonitoringPage() {
  const { can, navigate } = useAdmin();
  if (!can("infrastructure.view")) return <Forbidden permission="infrastructure.view" />;
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="Monitoring" description="Health indicators for servers and services. States (Operational · Warning · Offline) are only shown when reported by a real metrics source."
        breadcrumbs={[{ label: "Infrastructure", to: "/admin/infrastructure" }, { label: "Monitoring" }]}
        actions={<StatusBadge status="No metrics source" />} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {indicators.map((m) => (
          <div key={m.label} className="rounded-xl border border-white/[0.07] bg-ink/80 p-4">
            <div className="flex items-center justify-between text-xs text-steel"><span>{m.label}</span><m.icon className="h-3.5 w-3.5" aria-hidden /></div>
            <div className="mt-3 text-2xl font-extrabold text-snow/35">—</div>
            <div className="mt-3 h-1 rounded-full bg-white/[0.05]" aria-hidden />
            <div className="mt-2 font-mono text-[10px] text-steel">Awaiting data</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title="Service health" padded={false}>
          <EmptyState icon={Database} title="No monitored services." description="Connect Prometheus or another metrics backend to list services and their state." action={can("integrations.view") && <Button onClick={() => navigate("/admin/integrations")}>Open integrations</Button>} />
        </Panel>
        <Panel title="Status legend">
          <ul className="space-y-3 text-sm">
            {[["Operational", "Responding within thresholds."], ["Warning", "Degraded or near a threshold."], ["Offline", "Not responding."]].map(([s, d]) => (
              <li key={s} className="flex items-start justify-between gap-3"><span className="text-steel">{d}</span><StatusBadge status={s} /></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

export function IntegrationsPage() {
  const { can, toast } = useAdmin();
  if (!can("integrations.view")) return <Forbidden permission="integrations.view" />;
  const categories = [...new Set(integrations.map((i) => i.category))];
  return (
    <>
      <PageHeader eyebrow="Infrastructure" title="Integrations" description="External services the Control Center can connect to. No integration is connected in this environment."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Integrations" }]} />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {(["Connected", "Not configured", "Unavailable"] as const).map((s) => (
          <div key={s} className="rounded-xl border border-white/[0.07] bg-ink/80 p-4"><div className="text-xs text-steel">{s}</div><div className="mt-1 text-2xl font-extrabold tabular-nums">{integrations.filter((i) => i.status === s).length}</div></div>
        ))}
      </div>
      <div className="space-y-6">
        {categories.map((c) => (
          <section key={c}>
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{c}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {integrations.filter((i) => i.category === c).map((i) => (
                <div key={i.name} className="flex items-start gap-4 rounded-xl border border-white/[0.07] bg-ink/80 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-white/15 text-steel"><Plug className="h-4 w-4" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{i.name}</span><StatusBadge status={i.status} /></div>
                    <p className="mt-1 text-xs text-steel">{i.description}</p>
                  </div>
                  <Button size="sm" disabled={!can("integrations.edit") || i.status === "Unavailable"}
                    onClick={() => toast("Configuring integrations requires a backend to store credentials securely.", "info")}
                    className={cn(i.status === "Unavailable" && "hidden sm:inline-flex")}>Configure</Button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
