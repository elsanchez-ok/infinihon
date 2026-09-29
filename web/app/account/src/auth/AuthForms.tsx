import { useState, type FormEvent } from "react";
import { authService, type AuthFailureReason } from "./authService";
import { AuthFeedback, AuthLink, FormField, PasswordField, PasswordStrength, ServiceNotice, SocialAuth, SubmitButton } from "./AuthFields";
import {
  emailError,
  hasErrors,
  validateLogin,
  validateRegister,
  type FieldErrors,
  type LoginValues,
  type RecoveryValues,
  type RegisterValues,
} from "./validation";

type Navigate = (to: string) => void;
type SubmitState = "idle" | "loading" | "success" | "error";

function useValidatedForm<T extends object>(initial: T, validator: (values: T) => FieldErrors<T>, prefix: string) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  function change<K extends keyof T>(key: K, value: T[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key] || errors[key] || (key === "password" && touched["confirmPassword" as keyof T])) {
      const nextErrors = validator(next);
      setErrors((current) => ({
        ...current,
        [key]: nextErrors[key],
        ...(key === "password" && "confirmPassword" in next
          ? { confirmPassword: nextErrors["confirmPassword" as keyof T] }
          : {}),
      }));
    }
  }

  function blur<K extends keyof T>(key: K) {
    setTouched((current) => ({ ...current, [key]: true }));
    setErrors((current) => ({ ...current, [key]: validator(values)[key] }));
  }

  function validateAll() {
    const nextErrors = validator(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const firstInvalid = Object.keys(nextErrors).find((key) => nextErrors[key as keyof T]);
      if (firstInvalid) requestAnimationFrame(() => document.getElementById(`${prefix}-${firstInvalid}`)?.focus());
      return false;
    }
    return true;
  }

  return { values, errors, change, blur, validateAll };
}

function failureText(reason: AuthFailureReason, action: "login" | "register" | "reset") {
  if (reason === "unavailable") {
    return "Este método de acceso aún no está disponible. Usa tu correo y contraseña.";
  }
  if (reason === "rate-limited") return "Hay demasiados intentos. Espera unos minutos antes de volver a probar.";
  if (reason === "network") return "No pudimos conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.";
  return action === "login"
    ? "Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo."
    : action === "register"
      ? "No pudimos crear la cuenta. Quizá ese correo ya esté registrado — inicia sesión o prueba otro."
      : "No pudimos completar la solicitud en este momento. Inténtalo más tarde.";
}

function FormHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="auth-form-heading">
      <div className="auth-form-eyebrow"><span className="auth-form-eyebrow-line" /> {step} <span className="auth-form-eyebrow-separator">/</span> PORTAL DE ACCESO</div>
      <h1 tabIndex={-1}>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function Completion({ title, description, navigate, destination = "/auth", action = "Volver a iniciar sesión" }: {
  title: string;
  description: string;
  navigate: Navigate;
  destination?: string;
  action?: string;
}) {
  return (
    <div className="auth-completion" role="status">
      <span className="auth-completion-mark" aria-hidden="true">✓</span>
      <h1 tabIndex={-1}>{title}</h1>
      <p>{description}</p>
      {destination === "/"
        ? <a href="/" className="auth-completion-action">{action} <span aria-hidden="true">↗</span></a>
        : <AuthLink href={destination} navigate={navigate} className="auth-completion-action">{action} <span aria-hidden="true">↗</span></AuthLink>}
    </div>
  );
}

