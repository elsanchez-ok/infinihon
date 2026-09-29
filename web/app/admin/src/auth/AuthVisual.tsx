import type { ReactNode } from "react";

export function AuthMark({ compact = false }: { compact?: boolean }) {
  return (
    <a className="auth-mark" href="/" aria-label="INFINIHON — volver al sitio">
      <svg viewBox="0 0 38 38" className="auth-mark-symbol" aria-hidden="true">
        <rect x=".5" y=".5" width="37" height="37" fill="#05070A" stroke="#0066FF" />
        <path d="M8 25.5C8 16 14.5 12 19 19c4.5 7 11 3 11-6.5" fill="none" stroke="#F5F7FA" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12.5c0 9.5 6.5 13.5 11 6.5 4.5-7 11-3 11 6.5" fill="none" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="19" r="2" fill="#00A8FF" />
      </svg>
      <span className="auth-mark-word">INFINIHON{!compact && <small>TECHNOLOGY & INFRASTRUCTURE</small>}</span>
    </a>
  );
}

const paths = [
  { d: "M378 242 H224 V127 H172", id: "p1" },
  { d: "M406 231 V116 H587 V94 H638", id: "p2" },
  { d: "M485 254 H607 V256 H663", id: "p3" },
  { d: "M457 324 V401 H594 V420 H644", id: "p4" },
  { d: "M386 324 V421 H252 V442 H211", id: "p5" },
  { d: "M354 281 H189 V306 H134", id: "p6" },
];

const nodes = [
  { x: 92, y: 106, width: 80, label: "RED", index: "01" },
  { x: 638, y: 73, width: 102, label: "NUBE", index: "02" },
  { x: 663, y: 236, width: 97, label: "SISTEMAS", index: "03" },
  { x: 644, y: 400, width: 92, label: "DATOS", index: "04" },
  { x: 114, y: 422, width: 97, label: "SERVIDORES", index: "05" },
  { x: 40, y: 286, width: 94, label: "SEGURIDAD", index: "06" },
];

function Module({ x, y, width, label, index }: (typeof nodes)[number]) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height="42" fill="#0A0F14" stroke="#284662" strokeWidth="1" />
      <path d={`M0 0h16M0 0v16M${width} 42h-16M${width} 42v-16`} fill="none" stroke="#0066FF" strokeWidth="1" opacity=".8" />
      <rect x="11" y="13" width="6" height="6" fill="#0066FF" />
      <text x="25" y="18.5" fill="#D5E1EE" fontSize="9" letterSpacing="1" fontFamily="JetBrains Mono, monospace">{label}</text>
      <text x="11" y="31" fill="#8B96A5" fontSize="7" letterSpacing="1.3" fontFamily="JetBrains Mono, monospace">CAPA / {index}</text>
    </g>
  );
}

