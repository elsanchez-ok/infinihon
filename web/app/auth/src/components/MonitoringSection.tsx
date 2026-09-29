import { useEffect, useState, type ReactNode } from "react";
import { Reveal, RevealTitle, SectionLabel, useInView, useReducedMotion } from "./ui";
import { cn } from "../utils/cn";

const N = 40;
function walk(prev: number, min: number, max: number, vol: number) {
  const v = prev + (Math.random() - 0.5) * vol;
  return Math.min(max, Math.max(min, v));
}
function init(base: number, vol: number, min: number, max: number) {
  const a: number[] = [];
  let v = base;
  for (let i = 0; i < N; i++) { v = walk(v, min, max, vol); a.push(v); }
  return a;
}

function useTelemetry(active: boolean) {
  const reduced = useReducedMotion();
  const [s, setS] = useState(() => ({
    cpu: init(42, 10, 15, 85),
    mem: 61,
    rx: init(55, 20, 10, 95),
    tx: init(35, 16, 8, 80),
    lat: init(18, 5, 8, 40),
    req: init(60, 18, 20, 100),
  }));
  useEffect(() => {
    if (!active || reduced) return;
    const id = setInterval(() => {
      setS((p) => ({
        cpu: [...p.cpu.slice(1), walk(p.cpu[N - 1], 15, 85, 12)],
        mem: walk(p.mem, 52, 74, 2),
        rx: [...p.rx.slice(1), walk(p.rx[N - 1], 10, 95, 22)],
        tx: [...p.tx.slice(1), walk(p.tx[N - 1], 8, 80, 18)],
        lat: [...p.lat.slice(1), walk(p.lat[N - 1], 8, 40, 6)],
        req: [...p.req.slice(1), walk(p.req[N - 1], 20, 100, 20)],
      }));
    }, 1400);
    return () => clearInterval(id);
  }, [active, reduced]);
  return s;
}

