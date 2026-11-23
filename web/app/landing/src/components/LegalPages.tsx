import type { ReactNode } from "react";
import { Reveal, RevealTitle, SectionLabel } from "./ui";
import { CONTACT_EMAIL } from "./ContactForm";
import { NetBackdrop } from "./NetBackdrop";

/** Fecha de última actualización mostrada en cada documento legal. Un solo
    lugar para cambiarla cuando se revise el contenido. */
const DOCS_UPDATED = "17 de noviembre de 2026";

function LegalHead({ index, kicker, lines, sub }: { index: string; kicker: string; lines: string[]; sub: string }) {
  return (
    <header className="mx-auto max-w-4xl text-center">
      <Reveal>
        <SectionLabel index={index} className="justify-center">
          {kicker}
        </SectionLabel>
      </Reveal>
      <RevealTitle
        as="h1"
        className="mx-auto mt-8 max-w-3xl text-[11vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
        lines={lines}
        accentLast
      />
      <Reveal delay={250} className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-steel">
        {sub}
      </Reveal>
      <Reveal delay={350} className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
        Última actualización: <span className="text-volt">{DOCS_UPDATED}</span>
      </Reveal>
    </header>
  );
}

/** Bloque numerado estilo "contrato técnico": 01 · Título → cuerpo. */
function LegalSection({ n, title, children }: { n: string; title: string; children: ReactNode }) {
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

function LegalList({ items }: { items: string[] }) {
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

/** Aviso + contacto, cierre común de las tres páginas. */
function LegalFooter() {
  return (
    <div className="mt-14 border border-white/[0.08] bg-ink/40 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-[13px] leading-relaxed text-steel">
          Este documento es informativo y no sustituye asesoría legal formal. ¿Dudas sobre su contenido?
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="shrink-0 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-volt transition-colors hover:text-snow"
        >
          {CONTACT_EMAIL} →
        </a>
      </div>
    </div>
  );
}

function LegalShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-obsidian">
      <div className="absolute inset-0 -z-10 mask-radial opacity-80">
        <NetBackdrop />
      </div>
      <div className="absolute left-1/2 top-[22%] -z-10 h-[55vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[150px]" />
      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-48">{children}</div>
    </section>
  );
}

/* ================================================================== */

export function TerminosPage() {
  return (
    <LegalShell>
      <LegalHead
        index="01"
        kicker="Legal"
        lines={["Términos y", "condiciones."]}
        sub="Las reglas de uso de este sitio y de los servicios de InfiniHon Corp. Al navegar o contratar con nosotros, aceptas lo siguiente."
      />
      <div className="mx-auto mt-16 max-w-3xl md:mt-20">
        <LegalSection n="01" title="Aceptación de los términos">
          <p>
            Al acceder a infinihon.vercel.app, a nuestra tienda digital, o contratar cualquiera de nuestros servicios
            de infraestructura, redes, nube o soporte técnico, aceptas estos términos en su totalidad. Si no estás de
            acuerdo con alguna parte, te pedimos no utilizar el sitio ni nuestros servicios.
          </p>
        </LegalSection>
        <LegalSection n="02" title="Quiénes somos">
          <p>
            InfiniHon Corp. es una empresa hondureña de infraestructura tecnológica con sede en Tegucigalpa,
            Francisco Morazán. Diseñamos, implementamos y damos soporte a soluciones de red, nube, monitoreo y
            seguridad para empresas e instituciones en Honduras.
          </p>
        </LegalSection>
        <LegalSection n="03" title="Uso permitido del sitio">
          <LegalList
            items={[
              "Consultar información de servicios, proyectos y productos de forma personal o para evaluar una contratación.",
              "Crear una cuenta y utilizar el panel de cliente para gestionar pedidos, soporte y facturación.",
              "Comprar productos y servicios a través de la tienda digital, sujeto a disponibilidad y verificación.",
            ]}
          />
        </LegalSection>
        <LegalSection n="04" title="Lo que no está permitido">
          <LegalList
            items={[
              "Intentar vulnerar, escanear o sobrecargar nuestra infraestructura, APIs o sistemas de autenticación.",
              "Reproducir, revender o distribuir el contenido del sitio sin autorización escrita.",
              "Usar cuentas falsas, suplantar identidad o proporcionar información de pago fraudulenta.",
              "Usar el sitio o los servicios para fines ilegales bajo la legislación hondureña o internacional aplicable.",
            ]}
          />
        </LegalSection>
        <LegalSection n="05" title="Cuentas de usuario">
          <p>
            Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda actividad
            realizada desde tu cuenta. Notifícanos de inmediato ante cualquier uso no autorizado.
          </p>
        </LegalSection>
        <LegalSection n="06" title="Contrataciones y pagos">
          <p>
            Los precios, alcances y tiempos de entrega de servicios de infraestructura se formalizan en una
            cotización o contrato específico. Los productos de la tienda digital se rigen por la orden de compra
            generada al momento del checkout, incluyendo impuestos aplicables según la ley hondureña.
          </p>
        </LegalSection>
        <LegalSection n="07" title="Propiedad intelectual">
          <p>
            El diseño, código, marca, logotipo "InfiniHon Corp." y los contenidos de este sitio son propiedad de
            InfiniHon Corp. o se usan bajo licencia. Ninguna disposición aquí te otorga derechos sobre ellos salvo
            autorización expresa.
          </p>
        </LegalSection>
        <LegalSection n="08" title="Limitación de responsabilidad">
          <p>
            Trabajamos para mantener la disponibilidad e integridad de nuestros servicios, pero no garantizamos que
            el sitio esté libre de interrupciones o errores. En la medida permitida por la ley, InfiniHon Corp. no
            será responsable por daños indirectos derivados del uso del sitio.
          </p>
        </LegalSection>
        <LegalSection n="09" title="Cambios a estos términos">
          <p>
            Podemos actualizar estos términos para reflejar cambios en nuestros servicios o en la normativa
            aplicable. La fecha de "última actualización" al inicio de este documento indica la versión vigente.
          </p>
        </LegalSection>
        <LegalSection n="10" title="Ley aplicable">
          <p>Estos términos se rigen por las leyes de la República de Honduras.</p>
        </LegalSection>
        <LegalFooter />
      </div>
    </LegalShell>
  );
}

