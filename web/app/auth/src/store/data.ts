export type ProductCategory = "Hardware" | "Networking" | "Servers" | "Storage" | "Security" | "Cloud" | "Software" | "Services";
export type ProductStatus = "Por confirmar" | "Próximamente";
export type VisualKind = "router" | "server" | "storage" | "gateway" | "cluster" | "monitor";

export type CatalogProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  use: string;
  technologies: string[];
  status: ProductStatus;
  visual: VisualKind;
  badge?: string;
  specLabels: string[];
};

/**
 * This is intentionally a reference catalog. Commercial pricing, stock, brands and
 * specifications are not connected yet, so the UI never presents them as facts.
 */
export const products: CatalogProduct[] = [
  {
    id: "edge-router-reference",
    name: "Router de borde",
    category: "Networking",
    description: "Referencia para una capa de borde con enrutamiento, VPN y segmentación de red.",
    use: "Conectividad de oficina, sedes y enlaces de internet.",
    technologies: ["MikroTik", "VPN", "BGP", "VLAN"],
    status: "Por confirmar",
    visual: "router",
    badge: "Referencia",
    specLabels: ["Interfaces", "Capacidad de routing", "VPN", "Alimentación", "Formato"],
  },
  {
    id: "compute-node-reference",
    name: "Nodo de cómputo",
    category: "Servers",
    description: "Referencia para cargas internas, virtualización, aplicaciones o servicios de infraestructura.",
    use: "Cómputo local y plataformas internas.",
    technologies: ["Linux", "Virtualización", "Docker"],
    status: "Por confirmar",
    visual: "server",
    badge: "Infraestructura",
    specLabels: ["Procesador", "Memoria", "Almacenamiento", "Networking", "Sistema operativo"],
  },
  {
    id: "storage-node-reference",
    name: "Nodo de almacenamiento",
    category: "Storage",
    description: "Referencia para datos compartidos, respaldos y almacenamiento conectado a la red.",
    use: "Backups, archivos y almacenamiento de aplicaciones.",
    technologies: ["NAS", "Backups", "Red"],
    status: "Por confirmar",
    visual: "storage",
    badge: "Referencia",
    specLabels: ["Capacidad", "Bahías", "Red", "RAID", "Energía"],
  },
  {
    id: "secure-gateway-reference",
    name: "Gateway seguro",
    category: "Security",
    description: "Referencia para perímetro, control de acceso y conexión segura entre ubicaciones.",
    use: "Protección de borde y acceso remoto.",
    technologies: ["Firewall", "VPN", "Hardening"],
    status: "Por confirmar",
    visual: "gateway",
    badge: "Seguridad",
    specLabels: ["Políticas", "VPN", "Throughput", "Interfaces", "Gestión"],
  },
  {
    id: "edge-cluster-reference",
    name: "Cluster de borde",
    category: "Hardware",
    description: "Referencia para prototipos, automatización, edge computing y laboratorios de infraestructura.",
    use: "Servicios ligeros, automatización y aprendizaje técnico.",
    technologies: ["Raspberry Pi", "K3s", "Docker"],
    status: "Próximamente",
    visual: "cluster",
    badge: "Edge",
    specLabels: ["Nodos", "Cómputo", "Almacenamiento", "Red", "Orquestación"],
  },
  {
    id: "observability-reference",
    name: "Stack de observabilidad",
    category: "Software",
    description: "Referencia de servicio y software para visualizar métricas, alertas y estado operativo.",
    use: "Monitorización de red, servidores y aplicaciones.",
    technologies: ["Prometheus", "Grafana", "Alerts"],
    status: "Próximamente",
    visual: "monitor",
    badge: "Software",
    specLabels: ["Fuentes de métricas", "Alertas", "Dashboards", "Retención", "Acceso"],
  },
  {
    id: "cloud-architecture-reference",
    name: "Arquitectura cloud",
    category: "Cloud",
    description: "Referencia de diseño para conectar cargas, identidades y redes entre el entorno local y cloud.",
    use: "Migraciones, operación híbrida y nuevas cargas en cloud.",
    technologies: ["AWS", "Azure", "Google Cloud", "Terraform"],
    status: "Por confirmar",
    visual: "monitor",
    badge: "Solución",
    specLabels: ["Proveedor cloud", "Red virtual", "Identidad", "Despliegue", "Costos"],
  },
  {
    id: "network-implementation-reference",
    name: "Implementación de red",
    category: "Services",
    description: "Referencia de servicio para diseñar, configurar y documentar una red de operación.",
    use: "Oficinas, sedes y equipos que requieren una red ordenada.",
    technologies: ["MikroTik", "VPN", "VLAN", "Documentación"],
    status: "Por confirmar",
    visual: "router",
    badge: "Servicio",
    specLabels: ["Alcance", "Sitios", "Topología", "Entregables", "Soporte"],
  },
];

