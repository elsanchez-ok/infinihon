import { useEffect, useRef, useState } from "react";
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
    <a href="/" className="flex shrink-0 items-center" aria-label="InfiniHon Corp. — inicio">
      <img src="/assets/infinihon.png" alt="InfiniHon Corp." className="h-9 w-auto sm:h-10" />
    </a>
  );
}

function AccountMenu() {
  const [accountOpen, setAccountOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnScroll = () => setAccountOpen(false);
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("scroll", closeOnScroll);
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setAccountOpen((v) => !v)}
        aria-expanded={accountOpen}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors",
          accountOpen ? "border-volt/50 text-snow" : "border-white/10 text-steel hover:text-snow"
        )}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="10" cy="6.5" r="3.25" />
          <path d="M3.5 17c.9-3.4 3.6-5.3 6.5-5.3s5.6 1.9 6.5 5.3" strokeLinecap="round" />
        </svg>
        Cuenta
        <svg viewBox="0 0 10 6" className={cn("h-[5px] w-[9px] transition-transform duration-300", accountOpen && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      <div
        role="menu"
        className={cn(
          "nav-glow absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right rounded-2xl p-2 transition-all duration-200",
          accountOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <a
          href="/auth"
          role="menuitem"
          onClick={() => setAccountOpen(false)}
          className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[13px] font-medium text-snow transition-colors hover:bg-white/[0.06]"
        >
          Iniciar sesión
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">Login</span>
        </a>
      </div>
    </div>
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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav className="nav-glow relative mx-auto flex h-[68px] max-w-[1400px] items-center justify-between rounded-[24px] px-5 md:rounded-[28px] md:px-8">
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
          <AccountMenu />
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
          "mx-auto hidden max-w-[1400px] overflow-hidden transition-[max-height] duration-300 lg:block xl:hidden",
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
        <ul className="nav-glow mt-2 flex h-[calc(100svh-104px)] flex-col gap-1 rounded-[20px] px-5 pt-6">
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
          <li className="mt-3">
            <a
              href="/auth"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-4 font-semibold text-snow"
            >
              Iniciar sesión
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
