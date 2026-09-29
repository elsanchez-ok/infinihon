import { useEffect, useMemo, useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { categories, products, type CategoryId } from "../../store/catalog";
import { ProductCard, EmptyState, Breadcrumb } from "./cards";
import { CategoryIcon } from "./ProductVisual";
import { Reveal } from "../ui";
import { cn } from "../../utils/cn";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const ALL_TECH = [...new Set(products.flatMap((p) => p.tech))].sort();
const ALL_USE = [...new Set(products.flatMap((p) => p.use))].sort();
const ALL_BRAND = [...new Set(products.map((p) => p.brand))].sort();
const AVAIL = [
  { id: "available", l: "Disponible" },
  { id: "low", l: "Últimas unidades" },
  { id: "soon", l: "Próximamente" },
];

export default function CatalogPage() {
  const { route } = useStore();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [tech, setTech] = useState<string[]>([]);
  const [use, setUse] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>("all");
  const [avail, setAvail] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("relevance");
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(true);

  // sync from URL
  useEffect(() => {
    setCat((route.query.get("cat") as CategoryId) || "all");
    setQ(route.query.get("q") || "");
  }, [route.raw]);

  // simulated fetch → skeleton states
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [cat, tech, use, brand, avail, maxPrice, q, sort]);

  const filtered = useMemo(() => {
    const t = norm(q.trim());
    let out = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (tech.length && !tech.every((x) => p.tech.includes(x))) return false;
      if (use.length && !p.use.some((x) => use.includes(x))) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (avail.length && !avail.includes(p.status)) return false;
      if (p.price !== null && p.price > maxPrice) return false;
      if (t && ![p.name, p.short, p.category, ...p.tech, ...p.use].some((h) => norm(h).includes(t))) return false;
      return true;
    });
    if (sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "status") out = [...out].sort((a, b) => a.status.localeCompare(b.status));
    if (sort === "cat") out = [...out].sort((a, b) => a.category.localeCompare(b.category));
    return out;
  }, [cat, tech, use, brand, avail, maxPrice, q, sort]);

  const activeCount = tech.length + use.length + avail.length + (brand !== "all" ? 1 : 0) + (cat !== "all" ? 1 : 0);

  const reset = () => {
    setCat("all"); setTech([]); setUse([]); setBrand("all"); setAvail([]); setMaxPrice(3000); setQ("");
    navigate("/catalogo");
  };

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const FilterBody = (
    <div className="space-y-7">
      <div>
        <Head>Categoría</Head>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip on={cat === "all"} onClick={() => setCat("all")}>Todas</Chip>
          {categories.filter((c) => c.id !== "services").map((c) => (
            <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>
          ))}
        </div>
      </div>
      <div>
        <Head>Disponibilidad</Head>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {AVAIL.map((a) => <Chip key={a.id} on={avail.includes(a.id)} onClick={() => toggle(avail, setAvail, a.id)}>{a.l}</Chip>)}
        </div>
      </div>
      <div>
        <Head>Tecnología</Head>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_TECH.map((t) => <Chip key={t} on={tech.includes(t)} onClick={() => toggle(tech, setTech, t)}>{t}</Chip>)}
        </div>
      </div>
      <div>
        <Head>Uso recomendado</Head>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_USE.map((u) => <Chip key={u} on={use.includes(u)} onClick={() => toggle(use, setUse, u)}>{u}</Chip>)}
        </div>
      </div>
      <div>
        <Head>Precio máximo <span className="text-volt">USD</span></Head>
        <input
          type="range" min={500} max={3000} step={100} value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
          className="mt-4 w-full accent-[#0066FF]"
          aria-label="Precio máximo"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-steel">
          <span>$500</span><span>${maxPrice.toLocaleString("en-US")}</span>
        </div>
      </div>
      <div>
        <Head>Marca</Head>
        <select value={brand} onChange={(e) => setBrand(e.target.value)}
          className="mt-3 w-full border border-white/10 bg-obsidian px-3 py-2.5 text-[13px] text-snow focus:border-volt focus:outline-none">
          <option value="all">Todas</option>
          {ALL_BRAND.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Tienda", to: "/catalogo" }]} />

      <header className="mt-8 flex flex-col gap-6 border-b border-white/[0.08] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[4rem]">
            {cat === "all" ? "Catálogo" : categories.find((c) => c.id === cat)?.label}
          </h1>
          <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-steel">
            {cat === "all"
              ? "Hardware, software y licencias para armar tu plataforma. Los servicios profesionales se cotizan aparte."
              : categories.find((c) => c.id === cat)?.desc}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar en el catálogo</span>
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en el catálogo…"
              className="w-full border border-white/10 bg-obsidian px-4 py-3 pl-10 text-[13.5px] text-snow placeholder:text-steel/60 focus:border-volt focus:outline-none"
            />
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-steel" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar"
            className="border border-white/10 bg-obsidian px-3 py-3 text-[13px] text-snow focus:border-volt focus:outline-none">
            <option value="relevance">Relevancia</option>
            <option value="name">Nombre A-Z</option>
            <option value="status">Disponibilidad</option>
            <option value="cat">Categoría</option>
          </select>
        </div>
      </header>

      {/* category rail */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link to="/catalogo" className={cn("flex shrink-0 items-center gap-2 border px-3.5 py-2 text-[12.5px] font-medium transition-colors", cat === "all" ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow")}>
          Todas <span className="font-mono text-[10px] text-steel/60">{products.length}</span>
        </Link>
        {categories.filter((c) => c.id !== "services").map((c) => (
          <Link key={c.id} to={`/catalogo?cat=${c.id}`}
            className={cn("flex shrink-0 items-center gap-2 border px-3.5 py-2 text-[12.5px] font-medium transition-colors", cat === c.id ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow")}>
            <CategoryIcon id={c.id} className="h-4 w-4" />
            {c.label}
            <span className="font-mono text-[10px] text-steel/60">{products.filter((p) => p.category === c.id).length}</span>
          </Link>
        ))}
        <Link to="/servicios" className="flex shrink-0 items-center gap-2 border border-dashed border-white/15 px-3.5 py-2 text-[12.5px] font-medium text-steel hover:text-snow">
          Servicios →
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[248px_1fr]">
        {/* desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-snow">Filtros</span>
              {activeCount > 0 && (
                <button onClick={reset} className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel hover:text-snow">Limpiar ({activeCount})</button>
              )}
            </div>
            <div className="pt-5">{FilterBody}</div>
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-steel">
              {loading ? "Cargando…" : `${filtered.length} ${filtered.length === 1 ? "resultado" : "resultados"}`}
            </span>
            <button onClick={() => setSheet(true)} className="flex items-center gap-2 border border-white/12 px-3.5 py-2 text-[12.5px] font-semibold text-snow lg:hidden">
              Filtrar {activeCount > 0 && <span className="font-mono text-[10px] text-volt">{activeCount}</span>}
            </button>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-white/[0.06] bg-ink" aria-hidden>
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
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4M8.5 11h5" /></svg>}
              title="Ningún producto coincide."
              text="Ajusta los filtros o cuéntanos qué necesitas: podemos conseguir equipos fuera de catálogo."
              cta="Hablar con un experto"
              onCta={() => navigate("/soporte")}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <Reveal key={p.slug} delay={Math.min(i, 6) * 50}><ProductCard p={p} /></Reveal>
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <Reveal delay={150} className="mt-10 border border-white/[0.07] bg-ink/40 p-6 md:flex-row md:items-center md:justify-between">
              <p className="text-[14.5px] leading-relaxed text-steel">
                ¿No encuentras el equipo específico que buscas? Trabajamos con requerimientos técnicos concretos.
              </p>
              <Link to="/soporte" className="mt-5 inline-block shrink-0 border-b border-tech pb-1 text-[13px] font-semibold hover:text-volt md:ml-6 md:mt-0">Solicitar un equipo →</Link>
            </Reveal>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      <div className={cn("fixed inset-0 z-[85] lg:hidden", sheet ? "" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-obsidian/80 backdrop-blur-sm transition-opacity", sheet ? "opacity-100" : "opacity-0")} onClick={() => setSheet(false)} />
        <div className={cn("absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto border-t border-white/10 bg-ink transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]", sheet ? "translate-y-0" : "translate-y-full")}>
          <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.08] bg-ink px-5 py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-snow">Filtros</span>
            <button onClick={() => setSheet(false)} className="font-mono text-sm text-steel hover:text-snow">✕</button>
          </div>
          <div className="px-5 py-6">{FilterBody}</div>
          <div className="sticky bottom-0 flex gap-3 border-t border-white/[0.08] bg-ink px-5 py-4">
            <button onClick={reset} className="flex-1 border border-white/12 py-3.5 text-[13px] font-semibold">Limpiar</button>
            <button onClick={() => setSheet(false)} className="flex-1 bg-tech py-3.5 text-[13px] font-semibold">Ver {filtered.length} resultados</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{children}</div>;
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn("border px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] transition-colors",
        on ? "border-tech bg-tech/20 text-snow" : "border-white/10 text-steel hover:border-white/25 hover:text-snow")}
    >
      {children}
    </button>
  );
}
