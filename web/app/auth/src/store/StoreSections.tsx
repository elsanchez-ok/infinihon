import { useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { Reveal, SectionLabel } from "../components/ui";
import type { CatalogProduct, ProductCategory } from "./data";
import { bundles, categories, products, services } from "./data";
import { HeroStoreVisual, ProductVisual, StoreMark, TechIcon } from "./StoreVisuals";

export function StoreHero() {
  return <section id="top" className="relative isolate min-h-[780px] overflow-hidden border-b border-white/[0.06] bg-obsidian pt-[70px] md:min-h-[820px]">
    <div className="absolute inset-0 -z-20 bg-grid opacity-70" />
    <div className="absolute right-[-12%] top-[10%] -z-10 h-[80vmin] w-[80vmin] rounded-full bg-hn/35 blur-[150px]" />
    <div className="absolute bottom-[-15%] right-[-10%] -z-10 h-[70%] w-[75%] opacity-90 sm:right-0 lg:bottom-0 lg:w-[68%]"><HeroStoreVisual /></div>
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian via-obsidian/85 to-transparent lg:via-obsidian/45" />
    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
    <div className="relative mx-auto flex min-h-[710px] max-w-[1520px] flex-col justify-center px-5 pb-24 pt-20 md:min-h-[750px] md:px-8 xl:px-12">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-steel"><span className="h-2 w-2 bg-volt pulse-soft" /><span className="font-semibold text-snow">INFINIHON</span><span className="text-steel/40">/</span> Marketplace tecnológico</div>
        <h1 className="mt-8 max-w-4xl text-[13vw] font-extrabold uppercase leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[6.8rem] xl:text-[8rem]">Tecnología<br />para construir<br /><span className="bg-gradient-to-r from-tech via-volt to-snow bg-clip-text text-transparent">lo que sigue.</span></h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-steel md:text-lg">Explora hardware, soluciones y servicios diseñados para llevar tu infraestructura al siguiente nivel.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#tienda" className="group inline-flex items-center justify-center gap-3 bg-tech px-6 py-4 text-sm font-semibold transition-colors hover:bg-[#1a75ff]">Explorar tienda <span className="transition-transform group-hover:translate-x-1">→</span></a><a href="#soluciones" className="inline-flex items-center justify-center gap-3 border border-white/15 px-6 py-4 text-sm font-semibold transition-colors hover:border-volt hover:bg-white/[0.03]">Ver soluciones <span className="text-steel">→</span></a></div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-steel/60 md:bottom-8 md:left-8 md:right-8 xl:left-12 xl:right-12"><span>Hardware · Software · Infrastructure · Services</span><span className="hidden sm:inline">Catálogo de demostración · datos comerciales por conectar</span><span className="sm:hidden">↓ scroll</span></div>
    </div>
  </section>;
}

export function CategoryGrid({ onCategory }: { onCategory: (category: ProductCategory) => void }) {
  return <section className="border-b border-white/[0.06] bg-ink py-24 md:py-32"><div className="mx-auto max-w-[1520px] px-5 md:px-8 xl:px-12"><Reveal><SectionLabel index="01">Explorar</SectionLabel></Reveal><div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><Reveal><h2 className="max-w-4xl text-[10vw] font-extrabold uppercase leading-[.91] tracking-[-.045em] sm:text-6xl lg:text-[4.8rem]">Explora el ecosistema<br /><span className="text-steel">INFINIHON.</span></h2></Reveal><Reveal delay={150} className="max-w-sm text-[15px] leading-relaxed text-steel">Productos, plataformas y servicios pensados para conectarse entre sí — no como piezas aisladas.</Reveal></div><div className="mt-16 grid border-l border-t border-white/[0.08] sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">{categories.map((cat, i) => <Reveal key={cat.id} delay={i*50} className="group"><button onClick={() => onCategory(cat.id)} className="relative flex min-h-52 w-full flex-col border-b border-r border-white/[0.08] p-6 text-left transition-colors duration-500 hover:bg-hn/25 md:min-h-60"><span className="absolute right-5 top-5 font-mono text-[10px] text-steel/50">0{i+1}</span><span className="text-steel transition-colors duration-500 group-hover:text-volt"><TechIcon name={cat.icon} className="h-8 w-8" /></span><span className="mt-auto text-2xl font-extrabold uppercase tracking-tight text-snow">{cat.id}</span><span className="mt-2 max-w-[210px] text-[13px] leading-relaxed text-steel">{cat.description}</span><span className="absolute bottom-6 right-6 text-lg text-steel opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-volt group-hover:opacity-100">→</span></button></Reveal>)}</div></div></section>;
}

export function ProductCard({ product, onOpen, onAdd, compared, onCompare }: { product: CatalogProduct; onOpen: (p: CatalogProduct) => void; onAdd: (p: CatalogProduct, origin?: HTMLElement) => void; compared: boolean; onCompare: (p: CatalogProduct) => void }) {
  return <article className="group relative flex h-full flex-col border border-white/[0.08] bg-ink transition-all duration-500 hover:-translate-y-1 hover:border-tech/70 hover:shadow-[0_20px_55px_-30px_rgba(0,102,255,0.7)]">
    <button onClick={() => onOpen(product)} className="relative block aspect-[1.25/1] overflow-hidden border-b border-white/[0.08] bg-[#080e15] text-left"><ProductVisual kind={product.visual} className="transition-transform duration-700 group-hover:scale-[1.055]" /><span className="absolute left-4 top-4 border border-volt/40 bg-obsidian/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-volt">{product.badge || "Referencia"}</span><span className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-[0.16em] text-steel/70">Ver detalle →</span></button>
    <div className="flex flex-1 flex-col p-5"><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{product.category}</div><h3 className="mt-2 text-2xl font-extrabold tracking-tight text-snow">{product.name}</h3><p className="mt-3 text-sm leading-relaxed text-steel">{product.description}</p><div className="mt-5 flex flex-wrap gap-1.5">{product.technologies.map((x) => <span key={x} className="border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-steel">{x}</span>)}</div><div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.08] pt-5"><div><div className="font-mono text-[9px] uppercase tracking-[0.16em] text-steel">Precio</div><div className="mt-1 text-sm font-bold text-snow">Bajo cotización</div></div><div className="text-right"><div className="font-mono text-[9px] uppercase tracking-[0.16em] text-steel">Estado</div><div className="mt-1 text-xs font-semibold text-snow"><span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", product.status === "Próximamente" ? "bg-steel" : "bg-volt")} />{product.status}</div></div></div><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><button onClick={(e) => onAdd(product, e.currentTarget)} className="inline-flex items-center justify-center gap-2 bg-tech py-3 text-sm font-semibold transition-colors hover:bg-[#1a75ff]"><TechIcon name="cart" className="h-4 w-4" />Añadir</button><button onClick={() => onCompare(product)} className={cn("border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors", compared ? "border-volt bg-hn/40 text-snow" : "border-white/12 text-steel hover:border-volt hover:text-snow")} aria-pressed={compared}>{compared ? "En comparación" : "Comparar"}</button></div></div>
  </article>;
}

