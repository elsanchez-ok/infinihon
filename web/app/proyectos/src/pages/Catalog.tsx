import { useMemo, useState } from "react";
import { Corners, GhostButton, PrimaryButton, Reveal, RevealTitle, SectionLabel } from "../components/ui";
import { CATEGORY_LABELS, projects, type Project, type ProjectCategory } from "../data/projects";
import { cn } from "../utils/cn";

const filters: Array<"todos" | ProjectCategory> = ["todos", "software", "infraestructura", "plataformas"];

function ProjectCard({ p, delay }: { p: Project; delay: number }) {
  return (
    <Reveal delay={delay} className="group relative h-full border border-white/[0.08] bg-ink p-8 transition-colors duration-500 hover:border-tech/50">
      <Corners />
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
        <span>Proyecto · {CATEGORY_LABELS[p.category]}</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
          {p.status}
        </span>
      </div>

      <h3 className="mt-8 text-3xl font-extrabold uppercase tracking-tight text-snow md:text-4xl">{p.name}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-steel">{p.description}</p>

      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">Stack</div>
        <ul className="flex flex-wrap gap-2">
          {p.stack.map((s) => (
            <li key={s} className="border border-white/10 px-3 py-1.5 font-mono text-[11px] text-snow/85">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px border border-white/[0.08] bg-white/[0.06]">
        {p.stats.map((s) => (
          <div key={s.label} className="bg-obsidian px-4 py-4">
            <div className="font-mono text-sm font-semibold text-volt">{s.value}</div>
            <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel/70">{s.label}</div>
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
            Abrir página del proyecto <span className="font-mono">→</span>
          </a>
        )}
        {p.links.repo && (
          <a
            href={p.links.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-steel/30 px-5 py-3 text-[13px] font-semibold text-snow transition-all hover:border-volt/60 hover:bg-white/[0.03]"
          >
            Repositorio en GitHub
          </a>
        )}
      </div>
      {p.download && (
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel/70">{p.download.meta}</p>
      )}
    </Reveal>
  );
}

export default function Catalog() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("todos");
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const list = useMemo(
    () => (filter === "todos" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-obsidian text-snow">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06] pb-24 pt-40 md:pb-32 md:pt-56">
          <div className="absolute inset-0 -z-10 bg-grid grid-drift mask-radial opacity-60" />
          <div className="absolute left-1/2 top-[40%] -z-10 h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[120px]" />
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal className="flex items-center gap-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-volt ring" />
                <span className="relative h-2 w-2 rounded-full bg-volt" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
                InfiniHon Corp. <span className="text-steel/40">/</span> Portafolio &amp; Labs
              </span>
            </Reveal>
            <RevealTitle
              className="mt-8 max-w-5xl text-[11vw] font-extrabold uppercase leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:text-[6.4rem]"
              lines={["Proyectos creados", "por InfiniHon", "Corp."]}
              accentLast
            />
            <Reveal delay={250} className="mt-10 max-w-2xl text-lg leading-relaxed text-steel">
              Más allá de redes y telecomunicaciones: InfiniHon Corp. es el corporativo donde construimos, documentamos y
              publicamos <span className="text-snow">software propio, motores experimentales y plataformas tecnológicas</span>{" "}
              abiertas al público.
            </Reveal>
          </div>
        </section>

        {/* Destacado */}
        <section className="relative border-b border-white/[0.06] bg-ink py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="01">Proyecto destacado · En desarrollo activo</SectionLabel>
            </Reveal>
            <div className="mt-12">
              <ProjectCard p={featured} delay={120} />
            </div>
          </div>
        </section>

        {/* Ecosistema */}
        <section className="relative py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <Reveal>
                  <SectionLabel index="02">Ecosistema y líneas de proyectos</SectionLabel>
                </Reveal>
                <RevealTitle
                  className="mt-8 max-w-3xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
                  lines={["Software propio,", "plataformas activas", "y divisiones técnicas."]}
                  accentLast
                />
              </div>
              <Reveal delay={150} className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-all duration-300",
                      filter === f
                        ? "border-tech bg-tech text-snow"
                        : "border-white/10 text-steel hover:border-volt/50 hover:text-snow"
                    )}
                  >
                    {f === "todos" ? "Todos" : CATEGORY_LABELS[f]}
                  </button>
                ))}
              </Reveal>
            </div>

            {list.length > 0 ? (
              <div className="mt-16 grid gap-10 lg:grid-cols-2">
                {list.map((p, i) => (
                  <ProjectCard key={p.slug} p={p} delay={i * 80} />
                ))}
              </div>
            ) : (
              <div className="mt-16 border border-dashed border-white/10 bg-ink/60 p-12 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">
                  // Ecosistema en crecimiento
                </p>
                <p className="mt-4 text-lg text-steel">
                  Pronto publicaremos nuevos proyectos de esta línea en{" "}
                  <span className="font-mono text-sm text-volt">infinihon.vercel.app/&lt;proyecto&gt;</span>.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-white/[0.06] bg-ink py-24 md:py-32">
          <div className="absolute inset-0 -z-10 bg-grid-fine mask-radial opacity-50" />
          <div className="mx-auto max-w-[1440px] px-5 text-center md:px-10">
            <Reveal className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
              <span className="text-volt">03</span> — Próximos lanzamientos
            </Reveal>
            <RevealTitle
              as="h2"
              className="mx-auto mt-8 max-w-4xl text-[11vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.8rem]"
              lines={["Cada proyecto,", "su propia ruta."]}
              accentLast
            />
            <Reveal delay={250} className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-steel">
              Cada proyecto creado dentro de <span className="text-snow">InfiniHon Corp.</span> recibe su propia ruta
              dedicada en <span className="font-mono text-sm text-volt">infinihon.vercel.app/&lt;proyecto&gt;</span> con
              documentación técnica, demos y acceso directo al repositorio.
            </Reveal>
            <Reveal delay={400} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton href="https://github.com/sarch-codelab">GitHub @sarch-codelab</PrimaryButton>
              <GhostButton href="/#contacto">Proponer colaboración</GhostButton>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
