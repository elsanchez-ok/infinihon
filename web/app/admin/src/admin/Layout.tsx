import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity, BarChart3, Bell, Boxes, Briefcase, ChevronDown, Cloud, FileText, FolderTree, Gauge, HelpCircle, KeyRound,
  LayoutDashboard, LogOut, Menu, Network, Package, Plug, Search, Server, Settings, Shield, ShieldCheck, ShoppingCart,
  User, UserCog, Users, UsersRound, X, type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useAdmin } from "./store";
import { signOutAndGo } from "./supabaseSync";
import { Modal } from "./ui";
import { useLocale } from "./locale";

export interface NavItem { label: string; to: string; icon: LucideIcon; permission: string }
export const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "Principal", items: [
    { label: "Overview", to: "/admin", icon: LayoutDashboard, permission: "" },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart3, permission: "analytics.view" },
  ] },
  { label: "Commerce", items: [
    { label: "Products", to: "/admin/products", icon: Package, permission: "products.view" },
    { label: "Categories", to: "/admin/categories", icon: FolderTree, permission: "categories.view" },
    { label: "Inventory", to: "/admin/inventory", icon: Boxes, permission: "inventory.view" },
    { label: "Orders", to: "/admin/orders", icon: ShoppingCart, permission: "orders.view" },
    { label: "Customers", to: "/admin/customers", icon: UsersRound, permission: "customers.view" },
  ] },
  { label: "Platform", items: [
    { label: "Users", to: "/admin/users", icon: Users, permission: "users.view" },
    { label: "Administrators", to: "/admin/administrators", icon: UserCog, permission: "administrators.view" },
    { label: "Roles & Permissions", to: "/admin/roles", icon: KeyRound, permission: "roles.view" },
    { label: "Services", to: "/admin/services", icon: Briefcase, permission: "services.view" },
    { label: "Support inbox", to: "/admin/support", icon: HelpCircle, permission: "customers.view" },
    { label: "Content", to: "/admin/content", icon: FileText, permission: "content.view" },
  ] },
  { label: "Infrastructure", items: [
    { label: "Infrastructure", to: "/admin/infrastructure", icon: Network, permission: "infrastructure.view" },
    { label: "Servers", to: "/admin/infrastructure/servers", icon: Server, permission: "infrastructure.view" },
    { label: "Cloud", to: "/admin/infrastructure/cloud", icon: Cloud, permission: "infrastructure.view" },
    { label: "Monitoring", to: "/admin/infrastructure/monitoring", icon: Gauge, permission: "infrastructure.view" },
    { label: "Integrations", to: "/admin/integrations", icon: Plug, permission: "integrations.view" },
  ] },
  { label: "System", items: [
    { label: "Notifications", to: "/admin/notifications", icon: Bell, permission: "notifications.view" },
    { label: "Activity Log", to: "/admin/activity", icon: Activity, permission: "activity.view" },
    { label: "Security", to: "/admin/security", icon: Shield, permission: "security.view" },
    { label: "Settings", to: "/admin/settings", icon: Settings, permission: "settings.view" },
  ] },
];

