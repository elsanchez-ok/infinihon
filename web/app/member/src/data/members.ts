/** Datos de los miembros del equipo — para añadir uno nuevo, agrega un objeto y su ruta /member/<id> queda lista. */
export interface Member {
  /** ID de la URL: /member/<id> */
  id: string;
  name: string;
  handle: string;
  role: string;
  roleEn: string;
  location: string;
  bio: string;
  status: string;
  focus: string[];
  duties: { title: string; desc: string }[];
  links: { label: string; href: string; note?: string }[];
  initials: string;
}

export const MEMBER: Member = {
  id: "elsanchezok",
  name: "El Sanchez",
  handle: "elsanchezok",
  role: "Fundador & CEO",
  roleEn: "Founder & CEO",
  location: "Tegucigalpa, Honduras",
  bio: "Fundé INFINIHON con una convicción simple: las empresas hondureñas merecen infraestructura tecnológica del mismo nivel que cualquier empresa del mundo — diseñada con criterio, implementada con disciplina y protegida de verdad. Hoy lidero la estrategia técnica y comercial: defino cómo diseñamos una red, cómo migramos un servidor o cómo blindamos un negocio, y me aseguro de que lo que prometemos sea exactamente lo que entregamos.",
  status: "Disponible para proyectos y alianzas",
  focus: [
    "Arquitectura de redes corporativas",
    "Virtualización y servidores",
    "Ciberseguridad aplicada",
    "Estrategia y dirección técnica",
  ],
  duties: [
    { title: "Dirección técnica", desc: "Define los estándares de diseño e implementación de cada proyecto de infraestructura que entrega INFINIHON." },
    { title: "Relación con clientes", desc: "Acompaña personalmente las cotizaciones clave y las decisiones técnicas de mayor impacto." },
    { title: "Alianzas", desc: "Construye las relaciones con fabricantes, distribuidores y partners que hacen posible el catálogo." },
    { title: "Operación", desc: "Responsable de que el equipo tenga lo que necesita para ejecutar con calidad, en tiempo y forma." },
  ],
  links: [
    { label: "Instagram", href: "https://instagram.com/elsanchezok", note: "@elsanchezok" },
    { label: "GitHub", href: "https://github.com/elsanchez-ok", note: "elsanchez-ok" },
    { label: "Email corporativo", href: "mailto:contacto@infinihon.com", note: "contacto@infinihon.com" },
    { label: "INFINIHON — sitio oficial", href: "https://infinihon.vercel.app/", note: "infinihon.vercel.app" },
    { label: "Tienda INFINIHON", href: "https://infinihon.vercel.app/tienda", note: "Catálogo y equipamiento" },
  ],
  initials: "ES",
};

export const byId = (id: string) => (id === MEMBER.id ? MEMBER : undefined);
