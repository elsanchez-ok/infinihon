import { type ReactNode } from "react";
import { Link, useStore } from "../../store/app";
import { categoryLabel, statusLabel, type Bundle, type Product, type Service } from "../../store/catalog";
import { ProductVisual, CategoryIcon } from "./ProductVisual";
import { cn } from "../../utils/cn";

/* ------------------------------------------------------------------ helpers */

export function StatusDot({ s }: { s: Product["status"] }) {
  const c = s === "available" ? "bg-volt" : s === "low" ? "bg-amber-400" : s === "soon" ? "bg-steel" : "bg-steel/50";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
      <span className={cn("h-1.5 w-1.5 rounded-full", c, s !== "out" && "pulse-soft")} />
      <span className={s === "available" ? "text-volt" : s === "low" ? "text-amber-400/90" : "text-steel"}>{statusLabel[s]}</span>
    </span>
  );
}

export function Price({ product, size = "md" }: { product: Product; size?: "sm" | "md" | "lg" }) {
  const p = product.price;
  const cls = size === "lg" ? "text-4xl md:text-5xl" : size === "md" ? "text-2xl" : "text-lg";
  if (p === null) {
    return <span className="font-extrabold tracking-tight text-snow">Por cotizar</span>;
  }
  return (
    <span className="flex items-baseline gap-2">
      <span className={cn("font-extrabold tracking-tight text-snow", cls)}>${p.toLocaleString("en-US")}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-steel/60">precio publicado</span>
    </span>
  );
}

/* -------------------------------------------------------------- product card */

