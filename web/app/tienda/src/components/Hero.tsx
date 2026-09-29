import { useEffect, useState, type CSSProperties } from "react";
import InfrastructureVisual from "./InfrastructureVisual";
import { PrimaryButton, GhostButton } from "./ui";
import { cn } from "../utils/cn";

const micro = ["Redes", "Cloud", "Seguridad", "DevOps", "Automatización"];

export default function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section id="inicio" className={cn("relative isolate min-h-[100svh] overflow-hidden", ready && "in hero-in")}>
      {/* background layers */}
      <div className="absolute inset-0 -z-20 bg-obsidian" />
      <div className="absolute inset-0 -z-10 bg-grid grid-drift mask-radial opacity-60" />
      <div className="absolute left-1/2 top-[55%] -z-10 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[120px] lg:left-[68%]" />

      <div className="absolute inset-0 -z-10 lg:left-[28%]">
        <InfrastructureVisual className="h-full w-full opacity-70 lg:opacity-100" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent lg:via-obsidian/40" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-obsidian to-transparent" />

      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-x-5 top-[88px] bottom-6 hidden md:inset-x-10 md:block" aria-hidden>
        <div className="absolute right-0 top-0 text-right font-mono text-[10px] uppercase leading-5 tracking-[0.2em] text-steel/70">
          <div>Topology view · Top-down</div>
          <div className="text-steel/50">Render: live · visual simulation</div>
        </div>
        <div className="absolute bottom-0 right-0 hidden text-right font-mono text-[10px] uppercase leading-5 tracking-[0.2em] text-steel/60 lg:block">
          <div>14.0818° N · 87.2068° W</div>
          <div className="text-steel/40">Tegucigalpa · HN</div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-center px-5 pb-28 pt-32 md:px-10">
        <div className="max-w-[860px]">
          <div className="reveal mb-8 flex items-center gap-4 md:mb-10" style={{ "--d": "100ms" } as CSSProperties}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-volt ring" />
              <span className="relative h-2 w-2 rounded-full bg-volt" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
              INF INIHON <span className="text-steel/40">/</span> Technology & Infrastructure
            </span>
          </div>

          <h1 className="text-[13vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-snow sm:text-[10vw] lg:text-[7.4rem] xl:text-[8.4rem]">
            <span className="line-reveal pb-[0.05em]" style={{ "--d": "200ms" } as CSSProperties}>
              <span>Infraestructura</span>
            </span>
            <span className="line-reveal pb-[0.05em]" style={{ "--d": "320ms" } as CSSProperties}>
              <span>
                que mueve <span className="bg-gradient-to-r from-tech to-volt bg-clip-text text-transparent">el</span>
              </span>
            </span>
            <span className="line-reveal pb-[0.08em]" style={{ "--d": "440ms" } as CSSProperties}>
              <span className="bg-gradient-to-r from-tech via-volt to-snow bg-clip-text text-transparent">futuro.</span>
            </span>
          </h1>

          <p
            className="reveal mt-8 max-w-[560px] text-base leading-relaxed text-steel md:mt-10 md:text-lg"
            style={{ "--d": "650ms" } as CSSProperties}
          >
            Diseñamos, implementamos y protegemos la <span className="text-snow">infraestructura tecnológica</span> que mantiene
            conectadas a las empresas modernas.
          </p>

          <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row" style={{ "--d": "800ms" } as CSSProperties}>
            <PrimaryButton href="#contacto">Construir mi infraestructura</PrimaryButton>
            <GhostButton href="#servicios">Explorar servicios</GhostButton>
          </div>

          <div
            className="reveal mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-steel md:mt-16"
            style={{ "--d": "950ms" } as CSSProperties}
          >
            {micro.map((m, i) => (
              <span key={m} className="flex items-center gap-3">
                {i > 0 && <span className="text-tech">·</span>}
                <span className="transition-colors hover:text-snow">{m}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* bottom rail */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-steel/70 md:px-10">
          <a href="#problema" className="group flex items-center gap-3 hover:text-snow">
            <span className="relative h-8 w-px overflow-hidden bg-white/10">
              <span className="scan absolute inset-x-0 top-0 h-1/2 bg-volt" />
            </span>
            Scroll
          </a>
          <span className="hidden sm:block">Networking · Servers · Cloud · Security · Observability</span>
          <span>© INF INIHON</span>
        </div>
      </div>
    </section>
  );
}
