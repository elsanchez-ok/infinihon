import { useMemo } from "react";
import { Reveal, RevealTitle, SectionLabel, useReducedMotion } from "./ui";

// Simplified outline of Honduras (lon, lat) — abstraction, not cartographic precision.
const OUTLINE: [number, number][] = [
  [-89.36, 14.42], [-89.14, 14.68], [-88.85, 14.9], [-88.6, 15.12], [-88.4, 15.45], [-88.22, 15.72],
  [-87.9, 15.87], [-87.6, 15.8], [-87.3, 15.78], [-86.8, 15.77], [-86.35, 15.9], [-85.95, 15.95],
  [-85.45, 15.9], [-84.95, 15.93], [-84.5, 15.8], [-84.0, 15.52], [-83.6, 15.3], [-83.15, 15.0],
  [-83.55, 14.93], [-84.0, 14.76], [-84.45, 14.63], [-84.8, 14.8], [-85.1, 14.55], [-85.3, 14.25],
  [-85.7, 13.97], [-86.0, 14.05], [-86.4, 13.76], [-86.75, 13.3], [-87.3, 12.98], [-87.45, 13.28],
  [-87.8, 13.4], [-87.75, 13.85], [-88.1, 13.95], [-88.5, 13.85], [-88.85, 14.0], [-89.1, 14.25],
];
const K = 100;
const proj = ([lon, lat]: [number, number]) => ({ x: (lon + 89.6) * K, y: (16.2 - lat) * K });

const CITIES = [
  { n: "TGU", full: "Tegucigalpa", ll: [-87.21, 14.08] as [number, number], hub: true },
  { n: "SAP", full: "San Pedro Sula", ll: [-88.03, 15.5] as [number, number] },
  { n: "LCE", full: "La Ceiba", ll: [-86.79, 15.76] as [number, number] },
  { n: "CHO", full: "Choluteca", ll: [-87.19, 13.3] as [number, number] },
  { n: "JUT", full: "Juticalpa", ll: [-86.22, 14.66] as [number, number] },
  { n: "CPN", full: "Comayagua", ll: [-87.64, 14.45] as [number, number] },
];

function inside(p: { x: number; y: number }, poly: { x: number; y: number }[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

function useMesh() {
  return useMemo(() => {
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647), (s - 1) / 2147483646);
    const poly = OUTLINE.map(proj);
    const pts: { x: number; y: number; edge?: boolean }[] = [];
    // points along outline
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.round(len / 34));
      for (let k = 0; k < steps; k++) pts.push({ x: a.x + ((b.x - a.x) * k) / steps, y: a.y + ((b.y - a.y) * k) / steps, edge: true });
    }
    // interior points
    let tries = 0;
    while (pts.filter((p) => !p.edge).length < 70 && tries < 5000) {
      tries++;
      const p = { x: 20 + r() * 620, y: 20 + r() * 320 };
      if (!inside(p, poly)) continue;
      if (pts.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 26)) continue;
      pts.push(p);
    }
    // connect to nearest neighbours
    const links = new Set<string>();
    const L: [number, number][] = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: Math.hypot(q.x - p.x, q.y - p.y) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, p.edge ? 2 : 3);
      near.forEach(({ j, d }) => {
        if (d > 70) return;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!links.has(key)) { links.add(key); L.push([i, j]); }
      });
    });
    return { poly, pts, links: L };
  }, []);
}

