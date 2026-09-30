import { useEffect, useMemo, useRef, useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { categories, categoryLabel, products, services, statusLabel, bySlug } from "../../store/catalog";
import { ProductVisual } from "./ProductVisual";
import { cn } from "../../utils/cn";
import { Corners } from "../ui";

/* ------------------------------------------------------------------- logo */

export function StoreLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex flex-col items-center gap-1.5" aria-label="INFINIHON — tienda">
      <img
        src="/assets/infinihon.png"
        alt="INFINIHON"
        className={cn("shrink-0 w-auto", compact ? "h-8" : "h-9")}
      />
      {!compact && (
        <span className="block font-mono text-[9px] uppercase leading-none tracking-[0.28em] text-steel">Infrastructure · Innovation · Honduras</span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ navbar */

const NAV = [
  { l: "Tienda", to: "/catalogo" },
  { l: "Servicios", to: "/servicios" },
  { l: "Soluciones", to: "/soluciones" },
  { l: "Infraestructura", to: "/", section: "infraestructura" },
  { l: "Soporte", to: "/soporte" },
];

const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function StoreNavbar() {
  const { cartCount, setDrawer, setSearch, route, compare, demoNotice, setDemoNotice } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => setMenu(false), [route.raw]);

  const goSection = (id: string) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (route.raw !== "/") {
      navigate("/");
      window.setTimeout(scroll, 140);
    } else {
      scroll();
    }
  };

  return (
    <>
      <header className={cn("sticky top-0 z-50 transition-all duration-500", scrolled ? "bg-obsidian/85 backdrop-blur-xl" : "bg-obsidian/50 backdrop-blur-sm")}>
        {/* aviso de catálogo: colapsa al hacer scroll para no estorbar la navegación */}
        <div className={cn("overflow-hidden border-b border-hn/60 bg-hn/25 transition-[max-height] duration-500", demoNotice && scrolled ? "max-h-0" : demoNotice ? "max-h-12" : "max-h-0")}>
          <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 md:px-8">
            <span className="hidden shrink-0 border border-volt/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-volt sm:block">Info</span>
            <p className="font-mono text-[10.5px] leading-4 tracking-[0.06em] text-steel">
              Catálogo sincronizado con el panel de INFINIHON. Los productos <span className="text-snow">sin precio publicado</span> se cotizan a medida y el pago se coordina con nuestro equipo.
            </p>
            <button onClick={() => setDemoNotice(false)} className="ml-auto shrink-0 font-mono text-[11px] text-steel hover:text-snow" aria-label="Cerrar aviso">✕</button>
          </div>
        </div>
        <div className={cn("border-b transition-colors duration-500", scrolled ? "border-white/[0.07]" : "border-transparent")}>
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-6 px-4 md:px-8">
          <StoreLogo />

          <nav aria-label="Principal" className="mx-auto hidden items-center gap-7 lg:flex">
            {NAV.map((n) => {
              const active = n.section ? false : route.raw === n.to || route.raw.startsWith(n.to + "/");
              return n.section ? (
                <button
                  key={n.l}
                  type="button"
                  onClick={() => goSection(n.section!)}
                  className="group relative text-[13px] font-medium text-steel transition-colors hover:text-snow"
                >
                  {n.l}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
                </button>
              ) : (
                <Link key={n.l} to={n.to} className={cn("group relative text-[13px] font-medium transition-colors", active ? "text-snow" : "text-steel hover:text-snow")}>
                  {n.l}
                  <span className={cn("absolute -bottom-1.5 left-0 h-px bg-volt transition-all duration-300", active ? "w-full" : "w-0 group-hover:w-full")} />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <IconBtn label="Buscar" onClick={() => setSearch(true)} kbd>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
            </IconBtn>
            <IconBtn label="Cuenta" onClick={() => navigate("/soporte")} className="hidden sm:flex">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" /></svg>
            </IconBtn>
            <IconBtn label={`Carrito, ${cartCount} productos`} onClick={() => setDrawer(true)} badge={cartCount} anchor>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON}><path d="M4 6h16l-1.4 11.2A2 2 0 0 1 16.6 19H7.4a2 2 0 0 1-2-1.8z" /><path d="M9 6V4.8A3 3 0 0 1 15 4.8V6" /></svg>
            </IconBtn>

            {compare.length > 0 && (
              <Link to="/comparar" className="relative ml-1 hidden items-center gap-2 border border-volt/50 bg-volt/10 px-3 py-2 text-[12px] font-semibold text-snow md:flex">
                <svg viewBox="0 0 24 24" className="h-4 w-4" {...ICON}><path d="M4 7h16M4 12h10M4 17h6" /></svg>
                {compare.length}
              </Link>
            )}

            <Link to="/soporte" className="ml-1 hidden items-center gap-2 border border-tech/60 bg-tech/10 px-4 py-2.5 text-[12.5px] font-semibold text-snow transition-colors hover:bg-tech xl:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
              Hablar con un experto
            </Link>

            <IconBtn label="Menú" onClick={() => setMenu((m) => !m)} className="lg:hidden">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...ICON}>
                {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </IconBtn>
          </div>
        </div>
        </div>

        {/* mobile menu */}
        <div className={cn("overflow-hidden border-t border-white/[0.07] bg-obsidian/95 backdrop-blur-xl transition-[max-height] duration-500 lg:hidden", menu ? "max-h-[80svh]" : "max-h-0")}>
          <nav className="px-4 py-3">
            {NAV.map((n, i) => (
              <div key={n.l} className="flex items-center justify-between border-b border-white/[0.06] py-3.5">
                {n.section ? (
                  <button type="button" onClick={() => { setMenu(false); goSection(n.section!); }} className="text-left text-lg font-bold">
                    {n.l}
                  </button>
                ) : (
                  <Link to={n.to} onClick={() => setMenu(false)} className="text-lg font-bold">{n.l}</Link>
                )}
                <span className="font-mono text-xs text-steel">0{i + 1}</span>
              </div>
            ))}
            {compare.length > 0 && (
              <Link to="/comparar" onClick={() => setMenu(false)} className="flex items-center justify-between border-b border-white/[0.06] py-3.5 text-lg font-bold">
                Comparar <span className="font-mono text-xs text-volt">{compare.length}</span>
              </Link>
            )}
            <Link to="/soporte" onClick={() => setMenu(false)} className="mt-4 flex items-center justify-center bg-tech py-3.5 text-sm font-semibold">
              Hablar con un experto
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

function IconBtn({ label, onClick, children, badge, kbd, anchor, className }: {
  label: string; onClick: () => void; children: React.ReactNode; badge?: number; kbd?: boolean; anchor?: boolean; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("relative flex h-10 w-10 items-center justify-center border border-white/[0.08] text-steel transition-all hover:border-volt/50 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt", className)}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center bg-tech px-1 font-mono text-[10px] font-semibold text-snow">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {anchor && <span id="cart-anchor" className="pointer-events-none absolute inset-0" aria-hidden />}
      {kbd && (
        <span className="pointer-events-none absolute right-1 top-1 hidden font-mono text-[8px] text-steel/50 md:block">⌘K</span>
      )}
    </button>
  );
}

/* --------------------------------------------------------------- catálogo */

/** Aviso informativo del catálogo: ya no es una demostración de datos. */
export function CatalogNotice() {
  const { demoNotice, setDemoNotice } = useStore();
  if (!demoNotice) return null;
  return (
    <div className="border-b border-hn/60 bg-hn/25">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 md:px-8">
        <span className="hidden shrink-0 border border-volt/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-volt sm:block">Info</span>
        <p className="font-mono text-[10.5px] leading-4 tracking-[0.06em] text-steel">
          Catálogo sincronizado con el panel de INFINIHON. Los productos <span className="text-snow">sin precio publicado</span> se cotizan a medida y el pago se coordina con nuestro equipo.
        </p>
        <button onClick={() => setDemoNotice(false)} className="ml-auto shrink-0 font-mono text-[11px] text-steel hover:text-snow" aria-label="Cerrar aviso">
          ✕
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ search */

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function SearchOverlay() {
  const { search, setSearch } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [setSearch]);

  useEffect(() => {
    if (search) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [search]);

  const results = useMemo(() => {
    const t = norm(q.trim());
    const out: { kind: "Producto" | "Servicio" | "Categoría"; label: string; sub: string; to: string; visual: string; tech: string[] }[] = [];
    if (!t) {
      products.slice(0, 4).forEach((p) => out.push({ kind: "Producto", label: p.name, sub: p.short, to: `/producto/${p.slug}`, visual: p.visual, tech: p.tech }));
      services.slice(0, 3).forEach((s) => out.push({ kind: "Servicio", label: s.name, sub: s.short, to: `/servicios`, visual: s.visual, tech: s.tech }));
      return out;
    }
    const hit = (hay: string[]) => hay.some((h) => norm(h).includes(t));
    products.forEach((p) => {
      if (hit([p.name, p.short, p.category, p.brand, ...p.tech, ...p.use])) out.push({ kind: "Producto", label: p.name, sub: p.short, to: `/producto/${p.slug}`, visual: p.visual, tech: p.tech });
    });
    services.forEach((s) => {
      if (hit([s.name, s.short, ...s.tech, ...s.scope])) out.push({ kind: "Servicio", label: s.name, sub: s.short, to: "/servicios", visual: s.visual, tech: s.tech });
    });
    categories.forEach((c) => {
      if (norm(c.label).includes(t) || norm(c.desc).includes(t)) out.push({ kind: "Categoría", label: c.label, sub: c.desc, to: `/catalogo?cat=${c.id}`, visual: "bundle", tech: [] });
    });
    return out.slice(0, 8);
  }, [q]);

  if (!search) return null;

  const go = (i: number) => {
    const r = results[i];
    if (!r) return;
    setSearch(false);
    navigate(r.to);
  };

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Buscar">
      <div className="absolute inset-0 bg-obsidian/85 backdrop-blur-md" onClick={() => setSearch(false)} />
      <div className="relative mx-auto mt-[12svh] w-[calc(100%-2rem)] max-w-2xl border border-white/[0.1] bg-ink shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <Corners />
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-tech" {...ICON}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              if (e.key === "Enter") go(sel);
            }}
            placeholder="Buscar productos, soluciones o servicios..."
            className="w-full bg-transparent text-base text-snow placeholder:text-steel/60 focus:outline-none"
            aria-label="Buscar productos, soluciones o servicios"
          />
          <kbd className="hidden border border-white/10 px-2 py-1 font-mono text-[10px] text-steel sm:block">ESC</kbd>
        </div>

        <div className="max-h-[52svh] overflow-y-auto">
          {!q && <div className="px-4 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60">Sugerencias</div>}
          {results.length === 0 && q && (
            <div className="px-5 py-12 text-center">
              <p className="text-lg font-bold text-snow">Sin resultados para “{q}”.</p>
              <p className="mt-2 text-sm text-steel">Prueba con una tecnología (MikroTik, Kubernetes, Terraform) o pídenos ayuda.</p>
              <Link to="/soporte" onClick={() => setSearch(false)} className="mt-6 inline-flex border border-tech/60 px-5 py-3 text-sm font-semibold hover:bg-tech">
                Hablar con un experto
              </Link>
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={r.to + r.label}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(i)}
              className={cn("flex w-full items-center gap-4 border-b border-white/[0.05] px-4 py-3 text-left transition-colors", i === sel ? "bg-hn/30" : "hover:bg-white/[0.02]")}
            >
              <span className="h-11 w-16 shrink-0 border border-white/[0.06] bg-obsidian">
                <ProductVisual visual={r.visual as never} uid={`s-${i}-${r.label}`} className="h-full w-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-volt">{r.kind}</span>
                  {r.tech[0] && <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel/60">{r.tech[0]}</span>}
                </span>
                <span className="mt-1 block truncate text-[15px] font-bold text-snow">{r.label}</span>
                <span className="block truncate text-[13px] text-steel">{r.sub}</span>
              </span>
              <span className="font-mono text-xs text-steel">↵</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel/60">
          <span>↑↓ navegar · ↵ abrir</span>
          <span>{results.length} resultados</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- cart drawer */

export function CartDrawer() {
  const { drawer, setDrawer, cartLines, setQty, remove, cartCount, subtotal } = useStore();
  return (
    <div className={cn("fixed inset-0 z-[95]", drawer ? "" : "pointer-events-none")} aria-hidden={!drawer}>
      <div className={cn("absolute inset-0 bg-obsidian/80 backdrop-blur-sm transition-opacity duration-400", drawer ? "opacity-100" : "opacity-0")} onClick={() => setDrawer(false)} />
      <aside
        role="dialog" aria-modal="true" aria-label="Carrito"
        className={cn("absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-white/[0.1] bg-ink transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]", drawer ? "translate-x-0" : "translate-x-full")}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em]">
            Carrito
            <span className="font-mono text-[11px] font-normal text-steel">{cartCount} {cartCount === 1 ? "artículo" : "artículos"}</span>
          </h2>
          <button onClick={() => setDrawer(false)} aria-label="Cerrar carrito" className="font-mono text-sm text-steel hover:text-snow">✕</button>
        </div>

        {cartLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-steel/40" {...ICON}><path d="M4 6h16l-1.4 11.2A2 2 0 0 1 16.6 19H7.4a2 2 0 0 1-2-1.8z" /><path d="M9 6V4.8A3 3 0 0 1 15 4.8V6M4 6h16" /></svg>
            <p className="mt-6 text-xl font-extrabold uppercase leading-tight">Tu infraestructura aún no tiene nada.</p>
            <p className="mt-3 text-sm text-steel">Explora nuestra tienda y encuentra tecnología para construir lo que sigue.</p>
            <Link to="/catalogo" onClick={() => setDrawer(false)} className="mt-8 bg-tech px-6 py-3.5 text-sm font-semibold hover:bg-[#1a75ff]">Explorar productos</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto">
              {cartLines.map(({ product: p, qty }) => (
                <li key={p.slug} className="flex gap-4 border-b border-white/[0.06] p-4">
                  <Link to={`/producto/${p.slug}`} onClick={() => setDrawer(false)} className="h-16 w-20 shrink-0 border border-white/[0.06] bg-obsidian">
                    <ProductVisual visual={p.visual} uid={`c-${p.slug}`} className="h-full w-full" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/producto/${p.slug}`} onClick={() => setDrawer(false)} className="truncate text-[14px] font-bold text-snow hover:text-volt">{p.name}</Link>
                      <button onClick={() => remove(p.slug)} aria-label={`Quitar ${p.name}`} className="font-mono text-[11px] text-steel hover:text-snow">✕</button>
                    </div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                      <span>{categoryLabel(p.category)}</span>
                      <span className="text-white/15">·</span>
                      <span className={p.status === "available" ? "text-volt" : "text-amber-400/80"}>{statusLabel[p.status]}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-white/10">
                        <button onClick={() => setQty(p.slug, qty - 1)} aria-label="Reducir cantidad" className="h-8 w-8 text-steel hover:text-snow">−</button>
                        <span className="w-8 text-center font-mono text-[13px]">{qty}</span>
                        <button onClick={() => setQty(p.slug, qty + 1)} aria-label="Aumentar cantidad" className="h-8 w-8 text-steel hover:text-snow">+</button>
                      </div>
                      <span className="font-mono text-[13px] text-snow">{p.price === null ? "Por cotizar" : `$${(p.price * qty).toLocaleString("en-US")}`}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/[0.08] p-5">
              <dl className="space-y-2 font-mono text-[12px]">
                <div className="flex justify-between text-steel"><dt>Subtotal</dt><dd className="text-snow">{subtotal === null ? "Por definir" : `$${subtotal.toLocaleString("en-US")}`}</dd></div>
                <div className="flex justify-between text-steel"><dt>Envío</dt><dd>Se calcula al cotizar</dd></div>
                <div className="flex justify-between text-steel"><dt>Impuestos</dt><dd>Según jurisdicción</dd></div>
              </dl>
              <div className="mt-4 flex justify-between border-t border-white/[0.08] pt-4">
                <span className="text-sm font-bold">Total</span>
                <span className="font-mono text-sm text-snow">{subtotal === null ? "A definir" : `$${subtotal.toLocaleString("en-US")}`}</span>
              </div>
              <Link to="/carrito" onClick={() => setDrawer(false)} className="mt-5 flex items-center justify-center gap-2 bg-tech py-4 text-sm font-semibold hover:bg-[#1a75ff]">
                Continuar compra <span className="font-mono">→</span>
              </Link>
              <p className="mt-3 text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel/60">Precios a cotizar · sin pago en línea</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ toaster */

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[110] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="fade-up pointer-events-auto flex items-start gap-3 border border-white/[0.1] bg-ink/95 p-4 backdrop-blur-md">
          <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border", t.kind === "cart" ? "border-tech bg-tech/20 text-volt" : "border-white/15 text-steel")}>
            {t.kind === "cart" ? "✓" : "i"}
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-snow">{t.title}</span>
            {t.note && <span className="block truncate text-[12px] text-steel">{t.note}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- footer */

const COLS: { t: string; items: [string, string][] }[] = [
  { t: "Tienda", items: [["Productos", "/catalogo"], ["Categorías", "/catalogo"], ["Destacados", "/"], ["Novedades", "/insights"]] },
  { t: "Soluciones", items: [["Networking", "/servicios"], ["Cloud", "/servicios"], ["Security", "/servicios"], ["DevOps", "/servicios"], ["Monitoring", "/servicios"]] },
  { t: "Empresa", items: [["Nosotros", "/nosotros"], ["Contacto", "/contacto"], ["Soporte", "/soporte"], ["Tech Insights", "/insights"]] },
  { t: "Ayuda", items: [["Preguntas frecuentes", "/faq"], ["Envíos", "/envios"], ["Pagos", "/pagos"], ["Seguimiento", "/seguimiento"], ["Mis solicitudes", "/solicitudes"]] },
  { t: "Legal", items: [["Privacidad", "/privacidad"], ["Términos", "/terminos"], ["Garantías", "/garantias"]] },
];

export function StoreFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-obsidian">
      <div className="mx-auto max-w-[1500px] px-4 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-2">
            <StoreLogo />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-steel">
              Tecnología que puedes adquirir. Infraestructura que puedes construir.
            </p>
            <div className="mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
              <span className="h-2 w-5 bg-hn" /> Hecho en Honduras.
            </div>
          </div>
          {COLS.map((c) => (
            <nav key={c.t} className="md:col-span-3 lg:col-span-2" aria-label={c.t}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">{c.t}</h3>
              <ul className="mt-4 space-y-2.5">
                {c.items.map(([l, to]) => (
                  <li key={l}>
                    <Link to={to} className="text-[14px] text-snow/75 transition-colors hover:text-volt">{l}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] py-7 font-mono text-[10px] uppercase tracking-[0.2em] text-steel md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} INFINIHON · Technology & Infrastructure</span>
          <span className="flex flex-wrap items-center gap-4">
            <span>Catálogo sincronizado en vivo</span>
            <Link to="/sitio" className="text-snow/80 hover:text-volt">Sitio corporativo →</Link>
          </span>
        </div>
      </div>
      <div aria-hidden className="select-none overflow-hidden px-2 pb-2 text-center text-[13vw] font-extrabold leading-[0.78] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(0,102,255,0.22)] md:text-[11vw]">
        INFINIHON
      </div>
    </footer>
  );
}

/** Floating compare bar + mobile cart affordance. */
export function FloatingBars() {
  const { compare, cartCount, setDrawer, clearCompare, route } = useStore();
  const names = compare.map((s) => bySlug(s)?.name ?? s);
  // the product page already owns the bottom bar on mobile
  const productPage = route.segments[0] === "producto";
  return (
    <>
      {compare.length > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl border border-volt/40 bg-ink/95 backdrop-blur-lg md:inset-x-8">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">Comparar</span>
            <span className="hidden flex-1 truncate text-[13px] text-steel sm:block">{names.join(" · ")}</span>
            <button onClick={clearCompare} className="font-mono text-[11px] text-steel hover:text-snow">Limpiar</button>
            <Link to="/comparar" className="bg-tech px-4 py-2 text-[12.5px] font-semibold hover:bg-[#1a75ff]">Ver comparación →</Link>
          </div>
        </div>
      )}
      {cartCount > 0 && compare.length === 0 && !productPage && (
        <button
          onClick={() => setDrawer(true)}
          className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 border border-tech bg-tech px-4 py-3 text-[13px] font-semibold text-snow shadow-[0_10px_40px_-10px_rgba(0,102,255,0.6)] md:hidden"
        >
          Carrito <span className="font-mono text-volt">{cartCount}</span>
        </button>
      )}
    </>
  );
}