export function FeaturedProducts({ onOpen, onAdd, compared, onCompare, selectedCategory, onSelectCategory }: { onOpen: (p: CatalogProduct) => void; onAdd: (p: CatalogProduct, origin?: HTMLElement) => void; compared: CatalogProduct[]; onCompare: (p: CatalogProduct) => void; selectedCategory: ProductCategory | "Todo"; onSelectCategory: (category: ProductCategory | "Todo") => void }) {
  return <section id="tienda" className="scroll-mt-20 border-b border-white/[0.06] bg-obsidian py-24 md:py-32"><div className="mx-auto max-w-[1520px] px-5 md:px-8 xl:px-12"><Reveal><SectionLabel index="02">Catálogo</SectionLabel></Reveal><div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><Reveal><h2 className="text-[11vw] font-extrabold uppercase leading-[.91] tracking-[-.045em] sm:text-6xl lg:text-[5rem]">Destacados<br /><span className="text-steel">de referencia.</span></h2></Reveal><Reveal delay={150} className="max-w-md text-[15px] leading-relaxed text-steel">Esta muestra no es un inventario comercial. Cada referencia requiere validación de modelo, compatibilidad, stock y precio antes de compra.</Reveal></div><Catalog onOpen={onOpen} onAdd={onAdd} compared={compared} onCompare={onCompare} selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} /></div></section>;
}

