import { Reveal, RevealTitle, SectionLabel } from "./ui";

const principles = [
  { k: "Arquitectura primero", v: "Antes de instalar, diseñamos. Cada decisión técnica responde a un objetivo de la operación." },
  { k: "Todo documentado", v: "Topologías, configuraciones y procedimientos entregados por escrito. Tu infraestructura no depende de una sola persona." },
  { k: "Estándares abiertos", v: "Preferimos tecnologías probadas y abiertas que evitan dependencias innecesarias de un proveedor." },
  { k: "Soporte continuo", v: "Acompañamiento después de la implementación: mantenimiento, soporte tecnológico y mejora continua." },
];

export default function AboutSection() {
  return (
    <section id="nosotros" className="relative border-t border-white/[0.06] bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><SectionLabel index="11">Nosotros</SectionLabel></Reveal>
        <RevealTitle
          className="mt-8 max-w-6xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[5.4rem]"
          lines={["No solo instalamos", "tecnología.", "Construimos sistemas."]}
          accentLast
        />

        <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal className="text-xl leading-relaxed text-snow/90 md:text-2xl">
              INF INIHON es una empresa tecnológica hondureña enfocada en infraestructura, sistemas y soluciones IT.
            </Reveal>
            <Reveal delay={100} className="mt-6 text-[15px] leading-relaxed text-steel">
              Trabajamos en todo el recorrido: desde el cableado lógico de una red y la configuración de un router
              MikroTik, hasta clusters de Raspberry Pi con K3s, despliegues en AWS, Azure o Google Cloud y el software
              que corre encima. Nuestro objetivo es simple: que la tecnología de tu empresa sea estable, segura y
              entendible.
            </Reveal>
            <Reveal delay={200} className="mt-10 grid grid-cols-3 border-y border-white/[0.08]">
              {[
                ["L1→L7", "de la red a la aplicación"],
                ["IaC", "configuración como código"],
                ["24/7", "monitorización posible"],
              ].map(([a, b], i) => (
                <div key={a} className={i ? "border-l border-white/[0.08] py-5 pl-4" : "py-5 pr-4"}>
                  <div className="text-2xl font-extrabold tracking-tight text-snow md:text-3xl">{a}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase leading-4 tracking-[0.14em] text-steel">{b}</div>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {principles.map((p, i) => (
              <Reveal key={p.k} delay={i * 80} className="group grid grid-cols-[56px_1fr] gap-4 border-t border-white/[0.08] py-7 last:border-b">
                <span className="font-mono text-sm text-tech">/{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-xl font-bold text-snow transition-colors group-hover:text-volt md:text-2xl">{p.k}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-steel">{p.v}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
