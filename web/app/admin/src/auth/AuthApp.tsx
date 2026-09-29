import { useEffect, useRef } from "react";
import { AuthBrandPanel, AuthMark } from "./AuthVisual";
import { ForgotPasswordForm, LoginForm, RegisterForm } from "./AuthForms";
import "./auth.css";

type AuthMode = "login" | "register" | "recovery";

function modeFromPath(pathname: string): AuthMode {
  if (pathname.replace(/\/$/, "") === "/auth/register") return "register";
  if (pathname.replace(/\/$/, "") === "/auth/forgot-password") return "recovery";
  return "login";
}

export default function AuthApp({ pathname, navigate }: { pathname: string; navigate: (to: string) => void }) {
  const mode = modeFromPath(pathname);
  const lastMode = useRef<AuthMode>(mode);

  useEffect(() => {
    const pageTitles: Record<AuthMode, string> = {
      login: "Acceso | INFINIHON",
      register: "Crear cuenta | INFINIHON",
      recovery: "Recuperar acceso | INFINIHON",
    };
    document.title = pageTitles[mode];
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Portal de acceso de INFINIHON. Inicia sesión, crea tu cuenta o recupera el acceso al ecosistema tecnológico.",
    );
    if (lastMode.current !== mode) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".auth-view-transition h1")?.focus());
      lastMode.current = mode;
    }
    return () => {
      document.title = "INFINIHON Store — Tecnología e infraestructura";
      document.querySelector('meta[name="description"]')?.setAttribute(
        "content",
        "INFINIHON Store — tecnología, infraestructura y servicios para construir lo que sigue.",
      );
    };
  }, [mode]);

  return (
    <div className="auth-page">
      <a className="auth-skip" href="#auth-form">Saltar al formulario</a>

      <header className="auth-header">
        <AuthMark compact />
        <a className="auth-exit-link" href="/">Volver al sitio <span aria-hidden="true">↗</span></a>
      </header>

      <main className="auth-shell">
        <AuthBrandPanel />
        <section className="auth-panel" id="auth-form" aria-label="Acceso a INFINIHON">
          <div className="auth-panel-inner">
            <div className="auth-panel-brand">
              <AuthMark />
              <span className="auth-panel-brand-index">/ CUENTA</span>
            </div>

            <div key={mode} className="auth-view-transition">
              {mode === "login" && <LoginForm navigate={navigate} />}
              {mode === "register" && <RegisterForm navigate={navigate} />}
              {mode === "recovery" && <ForgotPasswordForm navigate={navigate} />}
            </div>

            <div className="auth-panel-footnote">
              <span className="auth-footnote-dash" />
              Un espacio para gestionar tu acceso al ecosistema INFINIHON.
            </div>
          </div>
          <footer className="auth-panel-footer">
            <span>© {new Date().getFullYear()} INFINIHON</span>
            <span>PORTAL DIGITAL <span className="auth-footer-separator">/</span> HONDURAS</span>
          </footer>
        </section>
      </main>
    </div>
  );
}