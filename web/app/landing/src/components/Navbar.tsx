import { useEffect, useState } from "react";
import { ThemeToggle, ArrowIcon } from "./ui";
import { cn } from "../utils/cn";

/* Links primarios: siempre visibles en escritorio (xl+). En pantallas más
   angostas (lg) no caben todos con el logo + botón, así que se dividen en
   "primarios" (quedan en la barra) y "secundarios" (se agrupan detrás de
   un botón "Más" que despliega un segundo menú justo debajo de la barra
   de navegación — como pidió el usuario). */
const primaryLinks = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/contacto" },
];
const secondaryLinks = [
  { label: "Infraestructura", href: "/#infraestructura" },
  { label: "Tecnología", href: "/#tecnologia" },
];
const allLinks = [...primaryLinks.slice(0, -1), ...secondaryLinks, primaryLinks[primaryLinks.length - 1]];

function Wordmark() {
  return (
    <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="InfiniHon Corp. — inicio">
      <img src="/favicon.png" alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
      <img src="/assets/infinihon.png" alt="InfiniHon Corp." className="h-5 w-auto" />
    </a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [moreOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="nav-glow relative mx-auto flex h-[72px] max-w-[1920px] items-center justify-between rounded-b-[26px] px-5 md:rounded-b-[32px] md:px-10">
        <Wordmark />

        {/* ---- Escritorio ancho (xl+): los 7 links, centrados ---- */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 xl:flex">
          {allLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="group relative text-[13px] font-medium text-steel transition-colors hover:text-snow">
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* ---- Escritorio angosto (lg): solo los primarios + botón "Más" ---- */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex xl:hidden">
          {primaryLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="group relative text-[13px] font-medium text-steel transition-colors hover:text-snow">
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={cn(
                "flex items-center gap-1.5 text-[13px] font-medium transition-colors",
                moreOpen ? "text-volt" : "text-steel hover:text-snow"
              )}
            >
              Más
              <svg viewBox="0 0 10 6" className={cn("h-[5px] w-[9px] transition-transform duration-300", moreOpen && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/tienda"
            className="hidden items-center gap-2 rounded-full bg-tech px-5 py-2.5 text-[13px] font-semibold text-snow transition-all hover:bg-[#1a75ff] sm:inline-flex"
          >
            <ArrowIcon className="h-3.5 w-3.5" />
            Tienda
          </a>
          <ThemeToggle className="hidden rounded-full sm:flex" />
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            <span className={cn("absolute h-px w-5 bg-snow transition-all duration-300", open ? "rotate-45" : "-translate-y-1")} />
            <span className={cn("absolute h-px w-5 bg-snow transition-all duration-300", open ? "-rotate-45" : "translate-y-1")} />
          </button>
        </div>
      </nav>

      {/* ---- Menú "Más": panel que aparece debajo de la barra (solo lg) ---- */}
      <div
        className={cn(
          "mx-auto hidden max-w-[1920px] overflow-hidden px-5 transition-[max-height] duration-300 lg:block xl:hidden",
          moreOpen ? "max-h-24" : "max-h-0"
        )}
      >
        <div className="nav-glow mt-2 flex items-center justify-center gap-8 rounded-[20px] px-6 py-4">
          {secondaryLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMoreOpen(false)}
              className="text-[13px] font-medium text-steel transition-colors hover:text-snow"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* ---- Menú móvil (<lg): pantalla completa ---- */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-500 lg:hidden",
          open ? "max-h-[100svh]" : "max-h-0"
        )}
      >
        <ul className="nav-glow mx-5 mt-2 flex h-[calc(100svh-96px)] flex-col gap-1 rounded-[20px] px-5 pt-6">
          {allLinks.map((l, i) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b border-white/[0.06] py-4 text-2xl font-bold text-snow"
              >
                {l.label}
                <span className="font-mono text-xs text-steel">0{i + 1}</span>
              </a>
            </li>
          ))}
          <li className="mt-6 flex items-center gap-3">
            <a href="/contacto" onClick={() => setOpen(false)} className="flex flex-1 items-center justify-center rounded-full bg-tech py-4 font-semibold">
              Hablar con InfiniHon Corp.
            </a>
            <ThemeToggle className="h-[54px] w-14 shrink-0 rounded-full" />
          </li>
        </ul>
      </div>
    </header>
  );
}