export const categories: { id: ProductCategory; description: string; icon: string }[] = [
  { id: "Hardware", description: "Nodos, edge computing y componentes de referencia.", icon: "node" },
  { id: "Networking", description: "Routing, switching, conectividad y sedes.", icon: "network" },
  { id: "Servers", description: "Cómputo para cargas críticas y servicios internos.", icon: "server" },
  { id: "Storage", description: "Datos, respaldos y almacenamiento conectado a red.", icon: "storage" },
  { id: "Security", description: "Perímetro, acceso y capas de protección.", icon: "shield" },
  { id: "Cloud", description: "Arquitecturas híbridas y despliegue en cloud.", icon: "cloud" },
  { id: "Software", description: "Plataformas, automatización y observabilidad.", icon: "terminal" },
  { id: "Services", description: "Diseño, implementación y soporte tecnológico.", icon: "layers" },
];

export const services = [
  { id: "network-setup", number: "01", title: "Network Setup", short: "Arquitectura, implementación y documentación de redes.", tags: ["MikroTik", "VPN", "VLAN", "BGP"] },
  { id: "cloud-deployment", number: "02", title: "Cloud Deployment", short: "Diseño de cargas cloud e infraestructura híbrida.", tags: ["AWS", "Azure", "GCP", "IaC"] },
  { id: "server-setup", number: "03", title: "Server Setup", short: "Servidores, virtualización, servicios y respaldo.", tags: ["Linux", "Docker", "Backups"] },
  { id: "security-audit", number: "04", title: "Security Audit", short: "Revisión técnica de exposición, accesos y configuración.", tags: ["Hardening", "VPN", "Firewall"] },
  { id: "devops", number: "05", title: "DevOps", short: "Automatización, contenedores e infraestructura como código.", tags: ["Kubernetes", "Terraform", "Ansible"] },
  { id: "monitoring", number: "06", title: "Monitoring", short: "Métricas, dashboards y alertas sobre toda la operación.", tags: ["Prometheus", "Grafana", "Alerts"] },
  { id: "automation", number: "07", title: "Automation", short: "Procesos conectados y tareas repetibles con menos fricción.", tags: ["APIs", "Integrations", "Scripts"] },
  { id: "technical-support", number: "08", title: "Technical Support", short: "Acompañamiento técnico para la operación diaria.", tags: ["Soporte", "Mantenimiento", "Escalamiento"] },
];

export const bundles = [
  { id: "starter", n: "01", title: "Starter Infrastructure", for: "Equipos que necesitan ordenar su base tecnológica.", solves: "Conectividad, acceso y operación inicial sin complejidad innecesaria.", includes: ["Diseño base", "Segmentación de red", "Acceso seguro", "Documentación"], tone: "blue" },
  { id: "network", n: "02", title: "Network Core", for: "Empresas con sedes, proveedores o mayor tráfico.", solves: "Una red estable y trazable que conecta la operación.", includes: ["Routing", "Firewall", "VPN entre sedes", "Monitorización base"], tone: "grid" },
  { id: "cloud", n: "03", title: "Cloud Ready", for: "Operaciones que se preparan para cargas híbridas o cloud.", solves: "Una ruta ordenada de lo local hacia servicios cloud.", includes: ["Assessment", "Arquitectura híbrida", "Identidad", "Infra as code"], tone: "cloud" },
  { id: "secure", n: "04", title: "Secure Business", for: "Equipos que desean revisar su superficie de exposición.", solves: "Capas de seguridad aplicadas desde la red hasta el acceso.", includes: ["Auditoría", "Hardening", "VPN", "Control de acceso"], tone: "secure" },
  { id: "monitor", n: "05", title: "Monitoring Stack", for: "Operaciones que necesitan visibilidad continua.", solves: "Detectar problemas con métricas antes de que afecten al usuario.", includes: ["Prometheus", "Grafana", "Alertas", "Runbooks"], tone: "monitor" },
  { id: "enterprise", n: "06", title: "Enterprise Infrastructure", for: "Operaciones complejas con varios sistemas o ubicaciones.", solves: "Una arquitectura integral pensada para escalar por capas.", includes: ["Red", "Servidores", "Cloud", "Seguridad", "Observabilidad"], tone: "enterprise" },
];

export type CartLine = { product: CatalogProduct; quantity: number };