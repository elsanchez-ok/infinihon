/**
 * Capa de datos del portal de usuario contra Supabase (REST).
 * Cada función usa el access token de la sesión; RLS garantiza en el
 * servidor que cada usuario solo acceda a SUS registros.
 */
import { getAccessToken, sb, SupabaseError } from "../lib/supabase";
import { portalOrderStatus, serviceCategoryOf } from "./data";
import type {
  AccountNotification, PortalOrder, Profile, PublicService, RequestRecord, TicketRecord,
} from "./data";

async function authed() {
  const token = await getAccessToken();
  if (!token) throw new SupabaseError(401, "sin sesión");
  return token;
}

/* ─────────── Perfil ─────────── */

export interface FullProfile extends Profile { id: string; isAdmin: boolean }

interface ProfileRow {
  id: string; email: string; first_name: string; last_name: string;
  phone: string; company: string; position: string; is_admin: boolean;
}

export async function fetchProfile(): Promise<FullProfile | null> {
  const token = await authed();
  const rows = await sb("/rest/v1/profiles?select=*&limit=1", { token }) as ProfileRow[];
  const r = rows?.[0];
  if (!r) return null;
  return {
    id: r.id, firstName: r.first_name ?? "", lastName: r.last_name ?? "", email: r.email ?? "",
    phone: r.phone ?? "", company: r.company ?? "", position: r.position ?? "",
    isAdmin: Boolean(r.is_admin),
  };
}

export async function saveProfilePatch(id: string, p: Partial<Profile>): Promise<void> {
  const token = await authed();
  await sb(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", token,
    body: {
      ...(p.firstName !== undefined && { first_name: p.firstName }),
      ...(p.lastName !== undefined && { last_name: p.lastName }),
      ...(p.email !== undefined && { email: p.email }),
      ...(p.phone !== undefined && { phone: p.phone }),
      ...(p.company !== undefined && { company: p.company }),
      ...(p.position !== undefined && { position: p.position }),
      updated_at: new Date().toISOString(),
    },
  });
}

export async function changePassword(newPassword: string): Promise<void> {
  const token = await authed();
  await sb("/auth/v1/user", { method: "PUT", token, body: { password: newPassword } });
}

/* ─────────── Solicitudes ─────────── */

interface RequestRow {
  id: string; title: string; type: string; description: string; status: string;
  created_at: string; updated_at: string; timeline: unknown; messages: unknown;
}

const toRequest = (r: RequestRow): RequestRecord => ({
  id: r.id, title: r.title, type: r.type as RequestRecord["type"], description: r.description,
  status: r.status as RequestRecord["status"], created: r.created_at, updated: r.updated_at,
  timeline: (r.timeline as RequestRecord["timeline"]) ?? [], messages: (r.messages as RequestRecord["messages"]) ?? [],
  attachments: [],
});

export async function fetchRequests(): Promise<RequestRecord[]> {
  const token = await authed();
  const rows = await sb("/rest/v1/requests?select=*&order=created_at.desc", { token }) as RequestRow[];
  return (rows ?? []).map(toRequest);
}

export async function upsertRequest(r: RequestRecord): Promise<void> {
  const token = await authed();
  await sb("/rest/v1/requests?on_conflict=id", {
    method: "POST", token,
    prefer: "resolution=merge-duplicates",
    body: { id: r.id, title: r.title, type: r.type, description: r.description, status: r.status, timeline: r.timeline, messages: r.messages, updated_at: r.updated },
  });
}

/* ─────────── Tickets ─────────── */

interface TicketRow {
  id: string; subject: string; category: string; priority: string; description: string; status: string;
  service_id: string | null; order_id: string | null; request_id: string | null;
  created_at: string; updated_at: string; messages: unknown;
}

const toTicket = (t: TicketRow): TicketRecord => ({
  id: t.id, subject: t.subject, category: t.category as TicketRecord["category"], priority: t.priority as TicketRecord["priority"],
  description: t.description, status: t.status as TicketRecord["status"], created: t.created_at, updated: t.updated_at,
  serviceId: t.service_id ?? undefined, orderId: t.order_id ?? undefined, requestId: t.request_id ?? undefined,
  messages: (t.messages as TicketRecord["messages"]) ?? [], attachments: [],
});

