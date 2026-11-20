import { useEffect, useState, type CSSProperties } from "react";
import { PrimaryButton, GhostButton } from "./ui";
import { cn } from "../utils/cn";

const micro = ["Proyectos", "Redes", "Cloud", "Seguridad", "DevOps", "Automatización"];

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
      <div
        className="hero-ambient-glow pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-full w-full"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-grid grid-drift mask-radial opacity-60" />
      <div className="hero-ambient-blob absolute left-1/2 top-[55%] -z-10 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[120px] lg:left-[68%]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-obsidian to-transparent" />

      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-x-5 top-[88px] bottom-6 hidden md:inset-x-10 md:block" aria-hidden>
        <div className="absolute bottom-0 right-0 hidden text-right font-mono text-[10px] uppercase leading-5 tracking-[0.2em] text-steel/60 lg:block">
          <div>14.0818° N · 87.2068° W</div>
          <div className="text-steel/40">Tegucigalpa · HN</div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col items-center justify-center px-5 pb-28 pt-32 text-center md:px-10">
        <div className="flex max-w-[780px] flex-col items-center">
          <div className="reveal mb-8 flex items-center gap-4 md:mb-10" style={{ "--d": "100ms" } as CSSProperties}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-volt ring" />
              <span className="relative h-2 w-2 rounded-full bg-volt" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
              INFINIHON CORP. <span className="text-steel/40">/</span> Corporativo de Proyectos &amp; IT
            </span>
          </div>

          <div className="reveal -mb-2 md:-mb-4" style={{ "--d": "160ms" } as CSSProperties}>
            <img
              src="/assets/mascot-hero.png"
              alt=""
              aria-hidden="true"
              className="relative z-10 mx-auto h-32 w-32 drop-shadow-[0_18px_40px_rgba(0,102,255,0.55)] sm:h-40 sm:w-40 md:h-48 md:w-48"
            />
          </div>

          <h1 className="text-[12vw] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-[#F5F7FA] sm:text-[8vw] lg:text-[4.6rem] xl:text-[5.2rem]">
            <span className="line-reveal pb-[0.05em]" style={{ "--d": "260ms" } as CSSProperties}>
              <span>
                Ingeniería de <span className="inline-block rounded-2xl bg-tech px-[0.35em] py-[0.05em]">infraestructura</span>
              </span>
            </span>
            <span className="line-reveal pb-[0.08em]" style={{ "--d": "400ms" } as CSSProperties}>
              <span>para tu empresa.</span>
            </span>
          </h1>

          <p
            className="reveal mt-8 max-w-[560px] text-base leading-relaxed text-steel md:mt-10 md:text-lg"
            style={{ "--d": "650ms" } as CSSProperties}
          >
            Diseñamos, implementamos y protegemos la <span className="text-snow">infraestructura tecnológica</span> que mantiene
            conectadas a las empresas modernas. Y publicamos los <span className="text-snow">proyectos de software y plataformas</span>{" "}
            que construimos dentro del corporativo.
          </p>

          <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row" style={{ "--d": "800ms" } as CSSProperties}>
            <PrimaryButton href="/contacto">Construir mi infraestructura</PrimaryButton>
            <GhostButton href="#servicios">Explorar servicios</GhostButton>
            <GhostButton href="/proyectos">Ver proyectos</GhostButton>
          </div>

          <div
            className="reveal mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-steel md:mt-16"
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
          <span>© INFINIHON CORP.</span>
        </div>
      </div>
    </section>
  );
}