export function PrivacidadPage() {
  return (
    <LegalShell>
      <LegalHead
        index="02"
        kicker="Legal"
        lines={["Política de", "privacidad."]}
        sub="Cómo recopilamos, usamos y protegemos tus datos personales cuando usas nuestro sitio, tienda o servicios."
      />
      <div className="mx-auto mt-16 max-w-3xl md:mt-20">
        <LegalSection n="01" title="Qué datos recopilamos">
          <LegalList
            items={[
              "Datos de contacto: nombre, correo electrónico, teléfono y empresa, cuando escribes por el formulario de contacto o te registras.",
              "Datos de cuenta: credenciales de acceso, historial de pedidos y preferencias dentro del panel de cliente.",
              "Datos de pago: procesados por nuestros proveedores de pasarela; no almacenamos números de tarjeta completos en nuestros servidores.",
              "Datos técnicos: dirección IP, tipo de dispositivo y navegador, con fines de seguridad y mejora del servicio.",
            ]}
          />
        </LegalSection>
        <LegalSection n="02" title="Para qué usamos tus datos">
          <LegalList
            items={[
              "Responder consultas y dar seguimiento a cotizaciones o soporte.",
              "Procesar compras, entregas y facturación en la tienda digital.",
              "Gestionar tu cuenta y mantener segura tu sesión.",
              "Enviar comunicaciones relevantes sobre tu pedido o servicio contratado (no spam).",
              "Cumplir obligaciones legales y fiscales aplicables en Honduras.",
            ]}
          />
        </LegalSection>
        <LegalSection n="03" title="Con quién compartimos datos">
          <p>
            No vendemos tus datos personales. Los compartimos únicamente con proveedores que nos ayudan a operar
            (procesadores de pago, hospedaje, mensajería de entrega) bajo acuerdos de confidencialidad, o cuando la
            ley lo exige.
          </p>
        </LegalSection>
        <LegalSection n="04" title="Cómo protegemos tu información">
          <p>
            Aplicamos controles técnicos y organizativos razonables — cifrado en tránsito, control de acceso y
            monitoreo — para proteger tus datos frente a accesos no autorizados, pérdida o uso indebido.
          </p>
        </LegalSection>
        <LegalSection n="05" title="Tus derechos">
          <p>
            Puedes solicitar acceso, corrección o eliminación de tus datos personales, así como retirar tu
            consentimiento para comunicaciones de marketing, escribiéndonos a nuestro correo de contacto.
          </p>
        </LegalSection>
        <LegalSection n="06" title="Conservación de datos">
          <p>
            Conservamos tus datos mientras tu cuenta esté activa o mientras sea necesario para cumplir fines
            legales, contables o de atención al cliente, y luego los eliminamos o anonimizamos de forma segura.
          </p>
        </LegalSection>
        <LegalSection n="07" title="Menores de edad">
          <p>Nuestros servicios están dirigidos a empresas y personas mayores de edad; no recopilamos a sabiendas datos de menores.</p>
        </LegalSection>
        <LegalSection n="08" title="Cambios a esta política">
          <p>Podemos actualizar esta política periódicamente. La fecha de "última actualización" refleja la versión vigente.</p>
        </LegalSection>
        <LegalFooter />
      </div>
    </LegalShell>
  );
}

export function CookiesPage() {
  return (
    <LegalShell>
      <LegalHead
        index="03"
        kicker="Legal"
        lines={["Política de", "cookies."]}
        sub="Qué cookies y tecnologías similares usamos en este sitio, y cómo puedes controlarlas."
      />
      <div className="mx-auto mt-16 max-w-3xl md:mt-20">
        <LegalSection n="01" title="Qué es una cookie">
          <p>
            Una cookie es un pequeño archivo que un sitio web guarda en tu navegador para recordar información entre
            visitas, como tu sesión de cuenta o preferencias de visualización.
          </p>
        </LegalSection>
        <LegalSection n="02" title="Cookies que usamos">
          <LegalList
            items={[
              "Esenciales: necesarias para iniciar sesión, mantener tu carrito y navegar de forma segura. No se pueden desactivar.",
              "Preferencias: recuerdan tu tema (claro/oscuro) y otras configuraciones de interfaz.",
            ]}
          />
          <p className="mt-4">
            Actualmente no usamos cookies ni herramientas de analítica o publicidad de terceros. Si en el futuro
            incorporamos alguna, la añadiremos a esta lista antes de activarla y actualizaremos la fecha de esta
            página.
          </p>
        </LegalSection>
        <LegalSection n="03" title="Cómo controlar las cookies">
          <p>
            Puedes administrar o bloquear cookies desde la configuración de tu navegador. Ten en cuenta que
            desactivar las cookies esenciales puede impedir funciones como el inicio de sesión o el carrito de
            compras.
          </p>
        </LegalSection>
        <LegalSection n="04" title="Cambios a esta política">
          <p>Podemos actualizar esta política de cookies; la fecha de "última actualización" refleja la versión vigente.</p>
        </LegalSection>
        <LegalFooter />
      </div>
    </LegalShell>
  );
}
