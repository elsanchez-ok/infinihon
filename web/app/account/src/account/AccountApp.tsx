import { useEffect, useMemo, useState } from "react";
import {
  Bell, Boxes, Compass, FileText, Headphones, Heart, HelpCircle, LifeBuoy, LogIn, LogOut, Menu, Package,
  Search, Send, Settings, ShieldCheck, User, Users, X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { displayName, useAccount, AccountProvider } from "./store";
import { fmtRelative } from "./data";
import { authSignOut } from "../lib/supabase";
import {
  AccountMark, Button, ConfirmDialog, Modal, Toaster, UserAvatar, useOutside,
} from "./ui";
import {
  DashboardPage, ServicesPage, ServiceDetailPage, OrdersPage, OrderDetailPage, FavoritesPage,
  BillingPage, OrganizationPage, DocumentsPage, HelpPage,
} from "./pages/Core";
import {
  RequestsPage, RequestFormPage, RequestDetailPage, SupportPage, TicketsPage, TicketDetailPage, MessagesPage,
} from "./pages/Engage";
import { ProfilePage, SecurityPage, SettingsPage, NotificationsPage } from "./pages/Account";
import { LocaleProvider } from "./locale";
import { EmptyState, PageHeader, Panel } from "./ui";
import "./account.css";

interface NavItem { label: string; to: string; icon: React.ComponentType<{ className?: string }> }

const groups: { label: string; items: NavItem[] }[] = [
  { label: "Resumen", items: [{ label: "Inicio", to: "/account", icon: Compass }] },
  { label: "Mi InfiniHon", items: [
    { label: "Mis servicios", to: "/account/services", icon: Boxes },
    { label: "Mis pedidos", to: "/account/orders", icon: Package },
    { label: "Mis solicitudes", to: "/account/requests", icon: Send },
    { label: "Favoritos", to: "/account/favorites", icon: Heart },
  ] },
  { label: "Soporte", items: [
    { label: "Soporte", to: "/account/support", icon: Headphones },
    { label: "Mensajes", to: "/account/messages", icon: LifeBuoy },
    { label: "Centro de ayuda", to: "/account/help", icon: HelpCircle },
  ] },
  { label: "Cuenta", items: [
    { label: "Mi perfil", to: "/account/profile", icon: User },
    { label: "Seguridad", to: "/account/security", icon: ShieldCheck },
    { label: "Configuración", to: "/account/settings", icon: Settings },
    { label: "Notificaciones", to: "/account/notifications", icon: Bell },
    { label: "Facturación", to: "/account/billing", icon: FileText },
    { label: "Organización", to: "/account/organization", icon: Users },
    { label: "Documentos", to: "/account/documents", icon: FileText },
  ] },
];

const isActive = (path: string, to: string) => (to === "/account" ? path === "/account" : path === to || path.startsWith(to + "/"));

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, pathname, navigate } = useAccount();
  const body = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
        <AccountMark onNavigate={(to) => { navigate(to); onClose(); }} />
        <button onClick={onClose} className="rounded-md p-2 text-steel hover:text-snow lg:hidden" aria-label="Cerrar navegación"><X className="h-4 w-4" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Portal de usuario">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="mb-1.5 px-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/70">{g.label}</div>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const on = isActive(pathname, i.to);
                return (
                  <li key={i.to}>
                    <a href={i.to} onClick={(e) => { e.preventDefault(); navigate(i.to); onClose(); }} aria-current={on ? "page" : undefined}
                      className={cn("relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors", on ? "bg-hn/40 text-snow" : "text-steel hover:bg-white/[0.04] hover:text-snow")}>
                      {on && <span className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full bg-volt" aria-hidden />}
                      <i.icon className={cn("h-4 w-4 shrink-0", on && "text-volt")} aria-hidden />
                      <span className="flex-1 truncate">{i.label}</span>
                      {i.to === "/account/notifications" && data.notifications.some((n) => !n.read) && <span className="h-1.5 w-1.5 rounded-full bg-volt" aria-label="Sin leer" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/[0.06] p-3">
        <a href="/auth" onClick={(e) => { e.preventDefault(); void authSignOut().then(() => window.location.assign("/auth")); }}
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] text-steel transition-colors hover:bg-white/[0.04] hover:text-snow">
          <LogOut className="h-4 w-4" aria-hidden />Cerrar sesión
        </a>
        <div className="mt-3 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-steel/50">Hecho en Honduras.</div>
      </div>
    </div>
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] border-r border-white/[0.06] bg-[#070a0e] lg:block">{body}</aside>
      <div className={cn("fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} />
      <aside aria-hidden={!open} className={cn("fixed inset-y-0 left-0 z-[65] w-[280px] border-r border-white/[0.08] bg-[#070a0e] transition-transform duration-300 lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{body}</aside>
    </>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { data, navigate, markAllRead, session, isAdmin } = useAccount();
  const [q, setQ] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOut, setSignOut] = useState(false);
  const bellRef = useOutside(() => setBellOpen(false));
  const menuRef = useOutside(() => setMenuOpen(false));
  const unread = data.notifications.filter((n) => !n.read).length;

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const hit = (s: string) => s.toLowerCase().includes(term);
    const out: { label: string; meta: string; to: string }[] = [];
    data.requests.filter((r) => hit(r.title + r.id)).forEach((r) => out.push({ label: r.title, meta: "Solicitud", to: `/account/requests/${r.id}` }));
    data.tickets.filter((t) => hit(t.subject + t.id)).forEach((t) => out.push({ label: t.subject, meta: "Ticket", to: `/account/support/tickets/${t.id}` }));
    groups.flatMap((g) => g.items).filter((i) => hit(i.label)).forEach((i) => out.push({ label: i.label, meta: "Sección", to: i.to }));
    return out.slice(0, 8);
  }, [q, data.requests, data.tickets]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-obsidian/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button onClick={onMenu} className="rounded-md p-2 text-steel hover:bg-white/[0.05] hover:text-snow lg:hidden" aria-label="Abrir navegación"><Menu className="h-5 w-5" /></button>
        <span className="lg:hidden"><AccountMark onNavigate={navigate} /></span>

        <div className="relative ml-auto w-full max-w-md lg:ml-0">
          <label className="relative block">
            <span className="sr-only">Buscar en tu cuenta</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en tu cuenta..."
              className="h-10 w-full rounded-lg border border-white/10 bg-ink/70 pl-9 pr-3 text-sm text-snow placeholder:text-steel/60 outline-none transition-colors hover:border-white/20 focus:border-tech" />
          </label>
          {q.trim() && (
            <div className="acct-pop absolute inset-x-0 top-12 z-40 overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl">
              {results.length ? results.map((r, i) => (
                <button key={i} onClick={() => { navigate(r.to); setQ(""); }} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/[0.05]">
                  <span className="truncate text-snow">{r.label}</span><span className="shrink-0 text-[11px] text-steel">{r.meta}</span>
                </button>
              )) : <p className="px-4 py-5 text-center text-xs text-steel">Sin resultados en tu cuenta para “{q}”.</p>}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div ref={bellRef} className="relative">
            <button onClick={() => setBellOpen((v) => !v)} aria-expanded={bellOpen}
              aria-label={unread ? `Notificaciones, ${unread} sin leer` : "Notificaciones"}
              className="relative rounded-md p-2 text-steel hover:bg-white/[0.05] hover:text-snow">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tech px-1 font-mono text-[9px] text-snow">{unread}</span>}
            </button>
            {bellOpen && (
              <div className="acct-pop absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <span className="text-sm font-bold">Notificaciones</span>
                  {unread > 0 && <button className="text-xs text-volt hover:text-snow" onClick={markAllRead}>Marcar todo como leído</button>}
                </div>
                {data.notifications.length ? (
                  <ul className="max-h-72 overflow-y-auto">
                    {data.notifications.slice(0, 5).map((n) => (
                      <li key={n.id} className="border-b border-white/[0.04] px-4 py-3 last:border-0">
                        <div className="flex gap-2.5">
                          <span className={n.read ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-steel/50" : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt"} aria-hidden />
                          <span className="min-w-0"><span className="block text-[13px] font-medium text-snow">{n.title}</span><span className="mt-0.5 block text-[11.5px] text-steel">{n.description} · {fmtRelative(n.date)}</span></span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="px-4 py-8 text-center text-xs text-steel">No tienes notificaciones todavía.</p>}
                <button className="w-full border-t border-white/[0.06] px-4 py-2.5 text-xs text-steel hover:text-snow" onClick={() => { setBellOpen(false); navigate("/account/notifications"); }}>Ver todas</button>
              </div>
            )}
          </div>

          <div ref={menuRef} className="relative ml-1">
            <button onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-haspopup="menu" className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-white/[0.04]">
              <UserAvatar name={displayName(data.profile)} />
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[13px] font-semibold text-snow">{session ? (data.profileCompleted ? displayName(data.profile) : session.email.split("@")[0]) : "Cuenta"}</span>
                <span className="block text-[11px] text-steel">{isAdmin ? "Administrador" : "Cliente"}</span>
              </span>
            </button>
            {menuOpen && (
              <div role="menu" className="acct-pop absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-white/10 bg-ink shadow-2xl">
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <div className="text-sm font-semibold">{data.profileCompleted ? displayName(data.profile) : session?.email || "Usuario de InfiniHon"}</div>
                  <div className="mt-0.5 truncate text-xs text-steel">{data.profile.email || session?.email || "Correo sin confirmar"}</div>
                </div>
                {[{ label: "Mi perfil", icon: User, to: "/account/profile" }, { label: "Seguridad", icon: ShieldCheck, to: "/account/security" }, { label: "Configuración", icon: Settings, to: "/account/settings" }].map((i) => (
                  <button key={i.label} role="menuitem" onClick={() => { setMenuOpen(false); navigate(i.to); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-snow/90 hover:bg-white/[0.04]">
                    <i.icon className="h-4 w-4 text-steel" aria-hidden />{i.label}
                  </button>
                ))}
                <button role="menuitem" onClick={() => { setMenuOpen(false); setSignOut(true); }} className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-2.5 text-left text-sm text-snow/90 hover:bg-white/[0.04]">
                  <LogOut className="h-4 w-4 text-steel" aria-hidden />Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-white/[0.06] bg-hn/[0.12] px-4 py-2 text-center text-[11px] text-steel md:px-6">
        {session
          ? <span className="font-semibold text-snow/90">Sesión activa: <span className="font-mono">{session.email}</span>{isAdmin ? " · administrador" : ""}</span>
          : <><span className="font-semibold text-snow/90">Sin sesión activa.</span> Tu información se sincroniza con tu cuenta.</>}
      </div>
      <ConfirmDialog open={signOut} onClose={() => setSignOut(false)} title="Cerrar sesión" confirmLabel="Cerrar sesión"
        message="¿Quieres cerrar tu sesión en este dispositivo?"
        onConfirm={() => { void authSignOut().then(() => window.location.assign("/auth")); }} />
    </header>
  );
}

const onboardingSteps = [
  { title: "Bienvenido a InfiniHon", text: "Este es tu espacio personal: aquí gestionas tus servicios, pedidos, solicitudes y soporte.", to: "" },
  { title: "Completa tu perfil", text: "Añade tu nombre y datos de contacto para que el equipo pueda atenderte mejor.", to: "/account/profile" },
  { title: "Explora los servicios", text: "Descubre lo que InfiniHon puede implementar para tu operación y guarda tus favoritos.", to: "/account/favorites" },
  { title: "Configura tu seguridad", text: "Revisa la verificación en dos pasos y las sesiones activas de tu cuenta.", to: "/account/security" },
  { title: "Todo listo", text: "Ya puedes empezar. Si necesitas ayuda, el soporte está a un clic.", to: "/account/support" },
];

function Onboarding() {
  const { data, patch, navigate } = useAccount();
  const [open, setOpen] = useState(!data.onboarded);
  const [step, setStep] = useState(0);
  if (!open) return null;
  const s = onboardingSteps[step];
  const close = () => { patch({ onboarded: true }); setOpen(false); };
  return (
    <Modal open={open} onClose={close} title={s.title} description={`Paso ${step + 1} de ${onboardingSteps.length}`} size="sm"
      footer={<>
        <Button variant="ghost" onClick={close}>Omitir por ahora</Button>
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Atrás</Button>}
        {step < onboardingSteps.length - 1
          ? <Button variant="primary" onClick={() => setStep(step + 1)}>Continuar</Button>
          : <Button variant="primary" onClick={close}>Finalizar</Button>}
      </>}>
      <p className="text-sm leading-relaxed text-steel">{s.text}</p>
      {s.to && <Button size="sm" className="mt-4 w-full" onClick={() => { close(); navigate(s.to); }}>Ir a esta sección</Button>}
      <div className="mt-5 flex gap-1.5" aria-hidden>
        {onboardingSteps.map((_, i) => <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-tech" : "bg-white/[0.08]")} />)}
      </div>
    </Modal>
  );
}

function Router({ section, id, sub, navigate }: { section?: string; id?: string; sub?: string; navigate: (to: string) => void }) {
  switch (section) {
    case undefined: return <DashboardPage />;
    case "services": return id ? <ServiceDetailPage /> : <ServicesPage />;
    case "orders": return id ? <OrderDetailPage id={id} /> : <OrdersPage />;
    case "requests":
      if (id === "new") return <RequestFormPage />;
      if (id) return <RequestDetailPage id={id} />;
      return <RequestsPage />;
    case "support": return id === "tickets" ? (sub ? <TicketDetailPage id={sub} /> : <TicketsPage />) : <SupportPage />;
    case "messages": return <MessagesPage />;
    case "favorites": return <FavoritesPage />;
    case "profile": return <ProfilePage />;
    case "security": return <SecurityPage />;
    case "settings": return <SettingsPage />;
    case "notifications": return <NotificationsPage />;
    case "billing": return <BillingPage />;
    case "organization": return <OrganizationPage />;
    case "documents": return <DocumentsPage />;
    case "help": return <HelpPage />;
    default: return (
      <>
        <PageHeader title="No encontramos esta página" description="La dirección no existe en tu espacio de InfiniHon." />
        <Panel><EmptyState icon={Compass} title="Página no encontrada"
          description="Revisa la dirección o vuelve al inicio de tu espacio."
          action={<Button variant="primary" onClick={() => navigate("/account")}>Volver al inicio</Button>} /></Panel>
      </>
    );
  }
}

function LoginGate({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="acct-root min-h-screen bg-obsidian text-snow">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Portal de usuario</div>
        <h1 className="mt-5 text-4xl font-extrabold uppercase tracking-[-0.03em]">Tu espacio te espera.</h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-steel">
          Inicia sesión para ver tus servicios, pedidos, solicitudes y soporte — todo sincronizado con tu cuenta.
        </p>
        <a href="/auth" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-tech px-6 text-sm font-semibold text-snow hover:bg-[#1a75ff]">
          <LogIn className="h-4 w-4" aria-hidden />Iniciar sesión o crear cuenta
        </a>
        <a href="/" className="mt-4 text-xs text-steel hover:text-snow">← Volver al sitio</a>
      </main>
    </div>
  );
}

function PortalShell({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  const { session, loading } = useAccount();
  const [sidebar, setSidebar] = useState(false);
  const [, , section, id, sub] = pathname.replace(/\/+$/, "").split("/");

  useEffect(() => {
    document.title = "Mi espacio | INFINIHON";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Portal de usuario de INFINIHON: gestiona tus servicios, pedidos, solicitudes, soporte y seguridad.");
    setSidebar(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="acct-root min-h-screen bg-obsidian text-snow">
        <main aria-busy="true" className="mx-auto w-full max-w-[1180px] px-4 py-16 md:px-6 lg:px-8">
          <span className="sr-only">Verificando tu sesión…</span>
          <div className="acct-shimmer mb-2 h-3 w-28 rounded-lg bg-white/[0.04]" />
          <div className="acct-shimmer mb-7 h-9 w-72 rounded-lg bg-white/[0.04]" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="acct-shimmer h-32 rounded-lg bg-white/[0.04]" />)}</div>
        </main>
      </div>
    );
  }
  if (!session) return <LoginGate navigate={navigate} />;

  return (
    <div className="acct-root min-h-screen bg-obsidian text-snow">
      <a href="#acct-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-tech focus:px-3 focus:py-2">Saltar al contenido</a>
      <Sidebar open={sidebar} onClose={() => setSidebar(false)} />
      <div className="lg:pl-[252px]">
        <Topbar onMenu={() => setSidebar(true)} />
        <main id="acct-main" className="mx-auto w-full max-w-[1180px] px-4 py-7 md:px-6 lg:px-8">
          <div key={pathname} className="acct-enter"><Router section={section} id={id} sub={sub} navigate={navigate} /></div>
        </main>
        <footer className="mx-auto w-full max-w-[1180px] px-4 pb-10 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-6 font-mono text-[9.5px] uppercase tracking-[0.2em] text-steel/60 sm:flex-row sm:items-center sm:justify-between">
            <span>INFINIHON · Portal de usuario</span>
            <span>Hecho en Honduras.</span>
          </div>
        </footer>
      </div>
      <Onboarding />
      <Toaster />
      </div>
  );
}

export default function AccountApp({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  return (
    <AccountProvider pathname={pathname} navigate={navigate}>
      <LocaleProvider defaultLocale="es-HN">
        <PortalShell pathname={pathname} navigate={navigate} />
      </LocaleProvider>
    </AccountProvider>
  );
}
