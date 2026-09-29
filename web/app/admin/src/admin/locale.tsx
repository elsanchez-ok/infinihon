import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en-US" | "es-HN";
const KEY = "infinihon.locale.v1";

const es: Record<string, string> = {
  "Overview": "Resumen", "Analytics": "Analítica", "Commerce": "Comercio", "Products": "Productos", "Categories": "Categorías", "Inventory": "Inventario", "Orders": "Pedidos", "Customers": "Clientes",
  "Platform": "Plataforma", "Users": "Usuarios", "Administrators": "Administradores", "Roles & Permissions": "Roles y permisos", "Services": "Servicios", "Content": "Contenido", "Support inbox": "Bandeja de soporte",
  "Infrastructure": "Infraestructura", "Servers": "Servidores", "Cloud": "Nube", "Monitoring": "Monitoreo", "Integrations": "Integraciones", "System": "Sistema", "Notifications": "Notificaciones", "Activity Log": "Registro de actividad", "Security": "Seguridad", "Settings": "Configuración",
  "Search anything...": "Buscar en todo...", "Search anything": "Buscar en todo", "Help": "Ayuda", "Help & documentation": "Ayuda y documentación", "Close": "Cerrar", "Open navigation": "Abrir navegación", "Close navigation": "Cerrar navegación", "Skip to content": "Saltar al contenido",
  "My Profile": "Mi perfil", "Edit profile": "Editar perfil", "Save changes": "Guardar cambios", "Cancel": "Cancelar", "Save": "Guardar", "Profile saved.": "Perfil guardado.", "Could not save your profile.": "No se pudo guardar el perfil.", "First name": "Nombre", "Last name": "Apellido", "Work email": "Correo de trabajo", "Language": "Idioma", "English (United States)": "Inglés (Estados Unidos)", "Español (Honduras)": "Español (Honduras)",
  "Name": "Nombre", "Email": "Correo", "Role": "Rol", "Status": "Estado", "Last active": "Última actividad", "Created": "Creado", "All statuses": "Todos los estados", "Search name or email": "Buscar nombre o correo", "Search users": "Buscar usuarios", "No users found.": "No se encontraron usuarios.",
  "All": "Todos", "Read": "Leída", "Unread": "Sin leer", "Mark read": "Marcar como leída", "Mark unread": "Marcar como no leída", "Mark all as read": "Marcar todo como leído", "View all notifications": "Ver todas las notificaciones", "You're all caught up. No notifications yet.": "Estás al día. No hay notificaciones.", "No notifications.": "No hay notificaciones.",
  "Any date": "Cualquier fecha", "All users": "Todos los usuarios", "All modules": "Todos los módulos", "Last 24 hours": "Últimas 24 horas", "Last 7 days": "Últimos 7 días", "Last 30 days": "Últimos 30 días", "No activity matches these filters.": "Ninguna actividad coincide con estos filtros.", "Search action or target": "Buscar acción o elemento", "Search activity": "Buscar actividad",
  "Next page": "Página siguiente", "Previous page": "Página anterior", "records": "registros", "page": "página", "of": "de", "Active": "Activo", "Pending": "Pendiente", "Suspended": "Suspendido", "Published": "Publicado", "Draft": "Borrador", "Scheduled": "Programado", "Archived": "Archivado", "Completed": "Completado", "Processing": "En proceso", "Shipped": "Enviado", "Cancelled": "Cancelado", "Low stock": "Pocas existencias", "Out of stock": "Agotado", "In stock": "Disponible",
  "Back to inbox": "Volver a la bandeja", "Conversation": "Conversación", "Reply": "Responder", "Send reply": "Enviar respuesta", "Sending…": "Enviando…", "Ticket details": "Detalles del ticket", "New customer message": "Nuevo mensaje de cliente", "No support tickets yet.": "Aún no hay tickets de soporte.", "Tickets submitted from /account will appear here.": "Aquí aparecerán los tickets enviados desde /account.", "Ticket not found.": "No se encontró el ticket.", "No results": "Sin resultados", "Customer support conversations from the account portal.": "Conversaciones de soporte recibidas desde el portal de cuenta.", "Ticket no longer exists": "El ticket ya no existe.", "Ticket": "Ticket", "Category": "Categoría", "Priority": "Prioridad", "Last updated": "Última actualización", "Write a reply to the customer…": "Escribe una respuesta para el cliente…", "Reply sent to the customer.": "Respuesta enviada al cliente.", "Could not send the reply. Check the connection and permissions.": "No se pudo enviar. Revisa la conexión y los permisos.",
  "Accounts that use InfiniHon's platform and store. Administrators are managed separately.": "Cuentas que usan la plataforma y tienda de InfiniHon. Los administradores se gestionan por separado.", "Platform accounts appear here once registration is enabled.": "Las cuentas de la plataforma aparecerán aquí cuando se habilite el registro.", "Never": "Nunca", "User details": "Datos del usuario", "Edit user": "Editar usuario", "Account type": "Tipo de cuenta", "Customer account": "Cuenta de cliente", "Partner account": "Cuenta de socio", "Enter a valid email address.": "Escribe un correo electrónico válido.", "Name is required.": "El nombre es obligatorio.", "User updated.": "Usuario actualizado.", "User deleted.": "Usuario eliminado.", "Suspend user": "Suspender usuario", "Delete user": "Eliminar usuario", "Reactivate": "Reactivar", "Suspend": "Suspender", "Delete": "Eliminar",
  "Professional services InfiniHon offers. Services use quotes instead of fixed prices.": "Servicios profesionales de InfiniHon. Se cotizan según el alcance, no tienen precio fijo.", "New service": "Nuevo servicio", "Actions for": "Acciones para", "Duration:": "Duración:", "Scope": "Alcance", "Deliverables": "Entregables", "Hidden": "Oculto", "CTA:": "Acción:", "Estimated duration": "Duración estimada", "Shown on the public service page.": "Se muestra en la página pública del servicio.", "Call to action": "Llamada a la acción", "Request a Quote": "Solicitar cotización", "Talk to an expert": "Hablar con un experto", "Book a consultation": "Agendar una consulta", "Upload image": "Subir imagen", "Requires object storage integration (not configured).": "Requiere integrar almacenamiento de archivos, aún no configurado.", "Add a scope item and press Enter": "Agrega un punto de alcance y presiona Enter", "Add a deliverable and press Enter": "Agrega un entregable y presiona Enter", "Add a technology and press Enter": "Agrega una tecnología y presiona Enter", "Add a feature and press Enter": "Agrega una característica y presiona Enter", "Visible on public site": "Visible en el sitio público", "Hidden services stay available to administrators only.": "Los servicios ocultos solo están disponibles para administradores.", "Service created.": "Servicio creado.", "Service updated.": "Servicio actualizado.", "Service duplicated as draft.": "Servicio duplicado como borrador.", "No services yet.": "Aún no hay servicios.", "Create a service to show it in the public site.": "Crea un servicio para mostrarlo en el sitio público.", "Delete service": "Eliminar servicio", "Are you sure you want to delete the service": "¿Seguro que quieres eliminar el servicio",
  "Audit trail of administrative actions. Entries from this session are tagged; sample entries are marked DEMO.": "Registro de acciones administrativas. Las acciones de esta sesión están identificadas; los ejemplos llevan la marca DEMO.", "Administrator": "Administrador", "Action": "Acción", "This session": "Esta sesión", "Search products, orders, customers, users…": "Buscar productos, pedidos, clientes y usuarios…", "Type to search across products, services, orders, customers, users, administrators and modules.": "Escribe para buscar productos, servicios, pedidos, clientes, usuarios, administradores y módulos.", "No results for": "Sin resultados para", "Modules": "Módulos", "Go to module": "Ir al módulo", "Notifications,": "Notificaciones,", "Guidance for operating the INFINIHON Control Center.": "Guía para usar el Centro de Control de INFINIHON.", "Search:": "Búsqueda:", "Data:": "Datos:", "Permissions:": "Permisos:", "Public site:": "Sitio público:", "press ⌘K / Ctrl+K anywhere to open global search.": "presiona ⌘K / Ctrl+K en cualquier lugar para abrir la búsqueda.",
};

export function translate(locale: Locale, text: string) {
  return locale === "es-HN" ? es[text] ?? text : text;
}

interface LocaleContextValue { locale: Locale; setLocale: (locale: Locale) => void; t: (text: string) => string }
const LocaleContext = createContext<LocaleContextValue | null>(null);

function readLocale(fallback: Locale): Locale {
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "es-HN" || stored === "en-US" ? stored : fallback;
  } catch { return fallback; }
}

export function LocaleProvider({ children, defaultLocale = "en-US" }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setCurrentLocale] = useState<Locale>(() => readLocale(defaultLocale));
  const setLocale = useCallback((next: Locale) => {
    setCurrentLocale(next);
    try { window.localStorage.setItem(KEY, next); } catch { /* storage may be unavailable */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    const sync = (event: StorageEvent) => { if (event.key === KEY) setCurrentLocale(readLocale(defaultLocale)); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [locale, defaultLocale]);
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => translate(locale, text) }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}