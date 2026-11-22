import { Reveal, RevealTitle, SectionLabel } from "./ui";

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
          <Reveal><SectionLabel index="10">Identidad</SectionLabel></Reveal>
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
          <img
            src="/assets/honduras-flag-mascot.webp"
            alt="Mascota de InfiniHon Corp. con la bandera de Honduras"
            className="mx-auto h-auto w-full max-w-[640px] drop-shadow-[0_30px_60px_rgba(0,102,255,0.35)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
