import { useEffect, useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { bundles, services } from "../../store/catalog";
import { BundleCard, SectionHead, SolutionCard, Breadcrumb } from "./cards";
import { HondurasMesh } from "./ProductVisual";
import { Reveal, RevealTitle, PrimaryButton } from "../ui";
import { cn } from "../../utils/cn";

/* ------------------------------------------------------------ quote form */

function QuoteForm({ preset, title }: { preset?: string; title: string }) {
  const { notify } = useStore();
  const [sent, setSent] = useState(false);
  const field = "w-full border border-white/10 bg-obsidian px-4 py-3 text-[14px] text-snow placeholder:text-steel/50 focus:border-volt focus:outline-none";
  const label = "block font-mono text-[10px] uppercase tracking-[0.18em] text-steel";

  useEffect(() => setSent(false), [preset]);

  return (
    <div id="cotizar" className="scroll-mt-28 border border-white/[0.09] bg-ink/60 p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
        <span>{title}</span>
        <span>Respuesta del equipo técnico</span>
      </div>
      {sent ? (
        <div className="py-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">Solicitud registrada</div>
          <p className="mt-4 text-2xl font-bold">Gracias. Te contactaremos.</p>
          <p className="mt-2 text-[14px] text-steel">Modo demostración: esta solicitud no se envía a ningún servidor.</p>
          <button onClick={() => setSent(false)} className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">← Editar solicitud</button>
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); notify("Solicitud registrada", "Modo demo · sin envío real", "info"); }}
          className="grid gap-5 sm:grid-cols-2"
        >
          <label className="block"><span className={label}>Nombre *</span><input required className={cn(field, "mt-2.5")} placeholder="Tu nombre" /></label>
          <label className="block"><span className={label}>Empresa</span><input className={cn(field, "mt-2.5")} placeholder="Razón social" /></label>
          <label className="block"><span className={label}>Email *</span><input required type="email" className={cn(field, "mt-2.5")} placeholder="tu@empresa.com" /></label>
          <label className="block"><span className={label}>Teléfono</span><input type="tel" className={cn(field, "mt-2.5")} placeholder="+504 0000 0000" /></label>
          <label className="block sm:col-span-2">
            <span className={label}>Servicio de interés *</span>
            <select required defaultValue={preset ?? ""} className={cn(field, "mt-2.5 [&>option]:bg-ink")}>
              <option value="" disabled>Selecciona</option>
              {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              <option value="otro">Aún no lo sé / otro</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Cuéntanos el contexto *</span>
            <textarea required rows={4} className={cn(field, "mt-2.5 resize-none")} placeholder="Cantidad de sedes, equipos actuales, qué problema quieres resolver…" />
          </label>
          <div className="flex flex-col items-start justify-between gap-4 sm:col-span-2 sm:flex-row sm:items-center">
            <p className="text-[13px] leading-relaxed text-steel">Sin compromiso. Usamos tus datos solo para responder esta solicitud.</p>
            <button type="submit" className="shrink-0 bg-tech px-6 py-4 text-sm font-semibold hover:bg-[#1a75ff]">Solicitar cotización <span className="font-mono">→</span></button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- services page */

export function ServicesPage() {
  const { route } = useStore();
  const preset = route.query.get("s") ?? undefined;
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Servicios" }]} />
      <header className="mt-8 grid gap-8 border-b border-white/[0.08] pb-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-steel"><span className="text-volt">Servicios</span> <span className="h-px w-10 bg-steel/40" /></div>
          <h1 className="mt-5 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[4rem]">
            Soluciones Infinihon
          </h1>
        </div>
        <p className="max-w-md text-[14.5px] leading-relaxed text-steel lg:col-span-5">
          Infinihon no solo vende hardware. Estos servicios se cotizan por alcance y se ejecutan con documentación entregable.
        </p>
      </header>

      <div className="mt-12 grid gap-px bg-white/[0.07] md:grid-cols-2">
        {services.map((s, i) => <SolutionCard key={s.slug} s={s} i={i} />)}
      </div>

      <div className="mt-16">
        <SectionHead kicker="Cotización" title="Solicita una propuesta" note="Cuéntanos el contexto y te devolvemos un alcance escrito, sin tecnicismos innecesarios." />
        <div className="mt-8"><QuoteForm preset={preset} title="Solicitud de servicio" /></div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {[
          ["Diagnóstico", "Revisamos el estado actual antes de proponer cualquier cosa."],
          ["Propuesta escrita", "Alcance, entregables y condiciones por adelantado."],
          ["Documentación", "Todo queda por escrito para tu equipo, no solo en nuestra cabeza."],
        ].map(([t, d], i) => (
          <Reveal key={t} delay={i * 70} className="border border-white/[0.08] bg-ink/40 p-6">
            <span className="font-mono text-[10px] text-volt">/{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-4 text-lg font-bold text-snow">{t}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{d}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- solutions page */

const LAYERS = [
  ["Network", "Routers, switching, wireless, enlaces entre sedes"],
  ["Servers", "Cómputo, virtualización, clusters de borde"],
  ["Cloud", "AWS, Azure, Google Cloud, arquitectura híbrida"],
  ["Applications", "Contenedores, despliegue automatizado, software a medida"],
  ["Monitoring", "Métricas, dashboards, alertas y soporte continuo"],
];

export function SolutionsPage() {
  const { route } = useStore();
  const preset = route.query.get("b") ?? undefined;
  const sel = bundles.find((b) => b.slug === preset);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Soluciones" }]} />

      <header className="mt-8 grid gap-8 border-b border-white/[0.08] pb-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-steel"><span className="text-volt">Infraestructura</span> <span className="h-px w-10 bg-steel/40" /></div>
          <h1 className="mt-5 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[4rem]">
            Construye tu infraestructura
          </h1>
        </div>
        <p className="max-w-md text-[14.5px] leading-relaxed text-steel lg:col-span-5">
          Cada nivel resuelve un problema concreto. Empiezas donde lo necesitas y creces hacia arriba sin rehacer lo anterior.
        </p>
      </header>

      {/* layer diagram */}
      <div className="mt-12 border border-white/[0.08] bg-ink/40 p-5 md:p-8">
        <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70">Arquitectura por capas</div>
        <ol className="space-y-2">
          {LAYERS.map(([l, d], i) => (
            <Reveal as="li" key={l} delay={i * 90} className="group relative grid items-center gap-3 md:grid-cols-[150px_1fr]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-volt">L{i + 1}</span>
                <span className="text-[17px] font-extrabold uppercase tracking-tight text-snow">{l}</span>
              </div>
              <div className="relative h-11 border border-white/[0.08] bg-obsidian transition-colors duration-500 group-hover:border-tech/60">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-hn/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <span className="absolute inset-y-0 left-4 flex items-center text-[12.5px] text-steel">{d}</span>
                <span className="absolute inset-y-0 right-3 flex items-center font-mono text-[10px] text-steel/50">{String(i + 1).padStart(2, "0")}</span>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      <div className="mt-14 space-y-5">
        {bundles.map((b, i) => (
          <Reveal key={b.slug} delay={i * 60}>
            <div id={b.slug} className="scroll-mt-28">
              <BundleCard b={b} />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16">
        <SectionHead kicker="Configuración" title={sel ? `Configurar: ${sel.name}` : "Armemos tu solución"} note="Si no sabes en qué nivel estás, también funciona: el diagnóstico es el primer paso." />
        <div className="mt-8"><QuoteForm title="Configuración de solución" /></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- support page */

const FAQ = [
  ["¿Puedo comprar sin saber exactamente qué necesito?", "Sí. Es el caso más frecuente. Planteas el problema y el equipo técnico define la arquitectura y los componentes."],
  ["¿Los precios que veo son reales?", "El precio publicado es el que mantiene nuestro equipo en el catálogo. Los productos sin precio se cotizan a medida según configuración, disponibilidad y entrega."],
  ["¿Entregan fuera de Honduras?", "Sí, con coordinación previa y costos de importación definidos por escrito antes de despachar."],
  ["¿Qué pasa después de la compra?", "Los equipos incluyen garantía del fabricante y acompañamiento técnico de Infinihon para instalación y configuración."],
  ["¿Cómo se cotizan los servicios?", "Por alcance: número de sedes, equipos, complejidad y ventanas de trabajo. Siempre con propuesta escrita previa."],
];

export function SupportPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Soporte" }]} />

      <section className="relative mt-8 overflow-hidden border border-white/[0.08] bg-ink/40 px-6 py-14 md:px-12 md:py-20">
        <div className="absolute inset-0 bg-grid-fine opacity-50" />
        <div className="relative max-w-3xl">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Asesoría técnica</div>
          <RevealTitle as="h1" className="mt-6 text-[11vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] sm:text-6xl lg:text-[5rem]" lines={["No sabes qué", "necesitas?"]} />
          <Reveal delay={200} className="mt-7 max-w-xl text-[16.5px] leading-relaxed text-steel">
            Nuestro equipo puede ayudarte a encontrar la solución adecuada para tu infraestructura.
          </Reveal>
          <Reveal delay={300} className="mt-9"><PrimaryButton href="#cotizar">Hablar con Infinihon</PrimaryButton></Reveal>
          <div className="mt-12 grid gap-6 border-t border-white/[0.08] pt-8 sm:grid-cols-3">
            {[["Ingeniería", "Quien te atiende es quien implementa"], ["Transparencia", "Sin promesas que no podamos sostener"], ["Cobertura", "Territorio nacional y coordinación internacional"]].map(([t, d]) => (
              <div key={t}>
                <div className="text-[15px] font-bold text-snow">{t}</div>
                <div className="mt-1.5 text-[13px] leading-relaxed text-steel">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Preguntas frecuentes</h2>
          <ul className="mt-8">
            {FAQ.map(([q, a], i) => (
              <li key={q} className="border-b border-white/[0.08]">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left"
                >
                  <span className="flex gap-4">
                    <span className="font-mono text-[11px] text-steel/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[16px] font-bold text-snow">{q}</span>
                  </span>
                  <span className={cn("shrink-0 font-mono text-lg text-steel transition-transform duration-300", open === i && "rotate-45 text-volt")}>+</span>
                </button>
                <div className={cn("grid transition-all duration-500", open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <p className="overflow-hidden pl-9 pr-8 text-[14.5px] leading-relaxed text-steel">
                    <span className="block pb-6">{a}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Políticas</h2>
            <div className="mt-6 grid gap-px bg-white/[0.07] sm:grid-cols-2">
              {[
                ["Privacidad", "Tratamos los datos de contacto únicamente para responder solicitudes y procesar órdenes.", "/privacidad"],
                ["Términos", "Condiciones de venta, entregables y responsabilidades por escrito antes de cada proyecto.", "/terminos"],
                ["Envíos", "Cobertura nacional con coordinación de importación cuando el equipo no está en stock local.", "/envios"],
                ["Garantías", "Cobertura del fabricante gestionada por Infinihon, más soporte de instalación propio.", "/garantias"],
              ].map(([t, d, to]) => (
                <Link key={t} to={to} className="group bg-ink/40 p-6 transition-colors hover:bg-hn/15">
                  <h3 className="text-[15px] font-bold text-snow group-hover:text-volt">{t}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{d}</p>
                  <span className="mt-4 inline-block font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel/60 transition-colors group-hover:text-volt">Leer documento →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <QuoteForm title="Hablar con Infinihon" />
          <div className="mt-6 border border-white/[0.08] bg-obsidian/50 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Identidad</span>
              <span className="h-2 w-5 bg-hn" />
            </div>
            <HondurasMesh className="mt-4 w-full" />
            <p className="mt-4 text-[13.5px] leading-relaxed text-steel">
              Atención técnica desde Honduras, con estándares de ingeniería internacionales.
            </p>
            <Link to="/sitio" className="mt-4 inline-block font-mono text-[10.5px] uppercase tracking-[0.16em] text-volt hover:text-snow">Sitio corporativo →</Link>
          </div>
        </aside>
      </div>

      <button onClick={() => navigate("/catalogo")} className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">← Volver a la tienda</button>
    </div>
  );
}
