import { type CSSProperties } from "react";
import { Reveal, RevealTitle, SectionLabel, useInView, Corners } from "./ui";
import { cn } from "../utils/cn";

const tools = [
  { k: "Docker", v: "Empaquetado de aplicaciones en contenedores portables." },
  { k: "Kubernetes", v: "Orquestación, autoescalado y recuperación automática." },
  { k: "K3s", v: "Kubernetes ligero para edge y clusters Raspberry Pi." },
  { k: "Terraform", v: "Infraestructura cloud declarada como código." },
  { k: "Ansible", v: "Configuración repetible de servidores y equipos." },
];

const nodes = [
  { name: "node-01", role: "control-plane", pods: ["api", "etcd", "sched", "dns", "", "", "", ""] },
  { name: "node-02", role: "worker", pods: ["web", "web", "api", "queue", "cache", "job", "", ""] },
  { name: "node-03", role: "worker", pods: ["web", "db", "prom", "graf", "api", "", "", ""] },
];

const term = [
  { p: "$", c: "terraform apply -auto-approve", o: false },
  { p: "", c: "Apply complete! Resources: 12 added.", o: true },
  { p: "$", c: "ansible-playbook site.yml", o: false },
  { p: "", c: "PLAY RECAP  ok=38  changed=6  failed=0", o: true },
  { p: "$", c: "kubectl get nodes", o: false },
  { p: "", c: "node-01 Ready · node-02 Ready · node-03 Ready", o: true },
];

function Cluster() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className="relative border border-white/[0.08] bg-ink/80 p-4 md:p-6">
      <Corners />
      <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-steel/70">
        <span>cluster · k3s-prod</span>
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" /> demo</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {nodes.map((n, ni) => (
          <div
            key={n.name}
            className={cn("reveal border border-white/[0.08] bg-obsidian p-3", inView && "in")}
            style={{ "--d": `${ni * 150}ms` } as CSSProperties}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-snow">{n.name}</span>
              <span className={cn("font-mono text-[9px] uppercase tracking-wider", ni === 0 ? "text-volt" : "text-steel")}>{n.role}</span>
            </div>
            <div className="mt-2 h-px bg-white/[0.06]" />
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {n.pods.map((p, pi) => (
                <div
                  key={pi}
                  className={cn(
                    "flex aspect-square items-center justify-center border font-mono text-[8px] uppercase",
                    p ? "container-life border-tech/50 bg-hn/50 text-snow/80" : "border-dashed border-white/10 text-transparent"
                  )}
                  style={{ "--d": `${(ni * 3 + pi * 1.7) % 9}s`, "--t": `${8 + ((pi + ni) % 4) * 2}s` } as CSSProperties}
                >
                  {p || "·"}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 font-mono text-[9px] text-steel">
              {["cpu", "mem"].map((m, mi) => (
                <div key={m} className="flex items-center gap-2">
                  <span className="w-6">{m}</span>
                  <div className="h-1 flex-1 bg-white/[0.06]">
                    <div
                      className="h-full bg-tech transition-all duration-[1500ms]"
                      style={{ width: inView ? `${30 + ((ni + 1) * (mi + 2) * 9) % 45}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ingress line */}
      <div className="relative my-4 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-steel/60">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-tech/50" />
        ingress · load balancer · service mesh
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-tech/50" />
      </div>

      {/* terminal */}
      <div className="border border-white/[0.08] bg-obsidian p-4 font-mono text-[11px] leading-6 md:text-[12px]">
        <div className="mb-2 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/15" /><span className="h-2 w-2 rounded-full bg-white/15" /><span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        {term.map((l, i) => (
          <div
            key={i}
            className={cn("reveal truncate", inView && "in", l.o ? "text-steel" : "text-snow")}
            style={{ "--d": `${600 + i * 350}ms` } as CSSProperties}
          >
            {l.p && <span className="mr-2 text-volt">{l.p}</span>}
            {l.o && <span className="mr-2 text-tech">›</span>}
            {l.c}
          </div>
        ))}
        <span className="blink inline-block h-3.5 w-2 translate-y-0.5 bg-volt" />
      </div>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-steel/50">Salida ilustrativa · no representa un entorno real</p>
    </div>
  );
}

export default function CloudSection() {
  return (
    <section className="relative border-t border-white/[0.06] bg-ink py-28 md:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal><SectionLabel index="05">Cloud + DevOps</SectionLabel></Reveal>
          <RevealTitle
            className="mt-8 text-[12vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-[5.4rem]"
            lines={["Del servidor", "al cloud."]}
            accentLast
          />
          <Reveal delay={200} className="mt-8 max-w-md text-[15px] leading-relaxed text-steel">
            Llevamos cargas desde servidores físicos y clusters locales hasta AWS, Azure y Google Cloud — o combinamos
            ambos mundos. Todo definido como código, versionado y reproducible.
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
            {["AWS", "Azure", "Google Cloud", "On-prem", "Híbrido"].map((c, i) => (
              <Reveal key={c} delay={250 + i * 50} className="border border-white/10 px-3 py-1.5 text-steel">{c}</Reveal>
            ))}
          </div>

          <dl className="mt-12">
            {tools.map((t, i) => (
              <Reveal key={t.k} delay={i * 70} className="group grid grid-cols-[130px_1fr] gap-4 border-t border-white/[0.08] py-4 transition-colors hover:border-tech md:grid-cols-[160px_1fr]">
                <dt className="font-bold text-snow transition-colors group-hover:text-volt">{t.k}</dt>
                <dd className="text-[14px] text-steel">{t.v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <div className="lg:pt-24">
          <Reveal><Cluster /></Reveal>
        </div>
      </div>
    </section>
  );
}
