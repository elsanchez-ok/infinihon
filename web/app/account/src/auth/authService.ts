import { authSignIn, authSignUp, authRecover, authSignOut, postLoginPath } from "../lib/supabase";

export type AuthFailureReason = "unavailable" | "invalid-credentials" | "rate-limited" | "network";

export type AuthResult =
  | { ok: true; session?: boolean; redirect?: string }
  | { ok: false; reason: AuthFailureReason };

export interface AuthService {
  login(input: { email: string; password: string; remember: boolean }): Promise<AuthResult>;
  register(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthResult>;
  resetPassword(input: { email: string }): Promise<AuthResult>;
  oauth(provider: "google" | "microsoft"): Promise<AuthResult>;
  logout(): Promise<AuthResult>;
}

/** Autenticación real contra Supabase Auth (GoTrue). */
export const authService: AuthService = {
  login: async ({ email, password, remember }) => {
    const r = await authSignIn(email, password, remember);
    return r.ok ? { ok: true, redirect: postLoginPath() } : r;
  },
  register: async (input) => {
    const r = await authSignUp(input);
    return r.ok ? { ok: true, session: r.session } : { ok: false, reason: r.reason };
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
};

export const authCapabilities = {
  emailPassword: true,
  google: false,
  microsoft: false,
  legalTermsPublished: false,
} as const;
