import { useEffect, useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { bundles, categories, categoryLabel, featured, insights, products, servicesFeatured, slugify } from "../../store/catalog";
import { CategoryIcon, HondurasMesh, ProductVisual } from "./ProductVisual";
import { BundleCard, ProductCard, SectionHead, SolutionCard } from "./cards";
import { Reveal, RevealTitle, PrimaryButton, GhostButton } from "../ui";
import { cn } from "../../utils/cn";

/* ------------------------------------------------------------- hero scene */

function HeroScene() {
  const units = [0, 1, 2, 3, 5, 6, 8, 9, 10, 11];
  return (
    <div className="relative aspect-square w-full max-w-[560px] [perspective:1200px]">
      {/* floor grid */}
      <div className="absolute inset-x-[-20%] bottom-[-10%] top-[30%] bg-grid [transform:rotateX(72deg)] opacity-70" />
      <div className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[90px]" />

      <svg viewBox="0 0 480 480" className="relative h-full w-full" role="img" aria-label="Composición abstracta de infraestructura: rack de servidores, nodos de red y capa cloud interconectados">
        <defs>
          <linearGradient id="hs-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* cloud layer */}
        <g opacity="0.85">
          <path d="M300 116h96a22 22 0 0 0 0-44 34 34 0 0 0-64-8 26 26 0 0 0-32 52z" fill="#0A0F14" stroke="#0066FF" strokeWidth="1.2" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={292 + i * 40} y={132} width="32" height="20" rx="2" fill="#0F141A" stroke="#39424E" strokeWidth="0.8" />
              <circle cx={300 + i * 40} cy={142} r="2" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.6}s` }} />
            </g>
          ))}
        </g>

        {/* rack cabinet */}
        <g>
          <rect x="150" y="150" width="120" height="230" rx="3" fill="#0A0F14" stroke="#39424E" strokeWidth="1.3" />
          <rect x="157" y="157" width="106" height="216" rx="2" fill="#070B10" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="157" y1={157 + i * 18} x2="263" y2={157 + i * 18} stroke="#1B222A" strokeWidth="0.6" />
          ))}
          {units.map((i) => (
            <g key={i}>
              <rect x="159" y={158 + i * 18} width="102" height="15.5" rx="1" fill="#151B22" stroke="#2E3944" strokeWidth="0.6" />
              {Array.from({ length: 10 }).map((_, k) => (
                <rect key={k} x={175 + k * 8} y={163 + i * 18} width="4" height="5" rx="2" fill="#05070A" />
              ))}
              <circle cx="167" cy={166 + i * 18} r="2" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.35}s` }} />
            </g>
          ))}
          <rect x="159" y={158 + 5 * 18} width="102" height="33" fill="url(#hs-plate)" />
        </g>

        {/* connections */}
        {[[196, 380, 96, 424], [224, 380, 300, 424], [266, 300, 356, 168], [150, 230, 78, 150]].map(([x1, y1, x2, y2], i) => (
          <path key={i} id={`hs-l${i}`} d={`M${x1},${y1} C${x1},${y1 + 40} ${x2},${y2 - 40} ${x2},${y2}`} fill="none" stroke="#0066FF" strokeWidth="1" opacity="0.55" className="flow-line" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle key={`p${i}`} r="2.4" fill="#F5F7FA">
            <animateMotion dur={`${6 + i * 1.4}s`} begin={`${i * 0.9}s`} repeatCount="indefinite"><mpath href={`#hs-l${i}`} /></animateMotion>
          </circle>
        ))}

        {/* satellite nodes */}
        {[[96, 424, "SWITCH"], [300, 424, "FIREWALL"], [356, 168, "CLOUD"], [78, 150, "REMOTE"]].map(([x, y, l], i) => (
          <g key={l as string}>
            <rect x={(x as number) - 38} y={(y as number) - 15} width="76" height="30" rx="2" fill="#0F141A" stroke="#39424E" strokeWidth="0.9" />
            <rect x={(x as number) - 38} y={(y as number) - 15} width="3" height="30" fill="#0066FF" />
            <text x={(x as number) - 28} y={(y as number) + 4} fontFamily="JetBrains Mono" fontSize="8" fill="#8B96A5" letterSpacing="1">{l as string}</text>
            <circle cx={(x as number) + 30} cy={(y as number) - 7} r="1.8" fill="#00A8FF" className="pulse-soft" style={{ animationDelay: `${i * 0.5}s` }} />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function StoreHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-grid opacity-50 mask-radial" />
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-4 pb-20 pt-14 md:px-8 lg:grid-cols-2 lg:gap-8 lg:pb-28 lg:pt-20">
        <div>
          <Reveal className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-steel">
            <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
            Infinihon Store <span className="text-steel/40">/</span> Tienda oficial
          </Reveal>
          <RevealTitle
            as="h1"
            className="mt-8 text-[12.5vw] font-extrabold uppercase leading-[0.88] tracking-[-0.05em] sm:text-[8vw] lg:text-[5.4rem]"
            lines={["Tecnología para", "construir", "lo que sigue."]}
          />
          <Reveal delay={250} className="mt-8 max-w-md text-[16px] leading-relaxed text-steel">
            Explora hardware, soluciones y servicios diseñados para llevar tu infraestructura al siguiente nivel.
          </Reveal>
          <Reveal delay={380} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="#/catalogo">Explorar tienda</PrimaryButton>
            <GhostButton href="#/soluciones">Ver soluciones</GhostButton>
          </Reveal>
          <Reveal delay={500} className="mt-12 grid max-w-md grid-cols-3 border-y border-white/[0.08]">
            {[["8", "categorías"], ["14", "productos"], ["8", "servicios"]].map(([a, b], i) => (
              <div key={b} className={cn("py-4", i && "border-l border-white/[0.08] pl-4")}>
                <div className="text-2xl font-extrabold tracking-tight text-snow">{a}</div>
                <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel">{b}</div>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={200} className="mx-auto max-w-[440px] justify-self-center lg:max-w-[560px]">
          <HeroScene />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- categories */

export function CategoryGrid() {
  return (
    <section className="relative border-b border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHead kicker="01" title="Explora el ecosistema Infinihon" note="Ocho áreas que cubren todo el recorrido: desde el puerto de red hasta el despliegue en la nube." />
        <div className="mt-12 grid grid-cols-2 gap-px bg-white/[0.07] md:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 45}>
              <Link
                to={`/catalogo?cat=${c.id}`}
                className="group relative flex h-full flex-col justify-between bg-obsidian p-6 transition-colors duration-500 hover:bg-hn/35 md:p-7"
              >
                <span className="absolute inset-x-0 top-0 h-px w-0 bg-volt transition-all duration-500 group-hover:w-full" />
                <CategoryIcon id={c.id} className="h-8 w-8 text-steel transition-colors duration-500 group-hover:text-volt" />
                <div className="mt-10">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel/60">{String(i + 1).padStart(2, "0")} · {c.count} items</div>
                  <h3 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-snow md:text-2xl">{c.label}</h3>
                  <p className="mt-1 text-[13px] text-steel">{c.desc}</p>
                  <span className="mt-4 inline-block font-mono text-[11px] text-steel opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">→</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- featured */

export function FeaturedProducts() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative border-b border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHead kicker="02" title="Destacados" note="Selección del equipo técnico. Cada referencia se entrega configurada y documentada." to="/catalogo" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeletonish key={i} />)
            : featured.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}><ProductCard p={p} /></Reveal>
            ))}
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60">
          Precios y disponibilidad sincronizados del catálogo
        </p>
      </div>
    </section>
  );
}

function Skeletonish() {
  return (
    <div className="border border-white/[0.06] bg-ink" aria-hidden>
      <div className="relative aspect-[4/3] border-b border-white/[0.06] bg-obsidian">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-2.5 w-20 animate-pulse bg-white/[0.06]" />
        <div className="h-4 w-3/4 animate-pulse bg-white/[0.08]" />
        <div className="h-3 w-full animate-pulse bg-white/[0.05]" />
        <div className="mt-6 h-10 w-full animate-pulse bg-white/[0.04]" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- solutions mix */

export function SolutionsSection() {
  return (
    <section className="relative border-b border-white/[0.06] bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHead kicker="03" title="Soluciones Infinihon" note="Servicios profesionales que se cotizan según alcance. No todo lo que necesitas cabe en un carrito." to="/servicios" />
        <div className="mt-12 grid gap-px bg-white/[0.07] md:grid-cols-2">
          {servicesFeatured.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60} className="bg-ink"><SolutionCard s={s} i={i} /></Reveal>
          ))}
        </div>
        <Reveal delay={200} className="mt-10 flex flex-col items-start gap-4 border border-white/[0.07] bg-obsidian/60 p-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-[14.5px] leading-relaxed text-steel">
            Los servicios se cotizan por alcance: número de sedes, equipos, complejidad y ventanas de trabajo. Recibes una propuesta
            escrita antes de empezar.
          </p>
          <Link to="/servicios" className="shrink-0 border-b border-tech pb-1 text-[13px] font-semibold hover:text-volt">Ver los 8 servicios →</Link>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- bundles */

export function BundlesSection() {
  return (
    <section id="infraestructura" className="relative overflow-hidden border-b border-white/[0.06] py-20 md:py-28">
      <div className="absolute inset-0 bg-grid opacity-40 mask-radial" />
      <div className="relative mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHead kicker="04" title="Construye tu infraestructura" note="Seis niveles de solución, desde el primer rack hasta una operación multi-sede." to="/soluciones" />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {bundles.map((b, i) => (
            <Reveal key={b.slug} delay={i * 60}><BundleCard b={b} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- support */

export function SupportSection() {
  return (
    <section className="relative border-b border-white/[0.06] bg-[#030507] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="relative overflow-hidden border border-white/[0.08] bg-ink/40 px-6 py-14 text-center md:px-16 md:py-20">
          <div className="absolute inset-0 bg-grid-fine opacity-50" />
          <div className="relative">
            <Reveal className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Asesoría técnica</Reveal>
            <RevealTitle as="h2" className="mx-auto mt-6 max-w-3xl text-[9vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-5xl lg:text-[4.2rem]" lines={["No sabes qué", "necesitas?"]} />
            <Reveal delay={250} className="mx-auto mt-7 max-w-xl text-[16px] leading-relaxed text-steel">
              Nuestro equipo puede ayudarte a encontrar la solución adecuada para tu infraestructura.
            </Reveal>
            <Reveal delay={350} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton href="#/soporte">Hablar con Infinihon</PrimaryButton>
              <GhostButton href="#/catalogo">Explorar productos</GhostButton>
            </Reveal>
            <Reveal delay={450} className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/70">
              <span>Diagnóstico inicial sin costo</span>
              <span>Propuesta escrita</span>
              <span>Sin compromiso</span>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- trust */

export function TrustSection() {
  const items = [
    { t: "Garantía", d: "Todos los equipos incluyen garantía del fabricante; gestionamos el proceso por ti." },
    { t: "Soporte", d: "Acompañamiento técnico después de la compra, por los canales acordados." },
    { t: "Envíos", d: "Entrega en territorio hondureño y coordinación de importación cuando aplica." },
    { t: "Políticas", d: "Condiciones de devolución, garantía y soporte disponibles antes de comprar." },
    { t: "Atención técnica", d: "Quien te atiende es quien implementa: ingeniería, no un call center." },
  ];
  return (
    <section className="relative border-b border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHead kicker="05" title="Tecnología con el respaldo de Infinihon" note="Mostramos solo lo que podemos sostener. Nada de cifras inventadas ni sellos que no poseemos." />
        <div className="mt-12 grid gap-px bg-white/[0.07] md:grid-cols-3 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 60} className="group bg-obsidian p-6 transition-colors duration-500 hover:bg-hn/30">
              <span className="font-mono text-[10px] text-volt">/{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-bold text-snow">{it.t}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-steel">{it.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- honduras */

export function HondurasStore() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-ink py-20 md:py-28">
      <div className="absolute right-0 top-1/2 h-[50vmin] w-[50vmin] -translate-y-1/2 rounded-full bg-hn/30 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-4 md:grid-cols-2 md:px-8">
        <div>
          <Reveal className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-steel">Identidad</Reveal>
          <RevealTitle as="h2" className="mt-6 text-[9.5vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-5xl lg:text-[4rem]" lines={["Tecnología construida", "desde Honduras."]} accentLast />
          <Reveal delay={200} className="mt-7 max-w-md text-[15px] leading-relaxed text-steel">
            Enviamos y damos soporte en territorio nacional, con la misma seriedad técnica que se espera de un proveedor internacional.
          </Reveal>
          <Reveal delay={300} className="mt-8 flex items-center gap-4 border-t border-white/[0.08] pt-6">
            <span className="h-2 w-5 bg-hn" />
            <span className="text-lg font-bold text-snow">Hecho en Honduras.</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">→ hacia el mundo</span>
          </Reveal>
        </div>
        <Reveal delay={150} className="flex flex-col items-center">
          <HondurasMesh className="w-full max-w-md" />
          <div className="mt-4 flex w-full max-w-md justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-steel/50">
            <span>HN · mesh abstracto</span><span>Cobertura nacional</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- tech insights */

export function TechInsights() {
  return (
    <section className="relative border-b border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHead kicker="06" title="Infinihon Tech" note="Guías y comparativas escritas por el equipo que implementa. Contenido en construcción." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {insights.map((n, i) => {
            const slug = slugify(n.t);
            return (
              <Reveal key={n.t} delay={i * 70}>
                <Link to={`/insights/${slug}`} className="group flex h-full flex-col border border-white/[0.07] bg-ink/50 p-6 transition-colors duration-500 hover:border-tech/70">
                  <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel">
                    <span className="text-volt">{n.c}</span><span>{n.r}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-snug text-snow transition-colors group-hover:text-volt">{n.t}</h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-steel">{n.d}</p>
                  <span className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60 transition-colors group-hover:text-volt">Leer artículo →</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- carousel */

export function AlsoViewed() {
  return (
    <section className="border-b border-white/[0.06] py-16 md:py-20">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Explora el catálogo</h2>
          <button onClick={() => navigate("/catalogo")} className="border-b border-tech pb-1 text-[13px] font-semibold hover:text-volt">Ver todo →</button>
        </div>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {products.slice(0, 8).map((p) => (
            <Link key={p.slug} to={`/producto/${p.slug}`} className="group w-[220px] shrink-0 border border-white/[0.07] bg-ink transition-colors hover:border-tech/70">
              <ProductVisual visual={p.visual} uid={`r-${p.slug}`} className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" />
              <div className="p-4">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel">{categoryLabel(p.category)}</div>
                <div className="mt-1.5 text-[14px] font-bold leading-snug text-snow group-hover:text-volt">{p.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function useQuoteIntent() {
  const { notify } = useStore();
  return (label: string) => notify("Solicitud registrada", `${label} — te contactaremos para definir alcance.`, "info");
}
