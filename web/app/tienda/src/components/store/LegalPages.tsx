import { useState } from "react";
import { Link, navigate, useStore } from "../../store/app";
import { insights, slugify } from "../../store/catalog";
import { Breadcrumb } from "./cards";
import { HondurasMesh } from "./ProductVisual";
import { Reveal, RevealTitle } from "../ui";
import { cn } from "../../utils/cn";

/**
 * Páginas de contenido estático: legales, compra, empresa y utilidades.
 * Mismo vocabulario visual que InfoPages: bordes white/[0.08], kickers volt,
 * mono uppercase, breadcrumbs y acordeones. Nada de secciones nuevas inventadas.
 *
 * Honestidad operativa: cada documento aclara su alcance y muestra su versión.
 */

/* ------------------------------------------------------------ shared bits */

const DOCS_VERSION = "v1.0 · septiembre 2026";

function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <header className="mt-8 grid gap-8 border-b border-white/[0.08] pb-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-steel">
          <span className="text-volt">{kicker}</span> <span className="h-px w-10 bg-steel/40" />
        </div>
        <h1 className="mt-5 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-snow sm:text-5xl lg:text-[4rem]">
          {title}
        </h1>
      </div>
      <p className="max-w-md text-[14.5px] leading-relaxed text-steel lg:col-span-5">{sub}</p>
    </header>
  );
}

/** Bloques numerados estilo contrato técnico: 01 · Título → cuerpo. */
function DocSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="border-b border-white/[0.06] py-8 first:pt-0 last:border-0">
      <div className="grid gap-4 md:grid-cols-[90px_1fr]">
        <span className="font-mono text-2xl text-tech">{n}</span>
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-snow md:text-2xl">{title}</h2>
          <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-steel">{children}</div>
        </div>
      </div>
    </Reveal>
  );
}

function DocList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-[9px] h-px w-4 shrink-0 bg-volt/70" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function DocCard({ t, d }: { t: string; d: string }) {
  return (
    <div className="border border-white/[0.08] bg-ink/40 p-6">
      <h3 className="text-[15px] font-bold text-snow">{t}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{d}</p>
    </div>
  );
}

/** Aviso + contacto, cierre común de todas las páginas. */
function DocFooter({ note }: { note: string }) {
  return (
    <div className="mt-14 border border-white/[0.08] bg-ink/40 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-[13px] leading-relaxed text-steel">
          {note} ¿Dudas sobre este documento?{" "}
          <Link to="/contacto" className="text-volt hover:text-snow">Escríbenos</Link> y lo aclaramos por escrito.
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60">{DOCS_VERSION}</span>
      </div>
    </div>
  );
}

function LegalShell({ crumbs, children }: { crumbs: string[]; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ l: crumbs[0] }]} />
      {children}
      <button onClick={() => navigate("/")} className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
        ← Volver a la tienda
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- términos */

export function TerminosPage() {
  return (
    <LegalShell crumbs={["Términos"]}>
      <PageHead
        kicker="Legal"
        title="Términos y condiciones"
        sub="Las reglas del juego por escrito: qué vendemos, cómo se cotiza y qué responsabilidad asumimos. Sin letra pequeña escondida."
      />
      <div className="mt-10">
        <DocSection n="01" title="Aceptación">
          <p>
            Al usar esta tienda o solicitar una cotización aceptas estos términos. Si contratas en nombre de una empresa,
            confirmas tener facultad para obligarla. Si algo no te cuadra, escríbenos antes de operar: preferimos aclararlo
            por adelantado.
          </p>
        </DocSection>
        <DocSection n="02" title="Qué vende Infinihon">
          <DocList
            items={[
              "Hardware de redes, cómputo, almacenamiento, seguridad y energía.",
              "Servicios profesionales: diseño, implementación, monitoreo y soporte de infraestructura.",
              "Software a medida y licencias, gestionadas con el fabricante correspondiente.",
            ]}
          />
        </DocSection>
        <DocSection n="03" title="Cotizaciones y órdenes">
          <p>
            Toda compra inicia con una cotización escrita válida por 15 días naturales, que incluye precios, disponibilidad,
            envío e impuestos. Una orden solo existe cuando la cotización es aceptada por escrito y se confirma el anticipo
            pactado. Nada se despacha sin esa confirmación.
          </p>
        </DocSection>
        <DocSection n="04" title="Precios y disponibilidad">
          <p>
            Los precios se expresan en dólares estadounidenses (USD) salvo indicación distinta, y no incluyen ISV ni costos de
            envío salvo que la cotización lo indique. La disponibilidad cambia a diario: si un artículo se agota entre tu
            orden y el despacho, te contactamos para reemplazarlo, reprogramarlo o devolver el pago — tú decides.
          </p>
        </DocSection>
        <DocSection n="05" title="Entregas y riesgo">
          <p>
            El riesgo sobre los equipos pasa al cliente al momento de la entrega física en la dirección acordada. Los plazos
            son estimaciones de buena fe; importaciones y aduanas pueden desfasarlos, y ante un retraso te informamos el
            estado real, no promesas genéricas.
          </p>
        </DocSection>
        <DocSection n="06" title="Servicios profesionales">
          <DocList
            items={[
              "Alcance, entregables y ventanas de trabajo definidos por escrito antes de iniciar.",
              "Cambios de alcance se cotizan por separado; nunca sorpresivos en la factura.",
              "Garantía de instalación: 30 días para corregir defectos de configuración a cargo nuestro.",
            ]}
          />
        </DocSection>
        <DocSection n="07" title="Límites de responsabilidad">
          <p>
            Infinihon responde por sus errores de configuración y por la garantía de los equipos que vende, y no responde por
            lucro cesante, pérdida de datos sin respaldo ni fallas ajenas a lo contratado (energía eléctrica, ISP, actos de
            terceros). Recomendamos — y vendemos — respaldos y redundancia precisamente por eso.
          </p>
        </DocSection>
        <DocSection n="08" title="Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de la República de Honduras. Cualquier disputa se intenta resolver primero
            por vía directa y amable; de no ser posible, ante los tribunales competentes de Tegucigalpa, M.D.C.
          </p>
        </DocSection>
      </div>
      <DocFooter note="Documento de alcance general para la operación comercial de Infinihon." />
    </LegalShell>
  );
}