function InfrastructureDiagram() {
  return (
    <svg className="auth-diagram" viewBox="0 0 800 520" role="img" aria-label="Diagrama abstracto de la infraestructura INFINIHON: red, nube, sistemas, datos, servidores y seguridad conectados al núcleo">
      <defs>
        <linearGradient id="auth-plane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#152b41" /><stop offset=".6" stopColor="#07101b" /><stop offset="1" stopColor="#030609" />
        </linearGradient>
        <linearGradient id="auth-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#003B73" stopOpacity="0" />
          <stop offset=".5" stopColor="#0066FF" stopOpacity=".76" />
          <stop offset="1" stopColor="#003B73" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="auth-core-glow">
          <stop stopColor="#0066FF" stopOpacity=".26" /><stop offset="1" stopColor="#0066FF" stopOpacity="0" />
        </radialGradient>
        <pattern id="auth-micro-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#8B96A5" strokeOpacity=".07" strokeWidth=".6" />
        </pattern>
      </defs>

      <rect x="28" y="20" width="744" height="474" fill="url(#auth-micro-grid)" opacity=".65" />
      <path d="M28 45v-25h25M747 20h25v25M28 468v26h25M747 494h25v-26" fill="none" stroke="#8B96A5" strokeOpacity=".24" strokeWidth="1" />

      <ellipse cx="420" cy="275" rx="285" ry="188" fill="none" stroke="#003B73" strokeOpacity=".3" strokeDasharray="2 10" />
      <ellipse cx="420" cy="275" rx="213" ry="135" fill="none" stroke="#003B73" strokeOpacity=".42" strokeDasharray="3 8" />
      <ellipse cx="420" cy="275" rx="154" ry="98" fill="none" stroke="#0066FF" strokeOpacity=".18" />

      {paths.map((path, index) => (
        <g key={path.id}>
          <path d={path.d} fill="none" stroke="#1e3f61" strokeWidth="1" />
          <path d={path.d} fill="none" stroke="url(#auth-line)" strokeWidth="1.15" className="auth-diagram-flow" style={{ animationDelay: `${index * -.95}s` }} />
          <circle cx={[224, 587, 607, 594, 252, 189][index]} cy={[127, 116, 256, 420, 442, 306][index]} r="2" fill="#00A8FF" opacity=".85" />
        </g>
      ))}

      <circle cx="420" cy="278" r="177" fill="url(#auth-core-glow)" />
      <path d="M420 158l126 72v96l-126 72-126-72v-96z" fill="#07101A" stroke="#0066FF" strokeOpacity=".45" strokeWidth="1.2" />
      <path d="M420 177l108 62v78l-108 62-108-62v-78z" fill="none" stroke="#3a648a" strokeOpacity=".42" strokeWidth=".8" />
      <path d="M420 198l88 50v60l-88 50-88-50v-60z" fill="none" stroke="#0066FF" strokeOpacity=".22" strokeDasharray="4 8" />

      <path d="M356 247l64-37 64 37-64 37z" fill="url(#auth-plane)" stroke="#4e89bd" strokeWidth="1" />
      <path d="M356 247v37l64 37v-37z" fill="#0A1622" stroke="#315476" strokeWidth="1" />
      <path d="M484 247v37l-64 37v-37z" fill="#06101b" stroke="#315476" strokeWidth="1" />
      <path d="M356 261l64 37 64-37M356 273l64 37 64-37" fill="none" stroke="#0066FF" strokeOpacity=".4" strokeWidth="1" />
      <path d="M381 247l39-22 39 22-39 22z" fill="#07101b" stroke="#0066FF" strokeWidth="1" />
      <path d="M392 247l28-16 28 16-28 16z" fill="none" stroke="#0066FF" strokeOpacity=".5" strokeWidth=".7" />
      <circle cx="420" cy="247" r="3.5" fill="#F5F7FA" />
      <circle cx="420" cy="247" r="13" fill="none" stroke="#00A8FF" strokeOpacity=".55" className="auth-diagram-ring" />
      <circle cx="420" cy="247" r="28" fill="none" stroke="#0066FF" strokeOpacity=".25" className="auth-diagram-ring auth-diagram-ring-alt" />

      <path d="M420 358v24M420 148v27M273 277h-24M571 277h-25" stroke="#0066FF" strokeOpacity=".5" />
      <text x="420" y="353" textAnchor="middle" fill="#D5E1EE" fontSize="10" letterSpacing="2" fontFamily="JetBrains Mono, monospace">NÚCLEO / INFINIHON</text>
      <text x="420" y="369" textAnchor="middle" fill="#8B96A5" fontSize="8" letterSpacing="2" fontFamily="JetBrains Mono, monospace">ARQUITECTURA CONECTADA</text>

      {nodes.map((node) => <Module key={node.index} {...node} />)}
      <text x="30" y="507" fill="#8B96A5" fontSize="8" letterSpacing="1.6" fontFamily="JetBrains Mono, monospace">01—06 / CAPAS DEL ECOSISTEMA</text>
      <text x="770" y="507" textAnchor="end" fill="#8B96A5" fontSize="8" letterSpacing="1.6" fontFamily="JetBrains Mono, monospace">VISUALIZACIÓN CONCEPTUAL</text>
    </svg>
  );
}

function HondurasSignature() {
  return (
    <div className="auth-honduras">
      <svg viewBox="0 0 64 36" width="54" height="31" fill="none" aria-hidden="true">
        <path d="M4 17L12 8l9-2 7-3 8 2 8-2 10 7 5 8-10 3-7 2-5 5-10 5-8-2-7-8-8-2z" stroke="#0066FF" strokeOpacity=".7" strokeWidth=".7" />
        <path d="M12 8l15 12L44 10M27 20l10 8M27 20l-8 11M44 10l5 11M27 20l22 1" stroke="#003B73" strokeWidth=".7" />
        {[[12, 8], [44, 10], [27, 20], [37, 28], [19, 31], [49, 21]].map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === 2 ? 1.8 : 1.3} fill={index === 2 ? "#F5F7FA" : "#0066FF"} />)}
      </svg>
      <span>HECHO EN HONDURAS.</span>
    </div>
  );
}

export function AuthBrandPanel({ children }: { children?: ReactNode }) {
  return (
    <aside className="auth-brand-panel" aria-label="Identidad INFINIHON">
      <div className="auth-brand-grain" aria-hidden="true" />
      <div className="auth-brand-copy">
        <div className="auth-brand-eyebrow"><span className="auth-brand-beacon" /> PORTAL DIGITAL <span className="auth-eyebrow-separator">/</span> ECOSISTEMA INFINIHON</div>
        <div className="auth-brand-title">INFINIHON<span className="auth-title-period">.</span></div>
        <div className="auth-brand-descriptor">TECHNOLOGY & INFRASTRUCTURE</div>
        <p className="auth-brand-statement">Tu infraestructura.<br />Tu tecnología.<br /><span>Tu espacio.</span></p>
      </div>
      <div className="auth-diagram-frame"><InfrastructureDiagram /></div>
      <div className="auth-brand-bottom">
        <HondurasSignature />
        <span className="auth-brand-bottom-index">INFINIHON / ACCESO</span>
      </div>
      {children}
    </aside>
  );
}