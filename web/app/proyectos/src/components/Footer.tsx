import { Logo } from "./ui";

const nav = [
  ["Inicio", "/"],
  ["Proyectos", "/proyectos"],
  ["Ghost Browser", "/ghost-browser"],
  ["Servicios IT", "/#servicios"],
  ["Tienda", "/tienda"],
  ["Contacto", "/#contacto"],
];

const pieces = [
  "Ghost Browser",
  "Wisp Engine",
  "Ecosistema InfiniHon",
  "Proyectos propios",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-obsidian">
      <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-steel">
              Corporativo tecnológico hondureño: proyectos propios de software, motores experimentales, infraestructura IT y
              plataformas publicadas abiertas al público.
            </p>
            <a
              href="/#contacto"
              className="mt-8 inline-flex items-center gap-3 border-b border-tech pb-1 text-sm font-semibold text-snow hover:text-volt"
            >
              Hablar con InfiniHon <span className="font-mono">→</span>
            </a>
          </div>
          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">Navegación</div>
            <ul className="mt-5 space-y-3">
              {nav.map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="text-[15px] text-snow/80 transition-colors hover:text-volt">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel/60">Proyectos</div>
            <ul className="mt-5 space-y-3">
              {pieces.map((s) => (
                <li key={s}>
                  <a href="/proyectos" className="text-[15px] text-snow/80 transition-colors hover:text-volt">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          aria-hidden
          className="mt-20 select-none whitespace-nowrap text-center text-[13vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(0,102,255,0.28)] md:text-[12vw]"
        >
          INFINIHON CORP.
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] py-8 font-mono text-[10px] uppercase tracking-[0.22em] text-steel md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} InfiniHon Corp. · Corporativo Tecnológico · Honduras</span>
          <span className="flex items-center gap-3">
            <span className="h-2 w-5 bg-hn" />
            Hecho en Honduras.
          </span>
        </div>
      </div>
    </footer>
  );
}
