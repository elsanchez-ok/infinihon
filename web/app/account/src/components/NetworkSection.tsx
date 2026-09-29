import { useEffect, useState } from "react";
import { Reveal, RevealTitle, SectionLabel, useReducedMotion, Corners } from "./ui";

type Pt = { x: number; y: number };
type NodeDef = { id: string; label: string; sub: string; kind: "isp" | "core" | "fw" | "cloud" | "site" | "srv" | "cli" };

const NODES: NodeDef[] = [
  { id: "ispa", label: "ISP A", sub: "AS 65001", kind: "isp" },
  { id: "ispb", label: "ISP B", sub: "AS 65002", kind: "isp" },
  { id: "rtr", label: "Edge Router", sub: "MikroTik", kind: "core" },
  { id: "fw", label: "Firewall", sub: "Stateful · NAT", kind: "fw" },
  { id: "core", label: "Core Switch", sub: "L3 · Trunk", kind: "core" },
  { id: "srv", label: "Servers", sub: "VLAN 10", kind: "srv" },
  { id: "cli", label: "Clients", sub: "VLAN 20", kind: "cli" },
  { id: "cloud", label: "Cloud", sub: "VPC", kind: "cloud" },
  { id: "b1", label: "Sede 01", sub: "Remote site", kind: "site" },
  { id: "b2", label: "Sede 02", sub: "Remote site", kind: "site" },
  { id: "b3", label: "Sede 03", sub: "Remote site", kind: "site" },
];

const EDGES: { a: string; b: string; tag: string; hot?: boolean }[] = [
  { a: "ispa", b: "rtr", tag: "BGP" },
  { a: "ispb", b: "rtr", tag: "BGP" },
  { a: "rtr", b: "fw", tag: "", hot: true },
  { a: "fw", b: "core", tag: "ACL", hot: true },
  { a: "core", b: "srv", tag: "VLAN 10" },
  { a: "core", b: "cli", tag: "VLAN 20" },
  { a: "fw", b: "cloud", tag: "IPsec VPN" },
  { a: "rtr", b: "b1", tag: "MPLS" },
  { a: "rtr", b: "b2", tag: "MPLS" },
  { a: "rtr", b: "b3", tag: "WireGuard" },
];

const DESKTOP: { vb: [number, number]; w: number; h: number; pos: Record<string, Pt> } = {
  vb: [1200, 620], w: 150, h: 56,
  pos: {
    ispa: { x: 110, y: 110 }, ispb: { x: 110, y: 290 }, rtr: { x: 350, y: 200 }, fw: { x: 590, y: 200 },
    core: { x: 830, y: 200 }, srv: { x: 1080, y: 110 }, cli: { x: 1080, y: 290 }, cloud: { x: 830, y: 50 },
    b1: { x: 240, y: 530 }, b2: { x: 590, y: 540 }, b3: { x: 940, y: 530 },
  },
};
const MOBILE: typeof DESKTOP = {
  vb: [420, 860], w: 124, h: 48,
  pos: {
    ispa: { x: 100, y: 50 }, ispb: { x: 320, y: 50 }, rtr: { x: 210, y: 180 }, b1: { x: 72, y: 300 }, b3: { x: 348, y: 300 },
    fw: { x: 210, y: 400 }, cloud: { x: 348, y: 510 }, core: { x: 210, y: 600 }, srv: { x: 100, y: 780 }, cli: { x: 320, y: 780 },
    b2: { x: -999, y: -999 },
  },
};

function curve(a: Pt, b: Pt) {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) > Math.abs(dy)) return `M${a.x},${a.y} C${a.x + dx / 2},${a.y} ${a.x + dx / 2},${b.y} ${b.x},${b.y}`;
  return `M${a.x},${a.y} C${a.x},${a.y + dy / 2} ${b.x},${a.y + dy / 2} ${b.x},${b.y}`;
}

