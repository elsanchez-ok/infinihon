/**
 * Sincronización del Control Center con Supabase.
 *
 *  · Al entrar: carga el catálogo real (store_items / store_categories) y
 *    verifica que la sesión tenga rol de administrador (profiles.is_admin).
 *  · Al editar: cada mutate del panel se traduce a upserts/borrados en la
 *    base; los campos que el panel no modela (visual, badge, destacados,
 *    specs de marketing) se preservan tal cual.
 *
 * RLS en el servidor es la autoridad real: is_admin decide quién puede
 * escribir el catálogo y ver datos de otros usuarios.
 */
import { getSessionUser, getAccessToken, sb, SupabaseError, authSignOut, type SessionUser } from "../lib/supabase";
import type {
  Activity, Administrator, Category, ContentItem, Customer, Doc, Movement, Notice, Order, OrderStatus, PlatformUser,
  Product, PublishStatus, Role, Service, Settings, Spec, SupportTicket,
} from "./data";

/* ─────────── Identidad ─────────── */

export async function currentSession(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function signOutAndGo(): Promise<void> {
  await authSignOut();
  window.location.assign("/auth");
}

export async function isAdminUser(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  try {
    const rows = await sb("/rest/v1/profiles?select=is_admin&limit=1", { token }) as { is_admin: boolean }[];
    return Boolean(rows?.[0]?.is_admin);
  } catch {
    return false;
  }
}

/** Verifica si el usuario es el super administrador basado en el email específico */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await currentSession();
  if (!user) return false;
  // El super administrador tiene el email específico
  return user.email === "infinihon.hn@gmail.com";
}

export async function fetchTicketsForAdmin(): Promise<SupportTicket[]> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  const rows = await sb("/rest/v1/tickets?select=*&order=updated_at.desc", { token }) as {
    id: string; subject: string; category: string; priority: string; description: string; status: string;
    created_at: string; updated_at: string; messages: SupportTicket["messages"] | null;
  }[];
  return (rows ?? []).map((t) => ({
    id: t.id, subject: t.subject, category: t.category, priority: t.priority, description: t.description,
    status: t.status, created: t.created_at, updated: t.updated_at, messages: t.messages ?? [],
  }));
}

export async function replyToTicket(ticket: SupportTicket, text: string): Promise<SupportTicket> {
  const token = await withToken();
  const next: SupportTicket = {
    ...ticket,
    status: ticket.status === "Resuelto" || ticket.status === "Cerrado" ? "En progreso" : ticket.status,
    updated: new Date().toISOString(),
    messages: [...ticket.messages, { from: "Soporte InfiniHon", text, date: new Date().toISOString() }],
  };
  await sb(`/rest/v1/tickets?id=eq.${encodeURIComponent(ticket.id)}`, {
    method: "PATCH", token,
    body: { status: next.status, messages: next.messages, updated_at: next.updated },
  });
  return next;
}

/* ─────────── Catálogo: lectura ─────────── */

interface RemoteItem {
  slug: string; kind: "product" | "service" | "bundle"; name: string; category: string;
  visual: string; short: string; description: string; price: number | null;
  status: "available" | "low" | "out" | "soon" | "archived"; badge: string | null; featured: boolean; sort: number;
  data: Record<string, unknown>; updated_at: string;
}

interface RemoteCategory { id: string; label: string; description: string; sort: number }

/** Listas de texto del `data` del catálogo; nunca deben romper la carga. */
function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "")).filter((v) => v !== "");
}

/**
 * La ficha pública guarda las especificaciones como `{ k, v }`; el editor las
 * maneja como `{ key, value }`. Aceptamos ambas formas para no perder datos
 * de filas antiguas y convertimos siempre al formato del panel.
 */
function toSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return [];
  const out: Spec[] = [];
  for (const raw of value) {
    if (raw && typeof raw === "object") {
      const r = raw as Record<string, unknown>;
      const key = typeof r.key === "string" ? r.key : typeof r.k === "string" ? r.k : "";
      const val = typeof r.value === "string" ? r.value : typeof r.v === "string" ? r.v : "";
      if (key.trim() || val.trim()) out.push({ key, value: val });
    } else if (typeof raw === "string" && raw.trim()) {
      const [key, ...rest] = raw.split(":");
      out.push({ key: key.trim(), value: rest.join(":").trim() });
    }
  }
  return out;
}

