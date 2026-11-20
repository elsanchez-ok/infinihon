import { Reveal, PrimaryButton, SectionLabel } from "./ui";

const badges = [
  "Fundador de InfiniHon Corp.",
  "Proyectos de infraestructura a gran escala",
  "Ingeniería end-to-end: redes, cloud y seguridad",
];

export default function FounderSection() {
  return (
    <section id="fundador" className="relative overflow-hidden border-t border-white/[0.06] bg-ink py-28 md:py-40">
      {/* resplandor de marca, sutil, igual familia visual que el footer */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(55% 90% at 85% 15%, rgba(0,122,255,0.18) 0%, rgba(3,12,28,0) 60%)",
        }}
        aria-hidden
      />

      {/* palabra gigante de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 select-none text-center font-extrabold uppercase leading-none tracking-tight text-white/[0.05] md:top-16"
        style={{ fontSize: "min(22vw, 13rem)" }}
      >
        Fundador
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><SectionLabel index="12">Equipo</SectionLabel></Reveal>

        <div className="mt-14 grid items-end gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5 lg:order-1">
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-snow/90"
                >
                  {b}
                </span>
              ))}
            </div>

            <h3 className="mt-8 text-4xl font-extrabold tracking-tight text-snow md:text-5xl">Joseph Sánchez</h3>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-volt">CEO &amp; Fundador</p>

            <div className="mt-8 max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-[15px] leading-relaxed text-snow/90 backdrop-blur">
              Graduado en Computación — Instituto Técnico de Electricidad y Electrónica (ITEE), San Pedro Sula, Honduras.
            </div>

            <PrimaryButton href="/contacto" className="mt-10">
              Más información
            </PrimaryButton>
          </Reveal>

          <Reveal delay={150} className="relative lg:col-span-7 lg:order-2">
            <div className="relative mx-auto flex max-w-[420px] justify-center lg:ml-auto lg:mr-0">
              <span
                className="pointer-events-none absolute -top-8 right-2 rotate-[-6deg] text-2xl font-bold italic text-volt md:-top-10 md:right-6 md:text-3xl"
                aria-hidden
              >
                Joseph Sánchez
              </span>
              <img
                src="/assets/joseph.webp"
                alt="Joseph Sánchez, CEO y fundador de InfiniHon Corp."
                className="relative z-10 h-[340px] w-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] sm:h-[400px] md:h-[460px]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
