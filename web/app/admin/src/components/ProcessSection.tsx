import { useEffect, useRef, useState } from "react";
import { Reveal, RevealTitle, SectionLabel } from "./ui";
import { cn } from "../utils/cn";

const steps = [
  { k: "Discover", d: "Levantamiento del estado actual: red, servidores, aplicaciones, riesgos y objetivos del negocio." },
  { k: "Design", d: "Arquitectura documentada: topología, capacidades, seguridad y plan de implementación." },
  { k: "Build", d: "Implementación con infraestructura como código y configuración reproducible." },
  { k: "Deploy", d: "Puesta en producción planificada, con ventanas controladas y plan de reversión." },
  { k: "Monitor", d: "Métricas, alertas y visibilidad continua sobre cada componente." },
  { k: "Scale", d: "Evolución de la infraestructura al ritmo del crecimiento de la operación." },
];

export default function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const fn = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = (vh * 0.75 - r.top) / (r.height + vh * 0.1);
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
      cancelAnimationFrame(raf);
    };
  }, []);

  const activeIdx = Math.floor(progress * steps.length - 0.001);

  return (
    <section className="relative border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Reveal><SectionLabel index="10">Proceso</SectionLabel></Reveal>
            <RevealTitle
              className="mt-8 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.8rem]"
              lines={["Un método.", "Seis etapas."]}
              accentLast
            />
          </div>
          <Reveal delay={150} className="max-w-sm text-[15px] leading-relaxed text-steel">
            Cada proyecto sigue el mismo ciclo de ingeniería. Sin improvisación, con entregables claros en cada etapa.
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-20 md:mt-28">
          {/* horizontal line (desktop) */}
          <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-white/10 lg:block">
            <div className="h-full bg-gradient-to-r from-hn via-tech to-volt transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
          {/* vertical line (mobile) */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 lg:hidden">
            <div className="w-full bg-gradient-to-b from-hn via-tech to-volt transition-[height] duration-300" style={{ height: `${progress * 100}%` }} />
          </div>

          <ol className="grid gap-12 lg:grid-cols-6 lg:gap-6">
            {steps.map((s, i) => {
              const on = i <= activeIdx;
              return (
                <Reveal as="li" key={s.k} delay={i * 90} className="relative pl-10 lg:pl-0">
                  <span
                    className={cn(
                      "absolute left-0 top-0 flex h-[15px] w-[15px] items-center justify-center border transition-all duration-700 lg:relative",
                      on ? "border-volt bg-obsidian shadow-[0_0_16px_rgba(0,168,255,0.6)]" : "border-white/20 bg-obsidian"
                    )}
                  >
                    <span className={cn("h-[5px] w-[5px] transition-colors duration-700", on ? "bg-volt" : "bg-white/20")} />
                  </span>
                  <div className="lg:mt-8">
                    <div className={cn("font-mono text-xs transition-colors duration-700", on ? "text-volt" : "text-steel/60")}>
                      {String(i + 1).padStart(2, "0")} —
                    </div>
                    <h3 className={cn("mt-2 text-3xl font-extrabold uppercase tracking-tight transition-colors duration-700 lg:text-[1.7rem] xl:text-3xl", on ? "text-snow" : "text-snow/40")}>
                      {s.k}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-steel">{s.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