/** Revierte {@link toSpecs} al contrato `{ k, v }` que lee la tienda. */
function fromSpecs(specs: Spec[]): { k: string; v: string }[] {
  return (specs ?? []).filter((s) => s.key.trim() || s.value.trim()).map((s) => ({ k: s.key, v: s.value }));
}

function toDocs(value: unknown): Doc[] {
  if (!Array.isArray(value)) return [];
  const out: Doc[] = [];
  for (const raw of value) {
    if (typeof raw === "string" && raw.trim()) { out.push({ t: raw.trim(), note: "" }); continue; }
    if (raw && typeof raw === "object") {
      const r = raw as Record<string, unknown>;
      const t = typeof r.t === "string" ? r.t : typeof r.title === "string" ? r.title : "";
      const note = typeof r.note === "string" ? r.note : typeof r.href === "string" ? r.href : "";
      if (t.trim() || note.trim()) out.push({ t, note });
    }
  }
  return out;
}

function toItem(r: RemoteItem): Product {
  const status: Product["status"] =
    r.kind === "product"
      ? r.status === "soon" ? "Draft" : r.status === "archived" ? "Archived" : "Active"
      : "Active";
  const d = r.data as Record<string, unknown>;
  return {
    id: r.slug,
    name: r.name,
    sku: (d.sku as string) ?? r.slug.toUpperCase(),
    category: r.category,
    brand: (d.brand as string) ?? "Por definir",
    description: r.description,
    price: r.price,
    cost: null, discount: null, tax: null,
    stock: null, minStock: 0,
    warehouse: "Digital",
    status,
    specs: toSpecs(d.specs),
    tech: textList(d.tech),
    use: textList(d.use),
    features: textList(d.features),
    compat: textList(d.compat),
    includes: textList(d.includes),
    docs: toDocs(d.docs),
    images: 0, seoTitle: "", seoDescription: "",
    slug: r.slug,
    updated: r.updated_at,
    demo: false,
  };
}

function toCategory(c: RemoteCategory): Category {
  return { id: c.id, name: c.label, description: c.description, demo: false };
}

/** Ítems crudos de la última lectura, para preservar campos al editar. */
export const lastRawItems = new Map<string, RemoteItem>();

function serviceStatus(r: RemoteItem): PublishStatus {
  if (r.status === "soon") return "Draft";
  if (r.status === "archived") return "Archived";
  if (r.status === "available") return "Published";
  return "Published";
}

function toService(r: RemoteItem): Service {
  const status = serviceStatus(r);
  const d = r.data as Record<string, unknown>;
  const tech = textList(d.tech);
  return {
    id: r.slug,
    name: r.name,
    description: r.description,
    category: r.category,
    status,
    cta: (d.cta as string) ?? "Request a Quote",
    features: textList(d.features),
    scope: textList(d.scope),
    deliverables: textList(d.deliverables),
    tech,
    duration: (d.duration as string) ?? "To be defined",
    visible: status === "Published",
    updated: r.updated_at,
    demo: false,
  };
}

export async function fetchCatalog(): Promise<{ products: Product[]; categories: Category[]; services: Service[] }> {
  const [items, cats] = await Promise.all([
    sb("/rest/v1/store_items?select=*&order=sort.asc") as Promise<RemoteItem[]>,
    sb("/rest/v1/store_categories?select=*&order=sort.asc") as Promise<RemoteCategory[]>,
  ]);
  lastRawItems.clear();
  for (const i of items ?? []) lastRawItems.set(i.slug, i);
  const all = items ?? [];
  return {
    products: all.filter((i) => i.kind === "product").map(toItem),
    categories: (cats ?? []).map(toCategory),
    services: all.filter((i) => i.kind === "service").map(toService),
  };
}

/** Guarda un servicio (creación o edición) en store_items con kind='service'. */
export async function upsertCatalogService(s: Service, current: RemoteItem | null): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  const remoteStatus: RemoteItem["status"] = s.status === "Draft" ? "soon" : s.status === "Archived" ? "archived" : "available";
  await sb("/rest/v1/store_items?on_conflict=slug", {
    method: "POST", token,
    prefer: "resolution=merge-duplicates",
    body: {
      slug: s.id,
      kind: "service",
      name: s.name,
      category: s.category,
      visual: current?.visual ?? "service",
      short: current?.short ?? s.description.slice(0, 140),
      description: s.description,
      price: null,
      status: remoteStatus,
      badge: current?.badge ?? null,
      featured: current?.featured ?? s.visible,
      data: {
        ...(current?.data ?? {}),
        cta: s.cta,
        features: s.features ?? [],
        scope: s.scope ?? [],
        deliverables: s.deliverables ?? [],
        tech: s.tech ?? [],
        duration: s.duration ?? "To be defined",
      },
      updated_at: new Date().toISOString(),
    },
  });
}