export function ProductCard({ p }: { p: Product }) {
  const { add, compare, toggleCompare } = useStore();
  const inCompare = compare.includes(p.slug);
  const disabled = p.status === "out";

  return (
    <article className="group relative flex flex-col border border-white/[0.07] bg-ink transition-all duration-500 hover:border-tech/70 hover:shadow-[0_20px_60px_-30px_rgba(0,102,255,0.55)]">
      {/* visual */}
      <Link to={`/producto/${p.slug}`} className="relative block overflow-hidden border-b border-white/[0.06] bg-obsidian">
        <div className="absolute inset-0 bg-grid-fine opacity-40" />
        <ProductVisual
          visual={p.visual}
          uid={`p-${p.slug}`}
          className="aspect-[4/3] w-full transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
        />
        {p.badge && (
          <span className="absolute left-3 top-3 border border-white/15 bg-obsidian/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-snow backdrop-blur-sm">
            {p.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center border border-white/10 bg-obsidian/80 text-steel opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
          <CategoryIcon id={p.category} className="h-4 w-4" />
        </span>
      </Link>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{categoryLabel(p.category)}</span>
          <StatusDot s={p.status} />
        </div>
        <h3 className="mt-3 text-[19px] font-bold leading-snug tracking-tight text-snow">
          <Link to={`/producto/${p.slug}`} className="transition-colors group-hover:text-volt">{p.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-steel">{p.short}</p>

        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/70">
          <span>SKU:</span>
          <span className="text-snow/90">{p.sku}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.tech.slice(0, 3).map((t) => (
            <span key={t} className="border border-white/[0.08] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-steel">{t}</span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <Price product={p} size="sm" />
          <div className="mt-4 grid translate-y-1 grid-cols-2 gap-2 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <Link to={`/producto/${p.slug}`} className={cn("border border-white/12 py-2.5 text-center text-[12.5px] font-semibold text-snow transition-colors hover:border-volt/60 hover:bg-white/[0.03]", disabled && "opacity-50")}>
              Ver producto
            </Link>
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => add(p.slug, 1, (e.currentTarget as HTMLElement).getBoundingClientRect())}
              className={cn(
                "bg-tech py-2.5 text-[12.5px] font-semibold text-snow transition-colors hover:bg-[#1a75ff]",
                disabled && "cursor-not-allowed bg-white/[0.06] text-steel hover:bg-white/[0.06]"
              )}
            >
              {p.status === "soon" ? "Reservar interés" : disabled ? "Agotado" : "Agregar al carrito"}
            </button>
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/70 transition-colors hover:text-snow">
            <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(p.slug)} className="peer sr-only" />
            <span className={cn("flex h-4 w-4 items-center justify-center border transition-colors", inCompare ? "border-volt bg-tech text-snow" : "border-white/20")}>
              {inCompare && <span className="text-[9px]">✓</span>}
            </span>
            Comparar
          </label>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------- service card */

export function SolutionCard({ s, i = 0 }: { s: Service; i?: number }) {
  return (
    <article className="group relative flex flex-col border-t border-white/[0.08] p-6 transition-colors duration-500 hover:border-tech md:p-7">
      <div className="absolute inset-0 -z-0 bg-gradient-to-b from-hn/25 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="font-mono text-[11px] text-tech">{String(i + 1).padStart(2, "0")}</span>
        <span className="h-10 w-14 shrink-0 border border-white/[0.06] bg-obsidian">
          <ProductVisual visual={s.visual} uid={`sv-${s.slug}`} className="h-full w-full" />
        </span>
      </div>
      <h3 className="relative mt-4 text-2xl font-extrabold tracking-tight text-snow transition-colors group-hover:text-volt">{s.name}</h3>
      <p className="relative mt-2 text-[14px] leading-relaxed text-steel">{s.short}</p>
      <ul className="relative mt-5 space-y-1.5">
        {s.scope.slice(0, 3).map((sc) => (
          <li key={sc} className="flex gap-2.5 font-mono text-[11px] leading-relaxed text-steel">
            <span className="text-tech">—</span>{sc}
          </li>
        ))}
      </ul>
      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {s.tech.map((t) => (
          <span key={t} className="border border-white/[0.08] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-steel">{t}</span>
        ))}
      </div>
      <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">Duración: {s.duration}</span>
        <Link to={`/servicios?s=${s.slug}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-snow transition-colors hover:text-volt">
          Solicitar cotización <span className="font-mono">→</span>
        </Link>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- bundle card */

export function BundleCard({ b }: { b: Bundle }) {
  return (
    <article className="group relative border border-white/[0.07] bg-ink/60 p-6 transition-all duration-500 hover:border-tech/70 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-volt">{b.tier}</span>
          <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-snow md:text-3xl">{b.name}</h3>
        </div>
        <ProductVisual visual="bundle" uid={`b-${b.slug}`} className="h-16 w-24 shrink-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <p className="mt-5 text-[14px] leading-relaxed text-steel">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60">Para quién · </span>{b.for}
      </p>
      <p className="mt-3 border-l-2 border-hn pl-4 text-[14px] italic leading-relaxed text-snow/80">“{b.problem}”</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60">Qué incluye</div>
          <ul className="mt-3 space-y-1.5">
            {b.includes.map((x) => (
              <li key={x} className="flex gap-2.5 text-[13px] leading-relaxed text-steel"><span className="text-volt">✓</span>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60">Componentes sugeridos</div>
          <ul className="mt-3 space-y-1.5">
            {b.requires.map((x) => (
              <li key={x} className="flex gap-2.5 text-[13px] leading-relaxed text-steel"><span className="text-tech">—</span>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel/60">Precio según alcance · cotización</span>
        <Link to={`/soluciones?b=${b.slug}`} className="inline-flex items-center justify-center gap-2 border border-tech/60 bg-tech/10 px-5 py-3 text-[13px] font-semibold text-snow transition-colors hover:bg-tech">
          {b.cta} <span className="font-mono">→</span>
        </Link>
      </div>
    </article>
  );
}

/* --------------------------------------------------------------- empty state */

export function EmptyState({ title, text, cta, onCta, icon }: { title: string; text: string; cta?: string; onCta?: () => void; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-white/[0.1] bg-ink/40 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-white/10 text-steel">{icon ?? "∅"}</div>
      <h3 className="mt-6 text-2xl font-extrabold uppercase tracking-tight text-snow md:text-3xl">{title}</h3>
      <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-steel">{text}</p>
      {cta && (
        <button onClick={onCta} className="mt-8 bg-tech px-6 py-3.5 text-sm font-semibold text-snow transition-colors hover:bg-[#1a75ff]">
          {cta}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ skeleton */

export function SkeletonCard() {
  return (
    <div className="border border-white/[0.06] bg-ink" aria-hidden>
      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/[0.06] bg-obsidian">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-2.5 w-20 animate-pulse bg-white/[0.06]" />
        <div className="h-4 w-3/4 animate-pulse bg-white/[0.08]" />
        <div className="h-3 w-full animate-pulse bg-white/[0.05]" />
        <div className="h-3 w-2/3 animate-pulse bg-white/[0.05]" />
        <div className="mt-6 h-6 w-24 animate-pulse bg-white/[0.06]" />
        <div className="h-10 w-full animate-pulse bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function SectionHead({ kicker, title, note, to }: { kicker: string; title: string; note?: string; to?: string }) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-steel">
          <span className="text-volt">{kicker}</span>
          <span className="h-px w-10 bg-steel/40" />
        </div>
        <h2 className="mt-5 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[3.6rem]">{title}</h2>
      </div>
      {note && <p className="max-w-sm text-[14.5px] leading-relaxed text-steel">{note}</p>}
      {to && (
        <Link to={to} className="shrink-0 border-b border-tech pb-1 text-[13px] font-semibold text-snow transition-colors hover:text-volt">
          Ver todo →
        </Link>
      )}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { l: string; to?: string }[] }) {
  return (
    <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/70">
      <Link to="/" className="hover:text-snow">Inicio</Link>
      {items.map((i) => (
        <span key={i.l} className="flex items-center gap-2">
          <span className="text-white/15">/</span>
          {i.to ? <Link to={i.to} className="hover:text-snow">{i.l}</Link> : <span className="text-steel">{i.l}</span>}
        </span>
      ))}
      <button onClick={() => window.history.back()} className="ml-2 hidden text-steel/50 hover:text-snow sm:block">· volver</button>
    </nav>
  );
}
