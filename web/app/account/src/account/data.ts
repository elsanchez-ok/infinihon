/**
 * INFINIHON — Portal de usuario.
 *
 * Regla de honestidad: este archivo NO contiene datos de ningún usuario real.
 * No hay pedidos, servicios contratados, facturas, documentos ni organizaciones:
 * esas colecciones empiezan vacías y se llenan cuando exista un backend.
 *
 * Lo único precargado es el catálogo PÚBLICO de servicios de InfiniHon
 * (información de marketing, no datos privados) para que "Favoritos" tenga sentido.
 */

export type ServiceStatus = "Activo" | "Pendiente" | "En pausa" | "Completado" | "Cancelado";
export type OrderStatus = "Pendiente" | "En proceso" | "Enviado" | "Completado" | "Cancelado";
export type RequestStatus = "Enviada" | "En revisión" | "En progreso" | "Esperándote" | "Completada" | "Cancelada";
export type TicketStatus = "Abierto" | "En progreso" | "Esperándote" | "Resuelto" | "Cerrado";
export type RequestType = "Cotización" | "Servicio" | "Soporte técnico" | "Implementación" | "Configuración" | "Cambio" | "Consultoría";
export type TicketCategory = "Cuenta" | "Pedidos" | "Servicios" | "Técnico" | "Facturación" | "Otro";
export type Priority = "Baja" | "Normal" | "Alta";

export interface PublicService {
  id: string; name: string; category: string; description: string; highlights: string[];
}

/** Catálogo público de referencia (mismos servicios que ofrece InfiniHon). */
export const publicServices: PublicService[] = [
  { id: "networking", name: "Networking", category: "Infraestructura", description: "Diseño, implementación y documentación de redes corporativas.", highlights: ["MikroTik", "VPN", "VLAN", "BGP"] },
  { id: "servers", name: "Server Infrastructure", category: "Infraestructura", description: "Servidores, virtualización y respaldos para tu operación.", highlights: ["Linux", "Virtualización", "Respaldos"] },
  { id: "cloud", name: "Cloud", category: "Cloud", description: "Arquitecturas cloud e híbridas en AWS, Azure o Google Cloud.", highlights: ["AWS", "Azure", "Google Cloud"] },
  { id: "devops", name: "DevOps", category: "Cloud", description: "Contenedores, pipelines e infraestructura como código.", highlights: ["Docker", "Kubernetes", "Terraform"] },
  { id: "security", name: "Security", category: "Seguridad", description: "Auditorías, hardening y control de accesos.", highlights: ["Auditoría", "Hardening", "VPN"] },
  { id: "monitoring", name: "Monitoring", category: "Operaciones", description: "Métricas, paneles y alertas sobre tu infraestructura.", highlights: ["Prometheus", "Grafana", "Alertas"] },
  { id: "automation", name: "Automation", category: "Operaciones", description: "Automatización de tareas repetitivas e integraciones.", highlights: ["Ansible", "Integraciones"] },
  { id: "software", name: "Software Development", category: "Software", description: "Software a medida y plataformas internas.", highlights: ["Web", "APIs"] },
  { id: "support", name: "Technical Support", category: "Operaciones", description: "Soporte técnico continuo y mantenimiento.", highlights: ["Soporte", "Mantenimiento"] },
];

export const serviceCatalog = publicServices;

/**
 * Categorías humanas para el catálogo de servicios que vive en store_items:
 * el slug de cada servicio no la lleva (la DB agrupa todo bajo "services"),
 * así que se asigna por servicio — misma taxonomía que el sitio público.
 */
const serviceCategoryBySlug: Record<string, string> = {
  "network-setup": "Infraestructura",
  "cloud-deployment-service": "Cloud",
  "server-setup": "Infraestructura",
  "security-audit": "Seguridad",
  "devops-service": "Cloud",
  "monitoring-service": "Operaciones",
  "automation-service": "Operaciones",
  "technical-support": "Operaciones",
};

export const serviceCategoryOf = (slug: string, dbCategory: string): string =>
  serviceCategoryBySlug[slug] ?? (dbCategory && dbCategory !== "services" ? dbCategory : "Servicios");

