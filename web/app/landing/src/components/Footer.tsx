const navCol1 = [
  ["Servicios", "/#servicios"],
  ["Infraestructura", "/#infraestructura"],
  ["Nosotros", "/#nosotros"],
];
const navCol2 = [
  ["Proyectos", "/proyectos"],
  ["Tecnología", "/#tecnologia"],
  ["Contacto", "/contacto"],
];

export default function Footer() {
  return (
    <footer className="footer-glow relative overflow-hidden rounded-t-[32px] sm:rounded-t-[40px]">
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-10 px-6 pb-16 pt-20 sm:px-10 md:flex-row md:items-end md:justify-between md:pb-20 md:pt-28">
        <a href="/" className="flex shrink-0 items-center gap-3" aria-label="InfiniHon Corp. — inicio">
          <img src="/favicon.png" alt="" aria-hidden="true" className="h-11 w-11 shrink-0" />
          <img src="/assets/infinihon.png" alt="InfiniHon Corp." className="h-7 w-auto sm:h-8" />
        </a>

        <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-[15px] sm:gap-x-20">
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

      <div className="relative z-10 border-t border-white/[0.06] px-6 py-6 text-center sm:px-10">
        <p className="text-[13px] text-steel/80">
          © InfiniHon Corp. {new Date().getFullYear()}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