function path(data: number[], w: number, h: number, max = 100) {
  return data.map((v, i) => `${i ? "L" : "M"}${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
}

function Panel({ title, meta, children, className }: { title: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("group relative flex flex-col bg-obsidian p-4 transition-colors duration-500 hover:bg-[#070b10] md:p-5", className)}>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
        <span className="flex items-center gap-2"><span className="h-1 w-1 bg-volt" />{title}</span>
        {meta}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  );
}

function AreaChart({ data, max = 100, color = "#0066FF", id }: { data: number[]; max?: number; color?: string; id: string }) {
  const w = 400, h = 120;
  const d = path(data, w, h, max);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-28 w-full md:h-32">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="rgba(139,150,165,0.1)" strokeDasharray="2 4" />
      ))}
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} style={{ transition: "d 1.2s ease" }} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ transition: "d 1.2s ease" }} />
    </svg>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 52, c = Math.PI * r; // half circle
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <svg viewBox="0 0 140 80" className="w-full max-w-[220px]">
        <path d="M18,72 A52,52 0 0 1 122,72" fill="none" stroke="rgba(139,150,165,0.12)" strokeWidth="8" />
        <path d="M18,72 A52,52 0 0 1 122,72" fill="none" stroke="#0066FF" strokeWidth="8" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = Math.PI - (i / 10) * Math.PI;
          return <line key={i} x1={70 + Math.cos(a) * 40} y1={72 - Math.sin(a) * 40} x2={70 + Math.cos(a) * 44} y2={72 - Math.sin(a) * 44} stroke="rgba(139,150,165,0.4)" />;
        })}
        <text x="70" y="68" textAnchor="middle" fontFamily="Manrope" fontWeight="800" fontSize="20" fill="#F5F7FA">{value.toFixed(0)}%</text>
      </svg>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">used / allocatable</div>
    </div>
  );
}

const alerts = [
  { lvl: "warn", t: "disk_usage > 80%", s: "srv-backup-02" },
  { lvl: "ok", t: "bgp_session up", s: "edge-rtr-01" },
  { lvl: "info", t: "cert renews in 14d", s: "ingress" },
  { lvl: "ok", t: "vpn tunnel restored", s: "sede-03" },
];

export default function MonitoringSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1, false);
  const s = useTelemetry(inView);
  const last = (a: number[]) => a[a.length - 1];

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="absolute inset-0 bg-grid-fine opacity-60 mask-fade-b" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal><SectionLabel index="06">Monitoring · Observability</SectionLabel></Reveal>
            <RevealTitle
              className="mt-8 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[5rem]"
              lines={["Si no puedes verlo,", "no puedes controlarlo."]}
              accentLast
            />
          </div>
          <Reveal delay={200} className="text-[15px] leading-relaxed text-steel lg:col-span-4">
            Implementamos Prometheus, Grafana y alertas sobre toda tu infraestructura: red, servidores, contenedores y
            aplicaciones. Un solo lugar para ver lo que está pasando.
          </Reveal>
        </div>

        <Reveal delay={100} className="mt-16 md:mt-20">
          <div ref={ref} className="border border-white/[0.08]">
            {/* toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-ink px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel md:px-5">
              <div className="flex items-center gap-4">
                <span className="text-snow">ops / infrastructure-overview</span>
                <span className="hidden text-steel/50 sm:inline">last 15m · refresh 1.4s</span>
              </div>
              <span className="flex items-center gap-2 border border-volt/40 px-2 py-1 text-volt">
                <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" /> Demo · datos simulados
              </span>
            </div>

            <div className="grid gap-px bg-white/[0.08] md:grid-cols-6">
              <Panel title="CPU" meta={<span className="text-snow">{last(s.cpu).toFixed(1)}%</span>} className="md:col-span-4">
                <AreaChart data={s.cpu} id="g-cpu" />
              </Panel>
              <Panel title="Memory" className="md:col-span-2">
                <Gauge value={s.mem} />
              </Panel>

              <Panel title="Network" meta={<span><span className="text-tech">rx</span> / <span className="text-steel">tx</span></span>} className="md:col-span-3">
                <div className="flex h-28 items-end gap-[3px] md:h-32">
                  {s.rx.slice(-28).map((v, i) => (
                    <div key={i} className="relative flex h-full flex-1 items-end">
                      <div className="w-full bg-tech/80" style={{ height: `${v}%`, transition: "height 1s ease" }} />
                      <div className="absolute bottom-0 w-full bg-steel/40" style={{ height: `${s.tx.slice(-28)[i]}%`, transition: "height 1s ease" }} />
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Latency" meta={<span className="text-snow">{last(s.lat).toFixed(0)} ms</span>} className="md:col-span-3">
                <AreaChart data={s.lat} max={50} color="#00A8FF" id="g-lat" />
              </Panel>

              <Panel title="Uptime" meta={<span className="text-steel/60">90d</span>} className="md:col-span-2">
                <div className="grid grid-cols-[repeat(30,1fr)] gap-[2px]">
                  {Array.from({ length: 90 }).map((_, i) => (
                    <span key={i} className={cn("h-3", i === 37 || i === 71 ? "bg-steel/40" : "bg-tech/70")} />
                  ))}
                </div>
                <div className="mt-4 flex justify-between font-mono text-[10px] text-steel">
                  <span>SLO target</span><span className="text-snow">objetivo definido por proyecto</span>
                </div>
              </Panel>
              <Panel title="Requests" meta={<span className="text-snow">{(last(s.req) * 12).toFixed(0)} rpm</span>} className="md:col-span-2">
                <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="h-16 w-full">
                  <path d={path(s.req, 200, 60)} fill="none" stroke="#F5F7FA" strokeOpacity="0.8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ transition: "d 1.2s ease" }} />
                </svg>
              </Panel>
              <Panel title="Alerts" meta={<span className="text-steel/60">alertmanager</span>} className="md:col-span-2">
                <ul className="space-y-2 font-mono text-[11px]">
                  {alerts.map((a) => (
                    <li key={a.t} className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", a.lvl === "warn" ? "bg-amber-400" : a.lvl === "ok" ? "bg-volt" : "bg-steel")} />
                      <span className="truncate text-snow/90">{a.t}</span>
                      <span className="ml-auto shrink-0 text-steel/60">{a.s}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
            Dashboard de referencia con valores generados aleatoriamente en tu navegador. No son métricas de clientes.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
