import { authUrl } from "../../auth/session";

const CHECKOUT_REDIRECT = "/tienda/checkout";

function GateCopy() {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt">Un paso más · seguridad</div>
      <h2 className="mt-4 text-2xl font-extrabold uppercase leading-tight tracking-tight text-snow">
        Inicia sesión o crea tu cuenta para continuar.
      </h2>
      <p className="mt-3 text-[14px] leading-relaxed text-steel">
        Por tu seguridad y para poder darle seguimiento a tu pedido, necesitamos que tengas una cuenta en
        InfiniHon Corp. antes de pasar al checkout. Es rápido: solo toma un minuto.
      </p>
    </>
  );
}

function GateActions({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? "mt-6 flex flex-col gap-3 sm:flex-row" : "mt-7 flex flex-col gap-3 sm:flex-row"}>
      <a
        href={authUrl("register", CHECKOUT_REDIRECT)}
        className="flex-1 bg-tech px-6 py-3.5 text-center text-sm font-semibold text-snow transition-colors hover:bg-[#1a75ff]"
      >
        Crear cuenta <span className="font-mono">→</span>
      </a>
      <a
        href={authUrl("login", CHECKOUT_REDIRECT)}
        className="flex-1 border border-white/15 px-6 py-3.5 text-center text-sm font-semibold text-snow hover:border-volt/60"
      >
        Ya tengo cuenta · Iniciar sesión
      </a>
    </div>
  );
}

/** Modal que aparece al presionar "Continuar compra" sin sesión iniciada. */
export function AuthGateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="auth-gate-title">
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[460px] border-t border-white/10 bg-ink p-7 sm:border sm:border-white/[0.09] md:p-8">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 font-mono text-sm text-steel hover:text-snow"
        >
          ✕
        </button>
        <div id="auth-gate-title">
          <GateCopy />
        </div>
        <GateActions compact />
        <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-steel/60">
          Registro gratuito · vuelves directo a tu checkout al terminar
        </p>
      </div>
    </div>
  );
}

/** Panel de bloqueo mostrado cuando se entra a /checkout directamente sin sesión. */
export function AuthGateNotice() {
  return (
    <div className="border border-tech/40 bg-hn/10 p-6 md:p-8">
      <GateCopy />
      <GateActions />
    </div>
  );
}
