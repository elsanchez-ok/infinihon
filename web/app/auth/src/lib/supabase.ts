/**
 * Cliente mínimo de Supabase (REST + GoTrue) sin dependencias externas.
 * Usado por /auth, /account y /admin. La sesión se guarda en el navegador:
 * localStorage si el usuario marca "Recordarme", sessionStorage si no.
 */

export const SUPABASE_URL = "https://jcizfmpagprxyhvzuymx.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_f8X-zd5BTDecZwdGSKLZsw_9P6Dm8Uf";

const LS_KEY = "infinihon.auth.session";
const SS_KEY = "infinihon.auth.session.mem";

interface Tokens { access_token: string; refresh_token: string; expires_at: number }
export interface AuthUser { id: string; email: string; firstName: string; lastName: string }

export class SupabaseError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

/* ─────────── REST helper ─────────── */

export async function sb(path: string, opts: { method?: string; body?: unknown; token?: string | null; prefer?: string } = {}) {
  const headers: Record<string, string> = { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.prefer) headers.Prefer = opts.prefer;
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new SupabaseError(0, "network");
  }
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.message ?? j.error_description ?? j.msg ?? msg;
    } catch { /* sin cuerpo JSON */ }
    throw new SupabaseError(res.status, msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ─────────── Sesión ─────────── */

function readStorage(key: string): Tokens | null {
  try {
    const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch { return null; }
}

function writeStorage(t: Tokens, remember: boolean) {
  try {
    window.localStorage.removeItem(LS_KEY);
    window.sessionStorage.removeItem(SS_KEY);
    (remember ? window.localStorage : window.sessionStorage).setItem(remember ? LS_KEY : SS_KEY, JSON.stringify(t));
  } catch { /* almacenamiento no disponible */ }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(LS_KEY);
    window.sessionStorage.removeItem(SS_KEY);
  } catch { /* noop */ }
}

/** Refresca el access token si expiró (o si se fuerza). Devuelve tokens válidos o null. */
async function validTokens(force = false): Promise<Tokens | null> {
  const t = readStorage(LS_KEY) ?? readStorage(SS_KEY);
  if (!t?.refresh_token) return null;
  if (!force && t.expires_at > Date.now() + 30_000) return t;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: t.refresh_token }),
    });
    if (!res.ok) { clearSession(); return null; }
    const j = await res.json();
    const next: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 };
    const remembered = Boolean(window.localStorage.getItem(LS_KEY));
    writeStorage(next, remembered);
    return next;
  } catch {
    return t.expires_at > Date.now() ? t : null; // sin red: usa lo vigente
  }
}

export async function getAccessToken(): Promise<string | null> {
  return (await validTokens())?.access_token ?? null;
}

export interface SessionUser { id: string; email: string; firstName: string; lastName: string }

/** Usuario de la sesión actual (o null). Refresca el token si hace falta. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const t = await validTokens();
  if (!t) return null;
  try {
    const u = await sb("/auth/v1/user", { token: t.access_token }) as {
      id: string; email?: string; user_metadata?: Record<string, string>;
    };
    if (!u?.id) { clearSession(); return null; }
    return {
      id: u.id,
      email: u.email ?? "",
      firstName: u.user_metadata?.firstName ?? "",
      lastName: u.user_metadata?.lastName ?? "",
    };
  } catch (e) {
    if (e instanceof SupabaseError && (e.status === 401 || e.status === 403)) { clearSession(); return null; }
    return null;
  }
}

/* ─────────── OAuth (Google / Microsoft) ─────────── */

export type OAuthProvider = "google" | "azure";

/**
 * Construye la URL de autorización de GoTrue para iniciar el flujo OAuth.
 * Es una redirección de página completa: el navegador sale del sitio hacia
 * el proveedor (Google/Microsoft) y luego Supabase trae de vuelta al usuario
 * a `redirectTo`, con los tokens de sesión en el fragmento `#` de la URL.
 * No funciona hasta que el provider correspondiente esté activado con sus
 * credenciales en Supabase → Authentication → Providers.
 */
export function oauthAuthorizeUrl(provider: OAuthProvider, redirectTo: string): string {
  const params = new URLSearchParams({ provider, redirect_to: redirectTo });
  return `${SUPABASE_URL}/auth/v1/authorize?${params.toString()}`;
}

export type OAuthCallbackOutcome = "signed-in" | "error" | "none";

/**
 * Si la URL actual trae el fragmento que GoTrue añade al volver de un login
 * OAuth (`#access_token=...` o `#error=...`), guarda la sesión (o detecta el
 * fallo) y limpia el fragmento de la URL. Debe llamarse una sola vez al
 * montar la página de destino (`/auth`).
 */
