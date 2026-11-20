import { Reveal, RevealTitle, SectionLabel, PrimaryButton, GhostButton } from "./ui";
import ContactForm, { CONTACT_EMAIL } from "./ContactForm";
import { NetBackdrop } from "./NetBackdrop";

const channels = [
  { t: "Email", d: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { t: "Ubicación", d: "Tegucigalpa · Francisco Morazán · Honduras" },
  { t: "Respuesta", d: "Respuesta directa del equipo técnico" },
];

export default function ContactPage() {
  return (
    <section className="relative isolate overflow-hidden bg-obsidian">
      <div className="absolute inset-0 -z-10 mask-radial opacity-80">
        <NetBackdrop />
      </div>
      <div className="absolute left-1/2 top-[30%] -z-10 h-[60vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[150px]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-48">
        <div className="text-center">
          <Reveal>
            <SectionLabel index="13" className="justify-center">
              Contacto
            </SectionLabel>
          </Reveal>
          <RevealTitle
            as="h1"
            className="mx-auto mt-10 max-w-5xl text-[12vw] font-extrabold uppercase leading-[0.88] tracking-[-0.05em] sm:text-[9vw] lg:text-[8.5rem]"
            lines={["Hablemos de", "tu proyecto."]}
            accentLast
          />
          <Reveal delay={300} className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-steel">
            Cuéntanos qué necesitas. <span className="text-snow">Diseñemos la infraestructura para hacerlo posible.</span>
          </Reveal>
          <Reveal delay={400} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton href="#formulario">Hablar con InfiniHon Corp.</PrimaryButton>
            <GhostButton href="/#servicios">Ver servicios</GhostButton>
          </Reveal>
        </div>

        <Reveal delay={150} className="mx-auto mt-24 max-w-4xl md:mt-32">
          <ContactForm />
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-px border border-white/[0.08] bg-white/[0.06] md:grid-cols-3">
          {channels.map((c) => (
            <div key={c.t} className="bg-obsidian p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">{c.t}</div>
              {c.href ? (
                <a href={c.href} className="mt-3 block text-[15px] font-semibold text-snow transition-colors hover:text-volt">
                  {c.d}
                </a>
              ) : (
                <div className="mt-3 text-[15px] font-semibold text-snow">{c.d}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