export async function fetchTickets(): Promise<TicketRecord[]> {
  const token = await authed();
  const rows = await sb("/rest/v1/tickets?select=*&order=created_at.desc", { token }) as TicketRow[];
  return (rows ?? []).map(toTicket);
}

export async function upsertTicket(t: TicketRecord): Promise<void> {
  const token = await authed();
  await sb("/rest/v1/tickets?on_conflict=id", {
    method: "POST", token,
    prefer: "resolution=merge-duplicates",
    body: {
      id: t.id, subject: t.subject, category: t.category, priority: t.priority, description: t.description,
      status: t.status, service_id: t.serviceId ?? null, order_id: t.orderId ?? null, request_id: t.requestId ?? null,
      messages: t.messages, updated_at: t.updated,
    },
  });
}

/* ─────────── Catálogo público (store_items, lectura anónima) ─────────── */

interface CatalogRow {
  slug: string; name: string; category: string; short: string | null;
  description: string | null; data: { tech?: string[] } | null;
}

export async function fetchCatalog(): Promise<PublicService[]> {
  const rows = await sb("/rest/v1/store_items?select=slug,name,category,short,description,data&kind=eq.service&order=sort.asc") as CatalogRow[];
  return (rows ?? []).map((r) => ({
    id: r.slug,
    name: r.name,
    category: serviceCategoryOf(r.slug, r.category),
    description: r.description || r.short || "",
    highlights: r.data?.tech ?? [],
  }));
}

/* ─────────── Favoritos ─────────── */

export async function fetchFavorites(): Promise<string[]> {
  const token = await authed();
  const rows = await sb("/rest/v1/favorites?select=service_id&order=created_at.desc", { token }) as { service_id: string }[];
  return (rows ?? []).map((r) => r.service_id);
}

export async function addFavorite(serviceId: string): Promise<void> {
  const token = await authed();
  await sb("/rest/v1/favorites", { method: "POST", token, body: { service_id: serviceId } });
}

export async function removeFavorite(serviceId: string): Promise<void> {
  const token = await authed();
  await sb(`/rest/v1/favorites?service_id=eq.${encodeURIComponent(serviceId)}`, { method: "DELETE", token });
}

/* ─────────── Notificaciones por usuario ─────────── */

interface NotificationRow {
  id: string; title: string; description: string; grp: string; created_at: string; read: boolean;
}

const toNotification = (r: NotificationRow): AccountNotification => ({
  id: r.id, title: r.title, description: r.description,
  group: (r.grp ?? "Cuenta") as AccountNotification["group"],
  date: r.created_at, read: r.read,
});

export async function fetchNotifications(): Promise<AccountNotification[]> {
  const token = await authed();
  const rows = await sb("/rest/v1/account_notifications?select=id,title,description,grp,created_at,read&order=created_at.desc", { token }) as NotificationRow[];
  return (rows ?? []).map(toNotification);
}

export async function persistNotification(n: AccountNotification): Promise<void> {
  const token = await authed();
  await sb("/rest/v1/account_notifications?on_conflict=id", {
    method: "POST", token,
    prefer: "resolution=merge-duplicates",
    body: { id: n.id, title: n.title, description: n.description, grp: n.group, read: n.read },
  });
}

export async function setNotificationRead(id: string, read: boolean): Promise<void> {
  const token = await authed();
  await sb(`/rest/v1/account_notifications?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", token, body: { read } });
}

export async function markAllNotificationsRead(): Promise<void> {
  const token = await authed();
  await sb("/rest/v1/account_notifications", { method: "PATCH", token, body: { read: true } });
}

/* ─────────── Pedidos ─────────── */

interface OrderRow {
  id: string; status: string; created_at: string;
  items: { productId: string; qty: number }[] | null; notes: string | null;
}

const toOrder = (r: OrderRow): PortalOrder => ({
  id: r.id,
  status: portalOrderStatus(r.status),
  created: r.created_at,
  items: r.items ?? [],
  notes: r.notes ?? "",
});

export async function fetchOrders(): Promise<PortalOrder[]> {
  const token = await authed();
  const rows = await sb("/rest/v1/orders?select=id,status,created_at,items,notes&order=created_at.desc", { token }) as OrderRow[];
  return (rows ?? []).map(toOrder);
}
