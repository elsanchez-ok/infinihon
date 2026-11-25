import {
  authSignIn, authSignUp, authRecover, authSignOut, authSignInWithIdToken, isAdminUser, postLoginPath, oauthAuthorizeUrl,
  isEmailVerified, sendVerificationCode, verifyEmailCode, persistSession, type PendingTokens,
} from "../lib/supabase";

export type AuthFailureReason =
  | "unavailable"
  | "invalid-credentials"
  | "rate-limited"
  | "network"
  | "email-unconfirmed";

export type { PendingTokens };

export type AuthResult =
  | { ok: true; session?: boolean; redirect?: string }
  | { ok: true; needsVerification: true; pendingTokens: PendingTokens; remember: boolean }
  | { ok: false; reason: AuthFailureReason };

export type VerifyResult =
  | { ok: true; redirect: string }
  | { ok: false; reason: "invalid-code" | "expired" | "too-many-attempts" | "rate-limited" | "network" };

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
  /** Confirma el código de 6 dígitos y, si es correcto, recién ahí persiste
   * la sesión que login/register dejaron pendiente. */
  confirmVerification(tokens: PendingTokens, code: string, remember: boolean): Promise<VerifyResult>;
  /** Reenvía el código de 6 dígitos (con límite del lado del servidor). */
  resendVerification(tokens: PendingTokens): Promise<boolean>;
}

/** Autenticación real contra Supabase Auth (GoTrue). */
export const authService: AuthService = {
  login: async ({ email, password, remember }) => {
    const r = await authSignIn(email, password);
    if (!r.ok) return r;
    const tokens = r.tokens!;
    const verified = await isEmailVerified(tokens.access_token);
    if (!verified) {
      void sendVerificationCode(tokens.access_token);
      return { ok: true, needsVerification: true, pendingTokens: tokens, remember };
    }
    persistSession(tokens, remember);
    // Los administradores entran directo al centro de control.
    const admin = await isAdminUser(tokens.access_token);
    return { ok: true, redirect: admin ? "/admin" : postLoginPath() };
  },
  register: async (input) => {
    const r = await authSignUp(input);
    if (!r.ok) return { ok: false, reason: r.reason };
    if (!r.session || !r.tokens) return { ok: true, session: false }; // requiere confirmar correo (Supabase)
    const tokens = r.tokens;
    const verified = await isEmailVerified(tokens.access_token);
    if (!verified) {
      void sendVerificationCode(tokens.access_token);
      return { ok: true, needsVerification: true, pendingTokens: tokens, remember: true };
    }
    // Defensivo: no debería pasar para un alta nueva por correo/contraseña,
    // pero si el perfil ya viniera verificado, se entra directo.
    persistSession(tokens, true);
    return { ok: true, session: true };
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
    // Las cuentas de Google ya probaron su correo ante Google: no pasan por
    // el código de 6 dígitos (ver backfill/trigger en la migración de
    // email_verified_at). authSignInWithIdToken persiste de inmediato.
    const r = await authSignInWithIdToken(provider, idToken, nonce, true);
    if (!r.ok) return r;
    const admin = await isAdminUser();
    return { ok: true, redirect: admin ? "/admin" : postLoginPath() };
  },
  logout: async () => {
    await authSignOut();
    return { ok: true };
  },
  confirmVerification: async (tokens, code, remember) => {
    const r = await verifyEmailCode(tokens.access_token, code);
    if (!r.ok) return r;
    persistSession(tokens, remember);
    const admin = await isAdminUser(tokens.access_token);
    return { ok: true, redirect: admin ? "/admin" : postLoginPath() };
  },
  resendVerification: async (tokens) => sendVerificationCode(tokens.access_token),
};

export const authCapabilities = {
  emailPassword: true,
  // Google ya está configurado en Supabase (Authentication → Providers) con
  // client_id/secret reales. Microsoft (Azure) aún no tiene credenciales.
  google: true,
  microsoft: false,
  legalTermsPublished: false,
} as const;