export function consumeOAuthRedirect(): OAuthCallbackOutcome {
  const hash = window.location.hash;
  if (hash.length < 2) return "none";
  const params = new URLSearchParams(hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const hasOAuthParams = accessToken || params.has("error") || params.has("error_description");
  if (!hasOAuthParams) return "none";
  // Limpia el fragmento para no dejar tokens ni errores visibles en la URL/historial.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  if (!accessToken || !refreshToken) return "error";
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  writeStorage({ access_token: accessToken, refresh_token: refreshToken, expires_at: Date.now() + expiresIn * 1000 }, true);
  return "signed-in";
}

/* ─────────── Auth ─────────── */

export type AuthOutcome =
  | { ok: true }
  | { ok: false; reason: "invalid-credentials" | "rate-limited" | "network" | "email-unconfirmed" };

function mapAuthError(status: number, message?: string): AuthOutcome {
  if (status === 429) return { ok: false, reason: "rate-limited" };
  if (status === 0) return { ok: false, reason: "network" };
  // Defensa en profundidad: si alguna vez se reactiva la confirmación de correo
  // (mailer_autoconfirm = false en Supabase), un intento de login con cuenta sin
  // confirmar no debe reportarse como "contraseña incorrecta".
  if (status === 400 && /confirm/i.test(message ?? "")) return { ok: false, reason: "email-unconfirmed" };
  return { ok: false, reason: "invalid-credentials" };
}

export async function authSignIn(email: string, password: string, remember: boolean): Promise<AuthOutcome> {
  try {
    const j = await sb("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password, gotrue_meta_security: { captcha_token: undefined } } });
    const t: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 };
    writeStorage(t, remember);
    return { ok: true };
  } catch (e) {
    return e instanceof SupabaseError ? mapAuthError(e.status, e.message) : { ok: false, reason: "network" };
  }
}

export async function authSignUp(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthOutcome & { session: boolean }> {
  try {
    const j = await sb("/auth/v1/signup", {
      method: "POST",
      body: { email: input.email, password: input.password, data: { firstName: input.firstName, lastName: input.lastName } },
    });
    if (j?.access_token && j?.refresh_token) {
      // confirmación de correo desactivada: sesión inmediata
      writeStorage({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 }, true);
      return { ok: true, session: true };
    }
    return { ok: true, session: false }; // requiere confirmar correo
  } catch (e) {
    const base = e instanceof SupabaseError ? mapAuthError(e.status, e.message) : ({ ok: false, reason: "network" } as const);
    return { ...base, session: false };
  }
}

/**
 * Inicia sesión con el ID token que entrega Google Identity Services en el
 * propio navegador (sin redirección completa de página). GoTrue valida la
 * firma del token y el `nonce` directamente; no depende del Client Secret
 * configurado en el provider.
 */
export async function authSignInWithIdToken(provider: "google", idToken: string, nonce: string, remember: boolean): Promise<AuthOutcome> {
  try {
    const j = await sb("/auth/v1/token?grant_type=id_token", { method: "POST", body: { provider, id_token: idToken, nonce } });
    const t: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 };
    writeStorage(t, remember);
    return { ok: true };
  } catch (e) {
    return e instanceof SupabaseError ? mapAuthError(e.status, e.message) : { ok: false, reason: "network" };
  }
}

export async function authRecover(email: string): Promise<AuthOutcome> {
  try {
    await sb("/auth/v1/recover", { method: "POST", body: { email } });
    return { ok: true };
  } catch (e) {
    return e instanceof SupabaseError ? mapAuthError(e.status, e.message) : { ok: false, reason: "network" };
  }
}

export async function authSignOut(): Promise<void> {
  const t = await validTokens(true);
  if (t) {
    try { await sb("/auth/v1/logout", { method: "POST", token: t.access_token }); } catch { /* cerrar igual */ }
  }
  clearSession();
}

/**
 * Lee `?redirect=` de la URL actual (p. ej. cuando /tienda envía al checkout
 * a registrarse). Solo acepta rutas relativas internas para evitar open-redirect
 * y nunca reenvía de vuelta a /auth.
 */
export function getSafeRedirect(): string | null {
  try {
    const r = new URLSearchParams(window.location.search).get("redirect");
    if (!r) return null;
    if (!r.startsWith("/") || r.startsWith("//") || r.includes("://")) return null;
    if (r.startsWith("/auth")) return null;
    return r;
  } catch {
    return null;
  }
}

/** A dónde ir después de iniciar sesión, según la app actual (o el redirect pedido). */
export function postLoginPath(): string {
  return getSafeRedirect() ?? (window.location.pathname.startsWith("/admin") ? "/admin" : "/account");
}

/**
 * Dispara (sin esperar su resultado) el correo de bienvenida de Zuri tras un
 * login exitoso, por correo/contraseña o con Google. La función de
 * servidor (`welcome-email`) es idempotente: solo envía el correo la
 * PRIMERA vez que se llama para cada cuenta — en cada inicio de sesión
 * posterior no hace nada. Por eso es seguro llamarla en todo login, sin
 * tener que distinguir aquí si es la primera vez.
 *
 * Se llama "a fuego y olvido" (no se espera la respuesta) para no retrasar
 * la redirección al portal: si falla, el usuario ya entró a su cuenta sin
 * problema, solo no recibió el correo.
 */
export function triggerWelcomeEmail(accessToken: string) {
  try {
    void fetch(`${SUPABASE_URL}/functions/v1/welcome-email`, {
      method: "POST",
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    }).catch(() => { /* best-effort: no bloquea el login si falla */ });
  } catch { /* noop */ }
}

/** Consulta si la sesión actual pertenece a un administrador (profiles.is_admin). */
export async function isAdminUser(token?: string | null): Promise<boolean> {
  try {
    const t = token ?? (await getAccessToken());
    if (!t) return false;
    const rows = (await sb("/rest/v1/profiles?select=is_admin&limit=1", { token: t })) as { is_admin?: boolean }[];
    return Boolean(rows?.[0]?.is_admin);
  } catch {
    return false;
  }
}
