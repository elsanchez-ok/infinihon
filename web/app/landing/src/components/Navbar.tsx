import { useEffect, useState } from "react";
import { Logo } from "./ui";
import { cn } from "../utils/cn";

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Infraestructura", href: "#infraestructura" },
  { label: "Tecnología", href: "#tecnologia" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "border-b border-white/[0.06] bg-obsidian/75 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Logo />
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="group relative text-[13px] font-medium text-steel transition-colors hover:text-snow">
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <a
            href="/tienda"
            className="hidden items-center gap-2 border border-tech/60 bg-tech/10 px-4 py-2.5 text-[13px] font-semibold text-snow transition-all hover:bg-tech sm:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
            Tienda Digital
          </a>
          <button
            className="relative flex h-10 w-10 items-center justify-center border border-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            <span className={cn("absolute h-px w-5 bg-snow transition-all duration-300", open ? "rotate-45" : "-translate-y-1")} />
            <span className={cn("absolute h-px w-5 bg-snow transition-all duration-300", open ? "-rotate-45" : "translate-y-1")} />
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-500 lg:hidden",
          open ? "max-h-[100svh]" : "max-h-0"
        )}
      >
        <ul className="flex h-[calc(100svh-72px)] flex-col gap-1 border-t border-white/[0.06] px-5 pt-6">
          {links.map((l, i) => (
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
          <li className="mt-6">
            <a href="#contacto" onClick={() => setOpen(false)} className="flex w-full items-center justify-center bg-tech py-4 font-semibold">
              Hablar con InfiniHon
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
