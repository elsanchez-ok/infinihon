import { cn } from "../utils/cn";
import type { VisualKind } from "./data";

export function StoreMark({ className }: { className?: string }) {
  return (
    <a href="#top" className={cn("flex items-center gap-3", className)} aria-label="INFINIHON — inicio">
      <img src="/assets/infinihon.png" alt="INFINIHON" className="h-8 w-auto shrink-0" />
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-[0.13em] text-snow">INFINIHON</span>
        <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.25em] text-steel">Technology & Infrastructure</span>
      </span>
    </a>
  );
}

const strokes = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "square" as const, strokeLinejoin: "miter" as const };
export function TechIcon({ name, className }: { name: string; className?: string }) {
  const icon = {
    node: <><rect x="6" y="6" width="8" height="8" {...strokes} /><rect x="22" y="6" width="8" height="8" {...strokes} /><rect x="14" y="22" width="8" height="8" {...strokes} /><path d="M10 14v4h8v4M26 14v4h-8" {...strokes} /></>,
    network: <><circle cx="18" cy="18" r="3" {...strokes} /><circle cx="7" cy="8" r="2" {...strokes} /><circle cx="29" cy="8" r="2" {...strokes} /><circle cx="7" cy="28" r="2" {...strokes} /><circle cx="29" cy="28" r="2" {...strokes} /><path d="M9 9.5l7 6.5M27 9.5l-7 6.5M9 26.5l7-6.5M27 26.5l-7-6.5" {...strokes} /></>,
    server: <><rect x="5" y="6" width="26" height="7" {...strokes} /><rect x="5" y="17" width="26" height="7" {...strokes} /><path d="M9 10h1M9 21h1M14 10h10M14 21h10" {...strokes} /><path d="M10 28h16" {...strokes} /></>,
    storage: <><path d="M6 9h24v18H6z" {...strokes} /><path d="M6 15h24M6 21h24M10 12h.1M10 18h.1M10 24h.1" {...strokes} /><path d="M14 12h12M14 18h12M14 24h12" {...strokes} /></>,
    shield: <><path d="M18 4l11 4.5v8.7c0 7.3-4.7 12-11 15-6.3-3-11-7.7-11-15V8.5z" {...strokes} /><path d="M12.5 18l3.5 3.5 7-7" {...strokes} /></>,
    cloud: <><path d="M11 26h15a5.5 5.5 0 0 0 .2-11A8 8 0 0 0 11 12.5 6.7 6.7 0 0 0 11 26z" {...strokes} /><path d="M13 30h10M18 26v4" {...strokes} /></>,
    terminal: <><rect x="4" y="6" width="28" height="22" {...strokes} /><path d="M9 13l4 4-4 4M17 21h7" {...strokes} /></>,
    layers: <><path d="M18 5l13 7-13 7L5 12zM5 18l13 7 13-7M5 24l13 7 13-7" {...strokes} /></>,
    search: <><circle cx="16" cy="16" r="8" {...strokes} /><path d="M22 22l7 7" {...strokes} /></>,
    cart: <><path d="M5 7h3l2.2 14h16.4L30 11H10" {...strokes} /><circle cx="13" cy="28" r="1.7" {...strokes} /><circle cx="25" cy="28" r="1.7" {...strokes} /></>,
    user: <><circle cx="18" cy="12" r="5" {...strokes} /><path d="M8 31c.6-6 4-9 10-9s9.4 3 10 9" {...strokes} /></>,
    menu: <><path d="M6 11h24M6 18h24M6 25h24" {...strokes} /></>,
    close: <><path d="M8 8l20 20M28 8L8 28" {...strokes} /></>,
    filter: <><path d="M5 8h26M9 18h18M13 28h10" {...strokes} /><circle cx="10" cy="8" r="2" fill="currentColor" /><circle cx="24" cy="18" r="2" fill="currentColor" /><circle cx="16" cy="28" r="2" fill="currentColor" /></>,
    arrow: <><path d="M5 18h24M21 10l8 8-8 8" {...strokes} /></>,
    plus: <><path d="M18 7v22M7 18h22" {...strokes} /></>,
    minus: <path d="M7 18h22" {...strokes} />,
  }[name] || <circle cx="18" cy="18" r="12" {...strokes} />;
  return <svg viewBox="0 0 36 36" className={cn("h-5 w-5", className)} aria-hidden>{icon}</svg>;
}

