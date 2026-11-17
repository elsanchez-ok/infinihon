import { Corners, GhostButton, Reveal, RevealTitle, SectionLabel } from "./ui";
import { CATEGORY_LABELS, projects, type Project } from "../data/projects";

function ProjectCard({ p, delay }: { p: Project; delay: number }) {
  return (
    <Reveal delay={delay} className="group relative h-full border border-white/[0.08] bg-obsidian p-8 transition-colors duration-500 hover:border-tech/50">
      <Corners />
      <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
        <span>{CATEGORY_LABELS[p.category]}</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
          {p.status}
        </span>
      </div>

      <h3 className="mt-8 text-3xl font-extrabold uppercase tracking-tight text-snow md:text-4xl">{p.name}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-steel">{p.description}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {p.stack.map((s) => (
          <span key={s} className="border border-white/10 px-3 py-1.5 font-mono text-[11px] text-snow/85">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px border border-white/[0.08] bg-white/[0.06]">
        {p.stats.map((s) => (
          <div key={s.label} className="bg-ink px-4 py-4">
            <div className="font-mono text-sm font-semibold text-volt">{s.value}</div>
            <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-steel/70">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {p.download && (
          <a
            href={p.download.url}
            download={p.download.file}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-tech px-5 py-3 text-[13px] font-semibold text-snow transition-colors hover:bg-[#1a75ff]"
          >
            Descargar {p.download.file} <span className="font-mono">↓</span>
          </a>
        )}
        {p.links.demo && (
          <a
            href={p.links.demo}
            className="inline-flex items-center gap-2 border border-steel/30 px-5 py-3 text-[13px] font-semibold text-snow transition-all hover:border-volt/60 hover:bg-white/[0.03]"
          >
            Abrir proyecto <span className="font-mono">→</span>
          </a>
        )}
        {p.links.repo && (
          <a
            href={p.links.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-steel/30 px-5 py-3 text-[13px] font-semibold text-snow transition-all hover:border-volt/60 hover:bg-white/[0.03]"
          >
            GitHub
          </a>
        )}
      </div>
      {p.download && (
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel/70">{p.download.meta}</p>
      )}
    </Reveal>
  );
}

export default function ProjectsSection() {
  return (
    <section id="proyectos" className="relative border-t border-white/[0.06] bg-ink py-28 md:py-40">
      <div className="absolute inset-0 -z-10 bg-grid-fine mask-radial opacity-40" />
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <SectionLabel index="04">Proyectos</SectionLabel>
        </Reveal>
        <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <RevealTitle
            className="max-w-4xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.6rem]"
            lines={["Proyectos propios.", "Software que", "construimos."]}
            accentLast
          />
          <Reveal delay={200} className="max-w-sm text-[15px] leading-relaxed text-steel">
            Más allá de redes y telecomunicaciones: InfiniHon Corp. publica aquí sus proyectos de software, motores
            experimentales y plataformas tecnológicas.
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} delay={i * 80} />
          ))}
        </div>

        <Reveal delay={200} className="mt-12 flex justify-center">
          <GhostButton href="/proyectos">Ver todos los proyectos</GhostButton>
        </Reveal>
      </div>
    </section>
  );
}
