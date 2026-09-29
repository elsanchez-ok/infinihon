import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en-US" | "es-HN";
const KEY = "infinihon.locale.v1";

const en: Record<string, string> = {
  "Resumen": "Overview", "Inicio": "Home", "Mi InfiniHon": "My InfiniHon", "Mis servicios": "My services", "Mis pedidos": "My orders", "Mis solicitudes": "My requests", "Favoritos": "Favorites",
  "Soporte": "Support", "Mensajes": "Messages", "Centro de ayuda": "Help center", "Cuenta": "Account", "Mi perfil": "My profile", "Seguridad": "Security", "Configuración": "Settings", "Notificaciones": "Notifications", "Facturación": "Billing", "Organización": "Organization", "Documentos": "Documents",
  "Cerrar sesión": "Sign out", "Abrir navegación": "Open navigation", "Cerrar navegación": "Close navigation", "Saltar al contenido": "Skip to content", "Buscar en tu cuenta": "Search your account", "Buscar en tu cuenta...": "Search your account...", "Sin resultados en tu cuenta para": "No account results for", "Sección": "Section", "Solicitud": "Request", "Ticket": "Ticket",
  "Portal de usuario": "Account portal", "Ver todas": "View all", "Marcar todo como leído": "Mark all as read", "No tienes notificaciones todavía.": "No notifications yet.", "Sin sesión activa.": "No active session.", "Sesión activa:": "Active session:", "Administrador": "Administrator", "Cliente": "Customer", "Tu información se sincroniza con tu cuenta.": "Your information is synced with your account.", "¿Quieres cerrar tu sesión en este dispositivo?": "Do you want to sign out on this device?", "Cerrar": "Close", "Descartar": "Dismiss",
  "Español (Honduras)": "Spanish (Honduras)", "Inglés (Estados Unidos)": "English (United States)", "Preferencias": "Preferences", "Zona horaria": "Time zone", "Comunicación": "Communication", "Guardar cambios": "Save changes", "Restaurar": "Restore", "Preferencias de idioma, zona horaria y comunicación.": "Language, time zone, and communication preferences.",
  "Notificaciones del navegador": "Browser notifications", "Avisos en este dispositivo.": "Alerts on this device.", "Notificaciones por correo": "Email notifications", "Actualizaciones de pedidos": "Order updates", "Actualizaciones de servicios": "Service updates", "Respuestas de soporte": "Support replies", "Comunicaciones comerciales": "Marketing communications", "Nunca vendemos ni compartimos tus datos.": "We never sell or share your data.",
  "Restablecer": "Reset", "Restablecer portal": "Reset portal", "Restablece el portal": "Reset portal", "Vuelve a los valores iniciales del portal de demostración.": "Return the demo portal to its initial values.", "Borra las solicitudes, tickets y favoritos creados en esta sesión.": "Deletes the requests, tickets, and favorites created in this session.", "Elige qué quieres recibir.": "Choose what you want to receive.", "Preferencias guardadas para esta sesión.": "Preferences saved for this session.", "English": "English", "Español": "Spanish",
  "Conversación": "Conversation", "Responder": "Reply", "Enviar respuesta": "Send reply", "Enviar": "Send", "Volver": "Back", "Todos": "All", "Sin leer": "Unread", "Abierto": "Open", "En progreso": "In progress", "Esperándote": "Waiting on you", "Resuelto": "Resolved", "Cerrado": "Closed", "Normal": "Normal", "Alta": "High", "Baja": "Low",
  "Nombre": "First name", "Apellido": "Last name", "Correo electrónico": "Email", "Teléfono": "Phone", "Empresa": "Company", "Cargo": "Job title", "Guardar": "Save", "Revisa los campos marcados.": "Review the highlighted fields.", "Perfil guardado en tu cuenta.": "Profile saved to your account.", "Mi espacio": "My space", "Hecho en Honduras.": "Made in Honduras.",
};

export function translate(locale: Locale, text: string) {
  return locale === "en-US" ? en[text] ?? text : text;
}

interface LocaleContextValue { locale: Locale; setLocale: (locale: Locale) => void; t: (text: string) => string }
const LocaleContext = createContext<LocaleContextValue | null>(null);

function readLocale(fallback: Locale): Locale {
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "es-HN" || stored === "en-US" ? stored : fallback;
  } catch { return fallback; }
}

export function LocaleProvider({ children, defaultLocale = "es-HN" }: { children: ReactNode; defaultLocale?: Locale }) {
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