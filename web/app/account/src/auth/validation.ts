export type LoginValues = { email: string; password: string; remember: boolean };
export type RegisterValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};
export type RecoveryValues = { email: string };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(email: string): string | undefined {
  if (!email.trim()) return "Introduce tu correo electrónico.";
  if (!emailPattern.test(email.trim())) return "Introduce un correo electrónico válido.";
  return undefined;
}

export const passwordRequirements = [
  { id: "length", label: "12 caracteres", check: (value: string) => value.length >= 12 },
  { id: "lower", label: "Una minúscula", check: (value: string) => /[a-z]/.test(value) },
  { id: "upper", label: "Una mayúscula", check: (value: string) => /[A-Z]/.test(value) },
  { id: "number", label: "Un número", check: (value: string) => /\d/.test(value) },
  { id: "symbol", label: "Un símbolo", check: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export function passwordScore(value: string): number {
  return passwordRequirements.filter((requirement) => requirement.check(value)).length;
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  return {
    email: emailError(values.email),
    password: values.password ? undefined : "Introduce tu contraseña.",
  };
}

export function validateRegister(values: RegisterValues): FieldErrors<RegisterValues> {
  return {
    firstName: values.firstName.trim() ? undefined : "Introduce tu nombre.",
    lastName: values.lastName.trim() ? undefined : "Introduce tu apellido.",
    email: emailError(values.email),
    password: passwordScore(values.password) === passwordRequirements.length
      ? undefined
      : "La contraseña debe cumplir los cinco requisitos de seguridad.",
    confirmPassword: !values.confirmPassword
      ? "Confirma tu contraseña."
      : values.confirmPassword !== values.password
        ? "Las contraseñas no coinciden."
        : undefined,
    termsAccepted: values.termsAccepted ? undefined : "Debes aceptar los términos y condiciones.",
  };
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}