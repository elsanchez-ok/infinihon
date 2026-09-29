import { Logo } from "./ui";

const nav = [
  ["Servicios", "#servicios"],
  ["Infraestructura", "#infraestructura"],
  ["Tecnología", "#tecnologia"],
  ["Nosotros", "#nosotros"],
  ["Contacto", "#contacto"],
];
const services = ["Networking · MikroTik", "Cloud · AWS · Azure · GCP", "DevOps · Kubernetes · K3s", "Seguridad · VPN", "Monitorización", "Software a medida", "Soporte tecnológico"];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-obsidian">
      <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-steel">
              Diseñamos, implementamos y protegemos la infraestructura tecnológica que mantiene conectadas a las empresas modernas.
            </p>
            <a href="#formulario" className="mt-8 inline-flex items-center gap-3 border-b border-tech pb-1 text-sm font-semibold text-snow hover:text-volt">
              Hablar con InfiniHon <span className="font-mono">→</span>
            </a>
          </div>
          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">Navegación</div>
            <ul className="mt-5 space-y-3">
              {nav.map(([l, h]) => (
                <li key={l}><a href={h} className="text-[15px] text-snow/80 transition-colors hover:text-volt">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">Servicios</div>
            <ul className="mt-5 space-y-3">
              {services.map((s) => (
                <li key={s}><a href="#servicios" className="text-[15px] text-snow/80 transition-colors hover:text-volt">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden className="mt-20 select-none whitespace-nowrap text-center text-[14vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(0,102,255,0.28)] md:text-[13vw]">
          INF INIHON
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] py-8 font-mono text-[10px] uppercase tracking-[0.22em] text-steel md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} INF INIHON · Technology & Infrastructure</span>
          <span className="flex items-center gap-3">
            <span className="h-2 w-5 bg-hn" />
            Hecho en Honduras.
          </span>
        </div>
      </div>
    </footer>
  );
}
