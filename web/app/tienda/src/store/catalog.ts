/**
 * INFINIHON — catálogo de la tienda.
 *
 * Este archivo es el CATÁLOGO DE RESPALDO que se usa cuando la API no responde
 * (sin sesión de Supabase o sin conexión). El catálogo real vive en
 * `store_items` y se carga con `loadRemoteCatalog()`; los objetos de este
 * archivo mantienen la misma forma porque esa forma es el contrato entre el
 * panel de administración, la base de datos y estos componentes.
 *
 * Los precios de respaldo son de referencia: sin precio publicado, el
 * producto se cotiza a medida.
 */

export type CategoryId =
  | "hardware" | "networking" | "servers" | "storage"
  | "security" | "cloud" | "software" | "services";

export type Visual =
  | "router" | "switch" | "server" | "firewall" | "nas" | "cluster"
  | "rack" | "sfp" | "ups" | "ap" | "mini" | "cloud" | "license"
  | "service" | "bundle";

export type Status = "available" | "low" | "out" | "soon";

export interface Spec { k: string; v: string }
export interface Product {
  slug: string;
  sku?: string;
  name: string;
  category: CategoryId;
  visual: Visual;
  short: string;
  description: string;
  /** Precio de demostración (USD). `null` = se define al cotizar. */
  price: number | null;
  status: Status;
  badge?: string;
  tech: string[];
  use: string[];
  brand: string;
  specs: Spec[];
  features: string[];
  compat: string[];
  includes: string[];
  docs: { t: string; note: string }[];
  featured?: boolean;
}

export interface Service {
  slug: string;
  name: string;
  category: CategoryId;
  visual: Visual;
  short: string;
  description: string;
  scope: string[];
  deliverables: string[];
  tech: string[];
  duration: string;
  featured?: boolean;
}

export interface Bundle {
  slug: string;
  name: string;
  tier: string;
  for: string;
  problem: string;
  includes: string[];
  requires: string[];
  components: string[];
  cta: "Configurar solución" | "Hablar con un experto";
}

export const categories: { id: CategoryId; label: string; desc: string; count: number }[] = [
  { id: "hardware", label: "Hardware", desc: "Racks, energía y accesorios", count: 4 },
  { id: "networking", label: "Networking", desc: "Routers, switches y wireless", count: 3 },
  { id: "servers", label: "Servers", desc: "Cómputo, virtualización y edge", count: 3 },
  { id: "storage", label: "Storage", desc: "Almacenamiento y respaldo", count: 1 },
  { id: "security", label: "Security", desc: "Firewall y acceso seguro", count: 1 },
  { id: "cloud", label: "Cloud", desc: "Despliegues y arquitectura", count: 1 },
  { id: "software", label: "Software", desc: "Licencias y plataformas", count: 2 },
  { id: "services", label: "Services", desc: "Servicios profesionales", count: 8 },
];

