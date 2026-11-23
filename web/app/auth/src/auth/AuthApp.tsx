import { useEffect, useRef, useState } from "react";
import { AuthBrandPanel, AuthMark } from "./AuthVisual";
import { ThemeToggle } from "../components/ui";
import { ForgotPasswordForm, LoginForm, RegisterForm } from "./AuthForms";
import { consumeOAuthRedirect, isAdminUser, postLoginPath } from "../lib/supabase";
import "./auth.css";

type AuthMode = "login" | "register" | "recovery";

function modeFromPath(pathname: string): AuthMode {
  if (pathname.replace(/\/$/, "") === "/auth/register") return "register";
  if (pathname.replace(/\/$/, "") === "/auth/forgot-password") return "recovery";
  return "login";
}

/** "checking"/"redirecting" mientras se procesa una vuelta de Microsoft (redirección completa). */
type OAuthStatus = "idle" | "checking" | "redirecting";

/** Aviso flotante sobre el escenario (fuera de la tarjeta de cristal) para
 * fallos de login social, tanto el de Google (ID token, sin redirección)
 * como el de Microsoft (redirección completa, ver consumeOAuthRedirect). */
function SocialAuthErrorToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="auth-toast auth-toast-error" role="alert">
      <span className="auth-toast-icon" aria-hidden="true">!</span>
      <p>No pudimos completar el acceso con ese proveedor. Inténtalo de nuevo o usa tu correo y contraseña.</p>
      <button type="button" className="auth-toast-dismiss" onClick={onDismiss} aria-label="Cerrar aviso">×</button>
    </div>
  );
}

export default function AuthApp({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  const mode = modeFromPath(pathname);
  const lastMode = useRef<AuthMode>(mode);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>(
    () => (window.location.hash.length > 1 ? "checking" : "idle"),
  );
  const [socialAuthError, setSocialAuthError] = useState(false);

  useEffect(() => {
    if (oauthStatus !== "checking") return;
    let cancelled = false;
    (async () => {
      const outcome = consumeOAuthRedirect();
      if (outcome === "none") { if (!cancelled) setOauthStatus("idle"); return; }
      if (outcome === "error") { if (!cancelled) { setOauthStatus("idle"); setSocialAuthError(true); } return; }
      if (!cancelled) setOauthStatus("redirecting");
      const admin = await isAdminUser();
      window.location.assign(admin ? "/admin" : postLoginPath());
    })();
    return () => { cancelled = true; };
  }, [oauthStatus]);

  useEffect(() => {
    const pageTitles: Record<AuthMode, string> = {
      login: "Acceso | InfiniHon Corp.",
      register: "Crear cuenta | InfiniHon Corp.",
      recovery: "Recuperar acceso | InfiniHon Corp.",
    };
    document.title = pageTitles[mode];
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Portal de acceso de InfiniHon Corp. Inicia sesión, crea tu cuenta o recupera el acceso al ecosistema tecnológico.",
    );
    if (lastMode.current !== mode) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".auth-view-transition h1")?.focus());
      lastMode.current = mode;
    }
    return () => {
      document.title = "InfiniHon Corp. Store — Tecnología e infraestructura";
      document.querySelector('meta[name="description"]')?.setAttribute(
        "content",
        "InfiniHon Corp. Store — tecnología, infraestructura y servicios para construir lo que sigue.",
      );
    };
  }, [mode]);

  return (
    <div className="auth-page">
      <a className="auth-skip" href="#auth-form">Saltar al formulario</a>

      {/* Escenario de pantalla completa: la imagen de marca cubre todo el
          fondo y la tarjeta de cristal flota centrada sobre ella, con
          espacio holgado alrededor en cualquier tamaño de pantalla. */}
      <main className="auth-stage">
        <AuthBrandPanel />

        {/* Aviso de fallo de login social: vive sobre el escenario, fuera de
            la tarjeta, para no interferir con el formulario. */}
        {socialAuthError && <SocialAuthErrorToast onDismiss={() => setSocialAuthError(false)} />}

        <section className="auth-panel" id="auth-form" aria-label="Acceso a InfiniHon Corp.">
          <div className="auth-panel-inner">
            <div className="auth-panel-topbar">
              <AuthMark compact />
              <div className="auth-panel-topbar-actions">
                <ThemeToggle />
                <a className="auth-exit-link" href="/">Volver al sitio <span aria-hidden="true">↗</span></a>
              </div>
            </div>

            {(oauthStatus === "checking" || oauthStatus === "redirecting") ? (
              <div className="auth-oauth-loading" role="status" aria-live="polite">
                <span className="auth-oauth-spinner" aria-hidden="true" />
                <p>Conectando tu cuenta...</p>
              </div>
            ) : (
              <div key={mode} className="auth-view-transition">
                {mode === "login" && <LoginForm navigate={navigate} onSocialAuthError={() => setSocialAuthError(true)} />}
                {mode === "register" && <RegisterForm navigate={navigate} />}
                {mode === "recovery" && <ForgotPasswordForm navigate={navigate} />}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
