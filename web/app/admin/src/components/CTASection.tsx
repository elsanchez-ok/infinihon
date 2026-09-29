import { useMemo, useState, type FormEvent } from "react";
import { Reveal, RevealTitle, PrimaryButton, GhostButton, Corners } from "./ui";

const CONTACT_EMAIL = "contacto@infinihon.com";
const interests = ["Redes / MikroTik", "Cloud (AWS · Azure · GCP)", "DevOps / Kubernetes", "Seguridad / VPN", "Monitorización", "Desarrollo de software", "Soporte tecnológico", "Aún no lo sé"];

function NetBackdrop() {
  const { pts, lines } = useMemo(() => {
    let s = 3;
    const r = () => ((s = (s * 16807) % 2147483647), (s - 1) / 2147483646);
    const pts = Array.from({ length: 60 }, () => ({ x: r() * 1600, y: r() * 900 }));
    const lines: [number, number][] = [];
    pts.forEach((p, i) =>
      pts.forEach((q, j) => {
        if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 190) lines.push([i, j]);
      })
    );
    return { pts, lines };
  }, []);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {lines.map(([a, b], i) => (
        <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke="#0066FF" strokeWidth="0.7" className="pulse-soft" style={{ opacity: 0.18, animationDelay: `${(i * 0.31) % 5}s`, animationDuration: `${5 + (i % 4)}s` }} />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#00A8FF" opacity="0.5" />
      ))}
    </svg>
  );
}

export default function CTASection() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `Nombre: ${f.get("name")}\nEmpresa: ${f.get("company")}\nEmail: ${f.get("email")}\nInterés: ${f.get("interest")}\n\n${f.get("message")}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Proyecto de infraestructura — " + (f.get("company") || f.get("name")))}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const input = "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-snow placeholder:text-steel/50 focus:border-volt focus:outline-none focus:ring-0 transition-colors";

  return (
    <section id="contacto" className="relative isolate overflow-hidden border-t border-white/[0.06] bg-obsidian">
      <div className="absolute inset-0 -z-10 mask-radial opacity-80"><NetBackdrop /></div>
      <div className="absolute left-1/2 top-[35%] -z-10 h-[60vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[150px]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-48">
        <div className="text-center">
          <Reveal className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
            <span className="text-volt">12</span> — Siguiente paso
          </Reveal>
          <RevealTitle
            as="h2"
            className="mx-auto mt-10 text-[12vw] font-extrabold uppercase leading-[0.88] tracking-[-0.05em] sm:text-[9vw] lg:text-[8.5rem]"
            lines={["¿Listo para", "construir", "lo que sigue?"]}
          />
          <Reveal delay={300} className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-steel">
            Cuéntanos qué necesitas.
            <br />
            <span className="text-snow">Diseñemos la infraestructura para hacerlo posible.</span>
          </Reveal>
          <Reveal delay={400} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton href="#formulario">Hablar con InfiniHon</PrimaryButton>
            <GhostButton href="#servicios">Ver servicios</GhostButton>
          </Reveal>
        </div>

        <Reveal delay={150} className="mx-auto mt-24 max-w-4xl md:mt-32">
          <div id="formulario" className="relative scroll-mt-28 border border-white/[0.08] bg-obsidian/70 p-6 backdrop-blur-md md:p-10">
            <Corners />
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
              <span>Brief de proyecto</span>
              <span>Respuesta directa del equipo técnico</span>
            </div>
            {sent ? (
              <div className="py-10 text-center">
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-volt">Mensaje preparado</div>
                <p className="mt-4 text-2xl font-bold">Se abrió tu cliente de correo.</p>
                <p className="mt-2 text-steel">Si no se abrió, escríbenos directamente a <a className="text-snow underline decoration-tech underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
                <button onClick={() => setSent(false)} className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-steel hover:text-snow">← Volver al formulario</button>
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
                    {interests.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">¿Qué necesitas? *</span>
                  <textarea required name="message" rows={3} className={input + " resize-none"} placeholder="Ej.: conectar 3 sedes con VPN, migrar servidores a AWS, monitorizar nuestra red…" />
                </label>
                <div className="flex flex-col items-start justify-between gap-4 md:col-span-2 md:flex-row md:items-center">
                  <p className="text-[13px] text-steel">Sin compromiso. Usamos tus datos solo para responder a tu solicitud.</p>
                  <button type="submit" className="group inline-flex items-center gap-3 bg-tech px-6 py-4 text-sm font-semibold text-snow transition-colors hover:bg-[#1a75ff]">
                    Enviar solicitud <span className="font-mono transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
