import { useEffect, useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { bySlug, categoryLabel, products, statusLabel } from "../../store/catalog";
import { ProductVisual } from "./ProductVisual";
import { Breadcrumb, Price, ProductCard, StatusDot } from "./cards";
import { Reveal } from "../ui";
import { cn } from "../../utils/cn";

const TABS = ["Descripción", "Especificaciones", "Compatibilidad", "Características", "Documentación", "Soporte"] as const;
type Tab = (typeof TABS)[number];

export default function ProductPage({ slug }: { slug: string }) {
  const { add, compare, toggleCompare } = useStore();
  const p = bySlug(slug);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("Descripción");
  const [view, setView] = useState(0);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    setQty(1); setTab("Descripción"); setView(0);
    setLoad(true);
    const t = setTimeout(() => setLoad(false), 320);
    return () => clearTimeout(t);
  }, [slug]);

  if (!p) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-24 md:px-8">
        <h1 className="text-4xl font-extrabold uppercase">Producto no encontrado.</h1>
        <p className="mt-4 text-steel">La referencia que buscas no existe o fue retirada del catálogo.</p>
        <Link to="/catalogo" className="mt-8 inline-block bg-tech px-6 py-3.5 text-sm font-semibold">Volver al catálogo</Link>
      </div>
    );
  }

  const views = [
    { label: "Frontal", zoom: 1, off: "0%" },
    { label: "Detalle", zoom: 1.9, off: "-14%" },
    { label: "Puertos", zoom: 2.6, off: "8%" },
    { label: "Contexto", zoom: 0.78, off: "0%" },
  ];
  const related = products.filter((x) => x.slug !== p.slug && (x.category === p.category || x.tech.some((t) => p.tech.includes(t)))).slice(0, 3);
  const disabled = p.status === "out";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Tienda", to: "/catalogo" }, { l: categoryLabel(p.category), to: `/catalogo?cat=${p.category}` }, { l: p.name }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14">
        {/* -------------------------------------------------------- gallery */}
        <div>
          <div className="relative overflow-hidden border border-white/[0.08] bg-obsidian">
            <div className="absolute inset-0 bg-grid-fine opacity-40" />
            {load ? (
              <div className="aspect-[4/3] w-full animate-pulse bg-white/[0.03]" />
            ) : (
              <div className="aspect-[4/3] w-full overflow-hidden">
                <ProductVisual
                  visual={p.visual}
                  uid={`g-${p.slug}-${view}`}
                  className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
                />
              </div>
            )}
            <span className="absolute left-4 top-4 font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/70">
              Render técnico · {views[view].label}
            </span>
            {p.badge && (
              <span className="absolute right-4 top-4 border border-white/15 bg-obsidian/80 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-snow">{p.badge}</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-obsidian to-transparent px-4 py-3">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/70">Vista 0{view + 1} / 04</span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/70">Render técnico · no es fotografía del producto</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3">
            {views.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setView(i)}
                aria-label={`Vista ${v.label}`}
                aria-pressed={view === i}
                className={cn("group relative overflow-hidden border bg-obsidian transition-colors", view === i ? "border-tech" : "border-white/[0.08] hover:border-white/25")}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <div className="h-full w-full origin-center transition-transform duration-700 group-hover:scale-105" style={{ transform: `scale(${v.zoom})`, translate: v.off }}>
                    <ProductVisual visual={p.visual} uid={`t-${p.slug}-${i}`} className="h-full w-full" />
                  </div>
                </div>
                <span className="absolute inset-x-0 bottom-0 bg-obsidian/85 py-1 text-center font-mono text-[8.5px] uppercase tracking-[0.14em] text-steel">{v.label}</span>
              </button>
            ))}
          </div>

          {/* tabs */}
          <div className="mt-12">
            <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-white/[0.08]">
              {TABS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn("relative shrink-0 py-3 text-[13px] font-semibold transition-colors", tab === t ? "text-snow" : "text-steel hover:text-snow")}
                >
                  {t}
                  <span className={cn("absolute inset-x-0 bottom-0 h-px bg-volt transition-opacity", tab === t ? "opacity-100" : "opacity-0")} />
                </button>
              ))}
            </div>

            <div className="py-8">
              {tab === "Descripción" && (
                <div className="max-w-2xl">
                  <p className="text-[17px] leading-relaxed text-snow/90">{p.description}</p>
                  <p className="mt-6 text-[14.5px] leading-relaxed text-steel">
                    Todos los equipos se entregan con configuración inicial y documentación. Si necesitas un dimensionamiento
                    específico, el equipo técnico de Infinihon puede ayudarte a elegir la versión adecuada.
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="border border-white/[0.08] p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60">Incluye</div>
                      <ul className="mt-3 space-y-1.5">{p.includes.map((x) => <li key={x} className="flex gap-2 text-[13.5px] text-steel"><span className="text-volt">✓</span>{x}</li>)}</ul>
                    </div>
                    <div className="border border-white/[0.08] p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60">Uso recomendado</div>
                      <ul className="mt-3 space-y-1.5">{p.use.map((x) => <li key={x} className="flex gap-2 text-[13.5px] text-steel"><span className="text-tech">—</span>{x}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Especificaciones" && (
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-400/80">
                    <span className="border border-amber-400/40 px-2 py-0.5">Placeholder</span>
                    <span className="text-steel">Valores de referencia pendientes del catálogo real</span>
                  </div>
                  <table className="w-full border-collapse">
                    <caption className="sr-only">Especificaciones de {p.name}</caption>
                    <tbody>
                      {p.specs.map((s, i) => (
                        <tr key={s.k} className={cn("border-b border-white/[0.07]", i % 2 && "bg-white/[0.015]")}>
                          <th scope="row" className="w-[42%] py-3.5 pr-6 text-left align-top font-mono text-[11px] uppercase tracking-[0.12em] text-steel">{s.k}</th>
                          <td className="py-3.5 text-[14px] text-snow/90">{s.v}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-white/[0.07]">
                        <th scope="row" className="py-3.5 pr-6 text-left align-top font-mono text-[11px] uppercase tracking-[0.12em] text-steel">Marca / modelo</th>
                        <td className="py-3.5 text-[14px] text-snow/90">{p.brand} — por definir en el catálogo real</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "Compatibilidad" && (
                p.compat.length ? <ul className="max-w-2xl space-y-px bg-white/[0.07]">
                  {p.compat.map((c, i) => {
                    const match = products.find((x) => x.name === c);
                    return (
                      <li key={c} className="flex items-center justify-between gap-4 bg-ink px-5 py-4">
                        <span className="flex items-center gap-3 text-[14px] text-snow/90">
                          <span className="font-mono text-[10px] text-tech">{String(i + 1).padStart(2, "0")}</span>{c}
                        </span>
                        {match ? (
                          <Link to={`/producto/${match.slug}`} className="shrink-0 font-mono text-[11px] text-volt hover:underline">Ver →</Link>
                        ) : (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/60">Validar</span>
                        )}
                      </li>
                    );
                  })}
                </ul> : <p className="max-w-2xl border border-white/[0.08] p-5 text-sm text-steel">La compatibilidad todavía no está confirmada para esta referencia.</p>
              )}

              {tab === "Características" && (
                p.features.length ? <ul className="grid max-w-2xl gap-px bg-white/[0.07] sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="bg-ink px-5 py-5 text-[14px] leading-relaxed text-steel"><span className="mb-2 block font-mono text-[10px] text-volt">✓</span>{f}</li>
                  ))}
                </ul> : <p className="max-w-2xl border border-white/[0.08] p-5 text-sm text-steel">Las características técnicas se publicarán al confirmar la configuración del equipo.</p>
              )}

              {tab === "Documentación" && (
                <div className="max-w-2xl">
                  {p.docs.length ? p.docs.map((d) => (
                    <div key={d.t} className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-5">
                      <div>
                        <div className="text-[15px] font-bold text-snow">{d.t}</div>
                        <div className="mt-1 font-mono text-[11px] text-steel">{d.note}</div>
                      </div>
                      <span className="shrink-0 border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/70">Pendiente</span>
                    </div>
                  )) : <p className="border-b border-white/[0.07] py-5 text-sm text-steel">La documentación se entregará con la configuración final del equipo.</p>}
                  <p className="mt-6 text-[14px] leading-relaxed text-steel">
                    Toda la documentación técnica se entrega junto con el equipo en formato digital.
                  </p>
                </div>
              )}

              {tab === "Soporte" && (
                <div className="max-w-2xl">
                  <p className="text-[15px] leading-relaxed text-steel">
                    Este producto cuenta con acompañamiento técnico de Infinihon: instalación, configuración y soporte posterior.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[
                      ["Instalación", "Configuración inicial y pruebas de funcionamiento"],
                      ["Documentación", "Topología y configuraciones entregadas por escrito"],
                      ["Garantía", "Cobertura del fabricante gestionada por Infinihon"],
                      ["Soporte", "Canal directo con el equipo que implementó"],
                    ].map(([t, d]) => (
                      <div key={t} className="border border-white/[0.08] p-5">
                        <div className="text-[15px] font-bold text-snow">{t}</div>
                        <div className="mt-1.5 text-[13px] leading-relaxed text-steel">{d}</div>
                      </div>
                    ))}
                  </div>
                  <Link to="/soporte" className="mt-8 inline-flex items-center gap-2 border-b border-tech pb-1 text-[13px] font-semibold hover:text-volt">Contactar soporte →</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------- details */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <Link to={`/catalogo?cat=${p.category}`} className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-steel hover:text-snow">{categoryLabel(p.category)}</Link>
            <StatusDot s={p.status} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold uppercase leading-[1.02] tracking-tight text-snow md:text-[2.6rem]">{p.name}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-steel">{p.short}</p>

          <div className="mt-7 border-y border-white/[0.08] py-6">
            <Price product={p} size="lg" />
            <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel/70">
              {p.price === null ? "Se cotiza según configuración" : "Precio publicado · confirmar con nuestro equipo"}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-white/10">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Reducir cantidad" className="h-11 w-11 text-steel hover:text-snow">−</button>
                <span className="w-10 text-center font-mono text-[15px] text-snow">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar cantidad" className="h-11 w-11 text-steel hover:text-snow">+</button>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-steel">{statusLabel[p.status]}</span>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => add(p.slug, qty, (e.currentTarget as HTMLElement).getBoundingClientRect())}
                className={cn("group relative w-full overflow-hidden py-4 text-sm font-semibold transition-colors",
                  disabled ? "cursor-not-allowed bg-white/[0.06] text-steel" : "bg-tech text-snow hover:bg-[#1a75ff]")}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">{p.status === "soon" ? "Añadir a lista de interés" : disabled ? "Agotado" : "Agregar al carrito"}</span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => { add(p.slug, qty); navigate("/carrito"); }}
                className="w-full border border-white/15 py-4 text-sm font-semibold text-snow transition-colors hover:border-volt/60 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Comprar ahora
              </button>
              <label className="flex cursor-pointer items-center gap-2.5 pt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel hover:text-snow">
                <input type="checkbox" checked={compare.includes(p.slug)} onChange={() => toggleCompare(p.slug)} className="peer sr-only" />
                <span className={cn("flex h-4 w-4 items-center justify-center border", compare.includes(p.slug) ? "border-volt bg-tech text-snow" : "border-white/20")}>
                  {compare.includes(p.slug) && <span className="text-[9px]">✓</span>}
                </span>
                Añadir a comparación
              </label>
            </div>
          </div>

          <dl className="mt-7 space-y-3">
            {[
              ["SKU", p.sku ?? p.slug.toUpperCase()],
              ["Tecnologías", p.tech.join(" · ")],
              ["Marca", p.brand],
              ["Categoría", p.category],
              ["Uso", p.use.join(" · ")],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 border-b border-dashed border-white/[0.07] pb-2.5">
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel/70">{k}</dt>
                <dd className="text-right text-[13px] text-snow/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 border border-white/[0.08] bg-ink/50 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">¿Dudas técnicas?</div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-steel">
              Te ayudamos a validar si esta referencia es la correcta para tu entorno.
            </p>
            <Link to="/soporte" className="mt-4 inline-flex items-center gap-2 border-b border-tech pb-0.5 text-[13px] font-semibold hover:text-volt">Hablar con un experto →</Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-white/[0.08] pt-14">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Se usa junto con</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => <Reveal key={r.slug} delay={i * 60}><ProductCard p={r} /></Reveal>)}
          </div>
        </section>
      )}

      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-[70] flex items-center gap-3 border-t border-white/[0.1] bg-ink/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-snow">{p.name}</div>
          <div className="font-mono text-[11px] text-steel">{p.price === null ? "Por cotizar" : `$${((p.price ?? 0) * qty).toLocaleString("en-US")}`} · {qty}u</div>
        </div>
        <button
          disabled={disabled}
          onClick={(e) => add(p.slug, qty, (e.currentTarget as HTMLElement).getBoundingClientRect())}
          className={cn("shrink-0 px-5 py-3.5 text-[13px] font-semibold", disabled ? "bg-white/[0.06] text-steel" : "bg-tech text-snow")}
        >
          Agregar
        </button>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}