export const products: Product[] = [
  {
    slug: "edge-router-1u",
    name: "Router de borde 1U",
    category: "networking",
    visual: "router",
    short: "Enrutamiento de borde con BGP, VPN y QoS para sedes corporativas.",
    description:
      "Equipo de borde pensado para terminar enlaces de uno o más proveedores, publicar prefijos por BGP y levantar túneles VPN hacia otras sedes. Se entrega configurado según la topología acordada: interfaces, direccionamiento, reglas de firewall y políticas de enrutamiento.",
    price: null,
    status: "soon",
    badge: "A la medida",
    tech: ["MikroTik", "RouterOS", "BGP", "OSPF", "VPN", "QoS"],
    use: ["Oficina", "Multi-sede", "Enlace WAN"],
    brand: "Por definir",
    specs: [
      { k: "Factor de forma", v: "1U rackmount" },
      { k: "Interfaces", v: "Según versión seleccionada" },
      { k: "Routing", v: "Estático · BGP · OSPF" },
      { k: "VPN", v: "IPsec · WireGuard" },
      { k: "Alimentación", v: "AC, con opción redundante" },
      { k: "Gestión", v: "Web · CLI · API" },
    ],
    features: [
      "Configuración inicial incluida y documentada",
      "Backups automáticos de configuración",
      "Monitoreo por SNMP listo para Prometheus",
    ],
    compat: ["Switches administrables", "Firewall perimetral", "Prometheus / Grafana"],
    includes: ["Equipo", "Fuente", "Soportes de rack", "Documentación de configuración"],
    docs: [{ t: "Ficha técnica", note: "Se publica con el catálogo real" }],
    featured: true,
  },
  {
    slug: "managed-switch-24",
    name: "Switch administrable 24 puertos",
    category: "networking",
    visual: "switch",
    short: "Conmutación L2/L3 con VLANs, trunking y PoE opcional.",
    description:
      "Switch de acceso para el núcleo de la red de oficina: segmentación por VLAN, enlaces troncales hacia el router, agregación de puertos y control de tormentas de broadcast. Disponible en versión PoE para alimentar access points y cámaras.",
    price: null,
    status: "available",
    tech: ["VLAN", "802.1Q", "LACP", "STP", "PoE"],
    use: ["Oficina", "Red corporativa"],
    brand: "Por definir",
    specs: [
      { k: "Puertos", v: "24 × Gigabit (versión PoE opcional)" },
      { k: "Uplinks", v: "SFP dedicados" },
      { k: "Capa", v: "L2 con funciones L3 básicas" },
      { k: "VLANs", v: "802.1Q, troncales y de gestión" },
      { k: "Alimentación PoE", v: "Presupuesto según versión" },
    ],
    features: ["VLANs por área", "Link aggregation", "Diagnóstico por puerto"],
    compat: ["Router de borde 1U", "Access Point WiFi 6"],
    includes: ["Equipo", "Cable de consola", "Soportes de rack"],
    docs: [{ t: "Guía de configuración", note: "Se publica con el catálogo real" }],
    featured: true,
  },
  {
    slug: "rack-server-1u",
    name: "Servidor de rack 1U",
    category: "servers",
    visual: "server",
    short: "Cómputo para virtualización y servicios críticos en rack.",
    description:
      "Servidor en formato 1U dimensionado según la carga objetivo: virtualización, contenedores o servicios internos. Se entrega con el sistema base instalado, acceso remoto configurado y plantillas de monitoreo listas.",
    price: null,
    status: "available",
    tech: ["Linux", "KVM", "Docker", "Proxmox"],
    use: ["Virtualización", "Servicios internos", "Datacenter"],
    brand: "Por definir",
    specs: [
      { k: "Procesador", v: "Según configuración" },
      { k: "Memoria", v: "Ampliable según plataforma" },
      { k: "Almacenamiento", v: "Bahías para discos SSD/HDD" },
      { k: "Red", v: "2 × Gigabit (bonding)" },
      { k: "Alimentación", v: "Fuente redundante opcional" },
    ],
    features: ["Instalación de sistema base", "Acceso remoto seguro", "Agente de monitoreo preinstalado"],
    compat: ["Gabinete de rack 12U", "UPS 1500VA", "NAS 4 bahías"],
    includes: ["Servidor", "Rieles", "Documentación de instalación"],
    docs: [{ t: "Hoja de configuración", note: "Se publica con el catálogo real" }],
    featured: true,
  },
  {
    slug: "nas-4bay",
    name: "Almacenamiento NAS 4 bahías",
    category: "storage",
    visual: "nas",
    short: "Archivo compartido, respaldo y almacenamiento para servidores.",
    description:
      "Almacenamiento en red para archivos de la empresa, respaldos de configuraciones y volúmenes para servidores. Se configura con RAID según la tolerancia a fallas requerida y políticas de respaldo definidas.",
    price: null,
    status: "low",
    badge: "Últimas unidades",
    tech: ["RAID", "NFS", "SMB", "iSCSI", "Snapshot"],
    use: ["Respaldo", "Archivo corporativo", "Bloque para VMs"],
    brand: "Por definir",
    specs: [
      { k: "Bahías", v: "4 × 3.5\"/2.5\"" },
      { k: "RAID", v: "0 · 1 · 5 · 6 · 10" },
      { k: "Protocolos", v: "SMB · NFS · iSCSI" },
      { k: "Red", v: "Gigabit, con opción 2.5G" },
    ],
    features: ["RAID y snapshots configurados", "Respaldo programado", "Usuarios y permisos por área"],
    compat: ["Servidor de rack 1U", "Switch administrable"],
    includes: ["Equipo", "Fuente", "Guía de políticas de respaldo"],
    docs: [{ t: "Política de respaldo sugerida", note: "Se publica con el catálogo real" }],
    featured: true,
  },
  {
    slug: "security-appliance",
    name: "Appliance de seguridad perimetral",
    category: "security",
    visual: "firewall",
    short: "Filtrado de tráfico, segmentación y control de accesos.",
    description:
      "Equipo dedicado a políticas de seguridad en el perímetro: reglas de filtrado por zona, NAT controlado, inspección de estado y registro de eventos. Se entrega con reglas documentadas y revisión de exposición.",
    price: null,
    status: "available",
    tech: ["Firewall", "IDS/IPS", "NAT", "Zero Trust", "Logging"],
    use: ["Perímetro", "Segmentación", "Cumplimiento"],
    brand: "Por definir",
    specs: [
      { k: "Interfaces", v: "Zonas separadas (WAN · LAN · DMZ)" },
      { k: "Políticas", v: "Stateful, por zona y por servicio" },
      { k: "Registros", v: "Exportación a syslog remoto" },
      { k: "VPN", v: "Túneles sitio a sitio y acceso remoto" },
    ],
    features: ["Reglas documentadas", "Segmentación por zonas", "Alertas ante eventos relevantes"],
    compat: ["Router de borde 1U", "Stack de monitorización"],
    includes: ["Equipo", "Documentación de políticas", "Revisión de exposición"],
    docs: [{ t: "Modelo de zonas", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "sbc-cluster-4",
    name: "Cluster de cómputo edge (4 nodos)",
    category: "servers",
    visual: "cluster",
    short: "Cuatro nodos de bajo consumo agrupados para ejecutar K3s.",
    description:
      "Cluster compacto de placas de cómputo para ejecutar cargas livianas de forma redundante: Kubernetes ligero, automatización, dashboards internos o entornos de pruebas. Ideal donde no se justifica un rack completo.",
    price: null,
    status: "available",
    badge: "Favorito técnico",
    tech: ["K3s", "Kubernetes", "Docker", "Raspberry Pi", "Ansible"],
    use: ["Edge", "Laboratorio", "Automatización"],
    brand: "Por definir",
    specs: [
      { k: "Nodos", v: "4 unidades independientes" },
      { k: "Orquestación", v: "K3s, 1 plano de control + workers" },
      { k: "Almacenamiento", v: "Local por nodo + volumen compartido opcional" },
      { k: "Consumo", v: "Bajo, alimentación centralizada" },
    ],
    features: ["Cluster K3s preinstalado", "Despliegue por Ansible", "Ingress y certificados configurados"],
    compat: ["NAS 4 bahías", "Stack de monitorización"],
    includes: ["4 nodos", "Chasis y alimentación", "Playbooks de despliegue"],
    docs: [{ t: "Arquitectura del cluster", note: "Se publica con el catálogo real" }],
    featured: true,
  },
  {
    slug: "rack-cabinet-12u",
    name: "Gabinete de rack 12U",
    category: "hardware",
    visual: "rack",
    short: "Estructura ordenada para equipos de red y servidores.",
    description:
      "Gabinete con puertas ventiladas, bandejas y gestión de cableado para concentrar la infraestructura de una oficina. Incluye organizadores y etiquetado de puertos.",
    price: null,
    status: "available",
    tech: ["19\"", "Ventilación", "Cableado estructurado"],
    use: ["Oficina", "Sala de equipos"],
    brand: "Por definir",
    specs: [
      { k: "Altura", v: "12U" },
      { k: "Ancho", v: "Estándar 19 pulgadas" },
      { k: "Acceso", v: "Frontal y posterior" },
      { k: "Ventilación", v: "Paneles con flujo dirigido" },
    ],
    features: ["Gestión de cableado", "Etiquetado de puertos", "Bandeja para equipos"],
    compat: ["Servidor 1U", "Switch 24p", "UPS 1500VA"],
    includes: ["Gabinete", "Bandejas", "Organizadores", "Juego de tornillos"],
    docs: [{ t: "Plano de ubicación", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "sfp-patch-kit",
    name: "Kit de fibra y patch cords",
    category: "hardware",
    visual: "sfp",
    short: "Módulos SFP y cables certificados para enlaces entre equipos.",
    description:
      "Kit de conectividad para enlaces de uplink y conexiones entre rack y áreas de trabajo: módulos ópticos según distancia y cables de patch certificados.",
    price: null,
    status: "available",
    tech: ["SFP", "Fibra", "Cat6"],
    use: ["Uplinks", "Backbone"],
    brand: "Por definir",
    specs: [
      { k: "Módulos", v: "SFP según distancia requerida" },
      { k: "Cables", v: "Patch cords Cat6 certificados" },
      { k: "Contenido", v: "Kit configurable" },
    ],
    features: ["Selección según distancia", "Certificado de categoría", "Etiquetado incluido"],
    compat: ["Switch administrable", "Router de borde"],
    includes: ["Módulos SFP", "Patch cords", "Etiquetas"],
    docs: [{ t: "Tabla de alcances", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "ups-1500va",
    name: "UPS 1500VA",
    category: "hardware",
    visual: "ups",
    short: "Energía respaldada para equipos críticos de red y cómputo.",
    description:
      "Unidad de energía ininterrumpida para mantener operativos router, switch y servidor ante cortes eléctricos, con apagado ordenado de los equipos conectados.",
    price: null,
    status: "low",
    tech: ["AVR", "Batería", "SNMP"],
    use: ["Protección eléctrica", "Continuidad"],
    brand: "Por definir",
    specs: [
      { k: "Capacidad", v: "1500VA (según versión)" },
      { k: "Salidas", v: "Múltiples, con respaldo selectivo" },
      { k: "Gestión", v: "Monitorización por SNMP" },
    ],
    features: ["Apagado ordenado", "Supresión de picos", "Notificación por monitoreo"],
    compat: ["Servidor 1U", "Switch 24p", "NAS 4 bahías"],
    includes: ["UPS", "Cableado", "Configuración de notificaciones"],
    docs: [{ t: "Tiempos de respaldo", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "wifi6-ap",
    name: "Access Point WiFi 6 PoE",
    category: "networking",
    visual: "ap",
    short: "Cobertura inalámbrica corporativa con alimentación por PoE.",
    description:
      "Punto de acceso para cobertura inalámbrica en oficinas, con redes separadas para personal, invitados y dispositivos, alimentado por el switch mediante PoE.",
    price: null,
    status: "available",
    tech: ["WiFi 6", "PoE", "VLAN", "SSID múltiples"],
    use: ["Oficina", "Inalámbrico"],
    brand: "Por definir",
    specs: [
      { k: "Estándar", v: "WiFi 6" },
      { k: "Alimentación", v: "PoE desde el switch" },
      { k: "Redes", v: "Varios SSID con VLAN asignada" },
    ],
    features: ["Red de invitados aislada", "Roaming entre puntos", "Gestión centralizada"],
    compat: ["Switch administrable 24 puertos"],
    includes: ["Access Point", "Soporte de techo", "Guía de SSID"],
    docs: [{ t: "Cobertura sugerida", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "edge-node-minipc",
    name: "Nodo edge Mini PC",
    category: "servers",
    visual: "mini",
    short: "Cómputo compacto para tareas dedicadas en ubicaciones remotas.",
    description:
      "Equipo compacto para ejecutar servicios específicos en sedes pequeñas o ubicaciones donde no hay rack: monitoreo local, caché, automatización o agente de respaldo.",
    price: null,
    status: "soon",
    tech: ["Linux", "Docker", "Edge"],
    use: ["Sede remota", "Servicio dedicado"],
    brand: "Por definir",
    specs: [
      { k: "Factor de forma", v: "Compacto, montaje flexible" },
      { k: "Consumo", v: "Bajo" },
      { k: "Sistema", v: "Linux con Docker" },
    ],
    features: ["Despliegue remoto", "Recuperación automática", "Agente de monitoreo"],
    compat: ["Stack de monitorización", "Cluster K3s"],
    includes: ["Equipo", "Fuente", "Configuración inicial"],
    docs: [{ t: "Casos de uso", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "vpn-site-license",
    name: "Licencia VPN sitio a sitio",
    category: "software",
    visual: "license",
    short: "Interconexión cifrada entre sedes y acceso remoto seguro.",
    description:
      "Licenciamiento y configuración de túneles cifrados entre ubicaciones, con acceso remoto para el equipo de TI bajo políticas de acceso controlado.",
    price: null,
    status: "available",
    tech: ["IPsec", "WireGuard", "Zero Trust"],
    use: ["Multi-sede", "Teletrabajo"],
    brand: "Por definir",
    specs: [
      { k: "Túneles", v: "Según licencia adquirida" },
      { k: "Protocolos", v: "IPsec · WireGuard" },
      { k: "Usuarios", v: "Definidos por política" },
    ],
    features: ["Túneles documentados", "Política de acceso", "Rotación de credenciales"],
    compat: ["Router de borde 1U", "Appliance de seguridad"],
    includes: ["Licencia", "Configuración", "Documentación"],
    docs: [{ t: "Matriz de acceso", note: "Se publica con el catálogo real" }],
  },
  {
    slug: "monitoring-license",
    name: "Stack de monitorización (anual)",
    category: "software",
    visual: "cloud",
    short: "Prometheus, Grafana y alertas sobre tu infraestructura.",
    description:
      "Implementación del stack de observabilidad: recolección de métricas de red, servidores y aplicaciones, dashboards de operación y alertas dirigidas al equipo responsable.",
    price: null,
    status: "available",
    tech: ["Prometheus", "Grafana", "Alertmanager", "Loki"],
    use: ["Operación", "Diagnóstico"],
    brand: "Open source",
    specs: [
      { k: "Componentes", v: "Prometheus · Grafana · Alertmanager" },
      { k: "Cobertura", v: "Red, servidores, contenedores, servicios" },
      { k: "Vigencia", v: "Suscripción anual" },
    ],
    features: ["Dashboards de operación", "Alertas priorizadas", "Histórico de métricas"],
    compat: ["Todos los equipos InfiniHon", "Infraestructura existente"],
    includes: ["Instalación", "Dashboards iniciales", "Capacitación al equipo"],
    docs: [{ t: "Lista de métricas base", note: "Se publica con el catálogo real" }],
    featured: true,
  },
  {
    slug: "cloud-deployment",
    name: "Paquete de despliegue cloud",
    category: "cloud",
    visual: "cloud",
    short: "Puesta en marcha de tu plataforma en AWS, Azure o Google Cloud.",
    description:
      "Implementación de un entorno cloud con infraestructura declarada como código: red virtual, identidades, permisos mínimos y costos visibles desde el primer día.",
    price: null,
    status: "available",
    tech: ["AWS", "Azure", "Google Cloud", "Terraform"],
    use: ["Migración", "Nueva plataforma"],
    brand: "Multi-nube",
    specs: [
      { k: "Proveedores", v: "AWS · Azure · Google Cloud" },
      { k: "Provisión", v: "Terraform, versión controlada" },
      { k: "Entregable", v: "Entorno operativo + código" },
    ],
    features: ["Red y subredes definidas", "Identidades y permisos", "Presupuesto y alertas de costo"],
    compat: ["Servicios cloud existentes", "DevOps as a Service"],
    includes: ["Código de infraestructura", "Documentación", "Sesión de traspaso"],
    docs: [{ t: "Diagrama de arquitectura", note: "Se publica con el catálogo real" }],
  },
];

export const services: Service[] = [
  {
    slug: "network-setup",
    name: "Network Setup",
    category: "services",
    visual: "service",
    short: "Diseño e implementación de la red: topología, VLANs y enrutamiento.",
    description: "Levantamos o reordenamos la red completa de tu empresa, con documentación de la topología y pruebas de funcionamiento.",
    scope: ["Levantamiento del estado actual", "Diseño de topología y VLANs", "Configuración de routers y switches", "Pruebas y documentación"],
    deliverables: ["Diagrama de red", "Configuraciones respaldadas", "Informe de pruebas"],
    tech: ["MikroTik", "VLAN", "BGP", "OSPF"],
    duration: "Según alcance",
    featured: true,
  },
  {
    slug: "cloud-deployment-service",
    name: "Cloud Deployment",
    category: "services",
    visual: "service",
    short: "Arquitectura e implementación en AWS, Azure o Google Cloud.",
    description: "Definimos la arquitectura, la declaramos como código y la dejamos operando con costos visibles.",
    scope: ["Selección de servicios y regiones", "Infraestructura como código", "Identidades y permisos", "Presupuesto y alertas de costo"],
    deliverables: ["Entorno operativo", "Repositorio de infraestructura", "Documentación de arquitectura"],
    tech: ["AWS", "Azure", "Google Cloud", "Terraform"],
    duration: "Según alcance",
    featured: true,
  },
  {
    slug: "server-setup",
    name: "Server Setup",
    category: "services",
    visual: "service",
    short: "Instalación, virtualización y preparación de servidores.",
    description: "Preparamos servidores físicos o virtuales para correr tus servicios de forma ordenada y monitoreada.",
    scope: ["Instalación del sistema", "Virtualización o contenedores", "Respaldos y acceso remoto", "Plantillas de monitoreo"],
    deliverables: ["Servidor operativo", "Política de respaldo", "Guía de operación"],
    tech: ["Linux", "Proxmox", "Docker", "Ansible"],
    duration: "Según alcance",
  },
  {
    slug: "security-audit",
    name: "Security Audit",
    category: "services",
    visual: "service",
    short: "Revisión de exposición, configuraciones y control de accesos.",
    description: "Evaluamos tu infraestructura y entregamos un plan priorizado de corrección, sin exagerar riesgos.",
    scope: ["Inventario de exposición", "Revisión de configuraciones", "Control de accesos y credenciales", "Plan de remediación"],
    deliverables: ["Informe de hallazgos", "Plan priorizado", "Acompañamiento en correcciones"],
    tech: ["Hardening", "Zero Trust", "VPN"],
    duration: "Según alcance",
    featured: true,
  },
  {
    slug: "devops-service",
    name: "DevOps",
    category: "services",
    visual: "service",
    short: "Contenedores, orquestación y automatización de despliegues.",
    description: "Llevamos tus aplicaciones a contenedores con despliegues repetibles y reversibles.",
    scope: ["Contenerización", "Cluster Kubernetes / K3s", "Pipelines de despliegue", "Infraestructura como código"],
    deliverables: ["Ambiente de despliegue", "Pipelines operativos", "Documentación"],
    tech: ["Docker", "Kubernetes", "K3s", "Terraform", "Ansible"],
    duration: "Según alcance",
    featured: true,
  },
  {
    slug: "monitoring-service",
    name: "Monitoring",
    category: "services",
    visual: "service",
    short: "Observabilidad completa sobre red, servidores y aplicaciones.",
    description: "Implementamos métricas, dashboards y alertas para que los problemas se detecten antes de que afecten.",
    scope: ["Recolección de métricas", "Dashboards de operación", "Definición de alertas", "Capacitación"],
    deliverables: ["Stack instalado", "Dashboards", "Reglas de alerta"],
    tech: ["Prometheus", "Grafana", "Alertmanager"],
    duration: "Según alcance",
    featured: true,
  },
  {
    slug: "automation-service",
    name: "Automation",
    category: "services",
    visual: "service",
    short: "Automatización de tareas repetitivas y procesos internos.",
    description: "Identificamos tareas manuales y las convertimos en procesos automáticos y verificables.",
    scope: ["Identificación de tareas", "Automatización con Ansible o scripts", "Validación", "Documentación"],
    deliverables: ["Automatizaciones", "Registro de cambios", "Manual de uso"],
    tech: ["Ansible", "Python", "Node.js"],
    duration: "Según alcance",
  },
  {
    slug: "technical-support",
    name: "Technical Support",
    category: "services",
    visual: "service",
    short: "Soporte técnico continuo para tu infraestructura.",
    description: "Acompañamiento para incidencias, mantenimiento y mejora progresiva de la plataforma.",
    scope: ["Atención de incidencias", "Mantenimiento programado", "Revisión periódica", "Mejora continua"],
    deliverables: ["Registro de incidencias", "Reportes de mantenimiento", "Recomendaciones"],
    tech: ["Soporte", "Mantenimiento"],
    duration: "Continuo",
  },
];

export const bundles: Bundle[] = [
  {
    slug: "starter-infrastructure",
    name: "Starter Infrastructure",
    tier: "Nivel 01",
    for: "Negocios que arman su primer rack o ordenan su red actual.",
    problem: "La red creció sin diseño: cables sueltos, equipos sin etiquetar y nadie sabe qué está conectado a qué.",
    includes: ["Levantamiento y diagnóstico", "Rediseño de la red local", "Gabinete y cableado ordenado", "Configuración básica de firewall"],
    requires: ["Gabinete de rack", "Switch administrable", "Router de borde"],
    components: ["rack-cabinet-12u", "managed-switch-24", "edge-router-1u"],
    cta: "Configurar solución",
  },
  {
    slug: "network-core",
    name: "Network Core",
    tier: "Nivel 02",
    for: "Empresas con varias áreas o pisos que necesitan segmentación real.",
    problem: "Todos los dispositivos comparten la misma red: sin VLANs, sin prioridad y sin aislamiento entre áreas.",
    includes: ["Diseño de VLANs por área", "Enrutamiento entre segmentos", "WiFi corporativo e invitados", "Documentación de topología"],
    requires: ["Switch administrable", "Access Points", "Router de borde"],
    components: ["managed-switch-24", "wifi6-ap", "edge-router-1u"],
    cta: "Configurar solución",
  },
  {
    slug: "cloud-ready",
    name: "Cloud Ready",
    tier: "Nivel 03",
    for: "Empresas que quieren salir de un solo servidor físico.",
    problem: "Todo depende de una máquina bajo un escritorio, sin respaldo ni forma de escalar.",
    includes: ["Arquitectura cloud o híbrida", "Infraestructura como código", "Migración de servicios", "Control de costos"],
    requires: ["Cuenta de cloud", "Definición de servicios a migrar"],
    components: ["cloud-deployment", "vpn-site-license"],
    cta: "Hablar con un experto",
  },
  {
    slug: "secure-business",
    name: "Secure Business",
    tier: "Nivel 04",
    for: "Operaciones que manejan datos sensibles o accesos externos.",
    problem: "Accesos compartidos, puertos abiertos y ninguna visibilidad sobre quién entra a la red.",
    includes: ["Auditoría de exposición", "Segmentación por zonas", "VPN y control de accesos", "Registro de eventos"],
    requires: ["Appliance de seguridad", "Política de accesos", "Monitoreo"],
    components: ["security-appliance", "vpn-site-license", "monitoring-license"],
    cta: "Hablar con un experto",
  },
  {
    slug: "monitoring-stack",
    name: "Monitoring Stack",
    tier: "Nivel 05",
    for: "Equipos de TI que se enteran de las fallas cuando el usuario avisa.",
    problem: "Sin métricas no hay diagnóstico: cada incidencia se resuelve adivinando.",
    includes: ["Instalación de Prometheus y Grafana", "Dashboards de operación", "Alertas priorizadas", "Capacitación"],
    requires: ["Acceso a los equipos", "Definición de responsables"],
    components: ["monitoring-license"],
    cta: "Configurar solución",
  },
  {
    slug: "enterprise-infrastructure",
    name: "Enterprise Infrastructure",
    tier: "Nivel 06",
    for: "Operaciones multi-sede con requisitos de disponibilidad.",
    problem: "Sedes desconectadas, sin redundancia y con procesos manuales en cada ubicación.",
    includes: ["Interconexión de sedes por VPN/MPLS", "Redundancia de enlaces", "Automatización de configuraciones", "Operación monitoreada"],
    requires: ["Enlaces por sede", "Equipos de borde", "Política de seguridad"],
    components: ["edge-router-1u", "security-appliance", "monitoring-license", "cloud-deployment"],
    cta: "Hablar con un experto",
  },
];

/** Slug URL-safe para títulos en español: normaliza acentos y ñ. */
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const insights = [
  { t: "Cómo segmentar una red corporativa con VLANs", c: "Guía", r: "8 min", d: "Por dónde empezar cuando todos los dispositivos comparten la misma red." },
  { t: "¿Cluster de placas o un solo servidor?", c: "Comparativa", r: "6 min", d: "Cuándo conviene un cluster K3s y cuándo un servidor tradicional." },
  { t: "Checklist de exposición antes de abrir puertos", c: "Seguridad", r: "5 min", d: "Lo que revisamos antes de publicar cualquier servicio a Internet." },
];

export const statusLabel: Record<Status, string> = {
  available: "Disponible",
  low: "Últimas unidades",
  out: "Agotado",
  soon: "Próximamente",
};

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

/** Etiqueta legible de una categoría; cae al id si el catálogo remoto trae otra. */
export const categoryLabel = (id: string) =>
  categories.find((c) => c.id === id)?.label ?? id;

/* ------------------------------------------------ catálogo remoto (Supabase) */

/**
 * Fuente real del catálogo: tabla store_items en Supabase (lectura pública
 * vía PostgREST). La forma de los objetos de arriba es el contrato: lo que
 * llega de la base se mapea a esas mismas interfaces, de modo que ningún
 * componente cambia.
 *
 * Si la red falla, el catálogo estático de arriba sigue siendo la vista de
 * respaldo: la tienda nunca se rompe.
 */
const SUPABASE_URL = "https://jcizfmpagprxyhvzuymx.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable_f8X-zd5BTDecZwdGSKLZsw_9P6Dm8Uf";

interface RemoteRow {
  slug: string; kind: "product" | "service" | "bundle"; name: string; category: string;
  visual: string; short: string; description: string; price: number | null;
  status: Status; badge: string | null; featured: boolean; sort: number;
  data: Record<string, unknown>;
}

let refreshing = false;

/** Descarga el catálogo desde Supabase y sustituye products/services/bundles en vivo. */
export async function loadRemoteCatalog(): Promise<boolean> {
  if (refreshing) return false;
  refreshing = true;
  try {
    const res = await fetch(`${SUPABASE_URL}/store_items?select=*&order=sort.asc`, { headers: { apikey: SUPABASE_KEY } });
    if (!res.ok) return false;
    const rows = (await res.json()) as RemoteRow[];
    if (!Array.isArray(rows) || rows.length === 0) return false;

    const prods: Product[] = [];
    const servs: Service[] = [];
    const bunds: Bundle[] = [];
    for (const r of rows) {
      const d = r.data ?? {};
      if (r.kind === "product") {
        prods.push({
          slug: r.slug, name: r.name, category: r.category as CategoryId, visual: r.visual as Visual,
          sku: (d.sku as string) ?? r.slug.toUpperCase(),
          short: r.short, description: r.description, price: r.price, status: r.status,
          badge: r.badge ?? undefined, featured: r.featured,
          tech: (d.tech as string[]) ?? [], use: (d.use as string[]) ?? [],
          brand: (d.brand as string) ?? "Por definir", specs: (d.specs as Spec[]) ?? [],
          features: (d.features as string[]) ?? [], compat: (d.compat as string[]) ?? [],
          includes: (d.includes as string[]) ?? [], docs: (d.docs as { t: string; note: string }[]) ?? [],
        });
      } else if (r.kind === "service") {
        servs.push({
          slug: r.slug, name: r.name, category: r.category as CategoryId, visual: r.visual as Visual,
          short: r.short, description: r.description, featured: r.featured,
          scope: (d.scope as string[]) ?? [], deliverables: (d.deliverables as string[]) ?? [],
          tech: (d.tech as string[]) ?? [], duration: (d.duration as string) ?? "Según alcance",
        });
      } else if (r.kind === "bundle") {
        bunds.push({
          slug: r.slug, name: r.name, tier: (d.tier as string) ?? "", for: (d.for as string) ?? r.short,
          problem: r.description, includes: (d.includes as string[]) ?? [], requires: (d.requires as string[]) ?? [],
          components: (d.components as string[]) ?? [],
          cta: d.cta === "Hablar con un experto" ? "Hablar con un experto" : "Configurar solución",
        });
      }
    }

    if (prods.length) products.splice(0, products.length, ...prods);
    if (servs.length) services.splice(0, services.length, ...servs);
    if (bunds.length) bundles.splice(0, bundles.length, ...bunds);
    for (const c of categories) c.count = prods.filter((p) => p.category === c.id).length + (c.id === "services" ? servs.length : 0);

    refreshFeatured();
    // avisa a la app para re-renderizar con los datos frescos
    window.dispatchEvent(new CustomEvent("infinihon:catalog"));
    return true;
  } catch {
    return false; // sin red / Supabase caído: queda el catálogo estático
  } finally {
    refreshing = false;
  }
}

/** Destacados como arreglos vivos: se recalculan cuando llega el catálogo remoto. */
export const featured: Product[] = products.filter((p) => p.featured);
export const servicesFeatured: Service[] = services.filter((s) => s.featured);
function refreshFeatured() {
  featured.splice(0, featured.length, ...products.filter((p) => p.featured));
  servicesFeatured.splice(0, servicesFeatured.length, ...services.filter((s) => s.featured));
}

/* ------------------------------------------------ pedidos (Supabase) */

/** Registra un pedido en la tabla orders de Supabase. */
export interface OrderPayload {
  id: string;
  customerId: string;
  items: { productId: string; qty: number }[];
  status: string;
  notes: string;
  created_at: string;
}

export async function registerOrder(payload: OrderPayload): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/orders?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
