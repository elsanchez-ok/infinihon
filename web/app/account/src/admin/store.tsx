import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as seed from "./data";
import type { Activity, Administrator, Category, ContentItem, Customer, Movement, Notice, Order, PlatformUser, Product, Role, Service, Settings } from "./data";

/**
 * Local, in-memory state for the Control Center.
 * Nothing here is persisted or sent anywhere. When a backend exists, replace the
 * `mutate` implementation with calls to an API client and keep the same shape.
 * Permissions checked with `can()` only hide UI — the backend must enforce them.
 */

export interface AdminData {
  products: Product[]; categories: Category[]; services: Service[]; orders: Order[]; customers: Customer[];
  users: PlatformUser[]; admins: Administrator[]; roles: Role[]; content: ContentItem[];
  activity: Activity[]; notifications: Notice[]; movements: Movement[]; settings: Settings;
}

type Tone = "success" | "error" | "info";
interface Toast { id: number; message: string; tone: Tone }
interface LogInput { action: string; module: string; target: string }

interface AdminContextValue {
  data: AdminData;
  mutate: <K extends keyof AdminData>(key: K, updater: (current: AdminData[K]) => AdminData[K], log?: LogInput) => void;
  notify: (notice: Omit<Notice, "id" | "date" | "read">) => void;
  roleId: string;
  setRoleId: (id: string) => void;
  role: Role;
  can: (permission: string) => boolean;
  toast: (message: string, tone?: Tone) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  pathname: string;
  navigate: (to: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);
export const SESSION_ACTOR = "Demo session";
let uid = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

export function AdminProvider({ children, pathname, navigate }: { children: ReactNode; pathname: string; navigate: (to: string) => void }) {
  const [data, setData] = useState<AdminData>(() => ({
    products: seed.seedProducts, categories: seed.seedCategories, services: seed.seedServices, orders: seed.seedOrders,
    customers: seed.seedCustomers, users: seed.seedUsers, admins: seed.seedAdmins, roles: seed.seedRoles,
    content: seed.seedContent, activity: seed.seedActivity, notifications: [], movements: [], settings: seed.seedSettings,
  }));
  const [roleId, setRoleId] = useState("super");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const mutate = useCallback<AdminContextValue["mutate"]>((key, updater, log) => {
    setData((current) => {
      const next = { ...current, [key]: updater(current[key]) };
      if (log) next.activity = [{ id: newId("ac"), actor: SESSION_ACTOR, date: new Date().toISOString(), demo: false, ...log }, ...current.activity];
      return next;
    });
  }, []);

  const notify = useCallback((notice: Omit<Notice, "id" | "date" | "read">) => {
    setData((current) => ({ ...current, notifications: [{ id: newId("n"), date: new Date().toISOString(), read: false, ...notice }, ...current.notifications] }));
  }, []);

  const role = data.roles.find((r) => r.id === roleId) ?? data.roles[0];
  const can = useCallback((permission: string) => role.permissions.includes(permission), [role]);

  const value = useMemo(() => ({ data, mutate, notify, roleId, setRoleId, role, can, toast, toasts, dismissToast, pathname, navigate }),
    [data, mutate, notify, roleId, role, can, toast, toasts, dismissToast, pathname, navigate]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

/* ─────────── Formatting helpers ─────────── */

export const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso)) : "—";
export const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
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