export function ProductVisual({ kind, className, compact = false }: { kind: VisualKind; className?: string; compact?: boolean }) {
  const common = "h-full w-full";
  const leds = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 480 340" className={cn(common, className)} role="img" aria-label={`Visual técnico de referencia: ${kind}`}>
      <defs>
        <linearGradient id={`plate-${kind}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#18222f" /><stop offset="1" stopColor="#070b10" />
        </linearGradient>
        <linearGradient id={`face-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#111a23" /><stop offset="1" stopColor="#07090d" />
        </linearGradient>
        <filter id={`glow-${kind}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <pattern id={`grid-${kind}`} width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#8B96A5" strokeOpacity=".07" /></pattern>
      </defs>
      <rect width="480" height="340" fill="#0A0F14" />
      <rect width="480" height="340" fill={`url(#grid-${kind})`} />
      <ellipse cx="245" cy="260" rx="160" ry="34" fill="#0066FF" opacity=".13" filter={`url(#glow-${kind})`} />
      {kind === "router" && <>
        <path d="M98 229l50-62h220l36 62H98z" fill="url(#plate-router)" stroke="#0066FF" strokeOpacity=".45" />
        <path d="M148 167h220l22 40H118z" fill="url(#face-router)" stroke="#8B96A5" strokeOpacity=".35" />
        <path d="M179 167l-18-47M336 167l23-47" stroke="#8B96A5" strokeWidth="3" />
        <circle cx="160" cy="118" r="4" fill="#00A8FF" /><circle cx="359" cy="118" r="4" fill="#00A8FF" />
        <rect x="160" y="184" width="178" height="18" fill="#05070A" stroke="#8B96A5" strokeOpacity=".35" />
        {leds.map((i) => <g key={i}><rect x={180 + i * 25} y="189" width="13" height="7" fill="#003B73" stroke="#0066FF" strokeOpacity=".6" /><circle cx={184 + i * 25} cy="192.5" r="1.5" fill="#00A8FF" className={i % 2 ? "pulse-soft" : ""} /></g>)}
        <text x="240" y="254" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="3">EDGE / ROUTING</text>
      </>}
      {kind === "server" && <>
        <path d="M118 88h246v168H118z" fill="url(#plate-server)" stroke="#0066FF" strokeOpacity=".45" />
        {[0,1,2,3].map((i) => <g key={i}><rect x="135" y={108 + i * 33} width="212" height="23" fill="url(#face-server)" stroke="#8B96A5" strokeOpacity=".3" /><circle cx="151" cy={119.5 + i * 33} r="2.5" fill="#00A8FF" className={i === 1 ? "pulse-soft" : ""} /><path d={`M168 ${119.5 + i * 33}h130`} stroke="#8B96A5" strokeOpacity=".24" /><path d={`M310 ${119.5 + i * 33}h20`} stroke="#0066FF" strokeOpacity=".7" /></g>)}
        <path d="M98 260h286" stroke="#0066FF" strokeOpacity=".45" /><path d="M118 88l-20 172M364 88l20 172" stroke="#8B96A5" strokeOpacity=".25" />
        <text x="240" y="286" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="3">COMPUTE / NODE</text>
      </>}
      {kind === "storage" && <>
        <path d="M125 74h230v187H125z" fill="url(#plate-storage)" stroke="#0066FF" strokeOpacity=".45" />
        {[0,1,2,3,4].map((i) => <g key={i}><rect x="148" y={96 + i * 29} width="184" height="20" fill="#06090d" stroke="#8B96A5" strokeOpacity=".3" /><rect x="159" y={101 + i * 29} width="5" height="10" fill="#00A8FF" opacity={i === 2 ? .5 : 1} className={i === 2 ? "pulse-soft" : ""} /><path d={`M176 ${106 + i * 29}h115`} stroke="#8B96A5" strokeOpacity=".2" /><circle cx="311" cy={106 + i * 29} r="2" fill="#003B73" /></g>)}
        <path d="M125 261h230" stroke="#0066FF" strokeOpacity=".55" /><text x="240" y="286" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="3">STORAGE / ARRAY</text>
      </>}
      {kind === "gateway" && <>
        <path d="M131 98h218v139H131z" fill="url(#plate-gateway)" stroke="#0066FF" strokeOpacity=".45" />
        <path d="M151 119h178v62H151z" fill="#05070A" stroke="#8B96A5" strokeOpacity=".32" />
        <path d="M168 158l30-25 25 17 34-37 51 43" fill="none" stroke="#0066FF" strokeWidth="1.5" /><circle cx="257" cy="113" r="3" fill="#00A8FF" className="pulse-soft" />
        {[0,1,2,3,4].map((i) => <rect key={i} x={160 + i * 33} y="194" width="21" height="13" fill="#003B73" stroke="#0066FF" strokeOpacity=".55" />)}
        <path d="M131 237h218" stroke="#0066FF" strokeOpacity=".5" /><text x="240" y="273" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="3">SECURITY / GATEWAY</text>
      </>}
      {kind === "cluster" && <>
        {[0,1,2].map((row) => [0,1,2].map((col) => <g key={`${row}-${col}`} transform={`translate(${130 + col * 75} ${78 + row * 56})`}><rect width="54" height="37" fill="url(#plate-cluster)" stroke="#0066FF" strokeOpacity=".45" /><circle cx="10" cy="10" r="2" fill="#00A8FF" className={(row + col) % 2 ? "pulse-soft" : ""} /><path d="M20 13h25M20 22h18" stroke="#8B96A5" strokeOpacity=".35" /></g>))}
        <path d="M157 115v19m75-19v19m75-19v19M157 190v18m75-18v18m75-18v18M157 246v21m75-21v21m75-21v21" stroke="#0066FF" strokeOpacity=".45" />
        <path d="M157 153h150M157 209h150" stroke="#0066FF" strokeOpacity=".35" /><circle cx="232" cy="282" r="4" fill="#00A8FF" className="pulse-soft" />
        <text x="240" y="310" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="3">EDGE / CLUSTER</text>
      </>}
      {kind === "monitor" && <>
        <path d="M90 78h300v181H90z" fill="url(#plate-monitor)" stroke="#0066FF" strokeOpacity=".45" /><path d="M107 96h266v128H107z" fill="#05070A" />
        {[0,1,2].map((i) => <path key={i} d={`M122 ${136 + i * 30} C150 ${110 + i * 18} 170 ${152 - i * 7} 204 ${129 + i * 13} S265 ${145 - i * 10} 290 ${122 + i * 22} S330 ${125 - i * 10} 358 ${112 + i * 15}`} fill="none" stroke={i === 0 ? "#00A8FF" : i === 1 ? "#0066FF" : "#8B96A5"} strokeOpacity={i === 2 ? .45 : .85} strokeWidth="1.5" />)}
        <path d="M210 259v25m60-25v25M180 284h120" stroke="#8B96A5" strokeOpacity=".35" /><text x="240" y="313" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="3">OBSERVABILITY / STACK</text>
      </>}
      {!compact && <text x="22" y="28" fontFamily="JetBrains Mono" fontSize="9" fill="#8B96A5" letterSpacing="2">REFERENCE VISUAL / NOT PRODUCT PHOTO</text>}
    </svg>
  );
}

export function HeroStoreVisual() {
  const points = [[100, 115], [195, 85], [300, 135], [385, 75], [485, 150], [590, 96], [700, 156], [760, 72], [840, 130], [930, 90], [1000, 160]];
  return (
    <svg viewBox="0 0 1100 520" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="hero-g"><stop stopColor="#0066FF" stopOpacity=".3" /><stop offset="1" stopColor="#0066FF" stopOpacity="0" /></radialGradient>
        <filter id="hero-blur"><feGaussianBlur stdDeviation="22" /></filter>
        <pattern id="hero-grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#8B96A5" strokeOpacity=".08" /></pattern>
      </defs>
      <rect width="1100" height="520" fill="url(#hero-grid)" />
      <ellipse cx="650" cy="265" rx="390" ry="250" fill="url(#hero-g)" filter="url(#hero-blur)" />
      {points.slice(0,-1).map((p, i) => <path key={i} d={`M${p[0]} ${p[1]} C${p[0] + 50} ${p[1] + 120} ${points[i+1][0] - 50} ${points[i+1][1] + 110} ${points[i+1][0]} ${points[i+1][1]}`} fill="none" stroke="#0066FF" strokeOpacity=".45" strokeWidth="1.2" className="flow-line" />)}
      {[0, 1, 2, 3].map((layer) => <path key={layer} d={`M80 ${340 + layer*28} C300 ${285 + layer*10} 570 ${430-layer*35} 1040 ${290 + layer*25}`} fill="none" stroke="#003B73" strokeOpacity={.5-layer*.06} strokeWidth="1" />)}
      <g transform="translate(430 185)">
        <path d="M0 75l55-65h190l68 65H0z" fill="#101924" stroke="#0066FF" strokeOpacity=".7" />
        <path d="M55 10h190l40 45H18z" fill="#070b10" stroke="#8B96A5" strokeOpacity=".4" />
        {Array.from({length: 6}).map((_, i) => <g key={i}><rect x={70+i*30} y="36" width="19" height="11" fill="#003B73" stroke="#0066FF" strokeOpacity=".8" /><circle cx={76+i*30} cy="41.5" r="1.8" fill="#00A8FF" className={i%2 ? "pulse-soft" : ""}/></g>)}
        <text x="155" y="101" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fill="#8B96A5" letterSpacing="3">INFINIHON / CORE</text>
      </g>
      {points.map(([x,y], i) => <g key={i}><circle cx={x} cy={y} r={i===5 ? 7 : 4} fill="#05070A" stroke="#00A8FF" strokeOpacity=".8"/><circle cx={x} cy={y} r={i===5 ? 26 : 14} fill="none" stroke="#0066FF" strokeOpacity=".25" className={i%3===0 ? "ring" : ""}/></g>)}
      <g fontFamily="JetBrains Mono" fontSize="10" fill="#8B96A5" letterSpacing="2"><text x="90" y="215">ROUTING</text><text x="255" y="255">SECURITY</text><text x="724" y="230">CLOUD</text><text x="930" y="245">OBSERVABILITY</text></g>
    </svg>
  );
}