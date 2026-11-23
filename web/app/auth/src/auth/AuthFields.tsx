import { useEffect, useRef, useState, type InputHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { authCapabilities } from "./authService";
import { GOOGLE_CLIENT_ID, generateNonce, loadGoogleIdentityScript } from "./googleIdentity";
import { passwordRequirements, passwordScore } from "./validation";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  helper?: string;
  describedBy?: string;
  trailing?: ReactNode;
};

export function FormField({ id, label, error, helper, describedBy, trailing, ...inputProps }: FieldProps) {
  const descriptionIds = [helper && `${id}-hint`, describedBy, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field-label">{label}</label>
      <div className={`auth-input-shell${error ? " auth-input-error" : ""}`}>
        <input
          {...inputProps}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionIds}
          className="auth-input"
        />
        {trailing}
      </div>
      {helper && <p className="auth-field-helper" id={`${id}-hint`}>{helper}</p>}
      {error && <p className="auth-field-error" id={`${id}-error`} role="alert"><span aria-hidden="true">!</span>{error}</p>}
    </div>
  );
}

export function PasswordField({
  id, label, error, describedBy, ...inputProps
}: Omit<FieldProps, "trailing" | "helper" | "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField
      {...inputProps}
      id={id}
      label={label}
      error={error}
      describedBy={describedBy}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="auth-reveal-password"
          aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          aria-pressed={visible}
          disabled={inputProps.disabled}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
}