/** Crea un servicio en la base. */
export async function createCatalogService(s: Service): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  const slug = s.id || s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const remoteStatus: RemoteItem["status"] = s.status === "Draft" ? "soon" : s.status === "Archived" ? "archived" : "available";
  await sb("/rest/v1/store_items", {
    method: "POST", token,
    body: {
      slug, kind: "service", name: s.name, category: s.category, visual: "service",
      short: s.description.slice(0, 140), description: s.description, price: null,
      status: remoteStatus, badge: null, featured: false, sort: 999,
      data: { cta: s.cta, features: s.features ?? [], scope: s.scope ?? [], deliverables: s.deliverables ?? [], tech: s.tech ?? [], duration: s.duration ?? "To be defined" },
    },
  });
}

/** Borra un servicio del catálogo. */
export async function deleteCatalogService(slug: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  await sb(`/rest/v1/store_items?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE", token });
}

/* ─────────── Catálogo: escritura ─────────── */

function patchFromProduct(p: Product, current: RemoteItem | null): Partial<RemoteItem> {
  const status: RemoteItem["status"] = p.status === "Draft" ? "soon" : "available";
  return {
    name: p.name,
    category: p.category,
    short: current?.short ?? p.description.slice(0, 140),
    description: p.description,
    price: p.price,
    status,
    badge: current?.badge ?? null,
    featured: current?.featured ?? false,
    visual: current?.visual ?? "rack",
    data: {
      ...(current?.data ?? {}),
      brand: p.brand,
      sku: p.sku,
      specs: fromSpecs(p.specs),
      tech: p.tech ?? [],
      use: p.use ?? [],
      features: p.features ?? [],
      compat: p.compat ?? [],
      includes: p.includes ?? [],
      docs: p.docs ?? [],
    },
    updated_at: new Date().toISOString(),
  };
}

/** Guarda un producto (creación o edición). Devuelve el slug final. */
export async function upsertCatalogProduct(p: Product, existing: RemoteItem | null): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  const patch = patchFromProduct(p, existing);
  const body = {
    slug: p.slug,
    kind: "product" as const,
    ...patch,
  };
  await sb("/rest/v1/store_items?on_conflict=slug", {
    method: "POST", token,
    prefer: "resolution=merge-duplicates",
    body,
  });
  return p.slug;
}

/** Crea un producto nuevo en la base (slug derivado del nombre). */
export async function createCatalogProduct(p: Product): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  const slug = p.slug || p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const status: RemoteItem["status"] = p.status === "Draft" ? "soon" : "available";
  await sb("/rest/v1/store_items", {
    method: "POST", token,
    body: {
      slug,
      kind: "product",
      name: p.name,
      category: p.category,
      visual: "rack",
      short: p.description.slice(0, 140),
      description: p.description,
      price: p.price,
      status,
      badge: null,
      featured: false,
      sort: 999,
      data: { brand: p.brand, sku: p.sku, specs: fromSpecs(p.specs), tech: p.tech ?? [], use: p.use ?? [], features: p.features ?? [], compat: p.compat ?? [], includes: p.includes ?? [], docs: p.docs ?? [] },
    },
  });
  return slug;
}

/** Borra un producto del catálogo. */
export async function deleteCatalogProduct(slug: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  await sb(`/rest/v1/store_items?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE", token });
}

/** Guarda una categoría (creación o edición). */
export async function upsertCatalogCategory(c: Category, sort: number): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  await sb("/rest/v1/store_categories?on_conflict=id", {
    method: "POST", token,
    prefer: "resolution=merge-duplicates",
    body: { id: c.id, label: c.name, description: c.description, sort },
  });
}

