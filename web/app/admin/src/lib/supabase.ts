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

/* ─────────── Auth ─────────── */

export type AuthOutcome = { ok: true } | { ok: false; reason: "invalid-credentials" | "rate-limited" | "network" };

function mapAuthError(status: number): AuthOutcome {
  if (status === 429) return { ok: false, reason: "rate-limited" };
  if (status === 0) return { ok: false, reason: "network" };
  return { ok: false, reason: "invalid-credentials" };
}

export async function authSignIn(email: string, password: string, remember: boolean): Promise<AuthOutcome> {
  try {
    const j = await sb("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password, gotrue_meta_security: { captcha_token: undefined } } });
    const t: Tokens = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000 };
    writeStorage(t, remember);
    return { ok: true };
  } catch (e) {
    return e instanceof SupabaseError ? mapAuthError(e.status) : { ok: false, reason: "network" };
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
  // Always redirect to /admin for the admin app
  return "/admin";
}