function isActive(pathname: string, to: string) {
  if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
  if (to === "/admin/infrastructure") return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

export function Mark({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className={cn("flex flex-col items-center gap-1.5", collapsed ? "" : "w-max")}>
      <img src="/assets/infinihon.png" alt="INFINIHON" className="h-8 w-auto shrink-0" />
      {!collapsed && (
        <span className="block max-w-[200px] text-center font-mono text-[7.5px] uppercase leading-[1.7] tracking-[0.22em] text-volt/90">Infrastructure · Innovation · Honduras</span>
      )}
    </span>
  );
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { pathname, navigate, can, backend } = useAdmin();
  const { t } = useLocale();
  const go = (to: string) => { navigate(to); onClose(); };
  const content = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-white/[0.06]", compact ? "justify-center px-2" : "px-5")}>
        <a href="/admin" onClick={(e) => { e.preventDefault(); go("/admin"); }} aria-label="INFINIHON Control Center — Overview"><Mark collapsed={compact} /></a>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Control Center">
        {navGroups.map((group) => {
          const items = group.items.filter((i) => !i.permission || can(i.permission));
          if (!items.length) return null;
          return (
            <div key={group.label} className="mb-5">
              {compact ? <div className="mx-auto mb-2 h-px w-6 bg-white/[0.08]" /> : <div className="mb-1.5 px-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/70">{t(group.label)}</div>}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(pathname, item.to);
                  return (
                    <li key={item.to}>
                      <a href={item.to} onClick={(e) => { e.preventDefault(); go(item.to); }} aria-current={active ? "page" : undefined} title={compact ? t(item.label) : undefined}
                        className={cn("group relative flex h-9 items-center gap-3 rounded-md text-[13px] transition-colors", compact ? "justify-center" : "px-2.5",
                          active ? "bg-hn/40 text-snow" : "text-steel hover:bg-white/[0.04] hover:text-snow")}>
                        {active && <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-volt" aria-hidden />}
                        <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-volt" : "")} aria-hidden />
                        {!compact && <span className="truncate">{t(item.label)}</span>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      {!compact && (
        <div className="border-t border-white/[0.06] px-5 py-4">
          <div className={cn("flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em]", backend === "online" ? "text-emerald-400/80" : backend === "loading" ? "text-steel" : "text-red-300/80")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", backend === "online" ? "bg-emerald-400" : backend === "loading" ? "bg-steel/60 animate-pulse" : "bg-red-300")} aria-hidden />
            {backend === "online" ? "Supabase connected" : backend === "loading" ? "Connecting…" : "Supabase offline"}
          </div>
          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-steel/50">Hecho en Honduras.</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] border-r border-white/[0.06] bg-[#070a0e] md:block xl:hidden">{content(true)}</aside>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[256px] border-r border-white/[0.06] bg-[#070a0e] xl:block">{content(false)}</aside>
      <div className={cn("fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity md:hidden", mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} />
      <aside aria-hidden={!mobileOpen} className={cn("fixed inset-y-0 left-0 z-[65] w-[280px] border-r border-white/[0.08] bg-[#070a0e] transition-transform duration-300 md:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <button onClick={onClose} className="absolute right-3 top-4 rounded-md p-2 text-steel hover:text-snow" aria-label="Close navigation"><X className="h-4 w-4" /></button>
        {content(false)}
      </aside>
    </>
  );
}

function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", fn);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", fn); document.removeEventListener("keydown", key); };
  }, [onClose]);
  return ref;
}

function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, navigate, can } = useAdmin();
  const [q, setQ] = useState("");
  useEffect(() => { if (!open) setQ(""); }, [open]);
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const match = (s: string) => s.toLowerCase().includes(term);
    const out: { group: string; label: string; meta: string; to: string }[] = [];
    if (can("products.view")) data.products.filter((p) => match(p.name + p.sku)).forEach((p) => out.push({ group: "Products", label: p.name, meta: p.sku, to: `/admin/products/${p.id}` }));
    if (can("services.view")) data.services.filter((s) => match(s.name)).forEach((s) => out.push({ group: "Services", label: s.name, meta: s.category, to: "/admin/services" }));
    if (can("orders.view")) data.orders.filter((o) => match(o.id)).forEach((o) => out.push({ group: "Orders", label: o.id, meta: o.status, to: `/admin/orders/${o.id}` }));
    if (can("customers.view")) data.customers.filter((c) => match(c.name + c.email)).forEach((c) => out.push({ group: "Customers", label: c.name, meta: c.email, to: `/admin/customers/${c.id}` }));
    if (can("users.view")) data.users.filter((u) => match(u.name + u.email)).forEach((u) => out.push({ group: "Users", label: u.name, meta: u.email, to: "/admin/users" }));
    if (can("administrators.view")) data.admins.filter((a) => match(a.name + a.email)).forEach((a) => out.push({ group: "Administrators", label: a.name, meta: a.email, to: "/admin/administrators" }));
    navGroups.flatMap((g) => g.items).filter((i) => (!i.permission || can(i.permission)) && match(i.label)).forEach((i) => out.push({ group: "Modules", label: i.label, meta: "Go to module", to: i.to }));
    return out.slice(0, 24);
  }, [q, data, can]);

  if (!open) return null;
  const groups = [...new Set(results.map((r) => r.group))];
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Global search">
      <div className="admin-fade absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="admin-pop relative w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <Search className="h-4 w-4 text-volt" aria-hidden />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Search products, orders, customers, users…" aria-label="Search anything"
            className="h-14 flex-1 bg-transparent text-sm text-snow outline-none placeholder:text-steel/60" />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-steel">ESC</kbd>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!q && <p className="px-3 py-6 text-center text-xs text-steel">Type to search across products, services, orders, customers, users, administrators and modules.</p>}
          {q && !results.length && <p className="px-3 py-6 text-center text-xs text-steel">No results for “{q}”.</p>}
          {groups.map((g) => (
            <div key={g} className="mb-2">
              <div className="px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel/70">{g}</div>
              {results.filter((r) => r.group === g).map((r, i) => (
                <button key={g + i} onClick={() => { navigate(r.to); onClose(); }} className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-white/[0.05] focus:bg-white/[0.05] focus:outline-none">
                  <span className="truncate text-snow">{r.label}</span>
                  <span className="truncate text-xs text-steel">{r.meta}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { data, navigate, role, roleId, setRoleId, toast, mutate, user } = useAdmin();
  const { t } = useLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const bellRef = useOutside(() => setBellOpen(false));
  const profileRef = useOutside(() => setProfileOpen(false));
  const unread = data.notifications.filter((n) => !n.read).length;
  const pendingTickets = data.tickets.filter((t) => t.messages.at(-1)?.from === "Tú");

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-obsidian/80 px-4 backdrop-blur-xl md:px-6">
      <button onClick={onMenu} className="rounded-md p-2 text-steel hover:bg-white/[0.05] hover:text-snow md:hidden" aria-label={t("Open navigation")}><Menu className="h-5 w-5" /></button>
      <span className="md:hidden"><Mark collapsed /></span>

      <button onClick={() => setSearchOpen(true)} className="group ml-auto flex h-9 items-center gap-2 rounded-md border border-white/10 bg-ink/70 px-3 text-sm text-steel transition-colors hover:border-white/20 md:ml-0 md:w-80" aria-label={t("Search anything")}>
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden md:inline">{t("Search anything...")}</span>
        <kbd className="ml-auto hidden rounded border border-white/10 px-1.5 font-mono text-[10px] md:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1 md:ml-auto">
        <div ref={bellRef} className="relative">
          <button onClick={() => setBellOpen((v) => !v)} className="relative rounded-md p-2 text-steel hover:bg-white/[0.05] hover:text-snow" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} aria-expanded={bellOpen}>
            <Bell className="h-[18px] w-[18px]" />
            {unread + pendingTickets.length > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tech px-1 font-mono text-[9px] text-snow">{unread + pendingTickets.length}</span>}
          </button>
          {bellOpen && (
            <div className="admin-pop absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="text-sm font-bold">{t("Notifications")}</span>
                {unread > 0 && <button className="text-xs text-volt hover:text-snow" onClick={() => mutate("notifications", (n) => n.map((x) => ({ ...x, read: true })))}>Mark all as read</button>}
              </div>
              {data.notifications.length || pendingTickets.length ? (
                <ul className="max-h-72 overflow-y-auto">
                  {pendingTickets.slice(0, 6).map((ticket) => (
                    <li key={`ticket-${ticket.id}`} className="border-b border-white/[0.04] last:border-0">
                      <button className="w-full px-4 py-3 text-left hover:bg-white/[0.03]" onClick={() => { setBellOpen(false); navigate(`/admin/support/${ticket.id}`); }}>
                        <p className="text-sm text-snow/90">{t("New customer message")} · {ticket.subject}</p>
                        <p className="mt-0.5 truncate text-xs text-steel">{ticket.messages.at(-1)?.text}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{ticket.id} · {ticket.category}</p>
                      </button>
                    </li>
                  ))}
                  {data.notifications.slice(0, 6).map((n) => (
                    <li key={n.id} className="border-b border-white/[0.04] px-4 py-3 last:border-0">
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt" aria-label="Unread" />}
                        <div><p className="text-sm text-snow/90">{n.title}</p><p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{n.type}</p></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="px-4 py-8 text-center text-xs text-steel">{t("You're all caught up. No notifications yet.")}</p>}
              <button className="w-full border-t border-white/[0.06] px-4 py-2.5 text-xs text-steel hover:text-snow" onClick={() => { setBellOpen(false); navigate("/admin/notifications"); }}>{t("View all notifications")}</button>
            </div>
          )}
        </div>

        <button onClick={() => setHelpOpen(true)} className="hidden rounded-md p-2 text-steel hover:bg-white/[0.05] hover:text-snow sm:block" aria-label={t("Help")}><HelpCircle className="h-[18px] w-[18px]" /></button>

        <div ref={profileRef} className="relative ml-1">
          <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 hover:bg-white/[0.04]" aria-expanded={profileOpen} aria-haspopup="menu">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-tech/40 bg-hn/50 text-xs font-bold text-snow"><User className="h-4 w-4" aria-hidden /></span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[13px] font-semibold text-snow">{user?.email ?? "Sesión"}</span>
              <span className="block text-[11px] text-steel">{role.name}</span>
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-steel lg:block" aria-hidden />
          </button>
          {profileOpen && (
            <div role="menu" className="admin-pop absolute right-0 top-12 w-72 overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl">
              <div className="border-b border-white/[0.06] px-4 py-3">
                <div className="text-sm font-semibold">{user?.email ?? "Sesión de administrador"}</div>
                <div className="text-xs text-steel">Sesión verificada · {role.name}</div>
              </div>
              <div className="border-b border-white/[0.06] px-4 py-3">
                <label htmlFor="role-preview" className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel">Preview as role</label>
                <select id="role-preview" value={roleId} onChange={(e) => { setRoleId(e.target.value); toast(`Previewing interface as ${data.roles.find((r) => r.id === e.target.value)?.name}.`, "info"); }}
                  className="mt-1.5 h-9 w-full rounded-md border border-white/10 bg-obsidian px-2 text-sm text-snow [&>option]:bg-ink">
                  {data.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <p className="mt-1.5 text-[10.5px] leading-snug text-steel">Hides UI the role can't use. Real enforcement must happen on the server.</p>
              </div>
              {[
                { label: "My Profile", icon: User, to: "/admin/profile" },
                { label: "Platform Settings", icon: Settings, to: "/admin/settings" },
                { label: "Security", icon: ShieldCheck, to: "/admin/security" },
              ].map((i) => (
                <button key={i.label} role="menuitem" onClick={() => { setProfileOpen(false); navigate(i.to); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-snow/90 hover:bg-white/[0.04]">
                  <i.icon className="h-4 w-4 text-steel" aria-hidden />{t(i.label)}
                </button>
              ))}
              <a role="menuitem" href="/auth" onClick={(e) => { e.preventDefault(); void signOutAndGo(); }} className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-2.5 text-sm text-snow/90 hover:bg-white/[0.04]">
                <LogOut className="h-4 w-4 text-steel" aria-hidden />{t("Cerrar sesión")}
              </a>
            </div>
          )}
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={t("Help & documentation")} description={t("Guidance for operating the INFINIHON Control Center.")}>
        <ul className="space-y-3 text-sm text-steel">
          <li><span className="font-semibold text-snow">Search:</span> press ⌘K / Ctrl+K anywhere to open global search.</li>
          <li><span className="font-semibold text-snow">Data:</span> this panel reads and writes Supabase. Edits are saved as you make them; records marked <span className="font-mono text-xs">DEMO</span> are illustrative samples kept for reference.</li>
          <li><span className="font-semibold text-snow">Permissions:</span> use “Preview as role” in the profile menu to see what each role can access. Supabase RLS is the real authority.</li>
          <li><span className="font-semibold text-snow">Public site:</span> the store reads the same catalog, so changes in Inventory, Services and Content appear on the public pages.</li>
        </ul>
      </Modal>
    </header>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname, backend } = useAdmin();
  useEffect(() => setMobileOpen(false), [pathname]);
  return (
    <div className="admin-root min-h-screen bg-obsidian text-snow">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-tech focus:px-3 focus:py-2">Skip to content</a>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="md:pl-[72px] xl:pl-[256px]">
        <Topbar onMenu={() => setMobileOpen(true)} />
        {backend !== "online" && (
          <div role="status" className={cn(
            "border-b px-4 py-2 text-center text-[11px] md:px-6",
            backend === "loading" ? "border-dashed border-white/[0.06] bg-hn/[0.12] text-steel" : "border-red-300/25 bg-red-500/10 text-red-200",
          )}>
            {backend === "loading"
              ? <>Loading data from Supabase…</>
              : <>Supabase is unreachable. You are seeing sample data and <span className="font-semibold">changes will not be saved</span> until the connection is back.</>}
          </div>
        )}
        <main id="admin-main" className="relative mx-auto w-full max-w-[1400px] px-4 py-7 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
