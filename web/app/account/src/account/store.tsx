import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSessionUser, type SessionUser } from "../lib/supabase";
import {
  addFavorite, changePassword, fetchCatalog, fetchFavorites, fetchNotifications, fetchOrders, fetchProfile,
  fetchRequests, fetchTickets, markAllNotificationsRead, persistNotification, removeFavorite,
  saveProfilePatch, setNotificationRead, upsertRequest, upsertTicket,
} from "./supabaseData";
import {
  emptyProfile, initialPreferences, initialSecurity, publicServices,
  type AccountNotification, type PortalOrder, type Preferences, type Profile, type PublicService,
  type RequestRecord, type RequestType, type SecurityState, type TicketCategory, type TicketRecord, type Priority,
} from "./data";

/**
 * Estado del portal con backend real (Supabase):
 *  · La sesión se verifica contra Supabase Auth al montar.
 *  · Perfil, solicitudes, tickets, favoritos, notificaciones y pedidos se
 *    cargan de la base y cada cambio se persiste vía REST; RLS garantiza en
 *    el servidor que cada usuario solo acceda a lo suyo.
 *  · El catálogo de servicios se lee de store_items (lectura pública) con
 *    el listado estático como respaldo si la base no responde.
 */

export interface AccountData {
  profile: Profile;
  preferences: Preferences;
  security: SecurityState;
  requests: RequestRecord[];
  tickets: TicketRecord[];
  favorites: string[];
  notifications: AccountNotification[];
  orders: PortalOrder[];
  catalog: PublicService[];
  onboarded: boolean;
  profileCompleted: boolean;
}

interface Toast { id: number; message: string; tone: "success" | "error" | "info" }

