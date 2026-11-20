import { useState } from "react";
import { Reveal, RevealTitle, SectionLabel } from "./ui";
import { NetBackdrop } from "./NetBackdrop";
import { cn } from "../utils/cn";

const faqs = [
  {
    q: "¿Qué tipo de empresas pueden trabajar con InfiniHon Corp.?",
    a: "Empresas de cualquier tamaño que necesiten infraestructura tecnológica estable: desde una pyme que quiere ordenar su red y su primer servidor, hasta operaciones con varias sedes que necesitan redes, cloud y seguridad integradas.",
  },
  {
    q: "¿Cuánto tiempo toma implementar un proyecto de infraestructura?",
    a: "Depende del alcance. Un diagnóstico y diseño inicial puede tomar entre 1 y 2 semanas; la implementación varía de unos días para una red pequeña a varios meses para una migración a cloud o un rediseño completo de infraestructura.",
  },
  {
    q: "¿Dan soporte y mantenimiento después de la implementación?",
    a: "Sí. Todo proyecto incluye documentación completa y ofrecemos acompañamiento continuo: monitorización, mantenimiento y soporte técnico para que tu infraestructura siga funcionando bien con el tiempo.",
  },
  {
    q: "¿Trabajan con infraestructura ya existente o solo proyectos nuevos?",
    a: "Ambos. Podemos auditar y mejorar lo que ya tienes (redes, servidores, cloud) o diseñar una infraestructura nueva desde cero, según lo que tu operación necesite.",
  },
  {
    q: "¿Cómo empiezo a trabajar con ustedes?",
    a: "Escríbenos desde la página de contacto contándonos qué necesitas. Agendamos una conversación inicial, hacemos un diagnóstico y te proponemos una arquitectura y un plan de implementación.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border-t border-white/[0.08] last:border-b">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-7 text-left"
      >
        <span className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-tech">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-lg font-bold text-snow md:text-xl">{q}</span>
        </span>
        <span
          className={cn(
            "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-steel/30 text-snow transition-transform duration-300",
            open && "rotate-45 border-volt/60 text-volt"
          )}
          aria-hidden
        >
          <span className="absolute h-px w-3 bg-current" />
          <span className="absolute h-3 w-px bg-current" />
        </span>
      </button>
      <div className={cn("grid overflow-hidden transition-all duration-300", open ? "grid-rows-[1fr] pb-7 opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="min-h-0">
          <p className="max-w-3xl text-[15px] leading-relaxed text-steel">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  return (
    <section id="preguntas" className="relative isolate overflow-hidden border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="absolute inset-0 -z-10 mask-radial opacity-60">
        <NetBackdrop />
      </div>

      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Reveal><SectionLabel index="14">Preguntas frecuentes</SectionLabel></Reveal>
            <RevealTitle
              className="mt-8 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.6rem]"
              lines={["Dudas, resueltas", "antes de empezar."]}
              accentLast
            />
          </div>
          <Reveal delay={150} className="max-w-sm text-[15px] leading-relaxed text-steel">
            Si tu pregunta no está aquí, escríbenos directamente desde la página de contacto.
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 70}>
              <FaqItem q={f.q} a={f.a} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
