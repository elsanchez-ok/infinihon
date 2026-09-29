import type { CategoryId, Visual } from "../../store/catalog";

/* ============================================================ product art */

const W = 400, H = 300;

/** Shared metallic panel gradient ids, unique per instance. */
const ids = (u: string) => ({
  body: `b-${u}`, face: `f-${u}`, glow: `g-${u}`, slot: `s-${u}`,
});

function Chassis({ u, x, y, w, h, r = 3, children }: { u: string; x: number; y: number; w: number; h: number; r?: number; children?: React.ReactNode }) {
  const i = ids(u);
  return (
    <g>
      <defs>
        <linearGradient id={i.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A323B" />
          <stop offset="45%" stopColor="#171C22" />
          <stop offset="100%" stopColor="#0B0F14" />
        </linearGradient>
        <linearGradient id={i.face} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F7FA" stopOpacity="0.14" />
          <stop offset="8%" stopColor="#F5F7FA" stopOpacity="0" />
          <stop offset="92%" stopColor="#F5F7FA" stopOpacity="0" />
          <stop offset="100%" stopColor="#F5F7FA" stopOpacity="0.07" />
        </linearGradient>
      </defs>
      {/* rack ears */}
      <rect x={x - 9} y={y} width={9} height={h} rx={1.5} fill="#131920" stroke="#39424E" strokeWidth="0.8" />
      <rect x={x + w} y={y} width={9} height={h} rx={1.5} fill="#131920" stroke="#39424E" strokeWidth="0.8" />
      <circle cx={x - 4.5} cy={y + 8} r="1.6" fill="#05070A" stroke="#4A5561" strokeWidth="0.6" />
      <circle cx={x - 4.5} cy={y + h - 8} r="1.6" fill="#05070A" stroke="#4A5561" strokeWidth="0.6" />
      <circle cx={x + w + 4.5} cy={y + 8} r="1.6" fill="#05070A" stroke="#4A5561" strokeWidth="0.6" />
      <circle cx={x + w + 4.5} cy={y + h - 8} r="1.6" fill="#05070A" stroke="#4A5561" strokeWidth="0.6" />
      {/* body */}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${i.body})`} stroke="#414B57" strokeWidth="0.9" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${i.face})`} />
      {children}
    </g>
  );
}

const RJ45 = ({ x, y, on }: { x: number; y: number; on?: boolean }) => (
  <g transform={`translate(${x},${y})`}>
    <rect width="17" height="15" rx="1.2" fill="#070A0E" stroke="#4A5561" strokeWidth="0.8" />
    <rect x="2" y="2" width="13" height="4.5" rx="0.8" fill="#1B222A" />
    <rect x="12" y="9" width="2.6" height="3.4" rx="0.5" fill={on ? "#00A8FF" : "#0E4C7A"} />
  </g>
);