function Map() {
  const { poly, pts, links } = useMesh();
  const reduced = useReducedMotion();
  const cities = CITIES.map((c) => ({ ...c, ...proj(c.ll) }));
  const hub = cities[0];
  const outline = poly.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg viewBox="-20 -60 760 460" className="h-auto w-full" role="img" aria-label="Mapa abstracto de Honduras formado por una red de nodos de infraestructura">
      <defs>
        <radialGradient id="hng">
          <stop offset="0%" stopColor="#0066FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* global links leaving the country */}
      {[
        { x: 740, y: -40, l: "NORTH AMERICA" },
        { x: 740, y: 120, l: "EUROPE" },
        { x: 740, y: 380, l: "SOUTH AMERICA" },
      ].map((g, i) => {
        const d = `M${hub.x},${hub.y} C${hub.x + 160},${hub.y - 20} ${g.x - 160},${g.y} ${g.x},${g.y}`;
        return (
          <g key={g.l}>
            <path id={`gl-${i}`} d={d} fill="none" stroke="#0066FF" strokeOpacity="0.35" strokeWidth="1" className="flow-line" />
            <text x={g.x - 6} y={g.y - 8} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#8B96A5" letterSpacing="2">{g.l} →</text>
            {!reduced && (
              <circle r="2" fill="#F5F7FA">
                <animateMotion dur={`${7 + i * 2}s`} begin={`${i * 1.5}s`} repeatCount="indefinite"><mpath href={`#gl-${i}`} /></animateMotion>
              </circle>
            )}
          </g>
        );
      })}

      <path d={outline} fill="rgba(0,59,115,0.12)" stroke="rgba(0,102,255,0.35)" strokeWidth="1" strokeDasharray="3 5" />

      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y}
          stroke="#0066FF"
          strokeWidth="0.8"
          className="pulse-soft"
          style={{ animationDelay: `${(i * 0.37) % 4}s`, animationDuration: `${4 + (i % 5)}s`, opacity: 0.4 }}
        />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.edge ? 1.8 : 1.4} fill={p.edge ? "#8B96A5" : "#00A8FF"} opacity={p.edge ? 0.7 : 0.6} />
      ))}

      {/* city backbone */}
      {cities.slice(1).map((c, i) => (
        <g key={c.n}>
          <path id={`cb-${i}`} d={`M${hub.x},${hub.y} L${c.x},${c.y}`} stroke="#00A8FF" strokeOpacity="0.55" strokeWidth="1.2" />
          {!reduced && (
            <circle r="2.2" fill="#F5F7FA">
              <animateMotion dur={`${3 + i * 0.6}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href={`#cb-${i}`} /></animateMotion>
            </circle>
          )}
        </g>
      ))}
      {cities.map((c) => (
        <g key={c.n} transform={`translate(${c.x},${c.y})`}>
          {c.hub && <circle r="46" fill="url(#hng)" />}
          {c.hub && <circle r="8" fill="none" stroke="#00A8FF" className="ring" />}
          <circle r={c.hub ? 5 : 3.2} fill={c.hub ? "#F5F7FA" : "#0A0F14"} stroke="#00A8FF" strokeWidth="1.3" />
          <text x={c.hub ? 12 : 8} y={c.hub ? 18 : -7} fontFamily="JetBrains Mono" fontSize={c.hub ? 11 : 9} fill={c.hub ? "#F5F7FA" : "#8B96A5"} letterSpacing="1.5">
            {c.hub ? "TGU · HQ" : c.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Five points in quincunx — a quiet nod to the five stars. */
function Quincunx() {
  return (
    <svg viewBox="0 0 30 18" className="h-4 w-7" aria-hidden>
      {[[5, 4], [25, 4], [15, 9], [5, 14], [25, 14]].map(([x, y], i) => (
        <path key={i} d={`M${x},${y - 2.6} L${x + 0.8},${y - 0.8} L${x + 2.6},${y - 0.8} L${x + 1.2},${y + 0.4} L${x + 1.7},${y + 2.4} L${x},${y + 1.2} L${x - 1.7},${y + 2.4} L${x - 1.2},${y + 0.4} L${x - 2.6},${y - 0.8} L${x - 0.8},${y - 0.8} Z`} fill="#0066FF" />
      ))}
    </svg>
  );
}

export default function HondurasSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-ink py-28 md:py-40">
      <div className="absolute right-0 top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full bg-hn/30 blur-[140px]" />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-16 px-5 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal><SectionLabel index="09">Identidad</SectionLabel></Reveal>
          <RevealTitle
            className="mt-8 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
            lines={["Tecnología", "construida", "desde Honduras."]}
            accentLast
          />
          <Reveal delay={200} className="mt-8 max-w-md text-[15px] leading-relaxed text-steel">
            Somos un equipo hondureño que diseña infraestructura con estándares internacionales. Entendemos el contexto
            local — proveedores, conectividad, operación — y lo conectamos con las mejores prácticas globales.
          </Reveal>
          <Reveal delay={300} className="mt-12 border-t border-white/[0.08] pt-6">
            <div className="flex items-center gap-4">
              <Quincunx />
              <span className="text-xl font-bold text-snow">Hecho en Honduras.</span>
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-steel">
              Desde Honduras <span className="text-tech">→</span> hacia el mundo
            </div>
          </Reveal>
        </div>
        <Reveal delay={150} className="lg:col-span-7">
          <Map />
          <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-steel/50">
            <span>HN · abstract infrastructure mesh</span>
            <span>13°N — 16°N</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