function useIsDesktop() {
  const [d, setD] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setD(mq.matches);
    const f = () => setD(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return d;
}

function Topology() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const L = desktop ? DESKTOP : MOBILE;
  const [hover, setHover] = useState<string | null>(null);
  const visible = (id: string) => L.pos[id].x > -100;
  const edges = EDGES.filter((e) => visible(e.a) && visible(e.b));
  const fs = desktop ? 14 : 12;

  return (
    <svg viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} className="h-auto w-full" role="img" aria-label="Diagrama de red: proveedores con BGP, router MikroTik, firewall, core switch, VLANs de servidores y clientes, VPN al cloud y sedes remotas por MPLS y VPN">
      <defs>
        <radialGradient id="nglow">
          <stop offset="0%" stopColor="#0066FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
        </radialGradient>
        <filter id="pk" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* edges */}
      {edges.map((e, i) => {
        const a = L.pos[e.a], b = L.pos[e.b];
        const d = curve(a, b);
        const lit = hover && (hover === e.a || hover === e.b);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        return (
          <g key={i}>
            <path id={`ne-${i}`} d={d} fill="none" stroke="#003B73" strokeWidth={e.hot ? 2.5 : 1.5} opacity={0.9} />
            <path d={d} fill="none" stroke={lit ? "#00A8FF" : "#0066FF"} strokeWidth={1} opacity={lit ? 0.95 : 0.45} className="flow-line" style={{ transition: "opacity .4s" }} />
            {e.tag && (
              <g transform={`translate(${mid.x},${mid.y})`}>
                <rect x={-(e.tag.length * 3.8 + 10)} y={-10} width={e.tag.length * 7.6 + 20} height={20} fill="#05070A" stroke={lit ? "#00A8FF" : "rgba(139,150,165,0.35)"} />
                <text textAnchor="middle" y={4} fontFamily="JetBrains Mono, monospace" fontSize={desktop ? 10.5 : 9.5} fill={lit ? "#F5F7FA" : "#8B96A5"} letterSpacing="1">
                  {e.tag}
                </text>
              </g>
            )}
            {!reduced && (
              <>
                <circle r={6} fill="#00A8FF" opacity={0.5} filter="url(#pk)">
                  <animateMotion dur={`${5 + (i % 4) * 1.5}s`} begin={`${i * 0.7}s`} repeatCount="indefinite" keyPoints={i % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear">
                    <mpath href={`#ne-${i}`} />
                  </animateMotion>
                </circle>
                <circle r={2.2} fill="#F5F7FA">
                  <animateMotion dur={`${5 + (i % 4) * 1.5}s`} begin={`${i * 0.7}s`} repeatCount="indefinite" keyPoints={i % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear">
                    <mpath href={`#ne-${i}`} />
                  </animateMotion>
                </circle>
              </>
            )}
          </g>
        );
      })}

      {/* nodes */}
      {NODES.filter((n) => visible(n.id)).map((n) => {
        const p = L.pos[n.id];
        const isCore = n.id === "rtr" || n.id === "core" || n.id === "fw";
        const active = hover === n.id;
        return (
          <g
            key={n.id}
            transform={`translate(${p.x - L.w / 2},${p.y - L.h / 2})`}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "default" }}
          >
            {isCore && <circle cx={L.w / 2} cy={L.h / 2} r={L.w * 0.7} fill="url(#nglow)" opacity={active ? 0.9 : 0.45} />}
            <rect width={L.w} height={L.h} fill="#0A0F14" stroke={active ? "#00A8FF" : isCore ? "#0066FF" : "rgba(139,150,165,0.35)"} strokeWidth={active ? 1.5 : 1} />
            <rect width={3} height={L.h} fill={isCore ? "#0066FF" : n.kind === "site" || n.kind === "isp" ? "#8B96A5" : "#003B73"} />
            <circle cx={L.w - 12} cy={12} r={2.5} fill="#00A8FF" className="pulse-soft" />
            <text x={14} y={L.h / 2 - 3} fontFamily="Manrope, sans-serif" fontWeight={700} fontSize={fs} fill="#F5F7FA">{n.label}</text>
            <text x={14} y={L.h / 2 + 13} fontFamily="JetBrains Mono, monospace" fontSize={fs - 4} fill={n.id === "rtr" ? "#00A8FF" : "#8B96A5"} letterSpacing="0.5">{n.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

const legend = [
  ["MikroTik", "RouterOS en borde y sedes"],
  ["BGP", "Multihoming entre proveedores"],
  ["MPLS", "Transporte privado entre sedes"],
  ["VPN", "IPsec / WireGuard cifrado"],
  ["VLAN", "Segmentación por función"],
  ["Firewall", "Políticas, NAT y filtrado"],
];

export default function NetworkSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="absolute inset-0 bg-grid opacity-50 mask-radial" />
      <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/25 blur-[140px]" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal><SectionLabel index="04">Network core</SectionLabel></Reveal>
            <RevealTitle
              className="mt-8 text-[12vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-[6.5rem]"
              lines={["Todo comienza", "con una red."]}
              accentLast
            />
          </div>
          <Reveal delay={200} className="text-[15px] leading-relaxed text-steel lg:col-span-4">
            Antes del cloud, antes de las aplicaciones, está la red. Diseñamos topologías redundantes, segmentadas y
            documentadas, desde una oficina hasta múltiples sedes interconectadas.
          </Reveal>
        </div>

        <Reveal delay={150} className="relative mt-16 border border-white/[0.08] bg-obsidian/60 p-3 backdrop-blur-sm md:mt-20 md:p-8">
          <Corners />
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-steel/70">
            <span>Topology · reference design</span>
            <span className="hidden sm:inline">Hover nodes to trace paths</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" /> Simulated traffic</span>
          </div>
          <Topology />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-px bg-white/[0.06] sm:grid-cols-3 lg:grid-cols-6">
          {legend.map(([k, v], i) => (
            <Reveal key={k} delay={i * 60} className="group bg-obsidian p-5 transition-colors duration-500 hover:bg-hn/30">
              <div className="font-mono text-[10px] text-volt">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-3 text-lg font-bold text-snow">{k}</div>
              <div className="mt-1 text-[13px] leading-snug text-steel">{v}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
