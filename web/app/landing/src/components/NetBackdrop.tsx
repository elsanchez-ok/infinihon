import { useMemo } from "react";

/** Fondo decorativo de puntos/líneas tipo red, reutilizado en CTA-like
 * secciones (antes vivía dentro de CTASection, ahora es compartido porque
 * ContactPage también lo usa). */
export function NetBackdrop() {
  const { pts, lines } = useMemo(() => {
    let s = 3;
    const r = () => ((s = (s * 16807) % 2147483647), (s - 1) / 2147483646);
    const pts = Array.from({ length: 60 }, () => ({ x: r() * 1600, y: r() * 900 }));
    const lines: [number, number][] = [];
    pts.forEach((p, i) =>
      pts.forEach((q, j) => {
        if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 190) lines.push([i, j]);
      })
    );
    return { pts, lines };
  }, []);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {lines.map(([a, b], i) => (
        <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke="#0066FF" strokeWidth="0.7" className="pulse-soft" style={{ opacity: 0.18, animationDelay: `${(i * 0.31) % 5}s`, animationDuration: `${5 + (i % 4)}s` }} />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#00A8FF" opacity="0.5" />
      ))}
    </svg>
  );
}