/** Borra una categoría. */
export async function deleteCatalogCategory(id: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  await sb(`/rest/v1/store_categories?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", token });
}

/* ─────────── Módulos: lectura ─────────── */

interface RemoteCustomer { id: string; name: string; email: string; status: string; city: string; notes: string; created_at: string; demo: boolean }
interface RemoteOrder { id: string; customer_id: string; items: { productId: string; qty: number }[]; status: string; notes: string; created_at: string; demo: boolean }
interface RemoteRole { id: string; name: string; description: string; permissions: string[]; locked: boolean; sort: number }
interface RemoteContent { id: string; title: string; type: string; status: string; author: string; updated_at: string; demo: boolean }
interface RemoteActivity { id: string; actor: string; action: string; module: string; target: string; created_at: string; demo: boolean }
interface RemoteNotice { id: string; title: string; type: string; read: boolean; created_at: string }
interface RemoteMovement { id: string; product_id: string; quantity: number; type: string; reason: string; location: string; notes: string; created_at: string }
interface RemoteSettingsRow { id: string; data: Settings }

export async function fetchOrders(): Promise<Order[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/orders?select=*&order=created_at.desc", { token }) as RemoteOrder[];
  return (rows ?? []).map((r) => ({
    id: r.id, customerId: r.customer_id, items: r.items, status: r.status as OrderStatus,
    date: r.created_at, notes: r.notes, demo: r.demo,
  }));
}

export async function fetchCustomers(): Promise<Customer[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/customers?select=*&order=created_at.asc", { token }) as RemoteCustomer[];
  return (rows ?? []).map((r) => ({
    id: r.id, name: r.name, email: r.email, status: r.status as Customer["status"],
    created: r.created_at, city: r.city, notes: r.notes, demo: r.demo,
  }));
}

export async function fetchRoles(): Promise<Role[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/roles?select=*&order=sort.asc", { token }) as RemoteRole[];
  return (rows ?? []).map((r) => ({
    id: r.id, name: r.name, description: r.description, permissions: r.permissions, locked: r.locked,
  }));
}

export async function fetchContent(): Promise<ContentItem[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/content_items?select=*&order=updated_at.desc", { token }) as RemoteContent[];
  return (rows ?? []).map((r) => ({
    id: r.id, title: r.title, type: r.type, status: r.status as ContentItem["status"],
    updated: r.updated_at, author: r.author, demo: r.demo,
  }));
}

export async function fetchActivity(): Promise<Activity[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/admin_activity?select=*&order=created_at.desc&limit=300", { token }) as RemoteActivity[];
  return (rows ?? []).map((r) => ({
    id: r.id, actor: r.actor, action: r.action, module: r.module, target: r.target,
    date: r.created_at, demo: r.demo,
  }));
}

export async function fetchNotifications(): Promise<Notice[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/admin_notifications?select=*&order=created_at.desc&limit=200", { token }) as RemoteNotice[];
  return (rows ?? []).map((r) => ({ id: r.id, title: r.title, type: r.type as Notice["type"], date: r.created_at, read: r.read }));
}

export async function fetchMovements(): Promise<Movement[]> {
  const token = await withToken();
  const rows = await sb("/rest/v1/inventory_movements?select=*&order=created_at.desc&limit=300", { token }) as RemoteMovement[];
  return (rows ?? []).map((r) => ({
    id: r.id, productId: r.product_id, quantity: r.quantity, type: r.type, reason: r.reason,
    location: r.location, notes: r.notes, date: r.created_at,
  }));
}

export async function fetchSettings(): Promise<Settings | null> {
  const token = await withToken();
  const rows = await sb("/rest/v1/settings?select=*&limit=1", { token }) as RemoteSettingsRow[];
  return rows?.[0]?.data ?? null;
}

interface RemoteProfile {
  id: string; email: string; first_name: string; last_name: string; is_admin: boolean;
  platform_status: string; last_active: string | null; last_login: string | null;
  role_id: string | null; role_label: string | null; created_at: string;
}

const profileName = (r: RemoteProfile) => [r.first_name, r.last_name].filter(Boolean).join(" ") || r.email;

export async function fetchProfiles(): Promise<{ users: PlatformUser[]; admins: Administrator[]; meRoleId: string | null }> {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  const rows = await sb(
    "/rest/v1/profiles?select=id,email,first_name,last_name,is_admin,platform_status,last_active,last_login,role_id,role_label,created_at",
    { token },
  ) as RemoteProfile[];
  const me = await currentSession();
  const all = rows ?? [];
  return {
    users: all.filter((r) => !r.is_admin).map((r) => ({
      id: r.id, name: profileName(r), email: r.email, role: r.role_label ?? "Customer account",
      status: r.platform_status as PlatformUser["status"], lastActive: r.last_active, created: r.created_at, demo: false,
    })),
    admins: all.filter((r) => r.is_admin).map((r) => ({
      id: r.id, name: profileName(r), email: r.email, roleId: r.role_id ?? "super",
      status: r.platform_status as Administrator["status"], lastLogin: r.last_login, created: r.created_at, demo: false,
    })),
    meRoleId: all.find((r) => r.email === me?.email)?.role_id ?? null,
  };
}

/** Carga de arranque: catálogo + todos los módulos del Control Center.
 *  Cada consulta es independiente: si una falla, las demás siguen funcionando.
 *  Esto permite que el panel sea usable aunque algunas tablas no existan o RLS bloquee el acceso.
 */
export async function fetchAdminData(): Promise<{
  products: Product[]; categories: Category[]; services: Service[]; orders: Order[]; customers: Customer[];
  roles: Role[]; content: ContentItem[]; activity: Activity[]; notifications: Notice[]; movements: Movement[]; tickets: SupportTicket[];
  users: PlatformUser[]; admins: Administrator[]; settings: Settings | null; meRoleId: string | null;
}> {
  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch { return fallback; }
  };

  const [catalog, orders, customers, roles, content, activity, notifications, movements, tickets, settings, profiles] = await Promise.all([
    safe(fetchCatalog, { products: [], categories: [], services: [] }),
    safe(fetchOrders, []),
    safe(fetchCustomers, []),
    safe(fetchRoles, []),
    safe(fetchContent, []),
    safe(fetchActivity, []),
    safe(fetchNotifications, []),
    safe(fetchMovements, []),
    safe(() => fetchTicketsForAdmin(), []),
    safe(fetchSettings, null),
    safe(fetchProfiles, { users: [], admins: [], meRoleId: null }),
  ]);

  return { ...catalog, orders, customers, roles, content, activity, notifications, movements, tickets, settings, ...profiles };
}

/* ─────────── Módulos: escritura ─────────── */

function withToken() {
  return getAccessToken().then((token) => {
    if (!token) throw new SupabaseError(401, "sin sesión");
    return token;
  });
}

export async function upsertOrder(o: Order): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/orders?on_conflict=id", {
    method: "POST", token, prefer: "resolution=merge-duplicates",
    body: { id: o.id, customer_id: o.customerId, items: o.items, status: o.status, notes: o.notes, created_at: o.date },
  });
}

export async function deleteOrder(id: string): Promise<void> {
  const token = await withToken();
  await sb(`/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", token });
}

export async function upsertCustomer(c: Customer): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/customers?on_conflict=id", {
    method: "POST", token, prefer: "resolution=merge-duplicates",
    body: { id: c.id, name: c.name, email: c.email, status: c.status, city: c.city, notes: c.notes, created_at: c.created },
  });
}

