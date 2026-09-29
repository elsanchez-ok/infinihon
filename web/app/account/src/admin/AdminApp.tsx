import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { AdminLayout } from "./Layout";
import { AdminProvider } from "./store";
import { Button, EmptyState, LoadingState, Panel, Toaster } from "./ui";
import { AnalyticsPage, OverviewPage } from "./pages/Overview";
import { ProductEditor, ProductsPage } from "./pages/Products";
import { CategoriesPage, CustomerDetail, CustomersPage, InventoryPage, OrderDetail, OrdersPage } from "./pages/Commerce";
import { AdministratorsPage, ContentPage, RolesPage, ServicesPage, UsersPage } from "./pages/Platform";
import { CloudPage, InfrastructurePage, IntegrationsPage, MonitoringPage, ServersPage } from "./pages/Infrastructure";
import { ActivityPage, NotificationsPage, SecurityPage, SettingsPage } from "./pages/System";
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
    case "settings": return <SettingsPage />;
    default: return <NotFound navigate={navigate} />;
  }
}

export default function AdminApp({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    document.title = "INFINIHON — Control Center";
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <AdminProvider pathname={pathname} navigate={navigate}>
      <AdminLayout>
        {loading ? <LoadingState /> : <div key={pathname} className="admin-enter"><Router pathname={pathname} navigate={navigate} /></div>}
      </AdminLayout>
      <Toaster />
    </AdminProvider>
  );
}