/* ─────────── Registros que crea el propio usuario en esta sesión ─────────── */

export interface PortalOrder {
  id: string;
  status: OrderStatus;
  created: string;
  items: { productId: string; qty: number }[];
  notes: string;
}

const dbOrderStatus: Record<string, OrderStatus> = {
  Pending: "Pendiente",
  Processing: "En proceso",
  Completed: "Completado",
  Cancelled: "Cancelado",
};

export const portalOrderStatus = (s: string): OrderStatus => dbOrderStatus[s] ?? "Pendiente";

export interface TimelineEntry { label: string; date: string; note?: string }

export interface RequestRecord {
  id: string; title: string; type: RequestType; description: string;
  status: RequestStatus; created: string; updated: string;
  timeline: TimelineEntry[]; messages: { from: "Tú" | "InfiniHon"; text: string; date: string }[];
  attachments: { name: string; size: string }[];
}

export interface TicketRecord {
  id: string; subject: string; category: TicketCategory; priority: Priority; description: string;
  status: TicketStatus; created: string; updated: string; serviceId?: string; orderId?: string; requestId?: string;
  messages: { from: "Tú" | "Soporte InfiniHon"; text: string; date: string }[];
  attachments: { name: string; size: string }[];
}

export interface AccountNotification {
  id: string; title: string; description: string;
  group: "Pedidos" | "Servicios" | "Seguridad" | "Soporte" | "Cuenta";
  date: string; read: boolean;
}

export interface Profile {
  firstName: string; lastName: string; email: string; phone: string; company: string; position: string;
}

export interface Preferences {
  language: string; timezone: string;
  emailNotifications: boolean; orderUpdates: boolean; serviceUpdates: boolean; supportNotifications: boolean; marketing: boolean;
}

export interface SecurityState {
  passwordUpdatedAt: string | null; twoFactor: "No configurado" | "Habilitado";
  sessions: { id: string; device: string; current: boolean; lastActive: string | null }[];
}

/* ─────────── Estado inicial (todo vacío, sin datos inventados) ─────────── */

export const emptyProfile: Profile = { firstName: "", lastName: "", email: "", phone: "", company: "", position: "" };

export const initialPreferences: Preferences = {
  language: "Español", timezone: "America/Tegucigalpa",
  emailNotifications: false, orderUpdates: true, serviceUpdates: true, supportNotifications: true, marketing: false,
};

export const initialSecurity: SecurityState = {
  passwordUpdatedAt: null,
  twoFactor: "No configurado",
  sessions: [{ id: "s-current", device: "Sesión local de demostración", current: true, lastActive: new Date().toISOString() }],
};

export const requestTypeOptions: RequestType[] = ["Cotización", "Servicio", "Soporte técnico", "Implementación", "Configuración", "Cambio", "Consultoría"];
export const ticketCategories: TicketCategory[] = ["Cuenta", "Pedidos", "Servicios", "Técnico", "Facturación", "Otro"];
export const priorities: Priority[] = ["Baja", "Normal", "Alta"];

export const serviceStatuses: ServiceStatus[] = ["Activo", "Pendiente", "En pausa", "Completado", "Cancelado"];
export const orderStatuses: OrderStatus[] = ["Pendiente", "En proceso", "Enviado", "Completado", "Cancelado"];
export const requestStatuses: RequestStatus[] = ["Enviada", "En revisión", "En progreso", "Esperándote", "Completada", "Cancelada"];
export const ticketStatuses: TicketStatus[] = ["Abierto", "En progreso", "Esperándote", "Resuelto", "Cerrado"];

/** Tono visual por estado (el color nunca es el único indicador: hay texto). */
export const statusTone = (s: string): "pos" | "warn" | "neg" | "neutral" => {
  if (["Activo", "Completado", "Completada", "Resuelto"].includes(s)) return "pos";
  if (["Pendiente", "En proceso", "Enviado", "Enviada", "En revisión", "En progreso", "Esperándote", "Abierto"].includes(s)) return "warn";
  if (["Cancelado", "Cancelada", "Cerrado"].includes(s)) return "neg";
  return "neutral";
};

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
export const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
};
