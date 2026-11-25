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
export type PendingTokens = Tokens;
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

/* ─────────── Auth ─────────── */

export type AuthOutcome = { ok: true } | { ok: false; reason: "invalid-credentials" | "rate-limited" | "network" };

function mapAuthError(status: number): AuthOutcome {
  if (status === 429) return { ok: false, reason: "rate-limited" };
  if (status === 0) return { ok: false, reason: "network" };
  return { ok: false, reason: "invalid-credentials" };
}

/**
 * Guarda en el navegador unos tokens ya obtenidos (login o registro). Se
 * expone por separado de `authSignIn`/`authSignUp` a propósito: entre
 * obtener los tokens y persistirlos, el llamador (authService) decide si la
 * cuenta ya está verificada (ver `isEmailVerified`) — si no lo está, NO se
 * debe llamar a esta función todavía.
 */
export function persistSession(tokens: Tokens, remember: boolean) {
  writeStorage(tokens, remember);
}

export async function authSignIn(email: string, password: string): Promise<AuthOutcome & { tokens?: Tokens }> {
  try {
    const j = await sb("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password, gotrue_meta_security: { captcha_token: undefined } } });
    const t: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 };
    return { ok: true, tokens: t };
  } catch (e) {
    return e instanceof SupabaseError ? mapAuthError(e.status) : { ok: false, reason: "network" };
  }
}

export async function authSignUp(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthOutcome & { session: boolean; tokens?: Tokens }> {
  try {
    const j = await sb("/auth/v1/signup", {
      method: "POST",
      body: { email: input.email, password: input.password, data: { firstName: input.firstName, lastName: input.lastName } },
    });
    if (j?.access_token && j?.refresh_token) {
      // confirmación de correo (de Supabase) desactivada: tokens inmediatos.
      // No se persisten aún — ver `persistSession` y el flujo de verificación
      // por código de 6 dígitos en authService.register.
      const t: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 };
      return { ok: true, session: true, tokens: t };
    }
    return { ok: true, session: false }; // requiere confirmar correo
  } catch (e) {
    const base = e instanceof SupabaseError ? mapAuthError(e.status) : ({ ok: false, reason: "network" } as const);
    return { ...base, session: false };
  }
}

export async function authRecover(email: string): Promise<AuthOutcome> {
  try {
    await sb("/auth/v1/recover", { method: "POST", body: { email } });
    return { ok: true };
  } catch (e) {
    return e instanceof SupabaseError ? mapAuthError(e.status) : { ok: false, reason: "network" };
  }
}

export async function authSignOut(): Promise<void> {
  const t = await validTokens(true);
  if (t) {
    try { await sb("/auth/v1/logout", { method: "POST", token: t.access_token }); } catch { /* cerrar igual */ }
  }
  clearSession();
}

/** A dónde ir después de iniciar sesión, según la app actual. */
export function postLoginPath(): string {
  return window.location.pathname.startsWith("/admin") ? "/admin" : "/account";
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

/* ─────────── Verificación de correo por código de 6 dígitos ─────────── */

/** Consulta si profiles.email_verified_at ya está marcado para esta sesión. */
export async function isEmailVerified(token: string): Promise<boolean> {
  try {
    const rows = (await sb("/rest/v1/profiles?select=email_verified_at&limit=1", { token })) as { email_verified_at?: string | null }[];
    return Boolean(rows?.[0]?.email_verified_at);
  } catch {
    return false;
  }
}

/** Pide a la función de servidor que genere y envíe un código nuevo de 6 dígitos. */
export async function sendVerificationCode(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-verification-code`, {
      method: "POST",
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type VerifyCodeReason = "invalid-code" | "expired" | "too-many-attempts" | "rate-limited" | "network";
export type VerifyCodeOutcome = { ok: true } | { ok: false; reason: VerifyCodeReason };

/** Confirma el código de 6 dígitos ingresado por el usuario. */
export async function verifyEmailCode(token: string, code: string): Promise<VerifyCodeOutcome> {
  try {
    const j = await sb("/functions/v1/verify-email-code", { method: "POST", token, body: { code } }) as { ok?: boolean; reason?: VerifyCodeReason };
    if (j?.ok) return { ok: true };
    return { ok: false, reason: j?.reason ?? "invalid-code" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
