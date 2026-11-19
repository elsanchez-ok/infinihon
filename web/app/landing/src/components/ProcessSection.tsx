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

/** Encabezado de la sección — compartido entre la variante fija (pin) y la estática. */
function SectionHeading() {
  return (
    <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
      <div>
        <Reveal><SectionLabel index="11">Proceso</SectionLabel></Reveal>
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
  );
}

function StepNumber({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative flex h-[15px] w-[15px] items-center justify-center border transition-all duration-700",
        on ? "border-volt bg-obsidian shadow-[0_0_16px_rgba(0,168,255,0.6)]" : "border-white/20 bg-obsidian"
      )}
    >
      <span className={cn("h-[5px] w-[5px] transition-colors duration-700", on ? "bg-volt" : "bg-white/20")} />
    </span>
  );
}

function StepCard({ s, i, on, wide }: { s: (typeof steps)[number]; i: number; on: boolean; wide?: boolean }) {
  return (
    <div className={cn("relative shrink-0", wide ? "w-[300px] md:w-[360px]" : "")}>
      <div className="flex items-center gap-4">
        <StepNumber on={on} />
        <div className={cn("font-mono text-xs transition-colors duration-700", on ? "text-volt" : "text-steel/60")}>
          {String(i + 1).padStart(2, "0")}
        </div>
      </div>
      <h3 className={cn("mt-6 text-3xl font-extrabold uppercase tracking-tight transition-colors duration-700 lg:text-[1.9rem] xl:text-4xl", on ? "text-snow" : "text-snow/40")}>
        {s.k}
      </h3>
      <p className="mt-3 max-w-[85%] text-[14px] leading-relaxed text-steel">{s.d}</p>
    </div>
  );
}

/**
 * Variante "fija" (pin): la sección queda clavada a pantalla completa mientras
 * el usuario hace scroll, y ese scroll empuja las 6 etapas en fila hacia la
 * izquierda — una franja horizontal dentro del flujo vertical de la página.
 * Solo se activa en escritorio y cuando el usuario no pidió reducir movimiento;
 * en cualquier otro caso se usa <StaticProcess /> (sin scroll-jacking).
 */
function PinnedProcess() {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!rowRef.current || !viewportRef.current) return;
      setMaxTranslate(Math.max(0, rowRef.current.scrollWidth - viewportRef.current.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = trackRef.current;
        if (!el) return;
        const scrollable = el.offsetHeight - window.innerHeight;
        const p = scrollable > 0 ? -el.getBoundingClientRect().top / scrollable : 0;
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [maxTranslate]);

  const activeIdx = Math.min(steps.length - 1, Math.floor(progress * steps.length));

  return (
    <div ref={trackRef} style={{ height: `calc(100vh + ${maxTranslate}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <SectionHeading />
        </div>

        <div ref={viewportRef} className="relative mx-auto mt-16 w-full max-w-[1440px] overflow-hidden md:mt-24">
          {/* horizontal progress line */}
          <div className="absolute left-5 right-5 top-[7px] h-px bg-white/10 md:left-10 md:right-10">
            <div className="h-full bg-gradient-to-r from-hn via-tech to-volt transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
          </div>

          <div
            ref={rowRef}
            className="flex gap-16 pb-2 pl-5 pr-5 pt-10 md:gap-20 md:pl-10 md:pr-10"
            style={{ transform: `translate3d(${-progress * maxTranslate}px,0,0)` }}
          >
            {steps.map((s, i) => (
              <StepCard key={s.k} s={s} i={i} on={i <= activeIdx} wide />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[1440px] px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50 md:px-10">
          Desliza — {String(activeIdx + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

/** Variante estática original: sin scroll-jacking — usada en móvil y cuando se prefiere reducir el movimiento. */
function StaticProcess() {
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
    <div className="mx-auto max-w-[1440px] px-5 py-28 md:px-10 md:py-40">
      <SectionHeading />

      <div ref={ref} className="relative mt-20 md:mt-28">
        <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-white/10 lg:block">
          <div className="h-full bg-gradient-to-r from-hn via-tech to-volt transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 lg:hidden">
          <div className="w-full bg-gradient-to-b from-hn via-tech to-volt transition-[height] duration-300" style={{ height: `${progress * 100}%` }} />
        </div>

        <ol className="grid gap-12 lg:grid-cols-6 lg:gap-6">
          {steps.map((s, i) => {
            const on = i <= activeIdx;
            return (
              <Reveal as="li" key={s.k} delay={i * 90} className="relative pl-10 lg:pl-0">
                <span className="absolute left-0 top-0 lg:relative">
                  <StepNumber on={on} />
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
  );
}

export default function ProcessSection() {
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 1024px)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinEnabled(mqDesktop.matches && !mqReduced.matches);
    update();
    mqDesktop.addEventListener("change", update);
    mqReduced.addEventListener("change", update);
    return () => {
      mqDesktop.removeEventListener("change", update);
      mqReduced.removeEventListener("change", update);
    };
  }, []);

  return (
    <section className="relative border-t border-white/[0.06] bg-obsidian">
      {pinEnabled ? <PinnedProcess /> : <StaticProcess />}
    </section>
  );
}
