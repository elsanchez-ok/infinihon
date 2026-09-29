import { useState, type InputHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { authCapabilities } from "./authService";
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

export function SocialAuth({ onProvider, pendingProvider }: {
  onProvider: (provider: "google" | "microsoft") => void;
  pendingProvider: "google" | "microsoft" | null;
}) {
  return (
    <div className="auth-social-area">
      <div className="auth-social-grid">
        <button className="auth-social-button" type="button" disabled={!authCapabilities.google || pendingProvider !== null} aria-busy={pendingProvider === "google"} onClick={() => onProvider("google")} title={!authCapabilities.google ? "Integración con Google pendiente" : undefined} aria-label={!authCapabilities.google ? "Continuar con Google, próximamente" : "Continuar con Google"}>
          <span className="auth-social-monogram" aria-hidden="true">G</span>
          <span>{pendingProvider === "google" ? "Conectando..." : "Continuar con Google"}</span>
        </button>
        <button className="auth-social-button" type="button" disabled={!authCapabilities.microsoft || pendingProvider !== null} aria-busy={pendingProvider === "microsoft"} onClick={() => onProvider("microsoft")} title={!authCapabilities.microsoft ? "Integración con Microsoft pendiente" : undefined} aria-label={!authCapabilities.microsoft ? "Continuar con Microsoft, próximamente" : "Continuar con Microsoft"}>
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