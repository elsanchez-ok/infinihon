import { authSignIn, authSignUp, authRecover, authSignOut, authSignInWithIdToken, isAdminUser, postLoginPath, oauthAuthorizeUrl } from "../lib/supabase";

export type AuthFailureReason =
  | "unavailable"
  | "invalid-credentials"
  | "rate-limited"
  | "network"
  | "email-unconfirmed";

export type AuthResult =
  | { ok: true; session?: boolean; redirect?: string }
  | { ok: false; reason: AuthFailureReason };

export interface AuthService {
  login(input: { email: string; password: string; remember: boolean }): Promise<AuthResult>;
  register(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthResult>;
  resetPassword(input: { email: string }): Promise<AuthResult>;
  /** Microsoft (pendiente de credenciales): redirección completa vía GoTrue. */
  oauth(provider: "microsoft"): Promise<AuthResult>;
  /** Google: ID token obtenido en el propio navegador con Google Identity
   * Services (ver googleIdentity.ts) — sin redirección, sin depender del
   * Client Secret del provider. */
  oauthIdToken(provider: "google", idToken: string, nonce: string): Promise<AuthResult>;
  logout(): Promise<AuthResult>;
}

/** Autenticación real contra Supabase Auth (GoTrue). */
export const authService: AuthService = {
  login: async ({ email, password, remember }) => {
    const r = await authSignIn(email, password, remember);
    if (!r.ok) return r;
    // Los administradores entran directo al centro de control.
    const admin = await isAdminUser();
    return { ok: true, redirect: admin ? "/admin" : postLoginPath() };
  },
  register: async (input) => {
    const r = await authSignUp(input);
    return r.ok ? { ok: true, session: r.session } : { ok: false, reason: r.reason };
  },
  resetPassword: async ({ email }) => {
    const r = await authRecover(email);
    return r.ok ? { ok: true } : r;
  },
  oauth: async (provider) => {
    // Flujo de redirección completa: GoTrue entrega el control al proveedor
    // (Microsoft) y luego vuelve a esta misma página con la sesión en el
    // fragmento de la URL (ver consumeOAuthRedirect en AuthApp). El
    // navegador abandona la SPA, así que esta promesa no se resuelve en el
    // caso feliz; solo existe para cumplir el tipo de retorno.
    const redirectTo = `${window.location.origin}/auth${window.location.search}`;
    window.location.assign(oauthAuthorizeUrl(provider === "microsoft" ? "azure" : "google", redirectTo));
    return new Promise<AuthResult>(() => {});
  },
  oauthIdToken: async (provider, idToken, nonce) => {
    const r = await authSignInWithIdToken(provider, idToken, nonce, true);
    if (!r.ok) return r;
    const admin = await isAdminUser();
    return { ok: true, redirect: admin ? "/admin" : postLoginPath() };
  },
  logout: async () => {
    await authSignOut();
    return { ok: true };
  },
};

export const authCapabilities = {
  emailPassword: true,
  // Google ya está configurado en Supabase (Authentication → Providers) con
  // client_id/secret reales. Microsoft (Azure) aún no tiene credenciales.
  google: true,
  microsoft: false,
  legalTermsPublished: false,
} as const;