export function PasswordStrength({ value, expanded }: { value: string; expanded: boolean }) {
  const score = passwordScore(value);
  const level = !value ? "Sin evaluar" : score <= 2 ? "Débil" : score < 5 ? "Media" : "Fuerte";
  const steps = !value ? 0 : score <= 2 ? 1 : score < 5 ? 2 : 3;
  return (
    <div className="auth-strength" id="register-password-strength">
      <div className="auth-strength-top">
        <span>Seguridad de la contraseña</span>
        <span aria-live="polite">{level}</span>
      </div>
      <div className="auth-strength-track" aria-hidden="true">
        {[0, 1, 2].map((index) => <span key={index} className={index < steps ? "auth-strength-active" : ""} />)}
      </div>
      {expanded && (
        <ul className="auth-requirements" aria-label="Requisitos de contraseña">
          {passwordRequirements.map((requirement) => {
            const met = requirement.check(value);
            return (
              <li key={requirement.id} className={met ? "auth-requirement-met" : ""}>
                <span aria-hidden="true">{met ? "✓" : "○"}</span>{requirement.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Celda del botón de Google: usa el widget real de Google Identity Services
 * (GIS), renderizado en el propio navegador. Así la pantalla de Google dice
 * "para continuar a <tu dominio>" en vez del dominio del proyecto de
 * Supabase, y el inicio de sesión no depende del Client Secret del provider.
 */
function GoogleButtonCell({ onCredential, pending }: {
  onCredential: (idToken: string, nonce: string) => void;
  pending: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;
    let ready = false;
    let resizeObserver: ResizeObserver | null = null;
    let frame = 0;

    // El botón oficial de Google se dibuja dentro de un iframe con un ancho
    // fijo en píxeles (no admite "100%"): si se le pasa un número que no
    // quepa en su celda, se desborda de la tarjeta. Por eso medimos el
    // espacio real disponible y lo volvemos a pintar cada vez que cambia
    // (al redimensionar la ventana, al rotar el teléfono, etc.).
    function paintButton() {
      if (cancelled || !containerRef.current || !window.google) return;
      const available = containerRef.current.getBoundingClientRect().width;
      const width = Math.max(200, Math.min(400, Math.floor(available) || 260));
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width,
      });
    }

    (async () => {
      try {
        await loadGoogleIdentityScript();
        const { nonce, hashedNonce } = await generateNonce();
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredentialRef.current(response.credential, nonce),
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
        });
        paintButton();
        ready = true;
        if (!cancelled) setStatus("ready");
        if (containerRef.current && "ResizeObserver" in window) {
          resizeObserver = new ResizeObserver(() => {
            if (!ready) return;
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(paintButton);
          });
          resizeObserver.observe(containerRef.current);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; window.cancelAnimationFrame(frame); resizeObserver?.disconnect(); };
  }, []);

  return (
    <div className="auth-google-cell">
      <div ref={containerRef} className="auth-google-button" hidden={status !== "ready" || pending} />
      {(status !== "ready" || pending) && (
        <button className="auth-social-button" type="button" disabled aria-busy={pending}>
          <span className="auth-social-monogram" aria-hidden="true">G</span>
          <span>{pending ? "Conectando..." : status === "error" ? "Google no disponible" : "Cargando Google..."}</span>
        </button>
      )}
    </div>
  );
}

export function SocialAuth({ onMicrosoft, onGoogleCredential, pendingProvider }: {
  onMicrosoft: () => void;
  onGoogleCredential: (idToken: string, nonce: string) => void;
  pendingProvider: "google" | "microsoft" | null;
}) {
  return (
    <div className="auth-social-area">
      <div className="auth-social-grid">
        {authCapabilities.google ? (
          <GoogleButtonCell onCredential={onGoogleCredential} pending={pendingProvider === "google"} />
        ) : (
          <button className="auth-social-button" type="button" disabled title="Integración con Google pendiente" aria-label="Continuar con Google, próximamente">
            <span className="auth-social-monogram" aria-hidden="true">G</span>
            <span>Continuar con Google</span>
          </button>
        )}
        <button className="auth-social-button" type="button" disabled={!authCapabilities.microsoft || pendingProvider !== null} aria-busy={pendingProvider === "microsoft"} onClick={onMicrosoft} title={!authCapabilities.microsoft ? "Integración con Microsoft pendiente" : undefined} aria-label={!authCapabilities.microsoft ? "Continuar con Microsoft, próximamente" : "Continuar con Microsoft"}>
          <span className="auth-social-monogram" aria-hidden="true">M</span>
          <span>{pendingProvider === "microsoft" ? "Conectando..." : "Continuar con Microsoft"}</span>
        </button>
      </div>
      {!authCapabilities.google && !authCapabilities.microsoft && <p className="auth-social-note">Google y Microsoft <span>·</span> Próximamente</p>}
      <div className="auth-divider"><span>o continúa con tu correo</span></div>
    </div>
  );
}

export function ServiceNotice() {
  if (authCapabilities.emailPassword) return null;
  return (
    <div className="auth-service-notice" role="note">
      <span className="auth-service-notice-icon" aria-hidden="true">i</span>
      <p><strong>Portal en preparación.</strong> Esta vista no envía ni guarda credenciales.</p>
    </div>
  );
}

export function AuthFeedback({ type, children }: { type: "error" | "success"; children: ReactNode }) {
  return (
    <div className={`auth-feedback auth-feedback-${type}`} role={type === "error" ? "alert" : "status"}>
      <span className="auth-feedback-icon" aria-hidden="true">{type === "error" ? "!" : "✓"}</span>
      <p>{children}</p>
    </div>
  );
}

export function SubmitButton({ children, pending, pendingText }: { children: ReactNode; pending: boolean; pendingText: string }) {
  return (
    <button className="auth-submit" type="submit" disabled={pending} aria-busy={pending}>
      {pending && <span className="auth-submit-spinner" aria-hidden="true" />}
      <span aria-live="polite">{pending ? pendingText : children}</span>
      {!pending && <span className="auth-submit-arrow" aria-hidden="true">↗</span>}
    </button>
  );
}

export function AuthLink({ href, navigate, children, className = "" }: {
  href: string;
  navigate: (to: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href);
  };
  return <a className={className} href={href} onClick={handleClick}>{children}</a>;
}