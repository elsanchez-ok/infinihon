import { useState } from "react";
import { Reveal, RevealTitle, SectionLabel, Corners } from "./ui";
import { cn } from "../utils/cn";

const Icon = ({ k }: { k: number }) => {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.25 } as const;
  const icons = [
    // networking
    <g {...p}><circle cx="16" cy="16" r="3" /><circle cx="5" cy="6" r="2" /><circle cx="27" cy="6" r="2" /><circle cx="5" cy="26" r="2" /><circle cx="27" cy="26" r="2" /><path d="M7 7l7 7M25 7l-7 7M7 25l7-7M25 25l-7-7" /></g>,
    // cloud
    <g {...p}><path d="M9 23h15a5 5 0 0 0 0-10 7 7 0 0 0-13.5-1.5A5.5 5.5 0 0 0 9 23z" /><path d="M12 27v2M16 27v2M20 27v2" /></g>,
    // devops
    <g {...p}><rect x="4" y="9" width="10" height="7" /><rect x="18" y="9" width="10" height="7" /><rect x="11" y="19" width="10" height="7" /><path d="M9 16v3h2M23 16v3h-2" /></g>,
    // security
    <g {...p}><path d="M16 3l10 4v8c0 7-4.5 11-10 14C10.5 26 6 22 6 15V7z" /><path d="M11 16l3.5 3.5L21 13" /></g>,
    // monitoring
    <g {...p}><rect x="3" y="5" width="26" height="18" /><path d="M6 18l5-5 4 3 5-7 6 5" /><path d="M11 27h10M16 23v4" /></g>,
    // custom
    <g {...p}><path d="M11 9l-7 7 7 7M21 9l7 7-7 7M18 6l-4 20" /></g>,
  ];
  return <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>{icons[k]}</svg>;
};

const services = [
  { n: "01", t: "Networking", items: ["MikroTik", "Routing", "VPN", "MPLS", "BGP"], d: "Diseño e implementación de redes corporativas, enlaces entre sedes y enrutamiento avanzado sobre equipos MikroTik y estándares abiertos." },
  { n: "02", t: "Cloud", items: ["AWS", "Azure", "Google Cloud", "Cloud Architecture"], d: "Arquitecturas cloud e híbridas: migraciones, redes virtuales, identidades y costos bajo control." },
  { n: "03", t: "DevOps", items: ["Docker", "Kubernetes", "K3s", "Terraform", "Ansible"], d: "Infraestructura como código, contenedores y pipelines para desplegar de forma repetible y sin sorpresas." },
  { n: "04", t: "Security", items: ["Auditoría", "Hardening", "VPN", "Network Security"], d: "Revisión de exposición, endurecimiento de sistemas, segmentación de red y accesos remotos seguros." },
  { n: "05", t: "Monitoring", items: ["Prometheus", "Grafana", "Observability", "Alerts"], d: "Métricas, dashboards y alertas sobre red, servidores y aplicaciones para operar con datos reales." },
  { n: "06", t: "Custom Systems", items: ["Software", "Automation", "Integrations", "Internal Platforms"], d: "Desarrollo de software a medida, automatización de procesos e integraciones entre sistemas." },
];

function Panel({ i }: { i: number }) {
  const s = services[i];
  return (
    <div className="relative h-full border border-white/[0.08] bg-ink p-8">
      <Corners />
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
        <span>Service · {s.n}</span>
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" /> Active</span>
      </div>
      <div key={i} className="fade-up mt-10">
        <div className="text-volt"><Icon k={i} /></div>
        <h3 className="mt-6 text-4xl font-extrabold uppercase tracking-tight">{s.t}</h3>
        <p className="mt-4 text-[15px] leading-relaxed text-steel">{s.d}</p>
        <div className="mt-8 border-t border-white/[0.08] pt-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">Stack / scope</div>
          <ul className="space-y-2">
            {s.items.map((it, k) => (
              <li key={it} className="flex items-center justify-between border-b border-dashed border-white/[0.06] pb-2 font-mono text-sm text-snow/90">
                <span><span className="mr-3 text-tech">{String(k + 1).padStart(2, "0")}</span>{it}</span>
                <span className="text-steel/40">—</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <a href="#contacto" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-snow hover:text-volt">
        Consultar sobre {s.t} <span className="font-mono">→</span>
      </a>
    </div>
  );
}

export default function ServicesSection() {
  const [active, setActive] = useState(0);
  return (
    <section id="servicios" className="relative border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><SectionLabel index="03">Servicios</SectionLabel></Reveal>
        <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <RevealTitle
            className="max-w-5xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.8rem]"
            lines={["Todo tu ecosistema", "tecnológico.", "En un solo lugar."]}
            accentLast
          />
          <Reveal delay={200} className="max-w-xs font-mono text-xs uppercase leading-6 tracking-[0.14em] text-steel">
            6 disciplinas · 1 equipo · una sola arquitectura coherente
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12">
          <ul className="lg:col-span-7" role="list">
            {services.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 60}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group relative grid w-full grid-cols-[64px_1fr] items-start gap-x-5 border-t py-8 text-left transition-colors duration-500 md:grid-cols-[110px_1fr_auto] md:gap-x-8 md:py-10",
                    active === i ? "border-tech" : "border-white/[0.08]"
                  )}
                  aria-pressed={active === i}
                >
                  <span
                    className={cn(
                      "absolute inset-0 -z-0 bg-gradient-to-r from-hn/40 via-hn/10 to-transparent transition-opacity duration-700",
                      active === i ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className={cn("absolute left-0 top-0 h-px bg-volt transition-all duration-700", active === i ? "w-full" : "w-0")} />
                  <span
                    className={cn(
                      "relative text-5xl font-extrabold leading-none tracking-tighter transition-colors duration-500 md:text-7xl",
                      active === i ? "text-tech" : "text-white/[0.1]"
                    )}
                  >
                    {s.n}
                  </span>
                  <span className="relative">
                    <span className="flex items-center gap-4">
                      <span className={cn("transition-colors duration-500", active === i ? "text-volt" : "text-steel")}><Icon k={i} /></span>
                      <span className="text-2xl font-extrabold uppercase tracking-tight text-snow md:text-4xl">{s.t}</span>
                    </span>
                    <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-steel">
                      {s.items.map((it, k) => (
                        <span key={it} className="flex items-center gap-4">
                          {k > 0 && <span className="text-white/15">/</span>}
                          <span className={cn("transition-colors duration-500", active === i && "text-snow/90")}>{it}</span>
                        </span>
                      ))}
                    </span>
                    <span className="mt-4 block text-sm leading-relaxed text-steel lg:hidden">{s.d}</span>
                  </span>
                  <span
                    className={cn(
                      "relative hidden h-10 w-10 items-center justify-center border transition-all duration-500 md:flex",
                      active === i ? "border-volt bg-tech text-snow" : "border-white/10 text-steel"
                    )}
                  >
                    →
                  </span>
                </button>
              </Reveal>
            ))}
            <li className="border-t border-white/[0.08]" aria-hidden />
          </ul>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <Panel i={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