const SFP = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x},${y})`}>
    <rect width="20" height="15" rx="1.2" fill="#0A0F14" stroke="#4A5561" strokeWidth="0.8" />
    <rect x="1.5" y="3" width="8" height="9" rx="1" fill="#151B22" />
    <path d="M11 5h6M11 8h6M11 11h6" stroke="#39424E" strokeWidth="0.9" />
  </g>
);

const Vents = ({ x, y, w, rows = 3 }: { x: number; y: number; w: number; rows?: number }) => (
  <g>
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: Math.floor(w / 7) }).map((_, c) => (
        <rect key={`${r}-${c}`} x={x + c * 7} y={y + r * 5} width="4" height="2.6" rx="1.3" fill="#05070A" opacity="0.85" />
      ))
    )}
  </g>
);

const Led = ({ x, y, c = "#00A8FF", d = 0, cls = "pulse-soft" }: { x: number; y: number; c?: string; d?: number; cls?: string }) => (
  <circle cx={x} cy={y} r="2" fill={c} className={cls} style={{ animationDelay: `${d}s` }} />
);

function art(v: Visual, u: string) {
  switch (v) {
    case "router":
      return (
        <>
          <Chassis u={u} x={70} y={120} w={260} h={62}>
            {/* antennas */}
            {[130, 200, 270].map((x, i) => (
              <g key={x}>
                <rect x={x - 1.6} y={72} width={3.2} height={48} rx={1.6} fill="#1A2129" stroke="#45505C" strokeWidth="0.7" />
                <rect x={x - 4} y={64} width={8} height={10} rx={4} fill="#20282F" stroke="#4A5561" strokeWidth="0.7" />
                <circle cx={x} cy={128} r="3.4" fill="none" stroke="#0066FF" strokeWidth="0.8" opacity="0.5" className="ring" style={{ animationDelay: `${i * 1.1}s` }} />
              </g>
            ))}
            <text x={78} y={136} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.4">EDGE ROUTER</text>
            <text x={78} y={146} fontFamily="JetBrains Mono" fontSize="6" fill="#5D6875" letterSpacing="1">BGP · OSPF · VPN</text>
            <Vents x={78} y={152} w={54} />
            {[0, 1, 2, 3].map((i) => <RJ45 key={i} x={196 + i * 21} y={140} on={i < 3} />)}
            <SFP x={196 + 4 * 21} y={140} />
            {[0, 1, 2, 3, 4].map((i) => <Led key={i} x={300 + i * 5} y={132} d={i * 0.4} />)}
            <rect x={296} y={162} width={28} height="5" rx="2.5" fill="#0E1620" stroke="#2E3944" strokeWidth="0.6" />
          </Chassis>
          <text x={200} y={205} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">1U · 19"</text>
        </>
      );
    case "switch":
      return (
        <Chassis u={u} x={56} y={118} w={288} h={70}>
          <text x={64} y={132} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.4">MANAGED SWITCH</text>
          <text x={64} y={141} fontFamily="JetBrains Mono" fontSize="6" fill="#5D6875" letterSpacing="1">L2/L3 · 802.1Q · LACP</text>
          <Vents x={64} y={148} w={30} />
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i}>
              <RJ45 x={100 + i * 16} y={150} on={i % 3 !== 2} />
              <RJ45 x={100 + i * 16} y={170} on={i % 4 === 0} />
            </g>
          ))}
          <SFP x={296} y={150} />
          <SFP x={296} y={170} />
          {[0, 1, 2, 3].map((i) => <Led key={i} x={64 + i * 5} y={170} d={i * 0.3} />)}
        </Chassis>
      );
    case "server":
      return (
        <Chassis u={u} x={64} y={118} w={272} h={68}>
          <text x={72} y={132} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.4">RACK SERVER</text>
          {/* drive bays */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={72} y={140 + i * 11} width="82" height="9" rx="1" fill="#0A0F14" stroke="#39424E" strokeWidth="0.7" />
              <rect x={75} y={143 + i * 11} width="34" height="3" rx="1.5" fill="#141A21" />
              <circle cx={148} cy={144.5 + i * 11} r="1.6" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.35}s` }} />
            </g>
          ))}
          <Vents x={166} y={140} w={110} rows={5} />
          <rect x={286} y={140} width="40" height="36" rx="2" fill="#070B10" stroke="#2E3944" strokeWidth="0.7" />
          <text x={306} y={152} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="6.5" fill="#00A8FF">OK</text>
          <path d="M292 168h28M292 172h20" stroke="#39424E" strokeWidth="1" />
          <circle cx={292} cy={158} r="2" fill="#00A8FF" className="pulse-soft" />
        </Chassis>
      );
    case "firewall":
      return (
        <Chassis u={u} x={70} y={122} w={260} h={60}>
          <text x={78} y={137} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.4">SECURITY APPLIANCE</text>
          {/* zones */}
          {[["WAN", 96], ["DMZ", 150], ["LAN", 204]].map(([l, x], i) => (
            <g key={l as string}>
              <rect x={x as number} y={146} width="46" height="26" rx="2" fill="#070B10" stroke={i === 0 ? "#0066FF" : "#39424E"} strokeWidth="0.8" />
              <text x={(x as number) + 23} y={162} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill={i === 0 ? "#F5F7FA" : "#8B96A5"}>{l}</text>
              <path d={`M${(x as number) + 46} 159h14`} stroke="#0066FF" strokeWidth="1" />
              <Led x={(x as number) + 8} y={152} d={i * 0.5} />
            </g>
          ))}
          <path d="M258 146h64M258 172h64" stroke="#39424E" strokeWidth="0.7" />
          <text x={262} y={164} fontFamily="JetBrains Mono" fontSize="6" fill="#5D6875">STATEFUL</text>
        </Chassis>
      );
    case "nas":
      return (
        <g>
          <Chassis u={u} x={116} y={82} w={168} h={140} r={4}>
            <text x={128} y={100} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.4">STORAGE</text>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={128} y={110 + i * 26} width="144" height="20" rx="2" fill="#0A0F14" stroke="#39424E" strokeWidth="0.8" />
                <rect x={132} y={116 + i * 26} width="52" height="8" rx="4" fill="#151B22" />
                <rect x={192} y={114 + i * 26} width="70" height="4" rx="2" fill="#10151B" />
                <circle cx={256} cy={120 + i * 26} r="2" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.6}s` }} />
              </g>
            ))}
          </Chassis>
          <text x={200} y={244} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">RAID · SMB · NFS</text>
        </g>
      );
    case "cluster":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0,${i * 44})`}>
              <rect x={96} y={96} width={208} height={34} rx={2.5} fill="#0F141A" stroke="#39424E" strokeWidth="0.9" />
              <rect x={96} y={96} width={208} height={6} fill="#F5F7FA" opacity="0.05" />
              {/* heatsink */}
              {Array.from({ length: 9 }).map((_, k) => (
                <rect key={k} x={110 + k * 7} y={104} width={3.6} height={18} rx={1.8} fill="#1D242C" stroke="#2E3944" strokeWidth="0.4" />
              ))}
              <rect x={186} y={104} width={40} height={18} rx={1.5} fill="#131920" stroke="#2E3944" strokeWidth="0.6" />
              <path d="M192 108h28M192 112h22M192 116h26" stroke="#0066FF" strokeWidth="0.7" opacity="0.7" />
              <circle cx={246} cy={113} r="2.2" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.4}s` }} />
              <path d="M262 113h34" stroke="#39424E" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={100} y={92} fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875">node-0{i + 1}</text>
            </g>
          ))}
          <text x={200} y={284} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">K3S CLUSTER</text>
        </g>
      );
    case "rack":
      return (
        <g>
          <rect x={128} y={52} width={144} height={200} rx={3} fill="#0A0F14" stroke="#39424E" strokeWidth="1.2" />
          <rect x={136} y={60} width={128} height={184} rx={2} fill="#070B10" />
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i}>
              <line x1={136} y1={60 + i * 15.3} x2={264} y2={60 + i * 15.3} stroke="#1B222A" strokeWidth="0.6" />
            </g>
          ))}
          {/* installed units */}
          {[1, 2, 4, 6, 7, 9, 11].map((i) => (
            <g key={i}>
              <rect x={138} y={61 + i * 15.3} width={124} height={13} rx={1} fill="#151B22" stroke="#2E3944" strokeWidth="0.6" />
              <Vents x={168} y={64 + i * 15.3} w={62} rows={1} />
              <circle cx={148} cy={67.5 + i * 15.3} r="1.8" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.3}s` }} />
            </g>
          ))}
          <rect x={138} y={61 + 4 * 15.3} width={124} height={28} fill="none" stroke="#0066FF" strokeWidth="0.8" opacity="0.6" />
          <text x={200} y={268} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">12U · 19"</text>
        </g>
      );
    case "sfp":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${118 + i * 58},${104})`}>
              <rect width="44" height="20" rx="2" fill="#0F141A" stroke="#4A5561" strokeWidth="0.8" />
              <rect x="3" y="5" width="16" height="10" rx="1" fill="#151B22" />
              <path d="M24 6h14M24 10h14M24 14h9" stroke="#39424E" strokeWidth="0.9" />
              <circle cx={36} cy={16} r="1.4" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.4}s` }} />
            </g>
          ))}
          {/* cords */}
          <path d="M120 124 C120 168, 300 150, 282 210" fill="none" stroke="#0066FF" strokeWidth="2.4" opacity="0.55" />
          <path d="M128 124 C132 160, 268 156, 272 214" fill="none" stroke="#003B73" strokeWidth="2.4" opacity="0.9" />
          <rect x={266} y={208} width="16" height="18" rx="2" fill="#151B22" stroke="#4A5561" strokeWidth="0.7" />
          <rect x={112} y={118} width="16" height="18" rx="2" fill="#151B22" stroke="#4A5561" strokeWidth="0.7" />
          <text x={200} y={250} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">FIBER · CAT6</text>
        </g>
      );
    case "ups":
      return (
        <g>
          <Chassis u={u} x={140} y={70} w={120} h={158} r={4}>
            <text x={152} y={88} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.4">UPS</text>
            <rect x={152} y={98} width={96} height={40} rx={2} fill="#070B10" stroke="#2E3944" strokeWidth="0.8" />
            <text x={200} y={118} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fill="#F5F7FA">1500</text>
            <text x={200} y={130} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="6" fill="#5D6875">VA · LOAD</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={152 + i * 20} y={148} width={16} height={26} rx={2}
                fill={i < 3 ? "#0066FF" : "#131920"} opacity={i < 3 ? 0.75 : 1} stroke="#2E3944" strokeWidth="0.6" />
            ))}
            {[0, 1, 2, 3].map((i) => <g key={i}><rect x={152 + i * 24} y={186} width={20} height={14} rx={2} fill="#0A0F14" stroke="#39424E" strokeWidth="0.7" /><circle cx={162 + i * 24} cy={193} r="2" fill={i < 3 ? "#00A8FF" : "#1B222A"} /></g>)}
          </Chassis>
          <text x={200} y={248} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">BATTERY BACKUP</text>
        </g>
      );
    case "ap":
      return (
        <g>
          <circle cx={200} cy={150} r={78} fill="#0F141A" stroke="#39424E" strokeWidth="1.2" />
          <circle cx={200} cy={150} r={62} fill="#0A0F14" stroke="#2E3944" strokeWidth="0.8" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={200 + Math.cos(a) * 62} y1={150 + Math.sin(a) * 62} x2={200 + Math.cos(a) * 78} y2={150 + Math.sin(a) * 78} stroke="#0066FF" strokeWidth="1" opacity="0.5" />;
          })}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={200} cy={150} r={12 + i * 10} fill="none" stroke="#0066FF" strokeWidth="0.8" opacity={0.32 - i * 0.04} className="ring" style={{ animationDelay: `${i * 0.5}s`, transformBox: "fill-box", transformOrigin: "center" }} />
          ))}
          <circle cx={200} cy={150} r={9} fill="#151B22" stroke="#00A8FF" strokeWidth="1.2" />
          <text x={200} y={250} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#5D6875" letterSpacing="2">WIFI 6 · PoE</text>
        </g>
      );
    case "mini":
      return (
        <g>
          <rect x={128} y={104} width={144} height={92} rx={5} fill="#0F141A" stroke="#39424E" strokeWidth="1.1" />
          <rect x={128} y={104} width={144} height={10} rx={5} fill="#F5F7FA" opacity="0.05" />
          <circle cx={200} cy={150} r={30} fill="#0A0F14" stroke="#2E3944" strokeWidth="0.9" />
          {Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return <line key={i} x1={200 + Math.cos(a) * 6} y1={150 + Math.sin(a) * 6} x2={200 + Math.cos(a) * 26} y2={150 + Math.sin(a) * 26} stroke="#1B222A" strokeWidth="2.4" />;
          })}
          <circle cx={200} cy={150} r={5} fill="#0066FF" opacity="0.55" />
          <text x={200} y={182} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="6.5" fill="#5D6875">EDGE NODE</text>
          {[0, 1, 2].map((i) => <RJ45 key={i} x={146 + i * 21} y={112} on={i === 0} />)}
          <Led x={262} y={119} />
        </g>
      );
    case "cloud":
      return (
        <g>
          {/* layered cloud plates */}
          <path d="M148 150h104a26 26 0 0 0 0-52 40 40 0 0 0-76-9 30 30 0 0 0-28 61z" fill="#0A0F14" stroke="#0066FF" strokeWidth="1.2" opacity="0.95" />
          <g className="pulse-soft">
            <circle cx={200} cy={124} r={4} fill="#00A8FF" />
          </g>
          {[["VPC", 150], ["IAM", 200], ["S3", 250]].map(([t, x], i) => (
            <g key={t as string}>
              <rect x={(x as number) - 22} y={190} width="44" height="26" rx="2" fill="#0F141A" stroke="#39424E" strokeWidth="0.8" />
              <text x={x as number} y={206} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5">{t}</text>
              <path d={`M${x as number} 176v14`} stroke="#0066FF" strokeWidth="1" />
              <circle cx={x as number} cy={176} r="2" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.5}s` }} />
            </g>
          ))}
          <path d="M128 176v52M272 176v52M128 228h144" stroke="#39424E" strokeWidth="0.8" strokeDasharray="4 4" />
        </g>
      );
    case "license":
      return (
        <g>
          <rect x={110} y={92} width={180} height={124} rx={4} fill="#0A0F14" stroke="#39424E" strokeWidth="1.1" />
          <rect x={110} y={92} width={180} height={124} rx={4} fill="none" stroke="#0066FF" strokeWidth="0.8" opacity="0.35" />
          <text x={126} y={118} fontFamily="JetBrains Mono" fontSize="7" fill="#8B96A5" letterSpacing="1.6">LICENSE KEY</text>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={126} y={130 + i * 16} width={148} height={10} rx={2} fill="#151B22" stroke="#2E3944" strokeWidth="0.6" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <circle cx={140 + i * 24} cy={122} r="3" fill="none" stroke="#0066FF" strokeWidth="0.9" />
              <path d={`M${137 + i * 24} 122l2 2 4-4`} stroke="#00A8FF" strokeWidth="1" fill="none" />
            </g>
          ))}
          <path d="M126 198h148" stroke="#1B222A" strokeWidth="1" />
          <text x={126} y={212} fontFamily="JetBrains Mono" fontSize="6" fill="#5D6875">SUBSCRIPTION · ANNUAL</text>
        </g>
      );
    case "service":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0,${i * 34})`} opacity={1 - i * 0.16}>
              <rect x={104} y={90 + i * 34} width={192} height={54} rx={3} fill="#0F141A" stroke="#39424E" strokeWidth="0.9" />
              <rect x={104} y={90 + i * 34} width={192} height={3} fill="#0066FF" opacity="0.5" />
              {Array.from({ length: 6 }).map((_, k) => (
                <rect key={k} x={118 + k * 28} y={104 + i * 34} width={18} height={26} rx={1.5} fill="#131920" stroke="#2E3944" strokeWidth="0.5" />
              ))}
              <circle cx={278} cy={104 + i * 34 + 13} r="2.4" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.6}s` }} />
            </g>
          ))}
          <path d="M200 84v14" stroke="#0066FF" strokeWidth="1" />
        </g>
      );
    default:
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={120 + i * 42} y={130 + i * 12} width={112} height={40} rx={3} fill="#0F141A" stroke="#39424E" strokeWidth="0.9" opacity={1 - i * 0.18} />
          ))}
        </g>
      );
  }
}

export function ProductVisual({ visual, uid, className }: { visual: Visual; uid: string; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-hidden focusable="false">
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#003B73" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#05070A" stopOpacity="0" />
        </radialGradient>
        <pattern id={`gr-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0v20" fill="none" stroke="#8B96A5" strokeOpacity="0.07" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#bg-${uid})`} />
      <rect width={W} height={H} fill={`url(#gr-${uid})`} />
      {/* floor reflection line */}
      <line x1="40" y1="268" x2="360" y2="268" stroke="#8B96A5" strokeOpacity="0.12" />
      {art(visual, uid)}
    </svg>
  );
}