export function LoginForm({ navigate }: { navigate: Navigate }) {
  const form = useValidatedForm<LoginValues>({ email: "", password: "", remember: false }, validateLogin, "login");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [providerLoading, setProviderLoading] = useState<"google" | "microsoft" | null>(null);

  async function signInWithProvider(provider: "google" | "microsoft") {
    setMessage("");
    setProviderLoading(provider);
    try {
      const result = await authService.oauth(provider);
      if (result.ok) setState("success");
      else { setState("error"); setMessage(failureText(result.reason, "login")); }
    } catch {
      setState("error");
      setMessage(failureText("network", "login"));
    } finally {
      setProviderLoading(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!form.validateAll()) return;
    setState("loading");
    try {
      const result = await authService.login({
        email: form.values.email.trim(),
        password: form.values.password,
        remember: form.values.remember,
      });
      if (result.ok) {
        setState("success");
        // sesión real: ve al portal correspondiente (cuenta o admin)
        if (result.redirect) window.setTimeout(() => window.location.assign(result.redirect!), 500);
      }
      else { setState("error"); setMessage(failureText(result.reason, "login")); }
    } catch {
      setState("error");
      setMessage(failureText("network", "login"));
    }
  }

  if (state === "success") return <Completion title="Sesión iniciada." description="Tu acceso se verificó correctamente." navigate={navigate} destination="/" action="Continuar al sitio" />;

  return (
    <div className="auth-view">
      <FormHeading step="01" title="Bienvenido de nuevo." description="Accede a tu cuenta de InfiniHon." />
      <SocialAuth onProvider={signInWithProvider} pendingProvider={providerLoading} />
      <ServiceNotice />
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormField
          id="login-email" label="Correo electrónico" type="email" inputMode="email" autoComplete="username"
          placeholder="tu@empresa.com" value={form.values.email} required disabled={state === "loading"}
          onChange={(event) => form.change("email", event.target.value)} onBlur={() => form.blur("email")}
          error={form.errors.email}
        />
        <PasswordField
          id="login-password" label="Contraseña" autoComplete="current-password"
          placeholder="Introduce tu contraseña" value={form.values.password} required disabled={state === "loading"}
          onChange={(event) => form.change("password", event.target.value)} onBlur={() => form.blur("password")}
          error={form.errors.password}
        />
        <div className="auth-form-options">
          <label className="auth-checkbox-label" htmlFor="login-remember">
            <input id="login-remember" type="checkbox" checked={form.values.remember} disabled={state === "loading"} onChange={(event) => form.change("remember", event.target.checked)} />
            <span>Recordarme</span>
          </label>
          <AuthLink href="/auth/forgot-password" navigate={navigate} className="auth-inline-link">¿Olvidaste tu contraseña?</AuthLink>
        </div>
        {message && <AuthFeedback type="error">{message}</AuthFeedback>}
        <SubmitButton pending={state === "loading"} pendingText="Iniciando sesión...">Iniciar sesión</SubmitButton>
      </form>
      <div className="auth-form-switch">¿No tienes una cuenta? <AuthLink href="/auth/register" navigate={navigate}>Crear cuenta <span aria-hidden="true">↗</span></AuthLink></div>
    </div>
  );
}

export function RegisterForm({ navigate }: { navigate: Navigate }) {
  const form = useValidatedForm<RegisterValues>({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "", termsAccepted: false,
  }, validateRegister, "register");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showTermsInfo, setShowTermsInfo] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!form.validateAll()) return;
    setState("loading");
    try {
      const result = await authService.register({
        firstName: form.values.firstName.trim(),
        lastName: form.values.lastName.trim(),
        email: form.values.email.trim(),
        password: form.values.password,
      });
      if (result.ok && "session" in result && result.session) {
        setState("success");
        window.setTimeout(() => window.location.assign("/account"), 500);
      }
      else if (result.ok) setState("success");
      else { setState("error"); setMessage(failureText(result.reason, "register")); }
    } catch {
      setState("error");
      setMessage(failureText("network", "register"));
    }
  }

  if (state === "success") return <Completion title="Cuenta creada correctamente." description="Tu cuenta ya está lista. Puedes iniciar sesión para continuar." navigate={navigate} />;

  return (
    <div className="auth-view">
      <FormHeading step="02" title="Crea tu cuenta." description="Empieza a formar parte del ecosistema InfiniHon." />
      <ServiceNotice />
      <form className="auth-form auth-form-register" onSubmit={submit} noValidate>
        <div className="auth-name-row">
          <FormField
            id="register-firstName" label="Nombre" type="text" autoComplete="given-name" placeholder="Tu nombre"
            value={form.values.firstName} required disabled={state === "loading"}
            onChange={(event) => form.change("firstName", event.target.value)} onBlur={() => form.blur("firstName")}
            error={form.errors.firstName}
          />
          <FormField
            id="register-lastName" label="Apellido" type="text" autoComplete="family-name" placeholder="Tu apellido"
            value={form.values.lastName} required disabled={state === "loading"}
            onChange={(event) => form.change("lastName", event.target.value)} onBlur={() => form.blur("lastName")}
            error={form.errors.lastName}
          />
        </div>
        <FormField
          id="register-email" label="Correo electrónico" type="email" inputMode="email" autoComplete="username" placeholder="tu@empresa.com"
          value={form.values.email} required disabled={state === "loading"}
          onChange={(event) => form.change("email", event.target.value)} onBlur={() => form.blur("email")}
          error={form.errors.email}
        />
        <div>
          <PasswordField
            id="register-password" label="Contraseña" autoComplete="new-password" placeholder="Crea una contraseña segura"
            value={form.values.password} required disabled={state === "loading"} describedBy="register-password-strength"
            onChange={(event) => form.change("password", event.target.value)}
            onFocus={() => setPasswordFocused(true)} onBlur={() => { form.blur("password"); setPasswordFocused(false); }}
            error={form.errors.password}
          />
          <PasswordStrength value={form.values.password} expanded={passwordFocused || Boolean(form.values.password)} />
        </div>
        <PasswordField
          id="register-confirmPassword" label="Confirmar contraseña" autoComplete="new-password" placeholder="Repite tu contraseña"
          value={form.values.confirmPassword} required disabled={state === "loading"}
          onChange={(event) => form.change("confirmPassword", event.target.value)} onBlur={() => form.blur("confirmPassword")}
          error={form.errors.confirmPassword}
        />
        <div className="auth-terms-block">
          <div className="auth-checkbox-row">
            <input
              id="register-termsAccepted" type="checkbox" checked={form.values.termsAccepted} disabled={state === "loading"}
              aria-invalid={Boolean(form.errors.termsAccepted)} aria-describedby={form.errors.termsAccepted ? "register-termsAccepted-error" : undefined}
              onChange={(event) => form.change("termsAccepted", event.target.checked)}
            />
            <label htmlFor="register-termsAccepted">Acepto los términos y condiciones.</label>
          </div>
          <p className="auth-terms-hint">Los términos se publicarán antes de activar el registro.</p>
          <button type="button" className="auth-terms-link" onClick={() => setShowTermsInfo((current) => !current)} aria-expanded={showTermsInfo}>Consultar estado de los términos ↗</button>
          {showTermsInfo && <p className="auth-terms-info" role="status">Al crear tu cuenta aceptas los términos publicados en infinihon.vercel.app/tienda/terminos y la política de privacidad.</p>}
          {form.errors.termsAccepted && <p className="auth-field-error" id="register-termsAccepted-error" role="alert"><span aria-hidden="true">!</span>{form.errors.termsAccepted}</p>}
        </div>
        {message && <AuthFeedback type="error">{message}</AuthFeedback>}
        <SubmitButton pending={state === "loading"} pendingText="Creando cuenta...">Crear cuenta</SubmitButton>
      </form>
      <div className="auth-form-switch">¿Ya tienes una cuenta? <AuthLink href="/auth" navigate={navigate}>Iniciar sesión <span aria-hidden="true">↗</span></AuthLink></div>
    </div>
  );
}

