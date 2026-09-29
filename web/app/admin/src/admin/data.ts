/**
 * INFINIHON Control Center — seed data.
 * Every record with `demo: true` is illustrative sample content for interface design.
 * No record here represents a real customer, sale, server, user or integration.
 * Replace with the API adapter in `api.ts` when a backend exists.
 */

export type ProductStatus = "Active" | "Draft" | "Archived";
export interface Spec { key: string; value: string }
/** Documento enlazado de la ficha pública (`data.docs`). */
export interface Doc { t: string; note: string }
export interface Product {
  id: string; name: string; sku: string; category: string; brand: string; description: string;
  price: number | null; cost: number | null; discount: number | null; tax: number | null;
  stock: number | null; minStock: number; warehouse: string; status: ProductStatus;
  specs: Spec[]; images: number; seoTitle: string; seoDescription: string; slug: string;
  /** Campos que la tienda pública muestra además de las especificaciones. */
  tech: string[]; use: string[]; features: string[]; compat: string[]; includes: string[]; docs: Doc[];
  updated: string; demo: boolean;
}
export interface Category { id: string; name: string; description: string; demo: boolean }
export type PublishStatus = "Published" | "Draft" | "Scheduled" | "Archived";
export interface Service {
  id: string; name: string; description: string; category: string; status: PublishStatus;
  cta: string; features: string[]; visible: boolean; updated: string; demo: boolean;
  /** Campos que la página pública de servicios muestra. */
  scope: string[]; deliverables: string[]; tech: string[]; duration: string;
}
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";
export interface Order {
  id: string; customerId: string; items: { productId: string; qty: number }[];
  status: OrderStatus; date: string; notes: string; demo: boolean;
}
export interface Customer {
  id: string; name: string; email: string; status: "Active" | "Inactive"; created: string;
  city: string; notes: string; demo: boolean;
}
export type AccountStatus = "Active" | "Pending" | "Suspended";
export interface PlatformUser { id: string; name: string; email: string; role: string; status: AccountStatus; lastActive: string | null; created: string; demo: boolean }
export interface Administrator { id: string; name: string; email: string; roleId: string; status: AccountStatus; lastLogin: string | null; created: string; demo: boolean }
export interface Role { id: string; name: string; description: string; permissions: string[]; locked?: boolean }
export interface ContentItem { id: string; title: string; type: string; status: PublishStatus; updated: string; author: string; demo: boolean }
export interface Activity { id: string; actor: string; action: string; module: string; target: string; date: string; demo: boolean }
export interface Notice { id: string; title: string; type: "System" | "Security" | "Orders" | "Inventory" | "Users" | "Infrastructure"; date: string; read: boolean }
export interface SupportTicket {
  id: string; subject: string; category: string; priority: string; description: string; status: string;
  created: string; updated: string; messages: { from: string; text: string; date: string }[];
}
export interface Movement { id: string; productId: string; quantity: number; type: string; reason: string; location: string; notes: string; date: string }
export interface Settings {
  companyName: string; contactEmail: string; contactPhone: string; currency: string; taxRate: string;
  lowStockAlerts: boolean; allowRegistration: boolean; minPasswordLength: number; sessionTimeout: number;
  require2fa: boolean; emailNotifications: boolean; systemNotifications: boolean; theme: string;
}

/* ─────────── Permissions ─────────── */

export const permissionModules: { module: string; label: string; actions: string[] }[] = [
  { module: "products", label: "Products", actions: ["view", "create", "edit", "delete"] },
  { module: "categories", label: "Categories", actions: ["view", "create", "edit", "delete"] },
  { module: "inventory", label: "Inventory", actions: ["view", "adjust"] },
  { module: "orders", label: "Orders", actions: ["view", "edit", "refund"] },
  { module: "customers", label: "Customers", actions: ["view", "edit"] },
  { module: "users", label: "Users", actions: ["view", "edit", "suspend", "delete"] },
  { module: "administrators", label: "Administrators", actions: ["view", "create", "edit", "remove"] },
  { module: "roles", label: "Roles & Permissions", actions: ["view", "edit"] },
  { module: "services", label: "Services", actions: ["view", "create", "edit", "delete"] },
  { module: "content", label: "Content", actions: ["view", "create", "edit", "delete"] },
  { module: "analytics", label: "Analytics", actions: ["view"] },
  { module: "infrastructure", label: "Infrastructure", actions: ["view", "edit"] },
  { module: "integrations", label: "Integrations", actions: ["view", "edit"] },
  { module: "notifications", label: "Notifications", actions: ["view"] },
  { module: "activity", label: "Activity Log", actions: ["view"] },
  { module: "security", label: "Security", actions: ["view", "edit"] },
  { module: "settings", label: "Settings", actions: ["view", "edit"] },
];

