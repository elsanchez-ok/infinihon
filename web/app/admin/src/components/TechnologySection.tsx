import { Reveal, RevealTitle, SectionLabel } from "./ui";

const stack = [
  { t: "MikroTik", c: "network" },
  { t: "AWS", c: "cloud" },
  { t: "Azure", c: "cloud" },
  { t: "Google Cloud", c: "cloud" },
  { t: "Docker", c: "platform" },
  { t: "Kubernetes", c: "platform" },
  { t: "Terraform", c: "iac" },
  { t: "Ansible", c: "iac" },
  { t: "Prometheus", c: "observability" },
  { t: "Grafana", c: "observability" },
  { t: "Node.js", c: "software" },
  { t: "React", c: "software" },
  { t: "Next.js", c: "software" },
];

const cats = [
  ["network", "Red"],
  ["cloud", "Cloud"],
  ["platform", "Plataforma"],
  ["iac", "Infra as code"],
  ["observability", "Observabilidad"],
  ["software", "Software"],
];

const ticker = ["K3s", "Raspberry Pi", "Linux", "WireGuard", "IPsec", "BGP", "OSPF", "MPLS", "VLAN", "Nginx", "PostgreSQL", "GitHub Actions", "Helm", "Loki", "Alertmanager", "Proxmox"];

export default function TechnologySection() {
  return (
    <section id="tecnologia" className="relative overflow-hidden border-t border-white/[0.06] bg-obsidian py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Reveal><SectionLabel index="08">Tecnología</SectionLabel></Reveal>
            <RevealTitle
              className="mt-8 text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.8rem]"
              lines={["Stack construido", "para escalar."]}
              accentLast
            />
          </div>
          <Reveal delay={150} className="flex max-w-md flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
            {cats.map(([k, v], i) => (
              <span key={k}><span className="text-volt">{String.fromCharCode(65 + i)}</span> {v}</span>
            ))}
          </Reveal>
        </div>

        <div className="mt-16 border-t border-white/[0.08] pt-12 md:mt-24 md:pt-16">
          <p className="text-[9.5vw] font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-[7vw] lg:text-[5.6rem] xl:text-[6.4rem]">
            {stack.map((s, i) => {
              const ci = cats.findIndex(([k]) => k === s.c);
              return (
                <Reveal as="span" key={s.t} delay={i * 45} className="group inline-block">
                  <span className="relative inline-block cursor-default text-snow/85 transition-colors duration-500 hover:text-tech">
                    {s.t}
                    <sup className="ml-1 align-super font-mono text-[10px] font-normal tracking-normal text-steel transition-colors group-hover:text-volt md:text-xs">
                      {String(i + 1).padStart(2, "0")}·{String.fromCharCode(65 + ci)}
                    </sup>
                  </span>
                  {i < stack.length - 1 && <span className="mx-[0.18em] font-light text-white/15">/</span>}
                </Reveal>
              );
            })}
          </p>
        </div>
      </div>

      <div className="relative mt-20 border-y border-white/[0.06] py-5 md:mt-28" aria-hidden>
        <div className="flex w-max marquee gap-10 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.24em] text-steel/60">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-10">
              {t}<span className="text-tech">◆</span>
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-obsidian" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-obsidian" />
      </div>
    </section>
  );
}
