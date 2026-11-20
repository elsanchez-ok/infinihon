import { Reveal, SectionLabel, ArrowIcon } from "./ui";

const badges = ["Fundador de InfiniHon Corp.", "Proyectos de infraestructura a gran escala", "Ingeniería end-to-end"];

const Photo = ({ className }: { className?: string }) => (
  <img
    src="/assets/joseph.webp"
    alt="Joseph Sánchez, CEO y fundador de InfiniHon Corp."
    className={className}
  />
);

const Badges = ({ className }: { className?: string }) => (
  <div className={className}>
    <span className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-[#0A0F14] sm:text-xs">
      {badges[0]}
    </span>
    <span className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-[#0A0F14] sm:text-xs">
      {badges[1]}
    </span>
    <span className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-[#0A0F14] sm:text-xs">
      {badges[2]}
    </span>
  </div>
);

const CredentialCard = ({ className }: { className?: string }) => (
  <div className={className}>
    Instituto Tecnológico de Excelencia Educativa (ITEE), San Pedro Sula, Honduras
  </div>
);

const MoreInfoButton = ({ className }: { className?: string }) => (
  <a
    href="/contacto"
    className={
      "group inline-flex items-center gap-4 rounded-[20px] bg-black/35 px-6 py-5 backdrop-blur-md transition-colors hover:bg-black/45 " +
      (className ?? "")
    }
  >
    <span className="text-left text-lg font-extrabold leading-[1.1] text-white sm:text-xl">
      Más
      <br />
      información
    </span>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#0A0F14] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
      <ArrowIcon className="h-4 w-4 -rotate-45" />
    </span>
  </a>
);

export default function FounderSection() {
  return (
    <section id="equipo" className="relative border-t border-white/[0.06] bg-ink py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <SectionLabel index="13">Equipo</SectionLabel>
        </Reveal>

        <Reveal delay={120} className="founder-card relative mt-10 overflow-hidden rounded-[32px] md:rounded-[40px]">
          {/* palabra gigante de fondo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-extrabold uppercase leading-none tracking-tight text-white/30 md:top-10"
            style={{ fontSize: "min(15vw, 8.5rem)" }}
          >
            Equipo
          </div>

          {/* ---- Escritorio: composición tipo póster, igual a la referencia ---- */}
          <div className="relative hidden min-h-[620px] lg:block xl:min-h-[680px]">
            <Badges className="absolute left-10 top-[30%] flex max-w-[300px] flex-wrap gap-2" />

            <span
              className="pointer-events-none absolute right-[11%] top-[27%] rotate-[-6deg] font-serif text-2xl italic text-[#9CFF6B] xl:text-3xl"
              aria-hidden
            >
              Joseph Sánchez
            </span>

            <Photo className="pointer-events-none absolute bottom-0 right-[6%] h-[94%] w-auto object-contain object-bottom" />

            <CredentialCard className="absolute right-[4%] top-[46%] max-w-[230px] rounded-2xl bg-white p-4 text-sm font-semibold leading-snug text-[#0A0F14] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)]" />

            <MoreInfoButton className="absolute bottom-10 left-10" />
          </div>

          {/* ---- Móvil/tablet: versión apilada, sin posicionamiento absoluto ---- */}
          <div className="relative flex flex-col items-center gap-6 px-6 pb-8 pt-28 lg:hidden">
            <Badges className="flex flex-wrap justify-center gap-2" />
            <span className="rotate-[-4deg] font-serif text-xl italic text-[#9CFF6B]">Joseph Sánchez</span>
            <Photo className="h-[300px] w-auto object-contain sm:h-[360px]" />
            <CredentialCard className="w-full max-w-sm rounded-2xl bg-white p-4 text-center text-sm font-semibold leading-snug text-[#0A0F14] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)]" />
            <MoreInfoButton className="w-full max-w-sm justify-center" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
