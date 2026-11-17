import { useMemo } from "react";
import { Reveal, RevealTitle, PrimaryButton, GhostButton } from "./ui";
import ContactForm from "./ContactForm";

function NetBackdrop() {
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

export { NetBackdrop };

export default function CTASection() {
  return (
    <section id="contacto" className="relative isolate overflow-hidden border-t border-white/[0.06] bg-obsidian">
      <div className="absolute inset-0 -z-10 mask-radial opacity-80">
        <NetBackdrop />
      </div>
      <div className="absolute left-1/2 top-[35%] -z-10 h-[60vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[150px]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-48">
        <div className="text-center">
          <Reveal className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
            <span className="text-volt">13</span> — Siguiente paso
          </Reveal>
          <RevealTitle
            as="h2"
            className="mx-auto mt-10 text-[12vw] font-extrabold uppercase leading-[0.88] tracking-[-0.05em] sm:text-[9vw] lg:text-[8.5rem]"
            lines={["¿Listo para", "construir", "lo que sigue?"]}
          />
          <Reveal delay={300} className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-steel">
            Cuéntanos qué necesitas.
            <br />
            <span className="text-snow">Diseñemos la infraestructura para hacerlo posible.</span>
          </Reveal>
          <Reveal delay={400} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton href="#formulario">Hablar con InfiniHon Corp.</PrimaryButton>
            <GhostButton href="/#servicios">Ver servicios</GhostButton>
          </Reveal>
        </div>

        <Reveal delay={150} className="mx-auto mt-24 max-w-4xl md:mt-32">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
