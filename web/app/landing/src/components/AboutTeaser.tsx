import { Reveal, RevealTitle, SectionLabel, GhostButton } from "./ui";

/* Versión corta de lo que antes era la sección "Nosotros" completa del
   home (fotos de comunidad, principios, etc.). Todo ese contenido ahora
   vive en /nosotros como página independiente (ver NosotrosPage.tsx); acá
   solo queda un teaser breve con enlace a la página completa. */
export default function AboutTeaser() {
  return (
    <section id="nosotros" className="relative border-t border-white/[0.06] bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <SectionLabel index="12">Nosotros</SectionLabel>
        </Reveal>
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <RevealTitle
              className="max-w-3xl text-[9vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
              lines={["No solo instalamos", "tecnología.", "Construimos sistemas."]}
              accentLast
            />
            <Reveal delay={150} className="mt-6 max-w-xl text-[15px] leading-relaxed text-steel md:text-base">
              InfiniHon Corp. es un corporativo tecnológico hondureño enfocado en infraestructura, sistemas,
              soluciones IT y proyectos propios de software.
            </Reveal>
          </div>
          <Reveal delay={200} className="lg:col-span-4 lg:text-right">
            <GhostButton href="/nosotros">Conoce más sobre nosotros</GhostButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