export function ForgotPasswordForm({ navigate }: { navigate: Navigate }) {
  const form = useValidatedForm<RecoveryValues>({ email: "" }, (values) => ({ email: emailError(values.email) }), "recovery");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!form.validateAll()) return;
    setState("loading");
    try {
      const result = await authService.resetPassword({ email: form.values.email.trim() });
      // A configured provider must never disclose account existence on this screen.
      if (result.ok || result.reason === "invalid-credentials") setState("success");
      else { setState("error"); setMessage(failureText(result.reason, "reset")); }
    } catch {
      setState("error");
      setMessage(failureText("network", "reset"));
    }
  }

  if (state === "success") {
    return <Completion title="Revisa tu correo." description="Si hay una cuenta asociada a ese correo, recibirás instrucciones para restablecer el acceso." navigate={navigate} />;
  }

  return (
    <div className="auth-view auth-view-recovery">
      <FormHeading step="03" title="Recupera tu acceso." description="Introduce el correo asociado a tu cuenta y te enviaremos instrucciones para restablecer tu contraseña." />
      <ServiceNotice />
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormField
          id="recovery-email" label="Correo electrónico" type="email" inputMode="email" autoComplete="username" placeholder="tu@empresa.com"
          value={form.values.email} required disabled={state === "loading"}
          onChange={(event) => form.change("email", event.target.value)} onBlur={() => form.blur("email")}
          error={form.errors.email}
        />
        {message && <AuthFeedback type="error">{message}</AuthFeedback>}
        <SubmitButton pending={state === "loading"} pendingText="Enviando instrucciones...">Enviar instrucciones</SubmitButton>
      </form>
      <div className="auth-form-switch auth-form-switch-recovery">
        <AuthLink href="/auth" navigate={navigate}>← Volver a iniciar sesión</AuthLink>
      </div>
    </div>
  );
}