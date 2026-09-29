import { useEffect, useState } from "react";
import { Compass, LogIn, ShieldAlert } from "lucide-react";
import { AdminLayout } from "./Layout";
import { AdminProvider } from "./store";
import { Button, EmptyState, LoadingState, Panel, Toaster } from "./ui";
import { AnalyticsPage, OverviewPage } from "./pages/Overview";
import { ProductEditor, ProductsPage } from "./pages/Products";
import { CategoriesPage, CustomerDetail, CustomersPage, InventoryPage, OrderDetail, OrdersPage } from "./pages/Commerce";
import { AdministratorsPage, ContentPage, RolesPage, ServicesPage, UsersPage } from "./pages/Platform";
import { CloudPage, InfrastructurePage, IntegrationsPage, MonitoringPage, ServersPage } from "./pages/Infrastructure";
import { ActivityPage, NotificationsPage, SecurityPage, SettingsPage } from "./pages/System";
import { ProfilePage } from "./pages/Profile";
import { SupportTicketsPage } from "./pages/SupportTickets";
import { LocaleProvider } from "./locale";
import { currentSession, isAdminUser, isSuperAdmin } from "./supabaseSync";
import type { SessionUser } from "../lib/supabase";
import "./admin.css";

function NotFound({ navigate }: { navigate: (to: string) => void }) {
  return <Panel><EmptyState icon={Compass} title="This page doesn't exist." description="The module may have moved or the address is incorrect." action={<Button variant="primary" onClick={() => navigate("/admin")}>Back to Overview</Button>} /></Panel>;
}

function Router({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  const path = pathname.replace(/\/+$/, "") || "/admin";
  const [, , section, id] = path.split("/");
  switch (section) {
    case undefined: return <OverviewPage />;
    case "analytics": return <AnalyticsPage />;
    case "products": return id ? <ProductEditor key={id} id={id} /> : <ProductsPage />;
    case "categories": return <CategoriesPage />;
    case "inventory": return <InventoryPage />;
    case "orders": return id ? <OrderDetail id={id} /> : <OrdersPage />;
    case "customers": return id ? <CustomerDetail key={id} id={id} /> : <CustomersPage />;
    case "users": return <UsersPage />;
    case "administrators": return <AdministratorsPage />;
    case "roles": return <RolesPage />;
    case "services": return <ServicesPage />;
    case "support": return <SupportTicketsPage id={id} />;
    case "content": return <ContentPage />;
    case "infrastructure":
      if (id === "servers") return <ServersPage />;
      if (id === "cloud") return <CloudPage />;
      if (id === "monitoring") return <MonitoringPage />;
      return id ? <NotFound navigate={navigate} /> : <InfrastructurePage />;
    case "integrations": return <IntegrationsPage />;
    case "notifications": return <NotificationsPage />;
    case "activity": return <ActivityPage />;
    case "security": return <SecurityPage />;
    case "profile": return <ProfilePage />;
    case "settings": return <SettingsPage />;
    default: return <NotFound navigate={navigate} />;
  }
}

type GateState =
  | { phase: "checking" }
  | { phase: "no-session" }
  | { phase: "forbidden"; user: SessionUser }
  | { phase: "ok"; user: SessionUser };

/** Acceso: requiere sesión activa y rol de administrador (profiles.is_admin) o ser super admin. */
function useAdminGate(): GateState {
  const [state, setState] = useState<GateState>({ phase: "checking" });
  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await currentSession();
      if (!alive) return;
      if (!user) { setState({ phase: "no-session" }); return; }
      const admin = await isAdminUser();
      const superAdmin = await isSuperAdmin();
      if (!alive) return;
      setState((admin || superAdmin) ? { phase: "ok", user } : { phase: "forbidden", user });
    })();
    return () => { alive = false; };
  }, []);
  return state;
}

function NoSession() {
  return (
    <div className="min-h-screen bg-obsidian text-snow">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Control Center</div>
        <h1 className="mt-5 text-4xl font-extrabold uppercase tracking-[-0.03em]">Acceso restringido.</h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-steel">
          Inicia sesión con una cuenta de administrador para gestionar el catálogo, pedidos y usuarios de INFINIHON.
        </p>
        <a href="/auth" className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-tech px-6 text-sm font-semibold text-snow hover:bg-[#1a75ff]">
          <LogIn className="h-4 w-4" aria-hidden />Iniciar sesión
        </a>
        <a href="/" className="mt-4 text-xs text-steel hover:text-snow">← Volver al sitio</a>
      </main>
    </div>
  );
}

function Forbidden({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-obsidian text-snow">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-10 w-10 text-steel" aria-hidden />
        <h1 className="mt-5 text-3xl font-extrabold uppercase tracking-[-0.03em]">Sin permisos de administrador.</h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-steel">
          La cuenta <span className="font-mono text-snow">{email}</span> no tiene rol de administrador.
          Si deberías tenerlo, contacta al equipo de INFINIHON.
        </p>
        <a href="/account" className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-tech px-6 text-sm font-semibold text-snow hover:bg-[#1a75ff]">Ir a mi portal</a>
        <button onClick={() => { void import("./supabaseSync").then((m) => m.signOutAndGo()); }} className="mt-4 text-xs text-steel hover:text-snow">Cerrar sesión</button>
      </main>
    </div>
  );
}

export default function AdminApp({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    document.title = "INFINIHON — Control Center";
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (gate.phase === "checking") return <div className="min-h-screen bg-obsidian"><LoadingState /></div>;
  if (gate.phase === "no-session") return <NoSession />;
  if (gate.phase === "forbidden") return <Forbidden email={gate.user.email} />;

  return (
    <AdminProvider pathname={pathname} navigate={navigate} user={gate.user}>
      <LocaleProvider defaultLocale="en-US">
        <AdminLayout>
          {loading ? <LoadingState /> : <div key={pathname} className="admin-enter"><Router pathname={pathname} navigate={navigate} /></div>}
        </AdminLayout>
        <Toaster />
      </LocaleProvider>
    </AdminProvider>
  );
}
