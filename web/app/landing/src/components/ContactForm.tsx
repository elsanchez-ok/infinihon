import { useState, type FormEvent } from "react";
import { Corners } from "./ui";
import { cn } from "../utils/cn";

export const CONTACT_EMAIL = "contacto@infinihon.com";

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

export default function ContactForm({ className }: { className?: string }) {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `Nombre: ${f.get("name")}\nEmpresa: ${f.get("company")}\nEmail: ${f.get("email")}\nInterés: ${f.get("interest")}\n\n${f.get("message")}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Proyecto de infraestructura — " + (f.get("company") || f.get("name"))
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

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
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-volt">Mensaje preparado</div>
          <p className="mt-4 text-2xl font-bold">Se abrió tu cliente de correo.</p>
          <p className="mt-2 text-steel">
            Si no se abrió, escríbenos directamente a{" "}
            <a className="text-snow underline decoration-tech underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-steel hover:text-snow"
          >
            ← Volver al formulario
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-x-10 gap-y-6 md:grid-cols-2">
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
              className="group inline-flex items-center gap-3 bg-tech px-6 py-4 text-sm font-semibold text-snow transition-colors hover:bg-[#1a75ff]"
            >
              Enviar solicitud <span className="font-mono transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