export async function upsertRole(r: Role, sort: number): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/roles?on_conflict=id", {
    method: "POST", token, prefer: "resolution=merge-duplicates",
    body: { id: r.id, name: r.name, description: r.description, permissions: r.permissions, locked: r.locked ?? false, sort },
  });
}

export async function deleteRole(id: string): Promise<void> {
  const token = await withToken();
  await sb(`/rest/v1/roles?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", token });
}

export async function upsertContent(c: ContentItem): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/content_items?on_conflict=id", {
    method: "POST", token, prefer: "resolution=merge-duplicates",
    body: { id: c.id, title: c.title, type: c.type, status: c.status, author: c.author, updated_at: c.updated },
  });
}

export async function deleteContent(id: string): Promise<void> {
  const token = await withToken();
  await sb(`/rest/v1/content_items?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", token });
}

export async function insertActivity(a: Activity): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/admin_activity", {
    method: "POST", token,
    body: { id: a.id, actor: a.actor, action: a.action, module: a.module, target: a.target, created_at: a.date, demo: false },
  });
}

export async function upsertNotice(n: Notice): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/admin_notifications?on_conflict=id", {
    method: "POST", token, prefer: "resolution=merge-duplicates",
    body: { id: n.id, title: n.title, type: n.type, read: n.read, created_at: n.date },
  });
}

export async function insertMovement(m: Movement): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/inventory_movements", {
    method: "POST", token,
    body: { id: m.id, product_id: m.productId, quantity: m.quantity, type: m.type, reason: m.reason, location: m.location, notes: m.notes, created_at: m.date },
  });
}

export async function saveSettings(s: Settings): Promise<void> {
  const token = await withToken();
  await sb("/rest/v1/settings?on_conflict=id", {
    method: "POST", token, prefer: "resolution=merge-duplicates",
    body: { id: "main", data: s },
  });
}

export async function updateProfileById(id: string, patch: Record<string, unknown>): Promise<void> {
  const token = await withToken();
  await sb(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", token, body: patch });
}
