import { useState, type FormEvent } from "react";
import { Corners } from "./ui";
import { cn } from "../utils/cn";

export const CONTACT_EMAIL = "infinihon.hn@gmail.com";

const CONTACT_ENDPOINT = "https://jcizfmpagprxyhvzuymx.supabase.co/functions/v1/contact-form";

const interests = [
  "Redes / MikroTik",
  "Cloud (AWS · Azure · GCP)",
  "DevOps / Kubernetes",
  "Seguridad / VPN",
  "Monitorización",
  "Desarrollo de software",
  "Soporte tecnológico",
  "Aún no lo sé",
];

const input =
  "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-snow placeholder:text-steel/50 focus:border-volt focus:outline-none focus:ring-0 transition-colors";

type SendState = "idle" | "loading" | "sent" | "error";

export default function ContactForm({ className }: { className?: string }) {
  const [state, setState] = useState<SendState>("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setState("loading");
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          company: f.get("company"),
          email: f.get("email"),
          interest: f.get("interest"),
          message: f.get("message"),
          // Honeypot: campo oculto para bots, invisible para personas (ver <input name="website">).
          website: f.get("website"),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setState("sent");
        form.reset();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const sent = state === "sent";

  return (
    <div
      id="formulario"
      className={cn(
        "relative scroll-mt-28 border border-white/[0.08] bg-obsidian/70 p-6 backdrop-blur-md md:p-10",
        className
      )}
    >
      <Corners />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
        <span>Brief de proyecto</span>
        <span>Respuesta directa del equipo técnico</span>
      </div>
      {sent ? (
        <div className="py-10 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-volt">Mensaje enviado</div>
          <p className="mt-4 text-2xl font-bold">Recibimos tu solicitud.</p>
          <p className="mt-2 text-steel">
            Te responderemos pronto. Si prefieres escribirnos directamente, hazlo a{" "}
            <a className="text-snow underline decoration-tech underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <button
            onClick={() => setState("idle")}
            className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-steel hover:text-snow"
          >
            ← Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          {state === "error" && (
            <p className="md:col-span-2 border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
              No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a{" "}
              <a className="underline decoration-current underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          )}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Nombre *</span>
            <input required name="name" autoComplete="name" className={input} placeholder="Tu nombre" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Empresa</span>
            <input name="company" autoComplete="organization" className={input} placeholder="Nombre de la empresa" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Email *</span>
            <input required type="email" name="email" autoComplete="email" className={input} placeholder="tu@empresa.com" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Área de interés</span>
            <select name="interest" className={input + " [&>option]:bg-ink"} defaultValue={interests[0]}>
              {interests.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">¿Qué necesitas? *</span>
            <textarea
              required
              name="message"
              rows={3}
              className={input + " resize-none"}
              placeholder="Ej.: conectar 3 sedes con VPN, migrar servidores a AWS, monitorizar nuestra red…"
            />
          </label>
          <div className="flex flex-col items-start justify-between gap-4 md:col-span-2 md:flex-row md:items-center">
            <p className="text-[13px] text-steel">Sin compromiso. Usamos tus datos solo para responder a tu solicitud.</p>
            <button
              type="submit"
              disabled={state === "loading"}
              className="group inline-flex items-center gap-3 bg-tech px-6 py-4 text-sm font-semibold text-snow transition-colors hover:bg-[#1a75ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "loading" ? "Enviando..." : "Enviar solicitud"}
              {state !== "loading" && (
                <span className="font-mono transition-transform group-hover:translate-x-1">→</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
