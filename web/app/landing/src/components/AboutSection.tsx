import { Reveal, RevealTitle, SectionLabel } from "./ui";

/* Collage disperso de fotos de comunidad/equipo: posiciones en % sobre un
   lienzo de referencia de 1200x620, con una ligera rotación aleatoria para
   que se vea orgánico en vez de una cuadrícula. Solo se muestra así en
   pantallas grandes (lg+); en móvil cae a una tira horizontal con scroll. */
const communityPhotos = [
  { src: "01-interview.jpg", alt: "Entrevista en vivo en un evento tecnológico", top: "4%", left: "4%", w: 168, rot: -4 },
  { src: "03-audience.jpg", alt: "Audiencia atenta en una conferencia de tecnología", top: "0%", left: "29%", w: 220, rot: 2 },
  { src: "02-coder.jpg", alt: "Desarrollador trabajando en su laptop", top: "9%", left: "56%", w: 150, rot: -3 },
  { src: "04-networking.jpg", alt: "Networking entre profesionales de tecnología", top: "2%", left: "78%", w: 170, rot: 3 },
  { src: "06-panel.jpg", alt: "Panel de discusión sobre tecnología", top: "46%", left: "10%", w: 150, rot: 3 },
  { src: "09-hallway.jpg", alt: "Asistente en el pasillo de una conferencia", top: "30%", left: "80%", w: 190, rot: -2 },
  { src: "05-crowd-phones.jpg", alt: "Público grabando una charla con el celular", top: "70%", left: "22%", w: 190, rot: -3 },
  { src: "10-laughing.jpg", alt: "Compañeros de equipo riendo juntos", top: "76%", left: "48%", w: 160, rot: 4 },
  { src: "08-notes.jpg", alt: "Tomando notas durante una conferencia", top: "66%", left: "86%", w: 116, rot: -5 },
  { src: "07-aerial-crowd.jpg", alt: "Vista aérea de una multitud en un evento tecnológico", top: "66%", left: "66%", w: 210, rot: 2 },
];

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
        <Reveal><SectionLabel index="12">Nosotros</SectionLabel></Reveal>
        <RevealTitle
          className="mt-8 max-w-6xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[5.4rem]"
          lines={["No solo instalamos", "tecnología.", "Construimos sistemas."]}
          accentLast
        />

        <Reveal delay={120} className="relative mt-14 md:mt-20">
          {/* Desktop/tablet grande: collage disperso con el titular al centro, sin marco ni caja */}
          <div className="relative hidden h-[620px] lg:block">
            {communityPhotos.map((p) => (
              <img
                key={p.src}
                src={`/assets/community/${p.src}`}
                alt={p.alt}
                loading="lazy"
                style={{ top: p.top, left: p.left, width: p.w, transform: `rotate(${p.rot}deg)` }}
                className="absolute aspect-square rounded-2xl border border-white/10 object-cover shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)] transition-transform duration-500 hover:z-10 hover:scale-105 hover:rotate-0"
              />
            ))}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10">
              <h3 className="max-w-xl text-center text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-snow xl:text-5xl">
                Juntos construimos infraestructura.
              </h3>
            </div>
          </div>

          {/* Móvil/tablet: titular + tira horizontal con scroll */}
          <div className="py-10 lg:hidden">
            <h3 className="mx-auto max-w-sm text-center text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-snow">
              Juntos construimos infraestructura.
            </h3>
            <div className="mt-10 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {communityPhotos.map((p) => (
                <img
                  key={p.src}
                  src={`/assets/community/${p.src}`}
                  alt={p.alt}
                  loading="lazy"
                  className="h-28 w-28 shrink-0 rounded-xl border border-white/10 object-cover sm:h-36 sm:w-36"
                />
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/60">
            <span>Comunidad InfiniHon · Tegucigalpa, HN</span>
            <span className="text-steel/30">·</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" /> HQ · operación activa</span>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal className="text-xl leading-relaxed text-snow/90 md:text-2xl">
              InfiniHon Corp. es un corporativo tecnológico hondureño enfocado en infraestructura, sistemas, soluciones IT y proyectos propios de software.
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