/* ------------------------------------------------------------- privacidad */

export function PrivacidadPage() {
  return (
    <LegalShell crumbs={["Privacidad"]}>
      <PageHead
        kicker="Legal"
        title="Privacidad y cookies"
        sub="Qué datos pedimos, para qué, cuánto tiempo viven y por qué esta tienda hoy no usa ni una sola cookie de seguimiento."
      />
      <div className="mt-10">
        <DocSection n="01" title="Resumen honesto">
          <p>
            El catálogo que ves es real y lo mantiene nuestro equipo, pero todavía no procesamos pagos en línea: los datos de los
            formularios no se envían a ningún servidor.
            Cuando la operación sea real, la regla no cambiará: pedimos lo mínimo, lo usamos solo para lo que lo pedimos y
            nunca lo vendemos. Eso no es un eslogan — es la arquitectura.
          </p>
        </DocSection>
        <DocSection n="02" title="Datos que recabamos">
          <DocList
            items={[
              "Contacto: nombre, correo y teléfono — para cotizar, vender y dar soporte.",
              "Facturación: razón social, RTN y dirección fiscal — para emitir comprobantes.",
              "Operación: dirección de entrega y referencias — para despachar y coordinar instalación.",
            ]}
          />
        </DocSection>
        <DocSection n="03" title="Cookies y almacenamiento local">
          <p>
            Usamos únicamente almacenamiento local del navegador para dos cosas: recordar tu carrito mientras compras y
            mantener tu sesión si inicias una. No hay cookies de publicidad, ni píxeles de seguimiento, ni terceros mirando
            por tu hombro. Puedes vaciarlas cuando quieras desde tu navegador sin romper nada.
          </p>
        </DocSection>
        <DocSection n="04" title="Terceros">
          <p>
            Solo compartimos datos con quien hace falta para completar tu operación: transportista para entregar, fabricante
            para activar garantía y banco/procesador para cobrar. Cada tercero recibe lo mínimo y bajo acuerdo de
            confidencialidad. Jamás compartimos datos con fines publicitarios.
          </p>
        </DocSection>
        <DocSection n="05" title="Tus derechos">
          <DocList
            items={[
              "Acceder a los datos que tengamos tuyos y pedir una copia.",
              "Corregirlos si están mal o pedirnos borrarlos cuando no haya obligación legal de conservarlos.",
              "Revocar el consentimiento de comunicaciones comerciales en cualquier momento, con un clic o un correo.",
            ]}
          />
        </DocSection>
        <DocSection n="06" title="Seguridad">
          <p>
            Tráfico cifrado (HTTPS), acceso restringido por roles, mínimos privilegios y respaldos. Si alguna vez existiera
            un incidente que afecte tus datos, te lo diremos de frente: qué pasó, qué datos y qué hicimos — en un plazo de 72
            horas.
          </p>
        </DocSection>
      </div>
      <DocFooter note="Política aplicable a tienda e interacciones comerciales de Infinihon." />
    </LegalShell>
  );
}

/* -------------------------------------------------------------- garantías */

export function GarantiasPage() {
  return (
    <LegalShell crumbs={["Garantías"]}>
      <PageHead
        kicker="Legal"
        title="Garantías y devoluciones"
        sub="Qué cubre el fabricante, qué cubrimos nosotros y cómo funciona un RMA sin burocracia. En equipo nuevo, la regla es simple."
      />
      <div className="mt-10">
        <DocSection n="01" title="Garantía de fabricante">
          <p>
            Todo equipo nuevo incluye la garantía oficial de su fabricante (típicamente 12 meses, algunos 24 o más). Infinihon
            gestiona el proceso por ti: recibimos el equipo, diagnosticamos, tramitamos con el fabricante y te devolvemos
            funcionando. Tú no peleas con nadie.
          </p>
        </DocSection>
        <DocSection n="02" title="Cobertura del fabricante (típica)">
          <DocList
            items={[
              "Defectos de fabricación y fallas de hardware en uso normal.",
              "No cubre: daño físico, sobretensión sin protección, líquidos, ni configuraciones fuera de especificación.",
              "Plazos de respuesta según marca; con equipos en stock local gestionamos reemplazo inmediato cuando existe.",
            ]}
          />
        </DocSection>
        <DocSection n="03" title="Garantía de instalación Infinihon">
          <p>
            Todo servicio que ejecutamos lleva 30 días de garantía de configuración: si el problema viene de algo que
            instalamos o configuramos mal, lo corregimos sin costo, a la brevedad y sin discutir. Si el problema viene de otra
            parte, lo diagnosticamos y te decimos la verdad sobre qué y quién.
          </p>
        </DocSection>
        <DocSection n="04" title="Devoluciones — equipo nuevo sin abrir">
          <DocList
            items={[
              "Ventana de 7 días naturales desde la recepción para devoluciones de equipo sin abrir y con empaque original.",
              "Reembolso por el mismo medio de pago dentro de 10 días hábiles de recibido el equipo en nuestro local.",
              "Los gastos de envío de la devolución corren por cuenta del cliente salvo que el error sea nuestro.",
            ]}
          />
        </DocSection>
        <DocSection n="05" title="Devoluciones — equipo con defecto de origen (DOA)">
          <p>
            Si un equipo llega defectuoso de fábrica, repórtalo dentro de 72 horas de recibido: lo reemplazamos por uno nuevo
            de inmediato si hay stock, o gestionamos cambio directo con el fabricante. El transporte de un DOA siempre lo
            asumimos nosotros.
          </p>
        </DocSection>
        <DocSection n="06" title="Software y servicios">
          <p>
            Las licencias de software no admiten devolución una vez activadas (política de los fabricantes, no nuestra). Los
            servicios quedan cubiertos por la garantía de instalación de la sección 03 y por el alcance escrito que firmamos
            antes de empezar.
          </p>
        </DocSection>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <DocCard t="RMA express" d="Trae tu factura y el equipo con todos sus accesorios. Diagnóstico en menos de 48 horas hábiles." />
        <DocCard t="Respaldo previo" d="Antes de entregar un equipo para garantía, haz respaldo. Nosotros te ayudamos si lo necesitas — pero tus datos son tu responsabilidad." />
        <DocCard t="Historial completo" d="Cada RMA queda documentado: fecha, falla reportada, diagnóstico y resolución. Sin misterios." />
      </div>
      <DocFooter note="Resumen operativo de las políticas de garantía; los términos completos del fabricante prevalecen en su caso." />
    </LegalShell>
  );
}

