import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as seed from "./data";
import type { Activity, Administrator, Category, ContentItem, Customer, Movement, Notice, Order, PlatformUser, Product, Role, Service, Settings, SupportTicket } from "./data";
import {
  fetchAdminData, fetchTicketsForAdmin, replyToTicket, upsertCatalogProduct, createCatalogProduct, deleteCatalogProduct, upsertCatalogCategory, deleteCatalogCategory,
  lastRawItems, isSuperAdmin, upsertCatalogService, createCatalogService, deleteCatalogService, upsertOrder, deleteOrder, upsertCustomer,
  upsertRole, deleteRole, upsertContent, deleteContent, insertActivity, upsertNotice, insertMovement, saveSettings, updateProfileById,
} from "./supabaseSync";
import type { SessionUser } from "../lib/supabase";

/**
 * Local, in-memory state for the Control Center.
 * Nothing here is persisted or sent anywhere. When a backend exists, replace the
 * `mutate` implementation with calls to an API client and keep the same shape.
 * Permissions checked with `can()` only hide UI — the backend must enforce them.
 */

export interface AdminData {
  products: Product[]; categories: Category[]; services: Service[]; orders: Order[]; customers: Customer[];
  users: PlatformUser[]; admins: Administrator[]; roles: Role[]; content: ContentItem[];
  activity: Activity[]; notifications: Notice[]; movements: Movement[]; settings: Settings; tickets: SupportTicket[];
}

type Tone = "success" | "error" | "info";
interface Toast { id: number; message: string; tone: Tone }
interface LogInput { action: string; module: string; target: string }

