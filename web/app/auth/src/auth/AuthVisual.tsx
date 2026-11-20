import type { ReactNode } from "react";

export function AuthMark({ compact = false }: { compact?: boolean }) {
  return (
    <a className="auth-mark" href="/" aria-label="InfiniHon Corp. — volver al sitio">
      <img src="/assets/infinihon.png" alt="InfiniHon Corp." className="auth-mark-symbol" />
      {!compact && <span className="auth-mark-word">Infrastructure · Innovation · Honduras</span>}
    </a>
  );
}

/* Panel izquierdo de /auth: antes tenía un diagrama técnico + copy sobre el
   ecosistema InfiniHon Corp.; el usuario pidió quitar todo ese contenido y
   dejar únicamente una imagen. Hay una imagen distinta para cada tema (el
   tema activo vive en <html data-theme="dark|light">); el CSS decide cuál
   de las dos se muestra, así no hay parpadeo al alternar tema. */
export function AuthBrandPanel({ children }: { children?: ReactNode }) {
  return (
    <aside className="auth-brand-panel" aria-label="Identidad InfiniHon Corp.">
      <img src="/assets/auth-brand-light.webp" alt="" aria-hidden="true" className="auth-brand-image auth-brand-image-light" />
      <img src="/assets/auth-brand-dark.webp" alt="" aria-hidden="true" className="auth-brand-image auth-brand-image-dark" />
      {children}
    </aside>
  );
}