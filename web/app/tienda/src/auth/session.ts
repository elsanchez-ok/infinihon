/**
 * Lectura de la sesión de Supabase Auth compartida entre las sub-apps de InfiniHon
 * (mismo origen: infinihon.vercel.app). Las credenciales se guardan por /auth y /account
 * bajo estas mismas claves — ver web/app/auth/src/lib/supabase.ts.
 *
 * La tienda nunca escribe en esta sesión: solo la lee para saber si ya hay una
 * cuenta activa antes de dejar pasar al checkout.
 */

const LS_KEY = "infinihon.auth.session";
const SS_KEY = "infinihon.auth.session.mem";

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

function readTokens(): Tokens | null {
  try {
    const raw = window.localStorage.getItem(LS_KEY) ?? window.sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Tokens>;
    return parsed?.access_token && parsed?.refresh_token ? (parsed as Tokens) : null;
  } catch {
    return null;
  }
}

/**
 * true si el navegador tiene una sesión guardada (el access token puede estar
 * vencido; /auth y /account lo refrescan automáticamente al usarlo). Suficiente
 * para decidir si mostramos el aviso de registro antes del checkout.
 */
export function hasStoredSession(): boolean {
  return readTokens() !== null;
}

/** Construye la URL de /auth con un retorno seguro al paso de checkout de la tienda. */
export function authUrl(mode: "login" | "register", redirectTo: string): string {
  const path = mode === "register" ? "/auth/register" : "/auth";
  return `${path}?redirect=${encodeURIComponent(redirectTo)}`;
}
