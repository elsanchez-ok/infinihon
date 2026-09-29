import { useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { bySlug, categoryLabel, products, registerOrder } from "../../store/catalog";
import { ProductVisual } from "./ProductVisual";
import { Breadcrumb, EmptyState, StatusDot } from "./cards";
import { cn } from "../../utils/cn";

/* ------------------------------------------------------------- cart page */

export function CartPage() {
  const { cartLines, setQty, remove, subtotal, clear, cartCount } = useStore();

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-14 md:px-8">
        <Breadcrumb items={[{ l: "Carrito" }]} />
        <div className="mt-10">
          <EmptyState
            icon={<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 6h16l-1.4 11.2A2 2 0 0 1 16.6 19H7.4a2 2 0 0 1-2-1.8z" /><path d="M9 6V4.8A3 3 0 0 1 15 4.8V6" /></svg>}
            title="Tu infraestructura aún no tiene nada."
            text="Explora nuestra tienda y encuentra tecnología para construir lo que sigue."
            cta="Explorar productos"
            onCta={() => navigate("/catalogo")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Carrito" }]} />
      <header className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-8">
        <h1 className="text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[3.6rem]">Carrito</h1>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">{cartCount} {cartCount === 1 ? "artículo" : "artículos"}</span>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {/* header row (desktop) */}
          <div className="hidden grid-cols-[1fr_130px_120px_90px] gap-4 border-b border-white/[0.08] pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60 md:grid">
            <span>Producto</span><span>Cantidad</span><span className="text-right">Precio</span><span className="text-right">Subtotal</span>
          </div>

          <ul>
            {cartLines.map(({ product: p, qty }) => (
              <li key={p.slug} className="grid grid-cols-[88px_1fr] gap-4 border-b border-white/[0.07] py-6 md:grid-cols-[1fr_130px_120px_90px] md:items-center md:gap-4">
                <div className="col-span-2 flex gap-4 md:col-span-1">
                  <Link to={`/producto/${p.slug}`} className="h-20 w-24 shrink-0 border border-white/[0.07] bg-obsidian">
                    <ProductVisual visual={p.visual} uid={`cp-${p.slug}`} className="h-full w-full" />
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/producto/${p.slug}`} className="text-[15.5px] font-bold text-snow hover:text-volt">{p.name}</Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                      <span>{categoryLabel(p.category)}</span><span className="text-white/15">·</span><StatusDot s={p.status} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-steel">{p.short}</p>
                    <button onClick={() => remove(p.slug)} className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel underline decoration-white/20 underline-offset-4 hover:text-snow">
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="col-start-2 flex items-center md:col-start-2">
                  <div className="flex items-center border border-white/10">
                    <button onClick={() => setQty(p.slug, qty - 1)} aria-label="Reducir cantidad" className="h-10 w-10 text-steel hover:text-snow">−</button>
                    <span className="w-9 text-center font-mono text-[13px] text-snow">{qty}</span>
                    <button onClick={() => setQty(p.slug, qty + 1)} aria-label="Aumentar cantidad" className="h-10 w-10 text-steel hover:text-snow">+</button>
                  </div>
                </div>

                <div className="col-start-2 md:col-start-3 md:text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel/60 md:hidden">Precio</div>
                  <span className="font-mono text-[13.5px] text-snow">{p.price === null ? "Por cotizar" : `$${p.price.toLocaleString("en-US")}`}</span>
                </div>
                <div className="col-start-2 md:col-start-4 md:text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel/60 md:hidden">Subtotal</div>
                  <span className="font-mono text-[13.5px] text-volt">{p.price === null ? "—" : `$${(p.price * qty).toLocaleString("en-US")}`}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link to="/catalogo" className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">← Seguir explorando</Link>
            <button onClick={clear} className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">Vaciar carrito</button>
          </div>
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-white/[0.09] bg-ink/60 p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-snow">Resumen</h2>
            <dl className="mt-5 space-y-3 font-mono text-[12.5px]">
              <div className="flex justify-between"><dt className="text-steel">Subtotal</dt><dd className="text-snow">{subtotal === null ? "Por definir" : `$${subtotal.toLocaleString("en-US")}`}</dd></div>
              <div className="flex justify-between"><dt className="text-steel">Envío</dt><dd className="text-steel">Se calcula al cotizar</dd></div>
              <div className="flex justify-between"><dt className="text-steel">Impuestos</dt><dd className="text-steel">Según jurisdicción</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.08] pt-5">
              <span className="text-[15px] font-bold">Total</span>
              <span className="font-mono text-[17px] text-snow">{subtotal === null ? "A definir" : `$${subtotal.toLocaleString("en-US")}`}</span>
            </div>

            <Link to="/checkout" className="mt-6 flex items-center justify-center gap-2 bg-tech py-4 text-sm font-semibold text-snow transition-colors hover:bg-[#1a75ff]">
              Continuar compra <span className="font-mono">→</span>
            </Link>

            <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-steel/70">
              <div className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-amber-400" />Pago sin procesar en línea</div>
              <p className="normal-case tracking-normal text-steel">
                No hay pasarela de pagos conectada. La integración con Stripe, PayPal o transferencia se activa en producción.
              </p>
            </div>
          </div>

          <div className="mt-4 border border-white/[0.08] bg-obsidian/50 p-5">
            <p className="text-[13px] leading-relaxed text-steel">
              ¿Tu compra incluye instalación o configuración? Los servicios se cotizan por alcance y se pueden agregar al mismo pedido.
            </p>
            <Link to="/servicios" className="mt-3 inline-block border-b border-tech pb-0.5 text-[12.5px] font-semibold hover:text-volt">Ver servicios →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- checkout */

const STEPS = ["Información", "Envío", "Pago", "Confirmación"];
const PAY = [
  { id: "card", l: "Tarjeta", note: "Stripe · no conectado" },
  { id: "paypal", l: "PayPal", note: "No conectado" },
  { id: "transfer", l: "Transferencia bancaria", note: "Requiere confirmación manual" },
];

export function CheckoutPage() {
  const { cartLines, subtotal, clear, notify } = useStore();
  const [step, setStep] = useState(0);
  const [pay, setPay] = useState("transfer");
  const [err, setErr] = useState<string | null>(null);
  const [orderId] = useState(() => "IH-" + Math.random().toString(36).slice(2, 7).toUpperCase());

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-14 md:px-8">
        <Breadcrumb items={[{ l: "Checkout" }]} />
        <div className="mt-10">
          <EmptyState title="No hay nada que procesar." text="Agrega productos al carrito para continuar con la compra." cta="Explorar productos" onCta={() => navigate("/catalogo")} />
        </div>
      </div>
    );
  }

  const field = "w-full border border-white/10 bg-obsidian px-4 py-3 text-[14px] text-snow placeholder:text-steel/50 focus:border-volt focus:outline-none";
  const label = "block font-mono text-[10px] uppercase tracking-[0.18em] text-steel";

  const next = async () => {
    const f = document.getElementById("co-form") as HTMLFormElement | null;
    if (f && step < 3) {
      const activeStep = f.querySelector(`[data-checkout-step="${step}"]`);
      const invalid = [...(activeStep?.querySelectorAll("input,select,textarea") ?? [])].some((el) => (el as HTMLInputElement).required && !(el as HTMLInputElement).checkValidity());
      if (invalid) { f.reportValidity(); return; }
    }
    if (step === 2) {
      // Collect form data
      const formData = new FormData(f!);
      const nombre = formData.get("nombre") as string;
      const empresa = formData.get("empresa") as string;
      const email = formData.get("email") as string;
      const tel = formData.get("tel") as string;
      const rtn = formData.get("rtn") as string;
      const dir = formData.get("dir") as string;
      const ciudad = formData.get("ciudad") as string;
      const dep = formData.get("dep") as string;
      const met = formData.get("met") as string;
      const notas = formData.get("notas") as string;

      // Build order payload
      const payload = {
        id: orderId,
        customerId: email, // use email as customer identifier
        items: cartLines.map(({ product: p, qty }) => ({ productId: p.slug, qty })),
        status: "Pending",
        notes: [
          `Cliente: ${nombre}`,
          empresa ? `Empresa: ${empresa}` : null,
          `Email: ${email}`,
          `Teléfono: ${tel}`,
          rtn ? `RTN: ${rtn}` : null,
          `Dirección: ${dir}, ${ciudad}, ${dep}`,
          `Método de entrega: ${met}`,
          `Método de pago: ${PAY.find((x) => x.id === pay)?.l ?? pay}`,
          notas ? `Notas: ${notas}` : null,
        ].filter(Boolean).join("\n"),
        created_at: new Date().toISOString(),
      };

      // Register order in Supabase
      const success = await registerOrder(payload);
      if (success) {
        clear();
        setStep(3);
        notify("Solicitud registrada (referencia " + orderId + ")", "Tu pedido se ha guardado en el servidor. Nuestro equipo te contactará para confirmar precio, entrega y forma de pago.", "info");
      } else {
        setErr("No se pudo registrar el pedido en el servidor. Verifica tu conexión e inténtalo de nuevo.");
      }
      return;
    }
    setErr(null);
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Carrito", to: "/carrito" }, { l: "Checkout" }]} />

      {/* stepper */}
      <ol className="mt-10 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="relative">
            <div className={cn("h-px w-full transition-colors duration-500", i <= step ? "bg-tech" : "bg-white/12")} />
            <div className="mt-3 flex items-baseline gap-2">
              <span className={cn("font-mono text-[11px]", i <= step ? "text-volt" : "text-steel/50")}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("text-[12px] font-semibold uppercase tracking-wide", i <= step ? "text-snow" : "text-steel/50")}>{s}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <form id="co-form" onSubmit={(e) => e.preventDefault()} className="min-w-0">
          <section data-checkout-step="0" hidden={step !== 0}>
              <h2 className="text-2xl font-extrabold uppercase tracking-tight">Información</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="block"><span className={label}>Nombre completo *</span><input required name="nombre" autoComplete="name" className={cn(field, "mt-2.5")} placeholder="Tu nombre" /></label>
                <label className="block"><span className={label}>Empresa</span><input name="empresa" autoComplete="organization" className={cn(field, "mt-2.5")} placeholder="Razón social" /></label>
                <label className="block"><span className={label}>Email *</span><input required type="email" name="email" autoComplete="email" className={cn(field, "mt-2.5")} placeholder="tu@empresa.com" /></label>
                <label className="block"><span className={label}>Teléfono *</span><input required type="tel" name="tel" autoComplete="tel" className={cn(field, "mt-2.5")} placeholder="+504 0000 0000" /></label>
                <label className="block sm:col-span-2"><span className={label}>RTN / identificación fiscal</span><input name="rtn" className={cn(field, "mt-2.5")} placeholder="Opcional, para facturación" /></label>
              </div>
          </section>

          <section data-checkout-step="1" hidden={step !== 1}>
              <h2 className="text-2xl font-extrabold uppercase tracking-tight">Envío</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className={label}>Dirección de entrega *</span><input required name="dir" autoComplete="street-address" className={cn(field, "mt-2.5")} placeholder="Calle, número, edificio" /></label>
                <label className="block"><span className={label}>Ciudad *</span><input required name="ciudad" autoComplete="address-level2" className={cn(field, "mt-2.5")} placeholder="Ciudad" /></label>
                <label className="block"><span className={label}>Departamento *</span>
                  <select required name="dep" className={cn(field, "mt-2.5 [&>option]:bg-ink")} defaultValue="">
                    <option value="" disabled>Selecciona</option>
                    {["Francisco Morazán", "Cortés", "Atlántida", "Choluteca", "Olancho", "Comayagua", "Otro"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label className="block"><span className={label}>Método</span>
                  <select name="met" className={cn(field, "mt-2.5 [&>option]:bg-ink")}>
                    <option>Entrega en domicilio</option><option>Recoger en oficina</option><option>Envío a sede fuera de Honduras</option>
                  </select>
                </label>
                <label className="block"><span className={label}>Notas</span><input name="notas" className={cn(field, "mt-2.5")} placeholder="Horario, referencias…" /></label>
              </div>
              <p className="mt-6 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-steel/70">
                Tarifas de envío definidas al confirmar la orden · cobertura nacional
              </p>
          </section>

          <section data-checkout-step="2" hidden={step !== 2}>
              <h2 className="text-2xl font-extrabold uppercase tracking-tight">Pago</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-steel">
                Selecciona el método con el que prefieres pagar. Todavía no procesamos cobros en línea: la referencia se usa para cotizar.
              </p>
              <div className="mt-7 space-y-2.5">
                {PAY.map((m) => (
                  <label key={m.id} className={cn("flex cursor-pointer items-center gap-4 border p-4 transition-colors", pay === m.id ? "border-tech bg-hn/25" : "border-white/10 hover:border-white/25")}>
                    <input type="radio" name="pay" value={m.id} checked={pay === m.id} onChange={() => setPay(m.id)} className="sr-only" />
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", pay === m.id ? "border-volt" : "border-white/25")}>
                      {pay === m.id && <span className="h-2 w-2 rounded-full bg-volt" />}
                    </span>
                    <span className="flex-1 text-[14.5px] font-semibold text-snow">{m.l}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel/70">{m.note}</span>
                  </label>
                ))}
              </div>
              {pay === "card" && (
                <div className="mt-6 border border-white/[0.08] bg-obsidian/60 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-400/80">Integración pendiente</div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-steel">
                    El formulario de tarjeta se conecta a Stripe en producción. Aquí no se solicita ningún dato de pago.
                  </p>
                </div>
              )}
              {err && <p className="mt-5 border border-amber-400/40 bg-amber-400/10 p-4 font-mono text-[12px] text-amber-200">{err}</p>}
          </section>

          {step === 3 && (
            <section data-checkout-step="3">
              <div className="border border-tech/40 bg-hn/20 p-6 md:p-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">Confirmación · solicitud registrada</div>
                <h2 className="mt-5 text-3xl font-extrabold uppercase leading-tight tracking-tight">Solicitud registrada.</h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-steel">
                  Referencia <span className="font-mono text-snow">{orderId}</span>. Tu pedido se ha guardado en el servidor. Nuestro equipo te contactará para confirmar precio, entrega y forma de pago.
                </p>
                <dl className="mt-7 grid gap-4 border-t border-white/[0.1] pt-6 sm:grid-cols-3">
                  {[["Método", PAY.find((x) => x.id === pay)?.l ?? ""], ["Artículos", `${cartLines.length}`], ["Total", subtotal === null ? "A definir" : `$${subtotal.toLocaleString("en-US")}`]].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel/70">{k}</dt>
                      <dd className="mt-1 text-[15px] font-bold text-snow">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => { clear(); navigate("/catalogo"); }} className="bg-tech px-6 py-4 text-sm font-semibold hover:bg-[#1a75ff]">Seguir explorando</button>
                <Link to="/soporte" className="border border-white/15 px-6 py-4 text-center text-sm font-semibold hover:border-volt/60">Contactar a Infinihon</Link>
              </div>
            </section>
          )}

          {step < 3 && (
            <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => (step === 0 ? navigate("/carrito") : setStep(step - 1))} className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
                ← {step === 0 ? "Volver al carrito" : "Anterior"}
              </button>
              <button type="button" onClick={next} className="bg-tech px-8 py-4 text-sm font-semibold text-snow hover:bg-[#1a75ff]">
                {step === 2 ? "Confirmar orden" : "Continuar"} <span className="font-mono">→</span>
              </button>
            </div>
          )}
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-white/[0.09] bg-ink/60 p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-snow">Tu pedido</h2>
            <ul className="mt-5 space-y-4">
              {cartLines.map(({ product: p, qty }) => (
                <li key={p.slug} className="flex gap-3">
                  <span className="h-12 w-16 shrink-0 border border-white/[0.06] bg-obsidian">
                    <ProductVisual visual={p.visual} uid={`k-${p.slug}`} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-snow">{p.name}</span>
                    <span className="block font-mono text-[11px] text-steel">{qty} × {p.price === null ? "cotizar" : `$${p.price.toLocaleString("en-US")}`}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-white/[0.08] pt-5">
              <span className="text-[14px] font-bold">Total</span>
              <span className="font-mono text-[14px] text-snow">{subtotal === null ? "A definir" : `$${subtotal.toLocaleString("en-US")}`}</span>
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-steel/60">
            Pendiente · sin procesamiento de pagos en línea
          </p>
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- compare */

export function ComparePage() {
  const { compare, toggleCompare, clearCompare } = useStore();
  const items = compare.map((s) => bySlug(s)).filter(Boolean) as typeof products;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-14 md:px-8">
        <Breadcrumb items={[{ l: "Comparar" }]} />
        <div className="mt-10">
          <EmptyState
            icon={<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 7h16M4 12h10M4 17h6" /></svg>}
            title="Nada seleccionado para comparar."
            text="Marca la casilla “Comparar” en cualquier producto del catálogo para ver sus especificaciones lado a lado."
            cta="Ir al catálogo"
            onCta={() => navigate("/catalogo")}
          />
        </div>
      </div>
    );
  }

  const rows: { k: string; f: (p: typeof products[number]) => React.ReactNode }[] = [
    { k: "Precio", f: (p) => <span className="font-mono text-[13px]">{p.price === null ? "Por cotizar" : `$${p.price.toLocaleString("en-US")}`}</span> },
    { k: "Estado", f: (p) => <StatusDot s={p.status} /> },
    { k: "Categoría", f: (p) => <span className="font-mono text-[12px] uppercase tracking-wide text-steel">{categoryLabel(p.category)}</span> },
    { k: "Uso recomendado", f: (p) => <span className="text-[13px] text-steel">{p.use.join(" · ")}</span> },
    { k: "Tecnologías", f: (p) => <span className="flex flex-wrap gap-1">{p.tech.map((t) => <span key={t} className="border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-steel">{t}</span>)}</span> },
    { k: "Compatibilidad", f: (p) => <span className="text-[13px] text-steel">{p.compat.join(" · ")}</span> },
    ...items[0].specs.map((s) => ({
      k: s.k,
      f: (p: typeof products[number]) => <span className="text-[13px] text-snow/90">{p.specs.find((x) => x.k === s.k)?.v ?? "—"}</span>,
    })),
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: "Comparar" }]} />
      <header className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-8">
        <h1 className="text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[3.4rem]">Comparación</h1>
        <button onClick={clearCompare} className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">Limpiar selección</button>
      </header>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <caption className="sr-only">Comparación de productos seleccionados</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[160px] border-b border-white/[0.1] pb-4 text-left align-bottom font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60">
                {items.length} / 4
              </th>
              {items.map((p) => (
                <th key={p.slug} scope="col" className="border-b border-white/[0.1] pb-4 pl-5 text-left align-bottom">
                  <div className="relative">
                    <Link to={`/producto/${p.slug}`} className="block border border-white/[0.07] bg-obsidian">
                      <ProductVisual visual={p.visual} uid={`cm-${p.slug}`} className="aspect-[4/3] w-full" />
                    </Link>
                    <button onClick={() => toggleCompare(p.slug)} aria-label={`Quitar ${p.name}`} className="absolute right-2 top-2 border border-white/15 bg-obsidian/80 px-2 py-1 font-mono text-[10px] text-steel hover:text-snow">✕</button>
                  </div>
                  <Link to={`/producto/${p.slug}`} className="mt-3 block text-[16px] font-bold leading-snug text-snow hover:text-volt">{p.name}</Link>
                  <Link to={`/producto/${p.slug}`} className="mt-2 inline-block border border-white/12 px-3 py-1.5 text-[11.5px] font-semibold hover:border-volt/60">Ver producto</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.k} className={cn(i % 2 && "bg-white/[0.015]")}>
                <th scope="row" className="border-b border-white/[0.07] py-4 pr-4 text-left align-top font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel">{r.k}</th>
                {items.map((p) => <td key={p.slug} className="border-b border-white/[0.07] py-4 pl-5 align-top">{r.f(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-steel/60">
        Comparativa con especificaciones sincronizadas del catálogo
      </p>
    </div>
  );
}
