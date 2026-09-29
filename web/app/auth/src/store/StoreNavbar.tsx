import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { StoreMark, TechIcon } from "./StoreVisuals";

const links = [
  ["Tienda", "#tienda"],
  ["Servicios", "#soluciones"],
  ["Soluciones", "#bundles"],
  ["Infraestructura", "#infraestructura"],
  ["Soporte", "#soporte"],
];

type Props = { cartCount: number; onSearch: () => void; onCart: () => void };

export function StoreNavbar({ cartCount, onSearch, onCart }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled || open ? "border-b border-white/[0.07] bg-obsidian/80 backdrop-blur-xl" : "bg-transparent")}> 
      <nav className="mx-auto flex h-[70px] max-w-[1520px] items-center justify-between px-5 md:px-8 xl:px-12">
        <StoreMark />
        <ul className="hidden items-center gap-7 xl:flex">
          {links.map(([label, href]) => <li key={href}><a href={href} className="group relative text-[13px] font-medium text-steel transition-colors hover:text-snow">{label}<span className="absolute -bottom-2 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" /></a></li>)}
        </ul>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={onSearch} className="group flex h-10 items-center gap-2 px-2 text-steel transition-colors hover:text-snow" aria-label="Buscar en tienda"><TechIcon name="search" className="h-5 w-5" /><span className="hidden text-[13px] sm:inline">Buscar</span></button>
          <a href="/auth" className="hidden h-10 items-center gap-2 px-2 text-steel transition-colors hover:text-snow lg:flex" aria-label="Acceder al portal de INFINIHON"><TechIcon name="user" className="h-5 w-5" /><span className="text-[13px]">Cuenta</span></a>
          <button onClick={onCart} className="group relative flex h-10 items-center gap-2 border-l border-white/[0.08] px-3 text-snow transition-colors hover:text-volt" aria-label={`Abrir carrito. ${cartCount} productos`}>
            <TechIcon name="cart" className="h-5 w-5" />
            <span className="hidden text-[13px] sm:inline">Carrito</span>
            <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[10px] transition-colors", cartCount ? "bg-tech text-snow" : "bg-white/10 text-steel")}>{cartCount}</span>
          </button>
          <a href="#soporte" className="ml-1 hidden border border-tech/60 bg-tech/10 px-3 py-2.5 text-[12px] font-semibold text-snow transition-colors hover:bg-tech lg:inline-flex">Hablar con un experto</a>
          <button onClick={() => setOpen(!open)} className="ml-1 flex h-10 w-10 items-center justify-center border border-white/10 text-snow xl:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
            <TechIcon name={open ? "close" : "menu"} />
          </button>
        </div>
      </nav>
      <div className={cn("overflow-hidden transition-[max-height] duration-500 xl:hidden", open ? "max-h-[calc(100svh-70px)] border-t border-white/[0.07]" : "max-h-0")}>
        <div className="flex h-[calc(100svh-70px)] flex-col px-5 pt-5">
          {links.map(([label, href], i) => <a key={href} onClick={() => setOpen(false)} href={href} className="flex items-center justify-between border-b border-white/[0.07] py-4 text-2xl font-bold tracking-tight"><span>{label}</span><span className="font-mono text-xs text-steel">0{i+1}</span></a>)}
          <a href="/auth" className="flex items-center justify-between border-b border-white/[0.07] py-4 text-2xl font-bold tracking-tight"><span>Mi cuenta</span><span className="font-mono text-xs text-volt">↗</span></a>
          <a href="#soporte" onClick={() => setOpen(false)} className="mt-6 bg-tech py-4 text-center font-semibold">Hablar con un experto</a>
          <p className="mt-auto pb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">INFINIHON / Technology & Infrastructure</p>
        </div>
      </div>
    </header>
  );
}