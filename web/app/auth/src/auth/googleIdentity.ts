/**
 * Integración con Google Identity Services (GIS): obtiene el ID token de
 * Google directamente en el navegador, sin salir del sitio. Así la pantalla
 * de cuentas de Google dice "para continuar a infinihon.vercel.app" (el
 * dominio del propio sitio) en vez del dominio del proyecto de Supabase —
 * sin necesitar un dominio personalizado de pago para Supabase Auth.
 */

// Client ID de Google (dato público, va en cada URL de autorización de
// cualquier forma; coincide con el configurado en Supabase → Authentication
// → Providers → Google).
export const GOOGLE_CLIENT_ID = "338885834460-gg574u9skdcmv5fobiohtugonak9hm6s.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            nonce?: string;
            use_fedcm_for_prompt?: boolean;
          }): void;
          renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

/** Inyecta (una sola vez) el script de Google Identity Services. */
export function loadGoogleIdentityScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[data-gis="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gis-load-error")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.gis = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gis-load-error"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Genera el par nonce/hashedNonce que exige el flujo de ID token de Supabase:
 * el nonce "crudo" se envía a Supabase al validar la sesión, su hash SHA-256
 * (hex) se envía a Google para que quede embebido en el ID token firmado.
 */
export async function generateNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encoded = new TextEncoder().encode(nonce);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const hashedNonce = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { nonce, hashedNonce };
}