function Catalog({ onOpen, onAdd, compared, onCompare, selectedCategory, onSelectCategory }: { onOpen: (p: CatalogProduct) => void; onAdd: (p: CatalogProduct, origin?: HTMLElement) => void; compared: CatalogProduct[]; onCompare: (p: CatalogProduct) => void; selectedCategory: ProductCategory | "Todo"; onSelectCategory: (category: ProductCategory | "Todo") => void }) {
  const [tech, setTech] = useState("Todas");
  const [filters, setFilters] = useState(false);
  const [availability, setAvailability] = useState("Todas");
  const [useFilter, setUseFilter] = useState("Todos");
  const techs = ["Todas", ...Array.from(new Set(products.flatMap((p) => p.technologies)))];
  const uses = ["Todos", "Conectividad", "Cómputo", "Datos", "Seguridad", "Cloud", "Monitorización"];
  const shown = useMemo(() => products.filter((p) => {
    const content = `${p.use} ${p.description}`.toLowerCase();
    return (selectedCategory === "Todo" || p.category === selectedCategory) &&
      (tech === "Todas" || p.technologies.includes(tech)) &&
      (availability === "Todas" || p.status === availability) &&
      (useFilter === "Todos" || content.includes(useFilter.toLowerCase()));
  }), [selectedCategory, tech, availability, useFilter]);
  const setCat = (c: ProductCategory | "Todo") => { onSelectCategory(c); window.setTimeout(() => document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30); };
  const filterButton = (active: boolean) => cn("border px-3 py-2 text-xs transition-colors", active ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow");
  const setAll = () => { onSelectCategory("Todo"); setTech("Todas"); setAvailability("Todas"); setUseFilter("Todos"); };
  return (
    <div className="mt-16 md:mt-20">
      <div className="flex flex-wrap items-center gap-2 border-y border-white/[0.08] py-3">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">Filtrar</span>
        <button onClick={() => setFilters(!filters)} className="inline-flex items-center gap-2 border border-white/12 px-3 py-2 text-xs font-semibold text-snow md:hidden"><TechIcon name="filter" className="h-4 w-4" />{filters ? "Cerrar" : "Filtrar"}</button>
        <div className={cn("w-full flex-wrap gap-2 md:flex md:w-auto", filters ? "flex" : "hidden")}>
          <span className="self-center font-mono text-[9px] uppercase tracking-[0.15em] text-steel/60">Categoría</span>
          <button onClick={() => setCat("Todo")} className={filterButton(selectedCategory === "Todo")}>Todo</button>
          {categories.map((x) => <button key={x.id} onClick={() => setCat(x.id)} className={filterButton(selectedCategory === x.id)}>{x.id}</button>)}
        </div>
        <div className={cn("ml-auto flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto", filters ? "flex" : "hidden md:flex")}>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-steel/60">Tecnología</span>
          {techs.slice(0, 5).map((x) => <button key={x} onClick={() => setTech(x)} className={cn("font-mono text-[10px] uppercase tracking-[0.1em] transition-colors", tech === x ? "text-volt" : "text-steel hover:text-snow")}>{x}</button>)}
        </div>
      </div>
      <div className={cn("mt-3 flex flex-wrap items-center gap-2", filters ? "flex" : "hidden md:flex")}>
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-steel/60">Disponibilidad</span>
        {["Todas", "Por confirmar", "Próximamente"].map((x) => <button key={x} onClick={() => setAvailability(x)} className={filterButton(availability === x)}>{x}</button>)}
        <span className="ml-0 font-mono text-[9px] uppercase tracking-[0.15em] text-steel/60 sm:ml-3">Uso</span>
        {uses.map((x) => <button key={x} onClick={() => setUseFilter(x)} className={filterButton(useFilter === x)}>{x}</button>)}
        <span className="ml-0 border border-dashed border-white/10 px-3 py-2 text-xs text-steel/60 sm:ml-3" title="No hay precios conectados al catálogo todavía">Precio: al cotizar</span>
        <span className="border border-dashed border-white/10 px-3 py-2 text-xs text-steel/60" title="Las marcas se publicarán con el catálogo real">Marca: por confirmar</span>
      </div>
      <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-steel"><span>{shown.length} referencias visibles</span><span>Filtros compactos · sin sidebar</span></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{shown.map((p) => <ProductCard key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} compared={compared.some((x) => x.id === p.id)} onCompare={onCompare} />)}</div>
      {!shown.length && <div className="mt-8 border border-dashed border-white/15 py-16 text-center"><div className="font-mono text-xs uppercase tracking-[0.2em] text-steel">No hay referencias con esos filtros</div><p className="mt-3 text-sm text-steel">Las marcas, precios y existencias se conectarán al catálogo comercial.</p><button onClick={setAll} className="mt-4 text-sm font-semibold text-volt">Limpiar filtros →</button></div>}
    </div>
  );
}

export function Solutions({ onContact }: { onContact: () => void }) {
  return <section id="soluciones" className="border-b border-white/[0.06] bg-ink py-24 md:py-32"><div className="mx-auto max-w-[1520px] px-5 md:px-8 xl:px-12"><div className="grid gap-10 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><Reveal><SectionLabel index="03">Servicios como soluciones</SectionLabel></Reveal><Reveal><h2 className="mt-8 text-[10vw] font-extrabold uppercase leading-[.91] tracking-[-.045em] sm:text-6xl lg:text-[5rem]">Soluciones<br /><span className="text-steel">INFINIHON.</span></h2></Reveal></div><Reveal delay={150} className="lg:col-span-4 text-[15px] leading-relaxed text-steel">No todo se compra en una caja. Algunas necesidades empiezan con una conversación técnica, un diagnóstico y una cotización clara.</Reveal></div><div className="mt-16 border-t border-white/[0.08] md:mt-24">{services.map((s, i) => <Reveal key={s.id} delay={i*45}><article className="group grid gap-5 border-b border-white/[0.08] py-7 transition-colors hover:bg-hn/15 md:grid-cols-[90px_1.2fr_1fr_auto] md:items-center md:px-5"><div className="font-mono text-2xl text-tech">{s.number}</div><div><h3 className="text-2xl font-extrabold tracking-tight text-snow">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-steel">{s.short}</p></div><div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.13em] text-steel">{s.tags.map((t, k) => <span key={t}>{k ? <span className="mr-3 text-white/20">/</span> : null}{t}</span>)}</div><button onClick={onContact} className="justify-self-start border border-white/12 px-4 py-3 text-sm font-semibold text-snow transition-colors hover:border-volt hover:text-volt md:justify-self-end">Solicitar cotización</button></article></Reveal>)}</div></div></section>;
}

