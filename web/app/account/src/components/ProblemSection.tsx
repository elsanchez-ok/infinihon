import { Reveal, RevealTitle, SectionLabel } from "./ui";

const problems = [
  { t: "Redes inestables", d: "Caídas, latencia y cortes que nadie sabe explicar. Cada minuto sin red es operación detenida.", tag: "packet loss" },
  { t: "Sistemas desconectados", d: "Aplicaciones, sedes y datos que no hablan entre sí. Información duplicada y decisiones a ciegas.", tag: "silos" },
  { t: "Falta de monitorización", d: "Los problemas se descubren cuando el cliente llama. Sin métricas no hay diagnóstico.", tag: "no observability" },
  { t: "Procesos manuales", d: "Configuraciones hechas a mano, servidor por servidor. Lento, frágil e imposible de replicar.", tag: "toil" },
  { t: "Riesgos de seguridad", d: "Puertos abiertos, accesos compartidos y equipos sin actualizar. La superficie de ataque crece sola.", tag: "exposure" },
  { t: "Infraestructura difícil de escalar", d: "Cada nuevo usuario, sede o servicio exige rehacerlo todo. El crecimiento se vuelve un problema.", tag: "bottleneck" },
];

export default function ProblemSection() {
  return (
    <section id="problema" className="relative border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal><SectionLabel index="01">El problema</SectionLabel></Reveal>
              <RevealTitle
                className="mt-8 text-[11vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.6rem]"
                lines={["Tu tecnología", "no debería ser", "el cuello", "de botella."]}
                accentLast
              />
              <Reveal delay={300} className="mt-10 max-w-sm border-l border-tech pl-5 text-lg leading-relaxed text-snow/90">
                Una empresa puede crecer rápidamente.
                <br />
                <span className="text-steel">Su infraestructura también debe hacerlo.</span>
              </Reveal>
            </div>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6 lg:pl-10">
            {problems.map((p, i) => (
              <Reveal as="li" key={p.t} delay={i * 60} className="group relative border-t border-white/[0.08] last:border-b">
                <div className="absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-hn/30 to-transparent transition-all duration-700 group-hover:w-full" />
                <div className="relative grid grid-cols-[auto_1fr] gap-x-6 py-8 md:grid-cols-[120px_1fr_auto] md:gap-x-10 md:py-10">
                  <span className="text-5xl font-extrabold leading-none tracking-tighter text-white/[0.08] transition-colors duration-500 group-hover:text-tech md:text-7xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-snow md:text-3xl">{p.t}</h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-steel">{p.d}</p>
                  </div>
                  <span className="col-start-2 mt-4 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60 md:col-start-3 md:mt-2">
                    <span className="text-red-400/70">●</span> {p.tag}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
