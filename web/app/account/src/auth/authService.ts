import {
  authSignIn, authSignUp, authRecover, authSignOut, isAdminUser, postLoginPath,
  isEmailVerified, sendVerificationCode, verifyEmailCode, persistSession, type PendingTokens,
} from "../lib/supabase";

export type AuthFailureReason = "unavailable" | "invalid-credentials" | "rate-limited" | "network";

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
  oauth(provider: "google" | "microsoft"): Promise<AuthResult>;
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
    persistSession(tokens, true);
    return { ok: true, session: true };
  },
  resetPassword: async ({ email }) => {
    const r = await authRecover(email);
    return r.ok ? { ok: true } : r;
  },
  oauth: async () => ({ ok: false, reason: "unavailable" }),
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
  google: false,
  microsoft: false,
  legalTermsPublished: false,
} as const;
