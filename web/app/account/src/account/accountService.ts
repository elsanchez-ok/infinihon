/**
 * Capa de servicios del portal de usuario.
 *
 * IMPORTANTE — no hay backend conectado:
 *  · Ninguna función llama a la red, guarda credenciales ni crea una sesión real.
 *  · `capabilities` declara qué puede hacer el portal hoy. La interfaz se oculta
 *    o se deshabilita según estas capacidades en lugar de fingir que funciona.
 *  · Al conectar la API, implementa estos métodos contra el servidor y mantén
 *    las mismas firmas: los componentes no necesitan cambiar.
 *
 * Seguridad: la autorización real (que un usuario solo vea SUS recursos) debe
 * aplicarse en el servidor. El frontend solo refleja el resultado.
 */

export const capabilities = {
  authentication: true,
  profileUpdate: true,
  passwordChange: true,
  twoFactor: false,
  orders: false,
  services: false,
  billing: false,
  documents: false,
  organization: false,
  notifications: false,
  fileUpload: false,
} as const;

export type AuthOutcome = { ok: true } | { ok: false; reason: "no-backend" | "network" };

const unavailable = (): AuthOutcome => ({ ok: false, reason: "no-backend" });

export const accountService = {
  getCurrentUser: async () => unavailable,
  getMyServices: async () => unavailable,
  getMyOrders: async () => unavailable,
  getMyRequests: async () => unavailable,
  getMyTickets: async () => unavailable,
  getNotifications: async () => unavailable,
  updateProfile: async () => unavailable,
  changePassword: async () => unavailable,
  updatePreferences: async () => unavailable,
};

/* ─────────── Sesión local de demostración ─────────── */

const KEY = "infinihon.account.demo";

export const hasDemoSession = () => {
  try { return window.sessionStorage.getItem(KEY) === "1"; } catch { return false; }
};
export const startDemoSession = () => {
  try { window.sessionStorage.setItem(KEY, "1"); } catch { /* almacenamiento no disponible */ }
};
export const endDemoSession = () => {
  try { window.sessionStorage.removeItem(KEY); } catch { /* almacenamiento no disponible */ }
};