/* ===================================================== category line icons */

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g: Record<CategoryId, React.ReactNode> = {
    hardware: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M7 7h10M7 11h10M7 15h4" /><circle cx="17" cy="15" r="1" /></>,
    networking: <><circle cx="12" cy="12" r="2.4" /><path d="M4 5v4M20 5v4M4 15v4M20 15v4M6 6l4 4M18 6l-4 4M6 18l4-4M18 18l-4-4" /></>,
    servers: <><rect x="3" y="5" width="18" height="5" rx="1" /><rect x="3" y="14" width="18" height="5" rx="1" /><path d="M7 7.5h.01M7 16.5h.01M11 7.5h5M11 16.5h5" /></>,
    storage: <><rect x="4" y="4" width="16" height="6" rx="1" /><rect x="4" y="14" width="16" height="6" rx="1" /><circle cx="7.5" cy="7" r=".6" fill="currentColor" /><circle cx="7.5" cy="17" r=".6" fill="currentColor" /><path d="M12 7h5M12 17h5" /></>,
    security: <><path d="M12 3l8 3.2V12c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6.2z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
    cloud: <><path d="M7.5 18h9.5a4 4 0 0 0 0-8 5.6 5.6 0 0 0-10.6-1.2A4.3 4.3 0 0 0 7.5 18z" /><path d="M9 21h7" /></>,
    software: <><path d="M9 7l-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" /></>,
    services: <><path d="M4 20V10M9 20V4M14 20v-7M19 20V8" /><path d="M3 20h18" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...p}>
      {g[id]}
    </svg>
  );
}

/** Abstract Honduras mesh (compact version for the store). */
export function HondurasMesh({ className }: { className?: string }) {
  const pts: [number, number][] = [
    [18, 46], [30, 34], [44, 26], [58, 18], [72, 14], [88, 10], [104, 8],
    [104, 20], [92, 26], [80, 30], [88, 40], [76, 46], [62, 44], [52, 52],
    [38, 56], [26, 62], [14, 58],
  ];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ") + "Z";
  return (
    <svg viewBox="0 0 120 72" className={className} aria-hidden>
      <path d={d} fill="rgba(0,59,115,0.25)" stroke="#0066FF" strokeWidth="0.8" strokeDasharray="2 3" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill={i === 10 ? "#F5F7FA" : "#00A8FF"} opacity="0.85" className="pulse-soft" style={{ animationDelay: `${(i * 0.4) % 4}s` }} />
      ))}
      {pts.map((p, i) => {
        const q = pts[i + 4];
        if (i % 3 !== 0 || !q) return null;
        return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#0066FF" strokeWidth="0.5" opacity="0.4" />;
      })}
    </svg>
  );
}