interface AdminContextValue {
  data: AdminData;
  user: SessionUser | null;
  mutate: <K extends keyof AdminData>(key: K, updater: (current: AdminData[K]) => AdminData[K], log?: LogInput) => void;
  notify: (notice: Omit<Notice, "id" | "date" | "read">) => void;
  sendTicketReply: (id: string, text: string) => Promise<void>;
  roleId: string;
  setRoleId: (id: string) => void;
  role: Role;
  can: (permission: string) => boolean;
  toast: (message: string, tone?: Tone) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  /** Estado real de la conexión con Supabase (lo que muestran la ayuda y el pie). */
  backend: "loading" | "online" | "offline";
  pathname: string;
  navigate: (to: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);
export const SESSION_ACTOR = "Demo session";
let uid = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

export function AdminProvider({ children, pathname, navigate, user }: { children: ReactNode; pathname: string; navigate: (to: string) => void; user: SessionUser | null }) {
  const [data, setData] = useState<AdminData>(() => ({
    products: seed.seedProducts, categories: seed.seedCategories, services: seed.seedServices, orders: seed.seedOrders,
    customers: seed.seedCustomers, users: seed.seedUsers, admins: seed.seedAdmins, roles: seed.seedRoles,
    content: seed.seedContent, activity: seed.seedActivity, notifications: [], movements: [], settings: seed.seedSettings, tickets: [],
  }));
  const [roleId, setRoleId] = useState("super");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [backend, setBackend] = useState<AdminContextValue["backend"]>("loading");

  /* ── Verificar si es super admin ── */
  useEffect(() => {
    let alive = true;
    void isSuperAdmin()
      .then((result) => {
        if (alive) setSuperAdmin(result);
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [user]);

  /* ── Datos reales desde Supabase al entrar ── */
  useEffect(() => {
    let alive = true;
    void fetchAdminData()
      .then((remote) => {
        if (!alive) return;
        // La respuesta del servidor es la autoridad: un arreglo vacío significa
        // "no hay registros", no "vuelve a los datos de demostración".
        setData((d) => ({
          ...d,
          roles: remote.roles.length ? remote.roles : d.roles,
          products: remote.products,
          categories: remote.categories,
          services: remote.services,
          orders: remote.orders,
          customers: remote.customers,
          content: remote.content,
          activity: remote.activity,
          notifications: remote.notifications,
          movements: remote.movements,
          users: remote.users,
          admins: remote.admins,
          settings: remote.settings ?? d.settings,
          tickets: remote.tickets,
        }));
        setRoleId(remote.meRoleId ?? "super");
        setBackend("online");
      })
      .catch(() => { if (alive) setBackend("offline"); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void fetchTicketsForAdmin().then((tickets) => setData((d) => ({ ...d, tickets }))).catch(() => undefined);
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  /* ── Sincronización con Supabase: diff entre estado previo y nuevo ── */
  const syncProduct = useCallback((prev: Product[], next: Product[]) => {
    const map = (l: Product[]) => new Map(l.map((p) => [p.slug || p.id, p] as const));
    const before = map(prev);
    const after = map(next);
    for (const [k, p] of after) {
      const was = before.get(k);
      if (!was) {
        void createCatalogProduct(p).catch(() => toast(`No se pudo crear “${p.name}” en el servidor.`, "error"));
      } else if (JSON.stringify(was) !== JSON.stringify(p)) {
        void upsertCatalogProduct(p, lastRawItems.get(k) ?? null).catch(() => toast(`No se pudieron guardar los cambios de “${p.name}”.`, "error"));
      }
    }
    for (const [k, p] of before) {
      if (!after.has(k)) void deleteCatalogProduct(p.slug).catch(() => toast(`No se pudo eliminar “${p.name}” del servidor.`, "error"));
    }
  }, [toast]);

  const syncCategory = useCallback((prev: Category[], next: Category[]) => {
    const map = (l: Category[]) => new Map(l.map((c) => [c.id, c] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, c] of after) {
      const was = before.get(id);
      if (!was || JSON.stringify(was) !== JSON.stringify(c)) {
        void upsertCatalogCategory(c, after.size - [...after.keys()].indexOf(id)).catch(() => toast(`No se pudo guardar la categoría “${c.name}”.`, "error"));
      }
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void deleteCatalogCategory(id).catch(() => toast("No se pudo eliminar la categoría del servidor.", "error"));
    }
  }, [toast]);

  const syncService = useCallback((prev: Service[], next: Service[]) => {
    const map = (l: Service[]) => new Map(l.map((s) => [s.id, s] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, s] of after) {
      const was = before.get(id);
      const current = lastRawItems.get(id) ?? null;
      if (!was) {
        void createCatalogService(s).catch(() => toast(`No se pudo crear el servicio “${s.name}” en el servidor.`, "error"));
      } else if (JSON.stringify(was) !== JSON.stringify(s)) {
        void upsertCatalogService(s, current).catch(() => toast(`No se pudieron guardar los cambios del servicio “${s.name}”.`, "error"));
      }
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void deleteCatalogService(id).catch(() => toast("No se pudo eliminar el servicio del servidor.", "error"));
    }
  }, [toast]);

  const syncOrder = useCallback((prev: Order[], next: Order[]) => {
    const map = (l: Order[]) => new Map(l.map((o) => [o.id, o] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, o] of after) {
      const was = before.get(id);
      if (was && JSON.stringify(was) !== JSON.stringify(o)) void upsertOrder(o).catch(() => toast(`No se pudo guardar el pedido ${o.id}.`, "error"));
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void deleteOrder(id).catch(() => toast("No se pudo eliminar el pedido del servidor.", "error"));
    }
  }, [toast]);

  const syncCustomer = useCallback((prev: Customer[], next: Customer[]) => {
    const map = (l: Customer[]) => new Map(l.map((c) => [c.id, c] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, c] of after) {
      const was = before.get(id);
      if (was && JSON.stringify(was) !== JSON.stringify(c)) void upsertCustomer(c).catch(() => toast(`No se pudieron guardar los datos de “${c.name}”.`, "error"));
    }
  }, [toast]);

  const syncRole = useCallback((prev: Role[], next: Role[]) => {
    const map = (l: Role[]) => new Map(l.map((r) => [r.id, r] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, r] of after) {
      const was = before.get(id);
      const sort = after.size - [...after.keys()].indexOf(id);
      if (!was) {
        void upsertRole(r, sort).catch(() => toast(`No se pudo crear el rol “${r.name}”.`, "error"));
      } else if (JSON.stringify(was) !== JSON.stringify(r)) {
        void upsertRole(r, sort).catch(() => toast(`No se pudieron guardar los permisos de “${r.name}”.`, "error"));
      }
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void deleteRole(id).catch(() => toast("No se pudo eliminar el rol del servidor.", "error"));
    }
  }, [toast]);

  const syncContent = useCallback((prev: ContentItem[], next: ContentItem[]) => {
    const map = (l: ContentItem[]) => new Map(l.map((c) => [c.id, c] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, c] of after) {
      const was = before.get(id);
      if (!was) {
        void upsertContent(c).catch(() => toast(`No se pudo crear “${c.title}”.`, "error"));
      } else if (JSON.stringify(was) !== JSON.stringify(c)) {
        void upsertContent(c).catch(() => toast(`No se pudieron guardar los cambios de “${c.title}”.`, "error"));
      }
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void deleteContent(id).catch(() => toast("No se pudo eliminar el contenido del servidor.", "error"));
    }
  }, [toast]);

  const syncUser = useCallback((prev: PlatformUser[], next: PlatformUser[]) => {
    const map = (l: PlatformUser[]) => new Map(l.map((u) => [u.id, u] as const));
    const before = map(prev);
    for (const [id, u] of next.map((u) => [u.id, u] as const)) {
      const was = before.get(id);
      if (was && JSON.stringify(was) !== JSON.stringify(u)) {
        const [first_name = "", ...rest] = u.name.trim().split(" ");
        void updateProfileById(id, { first_name, last_name: rest.join(" "), role_label: u.role, platform_status: u.status }).catch(() => toast(`No se pudo actualizar el usuario ${u.name}.`, "error"));
      }
    }
  }, [toast]);

  const syncAdmin = useCallback((prev: Administrator[], next: Administrator[]) => {
    const map = (l: Administrator[]) => new Map(l.map((a) => [a.id, a] as const));
    const before = map(prev);
    const after = map(next);
    for (const [id, a] of after) {
      const was = before.get(id);
      if (!was) continue; // invitación: sin cuenta de auth todavía
      if (JSON.stringify(was) !== JSON.stringify(a)) {
        const [first_name = "", ...rest] = a.name.trim().split(" ");
        void updateProfileById(id, { first_name, last_name: rest.join(" "), role_id: a.roleId, platform_status: a.status, last_login: a.lastLogin }).catch(() => toast(`No se pudo actualizar el administrador ${a.name}.`, "error"));
      }
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void updateProfileById(id, { is_admin: false }).catch(() => toast("No se pudo quitar el acceso de administrador.", "error"));
    }
  }, [toast]);

  const syncNotice = useCallback((prev: Notice[], next: Notice[]) => {
    const map = (l: Notice[]) => new Map(l.map((n) => [n.id, n] as const));
    const before = map(prev);
    for (const [id, n] of next.map((n) => [n.id, n] as const)) {
      const was = before.get(id);
      if (!was || JSON.stringify(was) !== JSON.stringify(n)) void upsertNotice(n).catch(() => undefined);
    }
  }, []);

  const syncSettings = useCallback((prev: Settings, next: Settings) => {
    if (JSON.stringify(prev) !== JSON.stringify(next)) void saveSettings(next).catch(() => undefined);
  }, []);

  const syncMovement = useCallback((prev: Movement[], next: Movement[]) => {
    const ids = new Set(prev.map((m) => m.id));
    for (const m of next) {
      if (!ids.has(m.id)) void insertMovement(m).catch(() => toast("No se pudo registrar el movimiento de inventario.", "error"));
    }
  }, [toast]);

  const syncActivityNew = useCallback((prev: Activity[], next: Activity[]) => {
    const ids = new Set(prev.map((a) => a.id));
    for (const a of next) {
      if (!ids.has(a.id)) void insertActivity(a).catch(() => undefined);
    }
  }, []);

  const mutate = useCallback<AdminContextValue["mutate"]>((key, updater, log) => {
    setData((current) => {
      const nextValue = updater(current[key]);
      if (key === "products") syncProduct(current.products as Product[], nextValue as Product[]);
      if (key === "categories") syncCategory(current.categories as Category[], nextValue as Category[]);
      if (key === "services") syncService(current.services as Service[], nextValue as Service[]);
      if (key === "orders") syncOrder(current.orders as Order[], nextValue as Order[]);
      if (key === "customers") syncCustomer(current.customers as Customer[], nextValue as Customer[]);
      if (key === "roles") syncRole(current.roles as Role[], nextValue as Role[]);
      if (key === "content") syncContent(current.content as ContentItem[], nextValue as ContentItem[]);
      if (key === "users") syncUser(current.users as PlatformUser[], nextValue as PlatformUser[]);
      if (key === "admins") syncAdmin(current.admins as Administrator[], nextValue as Administrator[]);
      if (key === "notifications") syncNotice(current.notifications as Notice[], nextValue as Notice[]);
      if (key === "settings") syncSettings(current.settings as Settings, nextValue as Settings);
      if (key === "movements") syncMovement(current.movements as Movement[], nextValue as Movement[]);
      const next = { ...current, [key]: nextValue };
      if (log) {
        next.activity = [{ id: newId("ac"), actor: user?.email ?? SESSION_ACTOR, date: new Date().toISOString(), demo: false, ...log }, ...current.activity];
        syncActivityNew(current.activity, next.activity);
      }
      return next;
    });
  }, [syncProduct, syncCategory, syncService, syncOrder, syncCustomer, syncRole, syncContent, syncUser, syncAdmin, syncNotice, syncSettings, syncMovement, syncActivityNew, user]);

  const notify = useCallback((notice: Omit<Notice, "id" | "date" | "read">) => {
    const full: Notice = { id: newId("n"), date: new Date().toISOString(), read: false, ...notice };
    setData((current) => ({ ...current, notifications: [full, ...current.notifications] }));
    void upsertNotice(full).catch(() => undefined);
  }, []);

  const sendTicketReply = useCallback(async (id: string, text: string) => {
    const ticket = data.tickets.find((item) => item.id === id);
    if (!ticket) throw new Error("Ticket no longer exists");
    const next = await replyToTicket(ticket, text);
    setData((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === id ? next : item) }));
  }, [data.tickets]);

  const role = data.roles.find((r) => r.id === roleId) ?? data.roles[0] ?? seed.seedRoles[0];
  const can = useCallback((permission: string) => superAdmin || role.permissions.includes(permission), [role, superAdmin]);

  const value = useMemo(() => ({ data, user, mutate, notify, sendTicketReply, roleId, setRoleId, role, can, toast, toasts, dismissToast, backend, pathname, navigate }),
    [data, user, mutate, notify, sendTicketReply, roleId, setRoleId, role, can, toast, toasts, dismissToast, backend, pathname, navigate]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

/* ─────────── Formatting helpers ─────────── */

/**
 * Formatea una fecha sin romper la vista: una fila con fecha inválida o ausente
 * muestra "—" en lugar de dejar la página en blanco.
 */
export function fmtSafe(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", opts).format(d);
}

export const fmtDate = (iso: string | null | undefined) => fmtSafe(iso, { month: "short", day: "numeric", year: "numeric" });
export const fmtDateTime = (iso: string | null | undefined) => fmtSafe(iso, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtDay = (iso: string | null | undefined) => fmtSafe(iso, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
export const fmtTime = (iso: string | null | undefined) => fmtSafe(iso, { hour: "2-digit", minute: "2-digit" });
export const fmtMoney = (value: number | null, currency: string) =>
  value === null ? "Not set" : currency ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value) : value.toFixed(2);

export function productStockState(p: Product): "In stock" | "Low stock" | "Out of stock" | "Digital" {
  if (p.stock === null) return "Digital";
  if (p.stock === 0) return "Out of stock";
  if (p.stock <= p.minStock) return "Low stock";
  return "In stock";
}
export function productDisplayStatus(p: Product) {
  return p.status === "Active" && p.stock === 0 ? "Out of stock" : p.status;
}