export const allPermissions = permissionModules.flatMap((m) => m.actions.map((a) => `${m.module}.${a}`));
const all = (module: string) => permissionModules.find((m) => m.module === module)!.actions.map((a) => `${module}.${a}`);
const view = (...modules: string[]) => modules.map((m) => `${m}.view`);

export const seedRoles: Role[] = [
  { id: "super", name: "Super Administrator", description: "Full access to every module, including roles and administrators.", permissions: [...allPermissions], locked: true },
  {
    id: "admin", name: "Administrator", description: "General administration. Cannot edit roles or remove administrators.",
    permissions: allPermissions.filter((p) => !["roles.edit", "administrators.remove", "security.edit"].includes(p)),
  },
  {
    id: "manager", name: "Manager", description: "Operational management of catalog, inventory and orders.",
    permissions: [...all("products"), ...all("inventory"), "orders.view", "orders.edit", "customers.view", "services.view", "services.edit", ...view("categories", "analytics", "notifications", "activity", "infrastructure")],
  },
  {
    id: "editor", name: "Editor", description: "Content, services and product information.",
    permissions: ["products.view", "products.create", "products.edit", "categories.view", "categories.edit", ...all("content"), "services.view", "services.edit", "notifications.view"],
  },
  {
    id: "support", name: "Support", description: "Customer care and order follow-up.",
    permissions: ["customers.view", "customers.edit", "orders.view", "products.view", "notifications.view"],
  },
];

/* ─────────── Demo records ─────────── */

const d = (day: number, h = 10) => new Date(Date.UTC(2026, 8, day, h, 12)).toISOString();

export const seedCategories: Category[] = [
  { id: "networking", name: "Networking", description: "Routing, switching and connectivity.", demo: true },
  { id: "servers", name: "Servers", description: "Compute nodes and virtualization.", demo: true },
  { id: "storage", name: "Storage", description: "Network storage and backups.", demo: true },
  { id: "security", name: "Security", description: "Perimeter and access control.", demo: true },
  { id: "hardware", name: "Hardware", description: "Edge devices and components.", demo: true },
  { id: "software", name: "Software", description: "Platforms and licenses.", demo: true },
];

const baseProduct = {
  cost: null, discount: null, tax: null, images: 0, seoTitle: "", seoDescription: "", demo: true,
  tech: [] as string[], use: [] as string[], features: [] as string[], compat: [] as string[], includes: [] as string[], docs: [] as Doc[],
} as const;

export const seedProducts: Product[] = [
  { ...baseProduct, id: "p1", name: "Edge Router — Reference", sku: "DEMO-NET-001", category: "networking", brand: "To be confirmed", description: "Reference item for an edge routing layer with VPN and VLAN segmentation.", price: null, stock: 12, minStock: 4, warehouse: "Main warehouse", status: "Active", specs: [{ key: "Interfaces", value: "Pending catalog" }], slug: "edge-router-reference", updated: d(26) },
  { ...baseProduct, id: "p2", name: "Compute Node — Reference", sku: "DEMO-SRV-001", category: "servers", brand: "To be confirmed", description: "Reference compute node for virtualization and internal services.", price: null, stock: 3, minStock: 4, warehouse: "Main warehouse", status: "Active", specs: [{ key: "Processor", value: "Pending catalog" }, { key: "Memory", value: "Pending catalog" }], slug: "compute-node-reference", updated: d(25) },
  { ...baseProduct, id: "p3", name: "Storage Node — Reference", sku: "DEMO-STO-001", category: "storage", brand: "To be confirmed", description: "Reference network storage for backups and shared data.", price: null, stock: 0, minStock: 2, warehouse: "Main warehouse", status: "Active", specs: [], slug: "storage-node-reference", updated: d(24) },
  { ...baseProduct, id: "p4", name: "Secure Gateway — Reference", sku: "DEMO-SEC-001", category: "security", brand: "To be confirmed", description: "Reference perimeter gateway with remote access.", price: null, stock: 7, minStock: 3, warehouse: "Secondary warehouse", status: "Draft", specs: [], slug: "secure-gateway-reference", updated: d(22) },
  { ...baseProduct, id: "p5", name: "Edge Cluster Kit — Reference", sku: "DEMO-HW-001", category: "hardware", brand: "To be confirmed", description: "Reference kit for edge computing labs and K3s.", price: null, stock: 0, minStock: 2, warehouse: "Main warehouse", status: "Draft", specs: [], slug: "edge-cluster-kit-reference", updated: d(20) },
  { ...baseProduct, id: "p6", name: "Observability Stack — Reference", sku: "DEMO-SW-001", category: "software", brand: "INFINIHON", description: "Reference software offering for metrics, dashboards and alerts.", price: null, stock: null, minStock: 0, warehouse: "Digital", status: "Archived", specs: [], slug: "observability-stack-reference", updated: d(12) },
];

