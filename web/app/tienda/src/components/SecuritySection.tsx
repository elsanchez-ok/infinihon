import { type CSSProperties } from "react";
import { Reveal, RevealTitle, SectionLabel, useInView } from "./ui";
import { cn } from "../utils/cn";

const rings = [
  { name: "Internet", ctl: "untrusted" },
  { name: "Firewall", ctl: "policy · NAT · IPS" },
  { name: "Network", ctl: "VLAN · segmentation" },
  { name: "Applications", ctl: "authN · authZ" },
  { name: "Data", ctl: "encryption · backup" },
];

const concepts = [
  { k: "Zero Trust", v: "Ningún acceso es implícito. Cada conexión se verifica según identidad, dispositivo y contexto." },
  { k: "Hardening", v: "Reducción de superficie: servicios mínimos, parches al día y configuraciones seguras por defecto." },
  { k: "VPN", v: "Acceso remoto y enlaces entre sedes sobre túneles cifrados IPsec o WireGuard." },
  { k: "Access Control", v: "Roles, privilegios mínimos y trazabilidad sobre quién accede a qué." },
  { k: "Monitoring", v: "Registros centralizados y alertas ante comportamientos anómalos." },
];

function Rings() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[560px]">
      {rings.map((r, i) => {
        const inset = `${i * 9.5}%`;
        const last = i === rings.length - 1;
        return (
          <div
            key={r.name}
            className={cn(
              "absolute border transition-all duration-1000",
              inView ? (last ? "border-volt bg-hn/50" : "border-tech/50") : "border-white/5",
              i === 0 && "border-dashed"
            )}
            style={{ inset, transitionDelay: `${i * 220}ms`, background: !last && inView ? `rgba(0,59,115,${0.04 + i * 0.03})` : undefined }}
          >
            <div className="absolute left-2 top-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] sm:left-3 sm:top-2 sm:text-[10px]">
              <span className="text-volt">L{i}</span>
              <span className={cn("text-snow transition-opacity duration-700", inView ? "opacity-100" : "opacity-0")} style={{ transitionDelay: `${i * 220 + 200}ms` }}>
                {r.name}
              </span>
            </div>
            {!last && (
              <div className="absolute bottom-1.5 right-2 hidden font-mono text-[9px] uppercase tracking-[0.14em] text-steel/60 sm:block">{r.ctl}</div>
            )}
          </div>
        );
      })}
      {/* core */}
      <div className="absolute left-1/2 top-[58%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-2 w-2 bg-volt/80 pulse-soft sm:h-2.5 sm:w-2.5" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
        <span className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-steel sm:text-[9px]">protected</span>
      </div>
      {/* inbound request line */}
      <div className="absolute bottom-[52%] left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-tech/40 to-volt/60">
        <span className="drop absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-snow shadow-[0_0_10px_#00A8FF]" style={{ "--d": "0s" } as CSSProperties} />
      </div>
    </div>
  );
}

export default function SecuritySection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#030507] py-28 md:py-40">
      <div className="absolute inset-0 bg-grid opacity-30 mask-radial" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><SectionLabel index="07">Seguridad</SectionLabel></Reveal>
        <RevealTitle
          className="mt-8 max-w-6xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[5.4rem]"
          lines={["La seguridad no", "es una función.", "Es una capa."]}
          accentLast
        />

        <div className="mt-16 grid items-center gap-16 md:mt-24 lg:grid-cols-2 lg:gap-24">
          <Reveal><Rings /></Reveal>

          <div>
            <Reveal className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
              Internet <span className="text-tech">→</span> Firewall <span className="text-tech">→</span> Network <span className="text-tech">→</span> Applications <span className="text-tech">→</span> Data
            </Reveal>
            <Reveal delay={100} className="mb-10 max-w-lg text-[15px] leading-relaxed text-steel">
              Diseñamos la seguridad desde la arquitectura: cada capa tiene sus propios controles, de modo que un fallo en
              una no compromete a las demás.
            </Reveal>
            <ul>
              {concepts.map((c, i) => (
                <Reveal as="li" key={c.k} delay={i * 70} className="group grid grid-cols-[40px_1fr] gap-4 border-t border-white/[0.08] py-5 last:border-b">
                  <span className="font-mono text-[11px] text-steel/50 transition-colors group-hover:text-volt">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="text-lg font-bold text-snow">{c.k}</div>
                    <p className="mt-1 text-[14px] leading-relaxed text-steel">{c.v}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
