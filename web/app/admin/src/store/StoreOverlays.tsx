import { useEffect, useMemo, useState, type FormEvent } from "react";
import { cn } from "../utils/cn";
import type { CartLine, CatalogProduct } from "./data";
import { products, services } from "./data";
import { ProductVisual, TechIcon } from "./StoreVisuals";

function useEscape(onClose: () => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="flex h-10 w-10 items-center justify-center border border-white/10 text-steel transition-colors hover:border-volt hover:text-snow" aria-label="Cerrar"><TechIcon name="close" /></button>;
}

export function SearchOverlay({ onClose, onOpenProduct, onContact }: { onClose: () => void; onOpenProduct: (p: CatalogProduct) => void; onContact: () => void }) {
  const [query, setQuery] = useState("");
  useEscape(onClose);
  const clean = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!clean) return products.slice(0, 4);
    return products.filter((p) => [p.name, p.category, p.description, p.use, ...p.technologies].join(" ").toLowerCase().includes(clean));
  }, [clean]);
  const serviceResults = useMemo(() => clean ? services.filter((s) => [s.title, s.short, ...s.tags].join(" ").toLowerCase().includes(clean)) : services.slice(0, 3), [clean]);
  return (
    <div className="fixed inset-0 z-[80] bg-obsidian/90 p-4 backdrop-blur-xl sm:p-8" role="dialog" aria-modal="true" aria-label="Buscar en tienda">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4">
          <TechIcon name="search" className="h-6 w-6 text-volt" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar productos, soluciones o servicios..." className="min-w-0 flex-1 border-0 bg-transparent py-4 text-xl font-semibold text-snow outline-none placeholder:text-steel/50 md:text-2xl" />
          <CloseButton onClick={onClose} />
        </div>
        <div className="border-t border-white/[0.08] pt-7">
          <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-steel"><span className="text-snow">Sugerencias:</span>{["MikroTik", "VPN", "Cloud", "Kubernetes", "Monitorización"].map((s) => <button key={s} onClick={() => setQuery(s)} className="border border-white/10 px-2 py-1 transition-colors hover:border-volt hover:text-snow">{s}</button>)}</div>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <section>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Productos de referencia · {results.length}</div>
              <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {results.length ? results.map((p) => <button key={p.id} onClick={() => { onOpenProduct(p); onClose(); }} className="group flex w-full items-center gap-4 py-4 text-left"><div className="h-14 w-20 shrink-0 overflow-hidden border border-white/10 bg-ink"><ProductVisual kind={p.visual} compact /></div><div><div className="font-bold text-snow transition-colors group-hover:text-volt">{p.name}</div><div className="mt-1 text-sm text-steel">{p.category} · {p.status}</div></div><span className="ml-auto text-steel group-hover:text-volt">→</span></button>) : <div className="py-10 text-sm text-steel">No encontramos una referencia para “{query}”. Prueba con una tecnología, categoría o servicio.</div>}
              </div>
            </section>
            <section>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Servicios relacionados · {serviceResults.length}</div>
              <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {serviceResults.length ? serviceResults.map((s) => <button key={s.id} onClick={() => { onClose(); onContact(); }} className="group flex w-full items-start gap-4 py-4 text-left"><span className="font-mono text-xs text-tech">{s.number}</span><div><div className="font-bold text-snow transition-colors group-hover:text-volt">{s.title}</div><div className="mt-1 text-sm leading-relaxed text-steel">{s.short}</div></div><span className="ml-auto pt-1 text-steel group-hover:text-volt">→</span></button>) : <div className="py-10 text-sm text-steel">No encontramos servicios relacionados. Nuestro equipo puede orientar tu caso.</div>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ product, onClose, onAdd, onContact }: { product: CatalogProduct; onClose: () => void; onAdd: (p: CatalogProduct) => void; onContact: () => void }) {
  const [image, setImage] = useState(0);
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-obsidian/95 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={`Detalle de ${product.name}`}>
      <div className="mx-auto max-w-[1440px] px-5 py-5 md:px-10 md:py-8">
        <div className="mb-8 flex items-center justify-between"><button onClick={onClose} className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-steel transition-colors hover:text-snow">← Volver a la tienda</button><CloseButton onClick={onClose} /></div>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden border border-white/[0.08] bg-ink"><ProductVisual kind={product.visual} className="aspect-[1.35/1] w-full" /></div>
            <div className="mt-3 flex gap-3">
              {[0,1,2].map((v) => <button key={v} onClick={() => setImage(v)} aria-label={`Vista ${v+1}`} className={cn("h-14 w-20 overflow-hidden border transition-colors", image === v ? "border-volt" : "border-white/10 hover:border-white/30")}><ProductVisual kind={product.visual} compact className={cn("h-full w-full", v === 1 && "scale-110", v === 2 && "scale-125")} /></button>)}
            </div>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-steel/50">Visual ilustrativo de referencia · no representa una fotografía o modelo comercial.</p>
          </div>
          <div className="lg:col-span-5 lg:pt-6">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-steel"><span>{product.category}</span><span className="border border-volt/40 px-2 py-1 text-volt">{product.badge || "Referencia"}</span></div>
            <h2 className="mt-6 text-5xl font-extrabold uppercase leading-[.92] tracking-[-.045em] md:text-6xl">{product.name}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel">{product.description}</p>
            <div className="mt-8 flex items-center justify-between border-y border-white/[0.08] py-4"><div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Precio</div><div className="mt-1 text-xl font-bold text-snow">Bajo cotización</div></div><div className="text-right"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Estado</div><div className="mt-1 text-sm font-semibold text-snow"><span className="mr-2 h-1.5 w-1.5 inline-block rounded-full bg-volt" />{product.status}</div></div></div>
            <p className="mt-4 text-sm leading-relaxed text-steel">Catálogo de demostración: precio, disponibilidad, marca, garantía y ficha técnica se confirman antes de cualquier compra.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={() => onAdd(product)} className="inline-flex items-center justify-center gap-2 bg-tech px-5 py-4 text-sm font-semibold transition-colors hover:bg-[#1a75ff]"><TechIcon name="cart" />Añadir a solicitud</button><button onClick={onContact} className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-4 text-sm font-semibold transition-colors hover:border-volt hover:bg-white/[0.03]">Solicitar cotización <span>→</span></button></div>
          </div>
        </div>
        <div className="mt-20 grid gap-12 border-t border-white/[0.08] pt-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Contexto de uso</div><h3 className="mt-4 text-3xl font-extrabold">Construido para decidir con contexto.</h3><p className="mt-4 text-[15px] leading-relaxed text-steel">{product.use} Nuestro equipo valida compatibilidad y dimensionamiento antes de recomendar un producto concreto.</p></div>
          <div className="lg:col-span-7 lg:col-start-6"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Especificaciones y documentación</div><div className="mt-5 border-y border-white/[0.08]">{product.specLabels.map((l) => <div key={l} className="grid grid-cols-2 border-b border-white/[0.07] py-4 text-sm last:border-b-0"><span className="font-semibold text-snow">{l}</span><span className="text-steel">Pendiente de catálogo real</span></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="border border-white/[0.08] p-4"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">Compatibilidad</div><div className="mt-2 text-sm text-snow">A confirmar con el proyecto</div></div><div className="border border-white/[0.08] p-4"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">Documentación</div><div className="mt-2 text-sm text-snow">A publicar con catálogo</div></div><div className="border border-white/[0.08] p-4"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">Soporte</div><div className="mt-2 text-sm text-snow">Consultar al equipo</div></div></div></div>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer({ open, onClose, items, onChangeQty, onRemove, onCheckout }: { open: boolean; onClose: () => void; items: CartLine[]; onChangeQty: (id: string, qty: number) => void; onRemove: (id: string) => void; onCheckout: () => void }) {
  const quantity = items.reduce((a, x) => a + x.quantity, 0);
  return <><div onClick={onClose} className={cn("fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")} /><aside className={cn("fixed inset-y-0 right-0 z-[75] flex w-full max-w-[500px] flex-col border-l border-white/[0.08] bg-obsidian shadow-2xl transition-transform duration-500", open ? "translate-x-0" : "translate-x-full")} aria-label="Carrito de consulta">
    <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5 md:px-7"><div><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Carrito de consulta</div><h2 className="mt-1 text-2xl font-extrabold">{quantity ? `${quantity} referencia${quantity !== 1 ? "s" : ""}` : "Sin referencias"}</h2></div><CloseButton onClick={onClose} /></div>
    {items.length ? <><div className="flex-1 overflow-y-auto px-5 md:px-7">{items.map((line) => <div key={line.product.id} className="flex gap-4 border-b border-white/[0.08] py-5"><div className="h-20 w-24 shrink-0 overflow-hidden border border-white/10 bg-ink"><ProductVisual kind={line.product.visual} compact /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><div className="font-bold text-snow">{line.product.name}</div><div className="mt-1 text-xs text-steel">{line.product.category} · Precio por cotizar</div></div><button onClick={() => onRemove(line.product.id)} className="font-mono text-xs text-steel transition-colors hover:text-snow" aria-label={`Eliminar ${line.product.name}`}>×</button></div><div className="mt-4 flex items-center justify-between"><div className="flex items-center border border-white/10"><button onClick={() => onChangeQty(line.product.id, line.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-steel hover:text-snow" aria-label="Reducir cantidad"><TechIcon name="minus" className="h-3.5 w-3.5" /></button><span className="w-7 text-center font-mono text-xs">{line.quantity}</span><button onClick={() => onChangeQty(line.product.id, line.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-steel hover:text-snow" aria-label="Aumentar cantidad"><TechIcon name="plus" className="h-3.5 w-3.5" /></button></div><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">Por confirmar</span></div></div></div>)}</div><div className="border-t border-white/[0.08] bg-ink px-5 py-5 md:px-7"><div className="flex justify-between text-sm"><span className="text-steel">Subtotal</span><span className="font-semibold">Se confirma al cotizar</span></div><div className="mt-3 flex justify-between text-sm"><span className="text-steel">Envío e impuestos</span><span className="font-semibold">No calculados</span></div><p className="mt-5 border-t border-white/[0.08] pt-4 text-[13px] leading-relaxed text-steel">Este carrito genera una solicitud. No hay pagos, inventario ni envío conectados todavía.</p><button onClick={onCheckout} className="mt-5 flex w-full items-center justify-center gap-3 bg-tech py-4 text-sm font-semibold transition-colors hover:bg-[#1a75ff]">Continuar solicitud <span>→</span></button></div></> : <div className="flex flex-1 flex-col items-center justify-center px-10 text-center"><div className="grid h-16 w-16 place-items-center border border-white/10 text-volt"><TechIcon name="cart" className="h-8 w-8" /></div><h3 className="mt-6 text-2xl font-extrabold uppercase leading-tight">Tu infraestructura aún no tiene nada.</h3><p className="mt-4 max-w-xs text-sm leading-relaxed text-steel">Explora la tienda y añade referencias para preparar una conversación con el equipo.</p><a onClick={onClose} href="#tienda" className="mt-7 bg-tech px-5 py-3 text-sm font-semibold">Explorar productos</a></div>}
  </aside></>;
}

export function CheckoutOverlay({ items, onClose, onDone }: { items: CartLine[]; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  useEscape(onClose);
  const steps = ["Información", "Envío", "Pago", "Confirmación"];
  const submit = (e: FormEvent) => { e.preventDefault(); if (step < 2) setStep(step + 1); else { setDone(true); onDone(); } };
  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-obsidian p-5 md:p-10" role="dialog" aria-modal="true" aria-label="Solicitud de compra"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Solicitud de compra · entorno demostrativo</div><CloseButton onClick={onClose} /></div><div className="mt-10 grid grid-cols-4 border-y border-white/[0.08] py-4">{steps.map((s, i) => <div key={s} className={cn("border-l border-white/[0.08] pl-3 first:border-l-0", i <= step ? "text-snow" : "text-steel/50")}><div className="font-mono text-[10px] text-tech">0{i+1}</div><div className="mt-1 text-xs font-semibold sm:text-sm">{s}</div></div>)}</div>{done ? <div className="py-20 text-center"><div className="font-mono text-xs uppercase tracking-[0.22em] text-volt">Solicitud preparada</div><h2 className="mt-5 text-4xl font-extrabold uppercase tracking-tight">El siguiente paso es humano.</h2><p className="mx-auto mt-5 max-w-lg text-steel">No se procesó ningún pago ni se enviaron datos: este flujo es una demostración preparada para integrarse con catálogo, envío y pagos reales.</p><a href="#soporte" onClick={onClose} className="mt-9 inline-flex bg-tech px-6 py-4 text-sm font-semibold">Hablar con InfiniHon</a></div> : <form onSubmit={submit} className="mt-12"><div className="grid gap-6 md:grid-cols-2"><label><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{step === 0 ? "Nombre" : step === 1 ? "Ubicación" : "Método"}</span>{step === 2 ? <div className="mt-3 border border-white/[0.08] p-4 text-sm text-steel">Los métodos de pago se conectarán al habilitar la tienda en producción. Ningún pago se procesa en esta demostración.</div> : <input required className="mt-2 w-full border-0 border-b border-white/15 bg-transparent py-3 text-snow outline-none focus:border-volt" placeholder={step === 0 ? "Tu nombre" : "Ciudad / país"} />}</label><label><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{step === 0 ? "Email" : step === 1 ? "Dirección" : "Condiciones"}</span>{step === 2 ? <div className="mt-3 border border-white/[0.08] p-4 text-sm text-steel">Precio, disponibilidad, envío e impuestos se confirman con una cotización antes de cualquier transacción.</div> : <input required type={step === 0 ? "email" : "text"} className="mt-2 w-full border-0 border-b border-white/15 bg-transparent py-3 text-snow outline-none focus:border-volt" placeholder={step === 0 ? "tu@empresa.com" : "Dirección a confirmar"} />}</label></div><div className="mt-12 border-t border-white/[0.08] pt-5"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Referencias incluidas</div><div className="mt-3 flex flex-wrap gap-2">{items.map((x) => <span key={x.product.id} className="border border-white/10 px-3 py-2 text-sm">{x.quantity}× {x.product.name}</span>)}</div></div><div className="mt-10 flex justify-between"><button type="button" onClick={() => step ? setStep(step-1) : onClose()} className="px-4 py-3 text-sm text-steel hover:text-snow">{step ? "← Atrás" : "Cancelar"}</button><button className="bg-tech px-6 py-4 text-sm font-semibold">{step < 2 ? "Continuar" : "Preparar solicitud"} →</button></div></form>}</div></div>;
}

export function CompareOverlay({ items, onClose, onOpenProduct }: { items: CatalogProduct[]; onClose: () => void; onOpenProduct: (p: CatalogProduct) => void }) {
  useEscape(onClose);
  const rows = ["Categoría", "Uso recomendado", "Tecnologías", "Precio", "Disponibilidad", "Ficha técnica"];
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-obsidian/95 p-5 backdrop-blur-xl md:p-10" role="dialog" aria-modal="true" aria-label="Comparar referencias"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Comparación</div><h2 className="mt-2 text-3xl font-extrabold">Referencias de catálogo</h2></div><CloseButton onClick={onClose} /></div><p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">La comparación muestra únicamente información de referencia disponible. Las especificaciones comerciales se agregan cuando el catálogo real esté conectado.</p><div className="mt-10 overflow-x-auto border border-white/[0.08]"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-white/[0.08]"><th className="w-44 p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">Referencia</th>{items.map((p) => <th key={p.id} className="min-w-56 p-5 align-top"><div className="h-24 overflow-hidden border border-white/10 bg-ink"><ProductVisual kind={p.visual} compact /></div><button onClick={() => {onClose(); onOpenProduct(p);}} className="mt-3 text-left text-lg font-bold hover:text-volt">{p.name}</button></th>)}</tr></thead><tbody>{rows.map((r) => <tr key={r} className="border-b border-white/[0.07] last:border-b-0"><th className="p-5 font-mono text-[10px] uppercase tracking-[0.16em] text-steel">{r}</th>{items.map((p) => <td key={p.id} className="p-5 text-sm leading-relaxed text-snow/90">{r === "Categoría" ? p.category : r === "Uso recomendado" ? p.use : r === "Tecnologías" ? p.technologies.join(" · ") : r === "Precio" ? "Bajo cotización" : r === "Disponibilidad" ? p.status : "Pendiente de catálogo real"}</td>)}</tr>)}</tbody></table></div></div></div>;
}

/** Interface ready for a CRM or email adapter. It deliberately never claims to send data. */
export function ContactOverlay({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  useEscape(onClose);
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setSent(true); };
  const field = "mt-2 w-full border-0 border-b border-white/15 bg-transparent py-3 text-snow outline-none placeholder:text-steel/50 focus:border-volt";
  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-obsidian/95 p-5 backdrop-blur-xl md:p-10" role="dialog" aria-modal="true" aria-label="Solicitar asesoría"><div className="mx-auto max-w-2xl"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">INFINIHON / solicitud técnica</div><CloseButton onClick={onClose} /></div>{sent ? <div className="py-24 text-center"><div className="font-mono text-xs uppercase tracking-[0.22em] text-volt">Interfaz preparada</div><h2 className="mt-5 text-4xl font-extrabold uppercase tracking-tight">La solicitud no se envió.</h2><p className="mx-auto mt-5 max-w-xl text-steel">Este formulario está listo para conectarse a correo, CRM o soporte. Actualmente no almacena ni transmite datos para no simular una operación comercial activa.</p><button onClick={onClose} className="mt-9 bg-tech px-6 py-4 text-sm font-semibold">Volver a la tienda</button></div> : <><h2 className="mt-12 text-5xl font-extrabold uppercase leading-[.9] tracking-[-.045em] md:text-6xl">Hablemos de tu<br /><span className="text-steel">infraestructura.</span></h2><p className="mt-6 max-w-xl text-[15px] leading-relaxed text-steel">Cuéntanos el contexto. En producción, este brief puede llegar al equipo técnico, a un CRM o a un sistema de soporte.</p><form onSubmit={submit} className="mt-12 grid gap-x-10 gap-y-7 md:grid-cols-2"><label><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Nombre</span><input required className={field} placeholder="Tu nombre" /></label><label><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Email</span><input required type="email" className={field} placeholder="tu@empresa.com" /></label><label><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Empresa</span><input className={field} placeholder="Nombre de la empresa" /></label><label><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Interés</span><select className={field + " [&>option]:bg-ink"} defaultValue="Redes y conectividad"><option>Redes y conectividad</option><option>Cloud y DevOps</option><option>Servidores y almacenamiento</option><option>Seguridad</option><option>Monitorización</option><option>Soporte tecnológico</option></select></label><label className="md:col-span-2"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Contexto</span><textarea required rows={4} className={field + " resize-none"} placeholder="Ej.: necesitamos conectar sedes, revisar nuestro firewall o definir una plataforma de monitorización..." /></label><div className="flex flex-col justify-between gap-4 border-t border-white/[0.08] pt-6 md:col-span-2 md:flex-row md:items-center"><p className="max-w-md text-[12px] leading-relaxed text-steel">Demostración sin backend: no se enviará ni guardará esta información.</p><button className="bg-tech px-6 py-4 text-sm font-semibold">Preparar solicitud →</button></div></form></>}</div></div>;
}