const svc = (id: string, name: string, category: string, description: string, features: string[], status: PublishStatus = "Published"): Service =>
  ({ id, name, category, description, features, status, cta: "Request a Quote", visible: status === "Published", updated: d(21), demo: true, scope: [], deliverables: [], tech: [...features], duration: "To be defined" });

export const seedServices: Service[] = [
  svc("s1", "Networking", "Infrastructure", "Network design, implementation and documentation.", ["MikroTik", "VPN", "VLAN", "BGP"]),
  svc("s2", "Server Infrastructure", "Infrastructure", "Servers, virtualization and backups.", ["Linux", "Virtualization", "Backups"]),
  svc("s3", "Cloud", "Cloud", "Cloud and hybrid architectures.", ["AWS", "Azure", "Google Cloud"]),
  svc("s4", "DevOps", "Cloud", "Containers, CI/CD and infrastructure as code.", ["Docker", "Kubernetes", "Terraform", "Ansible"]),
  svc("s5", "Security", "Security", "Audits, hardening and access control.", ["Audit", "Hardening", "VPN"]),
  svc("s6", "Monitoring", "Operations", "Metrics, dashboards and alerts.", ["Prometheus", "Grafana", "Alerts"]),
  svc("s7", "Automation", "Operations", "Process automation and integrations.", ["APIs", "Scripts", "Integrations"], "Draft"),
  svc("s8", "Software Development", "Software", "Custom software and internal platforms.", ["Web", "APIs", "Internal tools"]),
  svc("s9", "Technical Support", "Operations", "Ongoing technical support and maintenance.", ["Support", "Maintenance"]),
];

export const seedCustomers: Customer[] = [
  { id: "c1", name: "Demo Customer 01", email: "customer01@example.com", status: "Active", created: d(3), city: "—", notes: "", demo: true },
  { id: "c2", name: "Demo Customer 02", email: "customer02@example.com", status: "Active", created: d(9), city: "—", notes: "", demo: true },
  { id: "c3", name: "Demo Customer 03", email: "customer03@example.com", status: "Inactive", created: d(14), city: "—", notes: "", demo: true },
];

export const seedOrders: Order[] = [
  { id: "DEMO-1001", customerId: "c1", items: [{ productId: "p1", qty: 2 }], status: "Pending", date: d(27, 9), notes: "", demo: true },
  { id: "DEMO-1002", customerId: "c2", items: [{ productId: "p2", qty: 1 }, { productId: "p4", qty: 1 }], status: "Processing", date: d(26, 15), notes: "", demo: true },
  { id: "DEMO-1003", customerId: "c1", items: [{ productId: "p3", qty: 1 }], status: "Completed", date: d(19, 11), notes: "", demo: true },
  { id: "DEMO-1004", customerId: "c3", items: [{ productId: "p1", qty: 1 }], status: "Cancelled", date: d(15, 17), notes: "", demo: true },
];

