import { Reveal, ArrowIcon } from "./ui";

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

function Label() {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0A0F14]/70">
      <span className="font-bold text-[#0A0F14]">13</span>
      <span className="h-px w-10 bg-[#0A0F14]/30" />
      <span>Equipo</span>
    </div>
  );
}

export default function FounderSection() {
  return (
    /* La tarjeta ES la sección: el degradado azul va pegado a los cuatro
       bordes del viewport (sin márgenes, igual que el footer), pero con
       las esquinas redondeadas arriba y abajo — como el footer, solo que
       el footer únicamente redondea arriba porque es el final de la
       página; esta sección no lo es, así que redondea los cuatro lados. */
    <section id="equipo" className="founder-card relative overflow-hidden rounded-[32px] border-t border-white/[0.06] py-16 md:rounded-[40px] md:py-24">
      {/* palabra gigante de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-extrabold uppercase leading-none tracking-tight text-white/30 md:top-10"
        style={{ fontSize: "min(15vw, 8.5rem)" }}
      >
        Fundador
      </div>

      {/* Foto: pegada al piso real de la sección (no al de su columna con
          padding), centrada horizontalmente, pero dentro del marco
          redondeado (no se recorta contra las esquinas). */}
      <Photo className="pointer-events-none absolute bottom-0 left-1/2 hidden h-[94%] w-auto -translate-x-1/2 object-contain object-bottom lg:block" />

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <Label />
        </Reveal>

        {/* ---- Escritorio: composición tipo póster, igual a la referencia ---- */}
        <Reveal delay={120} className="relative mt-10 hidden min-h-[560px] lg:block xl:min-h-[640px]">
          <Badges className="absolute left-0 top-[26%] flex max-w-[300px] flex-wrap gap-2" />

          <span
            className="pointer-events-none absolute left-1/2 top-[22%] translate-x-[6%] rotate-[-6deg] font-serif text-2xl italic text-[#9CFF6B] xl:text-3xl"
            aria-hidden
          >
            Joseph Sánchez
          </span>

          <CredentialCard className="absolute right-[14%] top-[44%] max-w-[230px] rounded-2xl bg-white p-4 text-sm font-semibold leading-snug text-[#0A0F14] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)]" />

          <MoreInfoButton className="absolute bottom-10 left-0" />
        </Reveal>

        {/* ---- Móvil/tablet: versión apilada, sin posicionamiento absoluto ---- */}
        <Reveal delay={120} className="relative flex flex-col items-center gap-6 pb-8 pt-16 lg:hidden">
          <Badges className="flex flex-wrap justify-center gap-2" />
          <span className="rotate-[-4deg] font-serif text-xl italic text-[#9CFF6B]">Joseph Sánchez</span>
          <Photo className="h-[300px] w-auto object-contain sm:h-[360px]" />
          <CredentialCard className="w-full max-w-sm rounded-2xl bg-white p-4 text-center text-sm font-semibold leading-snug text-[#0A0F14] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)]" />
          <MoreInfoButton className="w-full max-w-sm justify-center" />
        </Reveal>
      </div>
    </section>
  );
}
