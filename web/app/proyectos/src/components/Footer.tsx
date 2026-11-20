const navCol1 = [
  ["Inicio", "/"],
  ["Proyectos", "/proyectos"],
  ["Ghost Browser", "/ghost-browser"],
];
const navCol2 = [
  ["Servicios IT", "/#servicios"],
  ["Tienda", "/tienda"],
  ["Contacto", "/#contacto"],
];

export default function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="footer-glow relative overflow-hidden rounded-[28px] border border-white/[0.07]">
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-14 sm:px-10 sm:py-16 md:flex-row md:items-center md:justify-between">
          <a href="/" className="flex shrink-0 items-center gap-3" aria-label="InfiniHon Corp. — inicio">
            <img src="/favicon.png" alt="" aria-hidden="true" className="h-11 w-11 shrink-0" />
            <img src="/assets/infinihon.png" alt="InfiniHon Corp." className="h-7 w-auto sm:h-8" />
          </a>

          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[15px] sm:gap-x-24">
            <ul className="space-y-3">
              {navCol1.map(([l, h]) => (
                <li key={l}><a href={h} className="text-snow/80 transition-colors hover:text-volt">{l}</a></li>
              ))}
            </ul>
            <ul className="space-y-3">
              {navCol2.map(([l, h]) => (
                <li key={l}><a href={h} className="text-snow/80 transition-colors hover:text-volt">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/[0.06] px-6 py-6 sm:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            © {new Date().getFullYear()} InfiniHon Corp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