export const seedUsers: PlatformUser[] = [
  { id: "u1", name: "Demo User 01", email: "user01@example.com", role: "Customer account", status: "Active", lastActive: d(27), created: d(2), demo: true },
  { id: "u2", name: "Demo User 02", email: "user02@example.com", role: "Customer account", status: "Pending", lastActive: null, created: d(18), demo: true },
  { id: "u3", name: "Demo User 03", email: "user03@example.com", role: "Partner account", status: "Suspended", lastActive: d(11), created: d(5), demo: true },
];

export const seedAdmins: Administrator[] = [
  { id: "a1", name: "Demo Super Admin", email: "superadmin@example.com", roleId: "super", status: "Active", lastLogin: d(27, 8), created: d(1), demo: true },
  { id: "a2", name: "Demo Editor", email: "editor@example.com", roleId: "editor", status: "Active", lastLogin: d(24), created: d(8), demo: true },
  { id: "a3", name: "Demo Support", email: "support@example.com", roleId: "support", status: "Pending", lastLogin: null, created: d(23), demo: true },
];

export const seedContent: ContentItem[] = [
  { id: "ct1", title: "Homepage hero", type: "Homepage", status: "Published", updated: d(20), author: "Demo Editor", demo: true },
  { id: "ct2", title: "Services overview", type: "Services", status: "Published", updated: d(19), author: "Demo Editor", demo: true },
  { id: "ct3", title: "Store introduction", type: "Store", status: "Draft", updated: d(25), author: "Demo Editor", demo: true },
  { id: "ct4", title: "Guide: planning a network that scales", type: "Insights", status: "Scheduled", updated: d(26), author: "Demo Editor", demo: true },
  { id: "ct5", title: "Portal maintenance notice", type: "Announcement", status: "Archived", updated: d(10), author: "Demo Super Admin", demo: true },
  { id: "ct6", title: "Infrastructure bundles banner", type: "Banner", status: "Draft", updated: d(23), author: "Demo Editor", demo: true },
  { id: "ct7", title: "Frequently asked questions", type: "FAQ", status: "Published", updated: d(17), author: "Demo Editor", demo: true },
];

export const seedActivity: Activity[] = [
  { id: "ac1", actor: "Demo Super Admin", action: "Updated inventory", module: "Inventory", target: "Edge Router — Reference", date: d(27, 9), demo: true },
  { id: "ac2", actor: "Demo Super Admin", action: "Created administrator", module: "Administrators", target: "Demo Support", date: d(23, 16), demo: true },
  { id: "ac3", actor: "Demo Editor", action: "Updated product", module: "Products", target: "Compute Node — Reference", date: d(25, 12), demo: true },
  { id: "ac4", actor: "Demo Super Admin", action: "Changed permissions", module: "Roles", target: "Manager", date: d(21, 10), demo: true },
  { id: "ac5", actor: "Demo Support", action: "Updated order status", module: "Orders", target: "DEMO-1002", date: d(26, 15), demo: true },
  { id: "ac6", actor: "Demo Editor", action: "Changed service configuration", module: "Services", target: "Automation", date: d(21, 9), demo: true },
];

export const seedSettings: Settings = {
  companyName: "INFINIHON", contactEmail: "", contactPhone: "", currency: "", taxRate: "",
  lowStockAlerts: true, allowRegistration: false, minPasswordLength: 12, sessionTimeout: 30,
  require2fa: true, emailNotifications: false, systemNotifications: true, theme: "Obsidian",
};

export const integrations: { name: string; category: string; description: string; status: "Connected" | "Not configured" | "Unavailable" }[] = [
  { name: "Payment gateway", category: "Payment", description: "Card and online payments for orders.", status: "Not configured" },
  { name: "Bank transfer", category: "Payment", description: "Manual transfer confirmation workflow.", status: "Not configured" },
  { name: "Transactional email", category: "Email", description: "Order, account and security emails.", status: "Not configured" },
  { name: "Cloud provider", category: "Cloud", description: "Resource inventory from a cloud account.", status: "Not configured" },
  { name: "Web analytics", category: "Analytics", description: "Traffic and conversion metrics.", status: "Not configured" },
  { name: "Identity provider", category: "Authentication", description: "Email/password and OAuth sign-in.", status: "Not configured" },
  { name: "Object storage", category: "Storage", description: "Product images and media library.", status: "Not configured" },
  { name: "Metrics backend", category: "Monitoring", description: "Server and service metrics source.", status: "Unavailable" },
];