export function InfrastructureBundles({ onContact }: { onContact: () => void }) {
  return <section id="bundles" className="relative overflow-hidden border-b border-white/[0.06] bg-obsidian py-24 md:py-32"><div className="absolute inset-0 bg-grid-fine opacity-40 mask-radial" /><div className="relative mx-auto max-w-[1520px] px-5 md:px-8 xl:px-12"><Reveal><SectionLabel index="04">Configuración por capas</SectionLabel></Reveal><div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><Reveal><h2 className="text-[10vw] font-extrabold uppercase leading-[.91] tracking-[-.045em] sm:text-6xl lg:text-[5rem]">Construye tu<br /><span className="text-steel">infraestructura.</span></h2></Reveal><Reveal delay={150} className="max-w-md text-[15px] leading-relaxed text-steel">Puntos de partida para conversar. Se adaptan al contexto, operación y tecnologías existentes de cada equipo.</Reveal></div><div className="mt-16 grid gap-0 border-l border-t border-white/[0.08] md:mt-24 md:grid-cols-2 lg:grid-cols-3">{bundles.map((b, i) => <Reveal key={b.id} delay={i*60}><article className="group relative min-h-[330px] border-b border-r border-white/[0.08] bg-obsidian p-6 transition-colors hover:bg-hn/25"><div className="flex items-start justify-between"><span className="font-mono text-xs text-tech">{b.n}</span><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">Configuración</span></div><h3 className="mt-10 text-3xl font-extrabold uppercase leading-[.95] tracking-tight text-snow">{b.title}</h3><p className="mt-4 text-sm leading-relaxed text-steel">{b.solves}</p><div className="mt-6 border-t border-white/[0.08] pt-4"><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel/70">Puede incluir</div><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-snow/80">{b.includes.map((x, k) => <span key={x}>{k ? <span className="mr-3 text-tech">·</span> : null}{x}</span>)}</div></div><div className="mt-6 text-[13px] leading-relaxed text-steel"><span className="font-semibold text-snow">Para:</span> {b.for}</div><button onClick={onContact} className="absolute bottom-6 right-6 inline-flex items-center gap-2 text-sm font-semibold text-snow transition-colors hover:text-volt">Configurar <span>→</span></button></article></Reveal>)}</div></div></section>;
}

export function Support({ onContact }: { onContact: () => void }) {
  return <section id="soporte" className="border-b border-white/[0.06] bg-ink py-24 md:py-32"><div className="mx-auto grid max-w-[1520px] gap-12 px-5 md:px-8 lg:grid-cols-12 xl:px-12"><div className="lg:col-span-7"><Reveal><SectionLabel index="05">Acompañamiento técnico</SectionLabel></Reveal><Reveal><h2 className="mt-8 text-[11vw] font-extrabold uppercase leading-[.9] tracking-[-.05em] sm:text-6xl lg:text-[5.5rem]">¿No sabes<br />qué necesitas?</h2></Reveal><Reveal delay={150}><p className="mt-8 max-w-xl text-lg leading-relaxed text-steel">Nuestro equipo puede ayudarte a encontrar la solución adecuada para tu infraestructura. Empezamos por entender qué debe funcionar, no por recomendar una caja.</p><button onClick={onContact} className="mt-9 inline-flex items-center gap-3 bg-tech px-6 py-4 text-sm font-semibold transition-colors hover:bg-[#1a75ff]">Hablar con INFINIHON <span>→</span></button></Reveal></div><Reveal delay={150} className="lg:col-span-4 lg:col-start-9"><div className="border-y border-white/[0.08]">{[["01", "Contexto", "Qué haces hoy y qué no está funcionando."], ["02", "Arquitectura", "Qué capas, integraciones y restricciones existen."], ["03", "Ruta", "Qué comprar, construir o implementar primero."]].map(([n,t,d]) => <div key={n} className="grid grid-cols-[45px_1fr] gap-4 border-b border-white/[0.08] py-7 last:border-b-0"><div className="font-mono text-xs text-volt">{n}</div><div><div className="text-xl font-bold">{t}</div><div className="mt-2 text-sm leading-relaxed text-steel">{d}</div></div></div>)}</div><p className="mt-5 font-mono text-[10px] uppercase leading-5 tracking-[0.16em] text-steel/60">Solicitud abierta: el canal final debe conectarse a CRM, correo o soporte operativo.</p></Reveal></div></section>;
}

function HondurasMesh() {
  const pts = [[67,130],[105,80],[175,65],[235,40],[310,54],[370,44],[435,66],[486,91],[520,125],[485,150],[430,170],[380,160],[340,191],[300,210],[260,260],[210,280],[180,250],[145,260],[120,225],[80,210],[52,180],[67,130]];
  const nodes = [[170,120],[235,114],[310,105],[375,115],[265,155],[210,180],[340,160],[160,215],[310,205],[410,130],[125,160],[360,82],[250,220]];
  return <svg viewBox="0 0 570 320" className="h-auto w-full" aria-label="Mapa abstracto de Honduras formado por nodos de infraestructura"><path d={pts.map((p,i)=>`${i?"L":"M"}${p[0]} ${p[1]}`).join(" ")+"Z"} fill="#003B73" fillOpacity=".18" stroke="#0066FF" strokeOpacity=".6" strokeDasharray="4 6" />{nodes.map((n,i)=>nodes.slice(i+1).filter((_,j)=>(i+j)%4===0).map((x,j)=><line key={`${i}-${j}`} x1={n[0]} y1={n[1]} x2={x[0]} y2={x[1]} stroke="#0066FF" strokeOpacity=".35" />))}{nodes.map((n,i)=><g key={i}><circle cx={n[0]} cy={n[1]} r={i===4?6:3.5} fill={i===4?"#F5F7FA":"#00A8FF"}/>{i===4&&<circle cx={n[0]} cy={n[1]} r="18" fill="none" stroke="#00A8FF" className="ring"/>}</g>)}<text x="275" y="180" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#F5F7FA" letterSpacing="2">TGU / HUB</text></svg>;
}

export function HondurasAndTrust() {
  const trust = [
    ["Cotización clara", "El precio y la disponibilidad se confirman antes de comprar."],
    ["Atención técnica", "Puedes consultar compatibilidad y alcance antes de solicitar."],
    ["Envíos", "Las condiciones de entrega se coordinan con la cotización."],
    ["Garantías", "Se validan por producto y proveedor antes de cualquier pago."],
    ["Políticas", "Se publicarán con la operación comercial; no simulamos términos."],
  ];
  return (
    <section id="infraestructura" className="border-b border-white/[0.06] bg-obsidian py-24 md:py-32">
      <div className="mx-auto max-w-[1520px] px-5 md:px-8 xl:px-12">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Reveal><SectionLabel index="06">Origen</SectionLabel></Reveal>
            <Reveal><h2 className="mt-8 text-[10vw] font-extrabold uppercase leading-[.91] tracking-[-.045em] sm:text-6xl lg:text-[4.4rem]">Tecnología<br />construida desde<br /><span className="text-steel">Honduras.</span></h2></Reveal>
            <Reveal delay={150}><p className="mt-7 max-w-md text-[15px] leading-relaxed text-steel">Desde Honduras hacia el mundo. Entendemos el terreno local y diseñamos con prácticas que escalan más allá de cualquier ubicación.</p><div className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-steel"><span className="text-tech">14.0818° N · 87.2068° W</span> / Hecho en Honduras</div></Reveal>
          </div>
          <Reveal delay={150} className="lg:col-span-6 lg:col-start-7"><HondurasMesh /><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-steel/50">HN / abstract infrastructure mesh · not a navigation map</p></Reveal>
        </div>
        <div className="mt-24 border-t border-white/[0.08] pt-12 md:mt-32">
          <Reveal><SectionLabel index="07">Transparencia</SectionLabel></Reveal>
          <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <Reveal><h2 className="text-[9vw] font-extrabold uppercase leading-[.92] tracking-[-.045em] sm:text-5xl lg:text-[4.3rem]">Tecnología con el respaldo<br /><span className="text-steel">de INFINIHON.</span></h2></Reveal>
            <Reveal delay={150} className="max-w-sm text-[15px] leading-relaxed text-steel">La confianza no se rellena con sellos inventados. Esta tienda muestra qué está listo hoy y qué debe confirmarse antes de operar comercialmente.</Reveal>
          </div>
          <div className="mt-14 grid border-l border-t border-white/[0.08] md:grid-cols-5">
            {trust.map(([title, description], i) => (
              <Reveal key={title} delay={i * 50} className="group">
                <div className="min-h-52 border-b border-r border-white/[0.08] p-5 transition-colors hover:bg-hn/20">
                  <div className="font-mono text-[10px] text-tech">0{i + 1}</div>
                  <h3 className="mt-7 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-steel">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Insights() {
  const articles = [["01", "Guía en preparación", "Cómo pensar una red que acompaña el crecimiento."], ["02", "Guía en preparación", "Del servidor local a una arquitectura híbrida."], ["03", "Guía en preparación", "Qué monitorizar primero en una operación pequeña."]];
  return <section className="border-b border-white/[0.06] bg-ink py-24 md:py-32"><div className="mx-auto max-w-[1520px] px-5 md:px-8 xl:px-12"><Reveal><SectionLabel index="08">INFINIHON / TECH</SectionLabel></Reveal><div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><Reveal><h2 className="text-[10vw] font-extrabold uppercase leading-[.91] tracking-[-.045em] sm:text-6xl lg:text-[4.8rem]">La infraestructura<br /><span className="text-steel">también se explica.</span></h2></Reveal><Reveal delay={150} className="max-w-sm text-[15px] leading-relaxed text-steel">Biblioteca técnica editorial en preparación. Será un espacio para guías, comparativas y decisiones de infraestructura sin lenguaje opaco.</Reveal></div><div className="mt-16 grid border-l border-t border-white/[0.08] md:grid-cols-3">{articles.map(([n,k,t],i)=><Reveal key={n} delay={i*80}><article className="group min-h-72 border-b border-r border-white/[0.08] p-6 transition-colors hover:bg-obsidian"><div className="font-mono text-xs text-tech">{n}</div><div className="mt-12 font-mono text-[10px] uppercase tracking-[0.19em] text-steel">{k}</div><h3 className="mt-4 max-w-sm text-2xl font-extrabold leading-tight">{t}</h3><span className="mt-10 inline-block text-sm font-semibold text-steel transition-colors group-hover:text-volt">Próximamente →</span></article></Reveal>)}</div></div></section>;
}

export function StoreFooter() {
  const groups: { name: string; links: string[] }[] = [
    { name: "Tienda", links: ["Productos", "Categorías", "Destacados", "Novedades"] },
    { name: "Soluciones", links: ["Networking", "Cloud", "Security", "DevOps", "Monitoring"] },
    { name: "Empresa", links: ["Nosotros", "Contacto", "Soporte"] },
    { name: "Legal", links: ["Privacidad", "Términos", "Envíos", "Garantías"] },
  ];
  return (
    <footer className="overflow-hidden bg-obsidian">
      <div className="mx-auto max-w-[1520px] px-5 pt-20 md:px-8 xl:px-12">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <StoreMark />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-steel">Tecnología que puedes adquirir. Infraestructura que puedes construir.</p>
            <a href="#soporte" className="mt-8 inline-flex border-b border-tech pb-1 text-sm font-semibold hover:text-volt">Hablar con INFINIHON →</a>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 lg:grid-cols-4">
            {groups.map((group) => (
              <div key={group.name}>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">{group.name}</div>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => <li key={link}><a href={link === "Soporte" ? "#soporte" : "#top"} className="text-sm text-snow/80 hover:text-volt">{link}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div aria-hidden className="mt-20 select-none whitespace-nowrap text-center text-[13vw] font-extrabold leading-[.8] tracking-[-.06em] text-transparent [-webkit-text-stroke:1px_rgba(0,102,255,0.28)]">INFINIHON</div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/[0.06] py-8 font-mono text-[10px] uppercase tracking-[0.19em] text-steel md:flex-row">
          <span>© {new Date().getFullYear()} INFINIHON · Technology & Infrastructure</span>
          <span>Hecho en Honduras.</span>
        </div>
      </div>
    </footer>
  );
}