/* ----------------------------------------------------------------- envíos */

export function EnviosPage() {
  return (
    <LegalShell crumbs={["Envíos"]}>
      <PageHead
        kicker="Compra"
        title="Envíos y cobertura"
        sub="Dónde entregamos, en cuánto tiempo y con qué costo. Coordinación real, plazos honestos, cero promesas de humo."
      />
      <div className="mt-10">
        <DocSection n="01" title="Cobertura">
          <p>
            Entregamos en todo el territorio hondureño. En Tegucigalpa y zona centro la entrega puede ser el mismo día o el
            siguiente hábil; al resto del país coordinamos con transporte terrestre de confianza o paquetería nacional según
            el tamaño y valor del equipo.
          </p>
        </DocSection>
        <div className="my-10 border border-white/[0.08] bg-ink/40 p-5 md:p-8">
          <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70">Tiempos estimados</div>
          <ol className="space-y-2">
            {[
              ["Tegucigalpa · Comayagüela", "Mismo día o siguiente hábil"],
              ["San Pedro Sula · Cortés", "24 – 48 horas hábiles"],
              ["Resto del país", "1 – 3 días hábiles"],
              ["Importaciones bajo pedido", "7 – 15 días hábiles, según aduana"],
            ].map(([z, t], i) => (
              <li key={z} className="grid items-center gap-3 md:grid-cols-[220px_1fr]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-volt">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] font-bold text-snow">{z}</span>
                </div>
                <div className="relative h-10 border border-white/[0.08] bg-obsidian">
                  <span className="absolute inset-y-0 left-4 flex items-center text-[12.5px] text-steel">{t}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[12.5px] leading-relaxed text-steel/80">
            Estimaciones en días hábiles, contadas desde la confirmación del pago. Aduanas y clima pueden desfasar el último
            tramo; si eso pasa, te enteras de nosotros antes que de nadie.
          </p>
        </div>
        <DocSection n="02" title="Costos">
          <DocList
            items={[
              "Tegucigalpa: L 80 – 150 según zona, gratis en compras mayores a $500.",
              "Resto del país: cotizado en tu orden según peso y valor asegurado del equipo.",
              "Importaciones: flete internacional + trámites aduanales, siempre desglosados por escrito antes de pagar.",
            ]}
          />
        </DocSection>
        <DocSection n="03" title="Empaque y seguro">
          <p>
            Equipos sensibles viajan en empaque antiestático con protección de impacto y van asegurados por su valor
            comercial. Si algo llega golpeado, no lo firmes conforme: repórtalo ahí mismo y activamos el reclamo con el
            transportista — con tu evidencia fotográfica, el proceso es rápido.
          </p>
        </DocSection>
        <DocSection n="04" title="Recogida en local">
          <p>
            Prefieres ahorrarte el envío? Coordinamos recogida en nuestro punto en Tegucigalpa: pagas en línea o al recoger
            (según lo acordado en tu cotización) y te entregamos con tu factura física o electrónica.
          </p>
        </DocSection>
      </div>
      <DocFooter note="Zonas y tarifas vigentes para operaciones dentro de Honduras." />
    </LegalShell>
  );
}

/* ------------------------------------------------------------------ pagos */

export function PagosPage() {
  return (
    <LegalShell crumbs={["Pagos"]}>
      <PageHead
        kicker="Compra"
        title="Métodos de pago"
        sub="Cómo se paga en Infinihon: transferencia, tarjeta y efectivo, con el flujo de cotización que protege a las dos partes."
      />
      <div className="mt-10">
        <DocSection n="01" title="El flujo primero">
          <p>
            Como vendemos infraestructura — no libros — el flujo estándar es: cotización escrita → tú aceptas → anticipo →
            despacho → saldo contra entrega. Para empresas con crédito aprobado trabajamos con facturación a 30 días. Sin
            sorpresas en ninguna etapa.
          </p>
        </DocSection>
        <div className="my-10 grid gap-px bg-white/[0.07] sm:grid-cols-2">
          {[
            ["Transferencia bancaria", "Cuentas en Lempiras y Dólares a nombre de Infinihon. El más ágil para montos empresariales; el despacho se activa con el comprobante verificado."],
            ["Tarjeta de crédito / débito", "Al habilitar el pago en línea: Visa y Mastercard con procesador certificado PCI-DSS. Nunca almacenamos el número de tu tarjeta en nuestros sistemas."],
            ["Efectivo contra entrega", "Disponible en Tegucigalpa para compras menores a $300. El repartidor lleva tu factura y tu recibo."],
            ["Financiamiento empresarial", "Para proyectos de infraestructura: anticipo + hitos de entrega. Estructura acordada en la cotización, por escrito."],
          ].map(([t, d]) => (
            <div key={t} className="bg-ink/40 p-6">
              <h3 className="flex items-center gap-3 text-[15px] font-bold text-snow">
                <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                {t}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-steel">{d}</p>
            </div>
          ))}
        </div>
        <DocSection n="02" title="Facturación">
          <p>
            Facturamos conforme a la legislación hondureña: factura con RTN, desglose de ISV cuando aplica y nota de remisión
            para entregas. Si tu empresa requiere orden de compra o requisitos especiales de facturación, indícalo al aceptar
            la cotización y lo incorporamos.
          </p>
        </DocSection>
        <DocSection n="03" title="Moneda e impuestos">
          <p>
            Precios base en USD; convertimos a lempiras al tipo de cambio del día de la cotización. El ISV y cualquier arancel
            de importación se muestran desglosados — el precio que apruebas es el precio que pagas.
          </p>
        </DocSection>
        <DocSection n="04" title="Estado actual de los pagos">
          <p>
            Hoy no procesamos ningún pago en línea. Cuando activemos la pasarela real, este
            documento se actualizará con los procesadores habilitados y su certificación. Lo que ves es exactamente cómo
            funcionará.
          </p>
        </DocSection>
      </div>
      <DocFooter note="Métodos vigentes para operaciones dentro de Honduras; el estado de cada medio se indica por sección." />
    </LegalShell>
  );
}

/* -------------------------------------------------------------------- FAQ */

const FAQ_ITEMS: [string, string][] = [
  ["¿Puedo comprar sin saber qué necesito?", "Sí, y es el caso más frecuente. Cuéntanos tu problema (o tu dolor actual) y el equipo técnico define arquitectura, equipos y costo. El diagnóstico inicial por escrito no tiene costo."],
  ["¿Los precios del catálogo son finales?", "El precio publicado es de referencia. El precio final siempre llega en una cotización escrita que incluye envío e impuestos — sin sorpresas."],
  ["¿Venden a personas naturales o solo empresas?", "A ambos. La tienda atiende al técnico de casa que arma su red y a la empresa que monta su rack completo. El trato y la garantía son los mismos."],
  ["¿Qué pasa si el equipo falla después de instalarlo?", "Primero diagnóstico nuestro (remoto o en sitio según el caso). Si es garantía de fabricante, tramitamos el RMA por ti. Si es de nuestra instalación, lo corregimos gratis dentro de los 30 días de garantía."],
  ["¿Puedo pedir equipos que no aparecen en el catálogo?", "Sí. El catálogo muestra la línea base; importamos bajo pedido casi cualquier equipo de red, cómputo o energía. Pídelo por soporte y te cotizamos con tiempo de entrega real."],
  ["¿Dan soporte a infraestructura comprada en otro lado?", "Sí, con un diagnóstico inicial. Si la base está sana, la operamos; si está en riesgo, te lo decimos claro y cotizamos la corrección. No cobramos por decir verdades incómodas."],
  ["¿Trabajan fuera de Honduras?", "Proyectos internacionales se coordinan caso a caso: alcance, viaje y condiciones por escrito antes de mover un solo cable. El soporte remoto no tiene fronteras."],
  ["¿Cómo pido una cotización formal para mi empresa?", "En cualquier página, botón «Hablar con Infinihon». Recibes respuesta con alcance y precios en menos de un día hábil. Si tu caso es urgente, dilo en el mensaje y priorizamos."],
];

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <LegalShell crumbs={["Preguntas frecuentes"]}>
      <PageHead
        kicker="Ayuda"
        title="Preguntas frecuentes"
        sub="Las respuestas directas a lo que más nos preguntan. Si la tuya no está aquí, el equipo técnico responde el mismo día hábil."
      />
      <ul className="mt-10">
        {FAQ_ITEMS.map(([q, a], i) => (
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
      <div className="mt-12 border border-white/[0.08] bg-ink/40 p-6 md:p-8">
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-snow">¿Sigue tu duda?</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-steel">
          Nada supera una conversación técnica directa. Escríbenos con tu contexto y un ingeniero — no un vendedor — te responde.
        </p>
        <Link to="/contacto" className="mt-6 inline-flex bg-tech px-6 py-3.5 text-sm font-semibold hover:bg-[#1a75ff]">
          Contactar a un ingeniero <span className="font-mono">→</span>
        </Link>
      </div>
      <button onClick={() => navigate("/")} className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
        ← Volver a la tienda
      </button>
    </LegalShell>
  );
}

/* --------------------------------------------------------------- nosotros */

export function NosotrosPage() {
  return (
    <LegalShell crumbs={["Nosotros"]}>
      <PageHead
        kicker="Empresa"
        title="Infinihon, de qué va"
        sub="Somos una empresa hondureña de tecnología e infraestructura. Diseñamos, implementamos y mantenemos lo que mantiene conectadas a las empresas."
      />
      <Reveal className="mt-10 border border-white/[0.08] bg-ink/40 p-6 md:p-10">
        <RevealTitle
          as="h2"
          className="text-[9vw] font-extrabold uppercase leading-[0.94] tracking-[-0.04em] text-snow sm:text-5xl"
          lines={["Cada render", "es una promesa", "cumplida."]}
        />
        <p className="mt-7 max-w-2xl text-[15.5px] leading-relaxed text-steel">
          Infinihon nació de una frustración conocida: redes que se caen cada viernes, «expertos» que desaparecen después de
          cobrar y equipos caros mal configurados. Decidimos hacer lo contrario — ingeniería seria, documentada y con
          respaldo local, al estándar que esperarías de un proveedor internacional.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Ingeniería", "Quien te atiende es quien implementa. Sin capas de intermediarios que diluyen la responsabilidad."],
          ["Documentación", "Todo queda por escrito: diagramas, configuraciones y credenciales entregadas. Tu red es tuya."],
          ["Transparencia", "Precios, plazos y límites dichos de frente. Preferimos perder una venta que prometer humo."],
          ["Territorio", "Cobertura nacional con base en Tegucigalpa. Entendemos la realidad operativa de Honduras."],
        ].map(([t, d], i) => (
          <Reveal key={t} delay={i * 70} className="border border-white/[0.08] bg-ink/40 p-6">
            <span className="font-mono text-[10px] text-volt">/{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-4 text-lg font-bold text-snow">{t}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{d}</p>
          </Reveal>
        ))}
      </div>
      <div className="mt-12 grid gap-8 border border-white/[0.08] bg-ink/40 p-6 md:grid-cols-2 md:p-10">
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
            <span className="h-2 w-5 bg-hn" /> Identidad
          </div>
          <HondurasMesh className="mt-6 w-full" />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-2xl font-extrabold uppercase tracking-tight text-snow">Hecho en Honduras, hacia el mundo.</h3>
          <p className="mt-4 text-[14.5px] leading-relaxed text-steel">
            Operamos desde Tegucigalpa para todo el país, con coordinación internacional para importaciones y proyectos
            regionales. La misma seriedad técnica que exigirías a un proveedor en cualquier capital del mundo — con la
            cercanía de quien vive donde tú vives.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/servicios" className="border border-white/15 px-5 py-3 text-sm font-semibold hover:border-volt hover:text-volt">
              Ver servicios
            </Link>
            <Link to="/contacto" className="bg-tech px-5 py-3 text-sm font-semibold hover:bg-[#1a75ff]">
              Trabajar con nosotros
            </Link>
          </div>
        </div>
      </div>
      <button onClick={() => navigate("/")} className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
        ← Volver a la tienda
      </button>
    </LegalShell>
  );
}

/* --------------------------------------------------------------- contacto */

export function ContactoPage() {
  const [sent, setSent] = useState(false);
  const field = "w-full border border-white/10 bg-obsidian px-4 py-3 text-[14px] text-snow placeholder:text-steel/50 focus:border-volt focus:outline-none";
  const label = "block font-mono text-[10px] uppercase tracking-[0.18em] text-steel";

  return (
    <LegalShell crumbs={["Contacto"]}>
      <PageHead
        kicker="Contacto"
        title="Habla con el equipo"
        sub="Ventas, soporte, alianzas o una duda técnica suelta: aquí está cómo llegar a nosotros y qué esperar de cada canal."
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="grid gap-px bg-white/[0.07] sm:grid-cols-2">
            {[
              ["Soporte técnico", "Lunes a viernes, 8:00–17:00. Casos urgentes con SLA contratado tienen línea prioritaria 24/7."],
              ["Ventas y cotizaciones", "Respuesta en menos de un día hábil. Cuanto más contexto nos des, más precisa sale la cotización."],
              ["WhatsApp comercial", "Para consultas rápidas y seguimiento de órdenes. Nada de bots: contesta gente del equipo."],
              ["Alianzas y proveedores", "Fabricantes, integradores y distribuidores: escríbenos directamente con tu propuesta."],
            ].map(([t, d]) => (
              <div key={t} className="bg-ink/40 p-6">
                <h3 className="flex items-center gap-3 text-[15px] font-bold text-snow">
                  <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                  {t}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-white/[0.08] bg-ink/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70">Base de operaciones</div>
            <p className="mt-3 text-[15px] font-bold text-snow">Tegucigalpa, M.D.C. — Honduras</p>
            <p className="mt-1.5 text-[13.5px] text-steel">
              Visitas con cita previa. Escríbenos y coordinamos: nos gusta mostrar la operación, no solo la web.
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-5">
              <span className="h-2 w-5 bg-hn" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Atención técnica desde Honduras</span>
            </div>
          </div>
        </div>
        <div className="border border-white/[0.09] bg-ink/60 p-6 md:p-8 lg:self-start">
          {sent ? (
            <div className="py-10 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">Mensaje registrado</div>
              <p className="mt-4 text-2xl font-bold">Gracias. Te contactaremos.</p>
              <p className="mt-2 text-[14px] text-steel">Este formulario todavía no envía mensajes a ningún servidor.</p>
              <button onClick={() => setSent(false)} className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
                ← Escribir otro
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="grid gap-5"
              aria-label="Formulario de contacto"
            >
              <label className="block"><span className={label}>Nombre *</span><input required className={cn(field, "mt-2.5")} placeholder="Tu nombre" /></label>
              <label className="block"><span className={label}>Email *</span><input required type="email" className={cn(field, "mt-2.5")} placeholder="tu@empresa.com" /></label>
              <label className="block">
                <span className={label}>Motivo *</span>
                <select required className={cn(field, "mt-2.5 [&>option]:bg-ink")} defaultValue="">
                  <option value="" disabled>Selecciona</option>
                  <option>Cotización de equipos</option>
                  <option>Servicios de infraestructura</option>
                  <option>Soporte técnico</option>
                  <option>Alianzas / distribuidores</option>
                  <option>Otro</option>
                </select>
              </label>
              <label className="block">
                <span className={label}>Mensaje *</span>
                <textarea required rows={5} className={cn(field, "mt-2.5 resize-none")} placeholder="Contexto, problema o pregunta. Detalla lo que puedas: mejor respuesta, menos ida y vuelta." />
              </label>
              <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                <p className="text-[12px] leading-relaxed text-steel">Aún sin envío real. Tus datos no salen del navegador.</p>
                <button type="submit" className="shrink-0 bg-tech px-6 py-3.5 text-sm font-semibold hover:bg-[#1a75ff]">
                  Enviar <span className="font-mono">→</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <button onClick={() => navigate("/")} className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
        ← Volver a la tienda
      </button>
    </LegalShell>
  );
}

/* ------------------------------------------------------- mis solicitudes */

interface Solicitud {
  id: string;
  ref: string;
  fecha: string;
  items: string;
  estado: "cotizando" | "confirmada" | "en tránsito" | "completada";
}

/**
 * Sin backend de pedidos en la tienda: no se inventan solicitudes. El carrito
 * activo y el estado vacío real son la única información mostrada aquí.
 */
const ESTADO_STYLE: Record<Solicitud["estado"], string> = {
  cotizando: "text-amber-400/90 border-amber-400/30",
  confirmada: "text-volt border-volt/40",
  "en tránsito": "text-tech border-tech/40",
  completada: "text-emerald-400/90 border-emerald-400/30",
};

export function SolicitudesPage() {
  const { cartLines, subtotal } = useStore();
  const pendientes: Solicitud[] = [];
  const historial: Solicitud[] = [];

  return (
    <LegalShell crumbs={["Mis solicitudes"]}>
      <PageHead
        kicker="Cuenta"
        title="Mis solicitudes"
        sub="Todo lo que has pedido o marcado como interés, en un solo lugar. Sin correos perdidos ni estados misteriosos."
      />

      {cartLines.length > 0 && (
        <Reveal className="mt-10 border border-volt/40 bg-volt/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">Carrito activo</div>
              <p className="mt-1.5 text-[15px] font-bold text-snow">
                {cartLines.length} {cartLines.length === 1 ? "artículo" : "artículos"} · {subtotal === null ? "por cotizar" : `$${subtotal.toLocaleString("en-US")}`}
              </p>
            </div>
            <Link to="/carrito" className="bg-tech px-5 py-3 text-sm font-semibold hover:bg-[#1a75ff]">
              Ir al carrito <span className="font-mono">→</span>
            </Link>
          </div>
        </Reveal>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-snow">En proceso</h2>
        {pendientes.length === 0 ? (
          <p className="mt-4 border border-white/[0.08] bg-ink/40 p-6 text-[14px] text-steel">Nada en proceso. Cuando solicites una cotización o una lista de interés, aparecerá aquí.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {pendientes.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 60} className="grid items-center gap-4 border border-white/[0.08] bg-ink/40 p-5 md:grid-cols-[130px_1fr_auto]">
                <div>
                  <div className="font-mono text-[11px] text-tech">{s.ref}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/60">{s.fecha}</div>
                </div>
                <div className="text-[14.5px] font-semibold text-snow">{s.items}</div>
                <span className={cn("justify-self-start border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] md:justify-self-end", ESTADO_STYLE[s.estado])}>
                  {s.estado}
                </span>
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-snow">Historial</h2>
        {historial.length === 0 ? (
          <p className="mt-4 border border-white/[0.08] bg-ink/40 p-6 text-[14px] text-steel">
            Sin historial todavía. Las solicitudes que envíes desde tu cuenta aparecerán aquí.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {historial.map((s) => (
              <li key={s.id} className="grid items-center gap-4 border border-white/[0.08] bg-ink/40 p-5 md:grid-cols-[130px_1fr_auto]">
                <div>
                  <div className="font-mono text-[11px] text-tech">{s.ref}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/60">{s.fecha}</div>
                </div>
                <div className="text-[14.5px] font-semibold text-snow">{s.items}</div>
                <span className={cn("justify-self-start border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] md:justify-self-end", ESTADO_STYLE[s.estado])}>
                  {s.estado}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DocFooter note="El catálogo viene de nuestra base de datos; los formularios de esta página aún no se envían al servidor." />
    </LegalShell>
  );
}

/* ------------------------------------------------------------ seguimiento */

const ETAPAS = ["Orden confirmada", "En preparación", "En tránsito", "Entregado"] as const;

export function SeguimientoPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = (c: string) => {
    if (!c.trim()) return;
    setResult(null);
    setNotFound(true);
  };

  // sin backend de pedidos: nunca se muestra un estado simulado
  const etapa = 0;

  return (
    <LegalShell crumbs={["Seguimiento"]}>
      <PageHead
        kicker="Cuenta"
        title="Seguimiento de pedido"
        sub="El estado real de tu orden, sin llamar a nadie. Escribe el código de tu solicitud y mira dónde está."
      />
      <form
        onSubmit={(e) => { e.preventDefault(); lookup(code); }}
        className="mt-10 flex flex-col gap-3 sm:flex-row"
        aria-label="Consultar estado de pedido"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SOL-2026-0148"
          aria-label="Código de solicitud"
          className="flex-1 border border-white/10 bg-obsidian px-4 py-3.5 font-mono text-[14px] uppercase tracking-[0.08em] text-snow placeholder:text-steel/40 focus:border-volt focus:outline-none"
        />
        <button type="submit" className="bg-tech px-8 py-3.5 text-sm font-semibold hover:bg-[#1a75ff]">
          Consultar <span className="font-mono">→</span>
        </button>
      </form>
      <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-steel/60">
        El seguimiento en línea todavía no está conectado
      </p>

      {notFound && (
        <div className="mt-8 border border-amber-400/30 bg-amber-400/5 p-6">
          <p className="text-[14.5px] font-bold text-snow">No encontramos ese código.</p>
          <p className="mt-1.5 text-[13.5px] text-steel">
            Verifica el código de tu confirmación o <Link to="/contacto" className="text-volt hover:text-snow">escríbenos</Link> con tu factura a la mano.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 border border-white/[0.08] bg-ink/40 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
            <div>
              <div className="font-mono text-[11px] text-tech">{result}</div>
              <p className="mt-1 text-[15px] font-bold text-snow">1× Router MikroTik · 1× Switch 8p</p>
            </div>
            <span className="border border-tech/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-tech">
              en tránsito
            </span>
          </div>
          <ol className="mt-6 space-y-0">
            {ETAPAS.map((e, i) => (
              <li key={e} className="relative flex gap-4 pb-7 last:pb-0">
                {i < ETAPAS.length - 1 && (
                  <span className={cn("absolute left-[7px] top-5 h-full w-px", i < etapa ? "bg-tech" : "bg-white/10")} />
                )}
                <span
                  className={cn(
                    "relative mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border-2",
                    i < etapa ? "border-tech bg-tech" : i === etapa ? "border-volt bg-obsidian shadow-[0_0_12px_rgba(0,168,255,0.5)]" : "border-white/20 bg-obsidian",
                  )}
                />
                <div>
                  <p className={cn("text-[14.5px] font-bold", i <= etapa ? "text-snow" : "text-steel/60")}>{e}</p>
                  {i === etapa && (
                    <p className="mt-1 text-[13px] text-steel">Salida del almacén: hoy · ETA Tegucigalpa: mañana antes de mediodía.</p>
                  )}
                  {i < etapa && <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel/50">completado</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <DocFooter note="El seguimiento en producción se conectará al sistema logístico; esta vista muestra el diseño final." />
    </LegalShell>
  );
}

/* ----------------------------------------------------- insight (detalle) */

export function InsightPage({ slug }: { slug: string }) {
  const idx = insights.findIndex((n) => slugify(n.t) === slug);
  const item = insights[idx];

  if (!item) {
    return (
      <LegalShell crumbs={["Insights"]}>
        <PageHead kicker="Infinihon Tech" title="Artículo no encontrado" sub="Ese contenido no existe o cambió de dirección." />
        <Link to="/insights" className="mt-10 inline-flex bg-tech px-6 py-3.5 text-sm font-semibold hover:bg-[#1a75ff]">
          Ver todos los artículos <span className="font-mono">→</span>
        </Link>
      </LegalShell>
    );
  }

  const CUERPO: Record<number, { h: string; p: string }[]> = {
    0: [
      { h: "El problema: todos en la misma red", p: "En una red plana, la laptop de contabilidad, la cámara de seguridad y el teléfono del receptionista comparten el mismo dominio de broadcast. Un dispositivo comprometido o un equipo con malware puede ver (y atacar) a todos los demás. La segmentación con VLANs resuelve esto separando el tráfico lógicamente, sin comprar más cableado." },
      { h: "Paso 1 · Define dominios por función, no por persona", p: "Empieza con cuatro VLANs base: administración (tus equipos de gestión), usuarios, seguridad (cámaras, control de acceso) e invitados. La regla: si un conjunto de dispositivos necesita hablar entre sí, va junto; si no necesita, va separado. Documenta cada VLAN con su propósito antes de tocar el switch." },
      { h: "Paso 2 · Subinterfaces y trunking en el router", p: "El router (o firewall) termina cada VLAN en una subinterfaz y el switch la distribuye por un trunk 802.1Q. En MikroTik esto es un bridge con VLAN filtering — potente pero fino: un error en el bridge puede dejarte fuera de tu propio equipo. Hazlo con acceso físico cerca." },
      { h: "Paso 3 · Firewall entre VLANs: negar por defecto", p: "La segmentación sin control de tráfico es decoración. La política sana: desde usuarios se puede salir a Internet, pero no llegar a la VLAN de administración; invitados solo Internet; cámaras solo hablan con su NVR. Aclara cada regla y su razón — la documentación de hoy es el incidente evitado de mañana." },
      { h: "Paso 4 · DHCP y reglas de oro", p: "Un servidor DHCP por VLAN, rangos reservados documentados, y las impresoras/Equipos compartidos en la VLAN que menos duela si se caen. Y la regla de oro: cambia la VLAN de gestión a una no por defecto antes de exponer cualquier servicio." },
      { h: "Cómo sabemos que funcionó", p: "Prueba de la verdad: desde la VLAN de invitados intenta alcanzar la VLAN de administración. Debe fallar. Hazlo cada que cambies algo y anótalo. Si quieres que lo revisemos con ojos de ingeniero, el diagnóstico inicial es gratis." },
    ],
    1: [
      { h: "La pregunta mal hecha", p: "«¿Cuál es más potente?» es la pregunta incorrecta. La correcta: ¿cuál falla de la forma menos dolorosa para MI carga? Un cluster de placas (K3s, Raspberry/mini-PCs) y un servidor tradicional resuelven problemas distintos con modos de falla opuestos." },
      { h: "Cluster de placas: donde brilla", p: "Aprendizaje (romper y rebuild en 20 minutos), servicios tolerantes a fallos (DNS, monitoreo, dashboards), y laboratorios de despliegue. Si un nodo muere, el servicio migra. El costo inicial es bajo y el consumo eléctrico, ridículo. Pero: almacenamiento distribuido es su punto débil, y el rendimiento por nodo individual es modesto." },
      { h: "Servidor tradicional: donde brilla", p: "Bases de datos reales, virtualización con almacenamiento local rápido (NVMe), cargas que puden memoria y RAM de una sola máquina. Un solo punto de falla — sí — pero con UPS, respaldos y hardware enterprise, esa falla es gestionable. El costo por vatio y por TB suele favorecerlo." },
      { h: "El patrón que recomendamos", p: "Híbrido honesto: un servidor pequeño serio para lo crítico (datos, dominio, respaldos) + cluster mini para servicios y experimentos. Lo mejor de ambos mundos sin hipotecar el presupuesto. Si tu caso puro es uno de los dos, te lo diremos — no vendemos el híbrido por inercia." },
    ],
    2: [
      { h: "Antes de abrir un solo puerto", p: "Publicar un servicio a Internet es abrir la puerta de tu oficina a la calle entera. Este es el checklist que ejecutamos antes de cualquier exposición, aprendido a base de auditorías." },
      { h: "1 · Inventario del servicio", p: "¿Qué versión corre? ¿Qué puertos usa REALMENTE (no los que dice la documentación)? ¿Depende de algo interno (base de datos, Active Directory)? Un servicio expuesto sin conocer sus dependencias es un mapa del tesoro regalado." },
      { h: "2 · Actualización y hardening", p: "Parches al día, cuentas por defecto eliminadas, TLS con certificado válido (Let's Encrypt existe para eso), headers de seguridad configurados. Si el software no ha tenido actualización en 18 meses, piénsalo dos veces." },
      { h: "3 · Exposición mínima", p: "Regla de oro: nada se publica directo; todo pasa por el firewall con regla explícita origen→destino→puerto. Geobloqueo cuando el servicio es local. Autenticación en capa frontal (fail2ban, WAF básico) para servicios sensibles." },
      { h: "4 · Observabilidad antes de abrir", p: "Logs centralizados, alerta por intentos fallidos repetidos y un dashboard del servicio. El día que algo raro pasa, la diferencia entre «saber en 5 minutos» y «enterarse el viernes» es si hiciste esta parte." },
      { h: "5 · Plan de cierre", p: "¿Cómo se apaga esto en una emergencia? Una regla de firewall que deshabilita el acceso en 10 segundos, documentada y probada. El botón rojo se instala antes de encender la luz, no después del incendio." },
    ],
  };

  return (
    <LegalShell crumbs={["Insights"]}>
      <article className="mx-auto max-w-[760px]">
        <header className="mt-8 border-b border-white/[0.08] pb-10">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
            <span className="text-volt">{item.c}</span>
            <span className="h-px w-6 bg-steel/40" />
            <span>{item.r} de lectura</span>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-snow md:text-5xl">{item.t}</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-steel">{item.d}</p>
        </header>

        <div className="mt-10 space-y-9">
          {(CUERPO[idx] ?? []).map((sec, i) => (
            <Reveal as="section" key={sec.h} delay={i * 50}>
              <h2 className="flex gap-3 text-xl font-extrabold tracking-tight text-snow md:text-2xl">
                <span className="font-mono text-[12px] text-tech">{String(i + 1).padStart(2, "0")}</span>
                {sec.h}
              </h2>
              <p className="mt-3 pl-8 text-[15px] leading-relaxed text-steel">{sec.p}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 border border-white/[0.08] bg-ink/40 p-6 md:p-8">
          <h3 className="text-lg font-extrabold uppercase tracking-tight text-snow">¿Y si alguien lo implementa por ti?</h3>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-steel">
            Este artículo es la teoría; nosotros vivimos de la práctica. Diagnóstico inicial sin costo, propuesta escrita,
            implementación documentada.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contacto" className="bg-tech px-6 py-3.5 text-sm font-semibold hover:bg-[#1a75ff]">Hablar con un ingeniero</Link>
            <Link to="/insights" className="border border-white/15 px-6 py-3.5 text-sm font-semibold hover:border-volt hover:text-volt">Más artículos</Link>
          </div>
        </div>
      </article>
    </LegalShell>
  );
}

/* ------------------------------------------------------- índice insights */

export function InsightsIndexPage() {
  return (
    <LegalShell crumbs={["Insights"]}>
      <PageHead
        kicker="Infinihon Tech"
        title="Guías y comparativas"
        sub="Escrito por el equipo que implementa, no por un redactor de contenidos. Sin humo, con checklists aplicables."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {insights.map((n, i) => {
          const slug = slugify(n.t);
          return (
            <Reveal key={n.t} delay={i * 70}>
              <Link to={`/insights/${slug}`} className="group flex h-full flex-col border border-white/[0.07] bg-ink/50 p-7 transition-colors duration-500 hover:border-tech/70">
                <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel">
                  <span className="text-volt">{n.c}</span>
                  <span>{n.r}</span>
                </div>
                <h3 className="mt-5 text-2xl font-bold leading-snug text-snow transition-colors group-hover:text-volt">{n.t}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-steel">{n.d}</p>
                <span className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/60 transition-colors group-hover:text-volt">
                  Leer artículo →
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
      <button onClick={() => navigate("/")} className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-steel hover:text-snow">
        ← Volver a la tienda
      </button>
    </LegalShell>
  );
}
