import { type CSSProperties } from "react";
import { Reveal, RevealTitle, SectionLabel, useInView } from "./ui";
import { cn } from "../utils/cn";

const layers = [
  { id: "L1", name: "Network", sub: "Routing · Switching · VPN · VLAN", mods: ["RTR", "FW", "SW", "SW", "AP", "VPN"], desc: "La base física y lógica. Todo lo demás depende de que esta capa sea estable." },
  { id: "L2", name: "Servers", sub: "Bare metal · Virtualización · Clusters", mods: ["HV-01", "HV-02", "NAS", "RPI-C"], desc: "Cómputo y almacenamiento dimensionados para la carga real de tu operación." },
  { id: "L3", name: "Cloud", sub: "AWS · Azure · Google Cloud · Híbrido", mods: ["VPC", "IAM", "S3", "LB", "DNS"], desc: "Extensión elástica de tu infraestructura, conectada de forma segura a lo local." },
  { id: "L4", name: "Applications", sub: "Containers · APIs · Sistemas internos", mods: ["API", "WEB", "DB", "QUEUE", "AUTH", "JOB", "CACHE"], desc: "Tus aplicaciones desplegadas de forma reproducible, versionada y automatizada." },
  { id: "L5", name: "Monitoring", sub: "Métricas · Logs · Alertas", mods: ["PROM", "GRAF", "ALERT"], desc: "Visibilidad completa sobre cada capa. Detectar antes de que el usuario lo note." },
];

function Layer({ l, i }: { l: (typeof layers)[number]; i: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="group relative">
      <div className="grid items-center gap-6 md:grid-cols-[180px_1fr_260px] md:gap-10">
        {/* label */}
        <div className={cn("reveal flex items-baseline gap-4 md:block", inView && "in")}>
          <span className="font-mono text-[11px] tracking-[0.2em] text-volt">{l.id}</span>
          <h3 className="text-2xl font-extrabold uppercase tracking-tight text-snow md:mt-2 md:text-3xl">{l.name}</h3>
        </div>

        {/* plate */}
        <div className="relative [perspective:1000px]">
          <div
            className={cn(
              "relative h-20 origin-center border bg-ink transition-all duration-1000 md:h-24",
              "[transform:rotateX(52deg)] group-hover:[transform:rotateX(40deg)]",
              inView ? "border-tech/60 shadow-[0_30px_80px_-20px_rgba(0,102,255,0.45)]" : "border-white/10"
            )}
          >
            <div className="absolute inset-0 bg-grid-fine" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-tech/20 to-transparent transition-opacity duration-1000",
                inView ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="relative flex h-full items-center justify-center gap-2 px-4 md:gap-3">
              {l.mods.map((m, k) => (
                <span
                  key={k}
                  className={cn(
                    "flex h-9 min-w-0 flex-1 items-center justify-center border font-mono text-[9px] tracking-wider transition-all duration-700 md:h-11 md:max-w-[90px] md:text-[10px]",
                    inView ? "border-volt/50 bg-hn/40 text-snow" : "border-white/10 text-steel/40"
                  )}
                  style={{ transitionDelay: `${200 + k * 80}ms` }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60">{l.sub}</div>
        </div>

        {/* desc */}
        <p className={cn("reveal text-[15px] leading-relaxed text-steel", inView && "in")} style={{ "--d": "200ms" } as CSSProperties}>
          {l.desc}
        </p>
      </div>

      {i < layers.length - 1 && (
        <div className="relative mx-auto my-2 h-14 w-px md:ml-[calc(220px_+_(100%_-_520px)_/_2)]">
          <div className="absolute inset-0 bg-gradient-to-b from-tech/60 to-tech/10" />
          <span className="drop absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-volt shadow-[0_0_12px_#00A8FF]" style={{ "--d": `${i * 0.4}s` } as CSSProperties} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-steel/50">↓</span>
        </div>
      )}
    </div>
  );
}

export default function ArchitectureSection() {
  return (
    <section id="infraestructura" className="relative overflow-hidden border-t border-white/[0.06] bg-ink py-28 md:py-40">
      <div className="absolute inset-0 bg-grid opacity-40 mask-radial" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <Reveal><SectionLabel index="02">La solución</SectionLabel></Reveal>
            <RevealTitle
              className="mt-8 max-w-5xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.8rem]"
              lines={["Construimos la", "infraestructura detrás", "de tu operación."]}
              accentLast
            />
          </div>
          <Reveal delay={200} className="max-w-sm text-[15px] leading-relaxed text-steel">
            Pensamos la tecnología como un sistema de capas. Cada una se diseña, documenta y conecta con la siguiente —
            así la operación completa se vuelve predecible.
          </Reveal>
        </div>

        <div className="mt-20 md:mt-28">
          <div className="mb-8 hidden grid-cols-[180px_1fr_260px] gap-10 border-b border-white/[0.06] pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60 md:grid">
            <span>Layer</span>
            <span className="text-center">Architecture · reference diagram</span>
            <span>Function</span>
          </div>
          {layers.map((l, i) => (
            <Layer key={l.id} l={l} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