interface Ctx {
  data: AccountData;
  session: SessionUser | null;
  isAdmin: boolean;
  loading: boolean;
  pathname: string;
  navigate: (to: string) => void;
  patch: (partial: Partial<AccountData>) => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  notify: (n: Omit<AccountNotification, "id" | "date" | "read">) => void;
  createRequest: (input: { title: string; type: RequestType; description: string }) => Promise<RequestRecord>;
  createTicket: (input: { subject: string; category: TicketCategory; priority: Priority; description: string; serviceId?: string; orderId?: string }) => Promise<TicketRecord>;
  replyTicket: (id: string, text: string) => Promise<void>;
  cancelRequest: (id: string) => void;
  toggleFavorite: (serviceId: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  reset: () => void;
  persistProfile: (p: Profile) => Promise<void>;
}

const AccountContext = createContext<Ctx | null>(null);
let seq = 0;
export const uid = (p: string) => `${p}-${Date.now().toString(36)}${(seq++).toString(36)}`;

const initial: AccountData = {
  profile: { ...emptyProfile },
  preferences: { ...initialPreferences },
  security: { ...initialSecurity, sessions: [{ ...initialSecurity.sessions[0], lastActive: new Date().toISOString() }] },
  requests: [],
  tickets: [],
  favorites: [],
  notifications: [],
  orders: [],
  catalog: [...publicServices],
  onboarded: false,
  profileCompleted: false,
};

export function AccountProvider({ children, pathname, navigate }: { children: ReactNode; pathname: string; navigate: (to: string) => void }) {
  const [data, setData] = useState<AccountData>(initial);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const patch = useCallback((partial: Partial<AccountData>) => setData((d) => ({ ...d, ...partial })), []);

  const notify = useCallback((n: Omit<AccountNotification, "id" | "date" | "read">) => {
    const record: AccountNotification = { id: uid("n"), date: new Date().toISOString(), read: false, ...n };
    setData((d) => ({ ...d, notifications: [record, ...d.notifications] }));
    void persistNotification(record).catch(() => undefined);
  }, []);

  /* ── Sesión + carga inicial desde Supabase ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await getSessionUser();
      if (!alive) return;
      if (!user) { setSession(null); setLoading(false); return; }
      setSession(user);
      try {
        const profile = await fetchProfile();
        if (!alive) return;
        if (profile) {
          setIsAdmin(profile.isAdmin);
          setData((d) => ({
            ...d,
            profile: { firstName: profile.firstName, lastName: profile.lastName, email: profile.email || user.email, phone: profile.phone, company: profile.company, position: profile.position },
            profileCompleted: Boolean(profile.firstName || profile.lastName),
            preferences: { ...d.preferences },
          }));
        }
        const [reqs, tks, favs, notifs, ords, cat] = await Promise.all([
          fetchRequests(), fetchTickets(), fetchFavorites(), fetchNotifications(), fetchOrders(),
          fetchCatalog().catch(() => null),
        ]);
        if (!alive) return;
        setData((d) => ({
          ...d,
          requests: reqs, tickets: tks, favorites: favs, notifications: notifs, orders: ords,
          catalog: cat && cat.length ? cat : d.catalog,
        }));
      } catch {
        // sin conexión a la base: el portal sigue usable en modo local
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!session) return;
    const refreshTickets = () => {
      void fetchTickets().then((tickets) => setData((d) => ({ ...d, tickets }))).catch(() => undefined);
    };
    const timer = window.setInterval(refreshTickets, 30_000);
    return () => window.clearInterval(timer);
  }, [session]);

  const createRequest = useCallback<Ctx["createRequest"]>(async (input) => {
    const now = new Date().toISOString();
    const record: RequestRecord = {
      id: uid("REQ").toUpperCase(), title: input.title.trim(), type: input.type, description: input.description.trim(),
      status: "Enviada", created: now, updated: now,
      timeline: [{ label: "Solicitud creada", date: now, note: "Recibida por el equipo de InfiniHon." }],
      messages: [], attachments: [],
    };
    setData((d) => ({
      ...d,
      requests: [record, ...d.requests],
      notifications: [{ id: uid("n"), title: "Solicitud recibida", description: `«${record.title}» quedó registrada como ${record.type.toLowerCase()}.`, group: "Soporte", date: now, read: false }, ...d.notifications],
    }));
    void upsertRequest(record).catch(() => toast("No se pudo guardar en el servidor; quedó registrada localmente.", "error"));
    return record;
  }, [toast]);

  const createTicket = useCallback<Ctx["createTicket"]>(async (input) => {
    const now = new Date().toISOString();
    const record: TicketRecord = {
      id: uid("TCK").toUpperCase(), subject: input.subject.trim(), category: input.category, priority: input.priority,
      description: input.description.trim(), status: "Abierto", created: now, updated: now,
      serviceId: input.serviceId, orderId: input.orderId,
      messages: [{ from: "Tú", text: input.description.trim(), date: now }], attachments: [],
    };
    setData((d) => ({
      ...d,
      tickets: [record, ...d.tickets],
      notifications: [{ id: uid("n"), title: "Ticket creado", description: `${record.id} · ${record.subject}`, group: "Soporte", date: now, read: false }, ...d.notifications],
    }));
    void upsertTicket(record).catch(() => toast("No se pudo guardar en el servidor; quedó registrado localmente.", "error"));
    return record;
  }, [toast]);

  const replyTicket = useCallback(async (id: string, text: string) => {
    const now = new Date().toISOString();
    const ticket = data.tickets.find((item) => item.id === id);
    if (!ticket) throw new Error("Ticket no longer exists");
    const updated: TicketRecord = {
      ...ticket,
      messages: [...ticket.messages, { from: "Tú", text, date: now }],
      updated: now,
      status: ticket.status === "Resuelto" || ticket.status === "Cerrado" ? "Abierto" : ticket.status,
    };
    await upsertTicket(updated);
    setData((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === id ? updated : item) }));
  }, [data.tickets]);

  const cancelRequest = useCallback((id: string) => {
    const now = new Date().toISOString();
    let updated: RequestRecord | undefined;
    setData((d) => ({
      ...d,
      requests: d.requests.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, status: "Cancelada", updated: now, timeline: [...r.timeline, { label: "Solicitud cancelada", date: now, note: "Cancelada por ti." }] };
        return updated;
      }),
    }));
    if (updated) void upsertRequest(updated).catch(() => undefined);
  }, []);

  const toggleFavorite = useCallback((serviceId: string) => {
    const removing = data.favorites.includes(serviceId);
    setData((d) => ({ ...d, favorites: removing ? d.favorites.filter((f) => f !== serviceId) : [...d.favorites, serviceId] }));
    void (removing ? removeFavorite(serviceId) : addFavorite(serviceId)).catch(() => undefined);
  }, [data.favorites]);

  const markAllRead = useCallback(() => {
    setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
    void markAllNotificationsRead().catch(() => undefined);
  }, []);
  const markRead = useCallback((id: string) => {
    setData((d) => ({ ...d, notifications: d.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
    void setNotificationRead(id, true).catch(() => undefined);
  }, []);
  const reset = useCallback(() => setData(initial), []);

  /** Guarda el perfil en la base (usado por la página de perfil). */
  const persistProfile = useCallback(async (p: Profile) => {
    if (!session) return;
    try {
      await saveProfilePatch(session.id, p);
      patch({ profile: p, profileCompleted: true });
      toast("Perfil guardado en tu cuenta.");
    } catch {
      patch({ profile: p, profileCompleted: true });
      toast("Sin conexión al servidor: los cambios quedaron en este dispositivo.", "error");
    }
  }, [session, patch, toast]);

  const value = useMemo(() => ({
    data, session, isAdmin, loading, pathname, navigate, patch, toast, toasts, dismissToast, notify,
    createRequest, createTicket, replyTicket, cancelRequest, toggleFavorite, markAllRead, markRead, reset, persistProfile,
  }), [data, session, isAdmin, loading, pathname, navigate, patch, toast, toasts, dismissToast, notify, createRequest, createTicket, replyTicket, cancelRequest, toggleFavorite, markAllRead, markRead, reset, persistProfile]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount debe usarse dentro de AccountProvider");
  return ctx;
}

export const displayName = (p: Profile) => [p.firstName, p.lastName].filter(Boolean).join(" ") || "Usuario de InfiniHon";
export const initialsOf = (p: Profile) => ((p.firstName[0] ?? "") + (p.lastName[0] ?? "")).toUpperCase() || "IH";
export { changePassword };
