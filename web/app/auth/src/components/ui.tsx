import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type ElementType } from "react";
import { cn } from "../utils/cn";

export function useInView<T extends Element>(threshold = 0.15, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

// El usuario prefiere que todos los efectos se ejecuten siempre, sin
// importar la preferencia de "reducir movimiento" del sistema operativo.
// Se mantiene la firma del hook (y el listener, por si se revierte) pero
// se fuerza a que siempre reporte "sin reducir movimiento".
export function useReducedMotion() {
  return false;
}


/* ---------------------------------------------------------------------
 * Tema claro / oscuro
 * El tema activo vive en <html data-theme="dark|light"> (fijado antes del
 * primer render por un script inline en index.html, para evitar parpadeo)
 * y se guarda en localStorage para recordarse en toda la plataforma.
 * ------------------------------------------------------------------- */
export type Theme = "dark" | "light";
const THEME_STORAGE_KEY = "infinihon-theme";
const THEME_EVENT = "infinihon-theme-change";

function readStoredTheme(): Theme | null {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function getActiveTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return readStoredTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* almacenamiento no disponible: el tema igual se aplica, solo no persiste */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(() => getActiveTheme());
  useEffect(() => {
    const onChange = (e: Event) => setThemeState((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_EVENT, onChange as EventListener);
    return () => window.removeEventListener(THEME_EVENT, onChange as EventListener);
  }, []);
  const setTheme = (next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  };
  return [theme, setTheme];
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={isLight ? "Modo oscuro" : "Modo claro"}
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 text-steel transition-colors hover:border-volt/50 hover:text-snow",
        className
      )}
    >
      {isLight ? (
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4.3" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden>
          <path d="M20.6 14.3a8.4 8.4 0 0 1-10.9-10.9.5.5 0 0 0-.6-.66A9.9 9.9 0 1 0 21.26 14.9a.5.5 0 0 0-.66-.6Z" />
        </svg>
      )}
    </button>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={cn("reveal", inView && "in", className)}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Headline where each line slides up from a mask. */
export function RevealTitle({
  lines,
  className,
  as: Tag = "h2",
  accentLast = false,
}: {
  lines: string[];
  className?: string;
  as?: ElementType;
  accentLast?: boolean;
}) {
  const { ref, inView } = useInView<HTMLHeadingElement>(0.2);
  return (
    <Tag ref={ref} className={cn(inView && "in", className)}>
      {lines.map((l, i) => (
        <span key={i} className="line-reveal pb-[0.06em]" style={{ "--d": `${i * 110}ms` } as CSSProperties}>
          <span className={cn(accentLast && i === lines.length - 1 && "text-steel")}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function SectionLabel({ index, children, className }: { index: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-steel", className)}>
      <span className="text-volt">{index}</span>
      <span className="h-px w-10 bg-steel/40" />
      <span>{children}</span>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#inicio" className={cn("group flex items-center gap-3", className)} aria-label="INFINIHON CORP. — inicio">
      <img src="/assets/infinihon.png" alt="InfiniHon Corp." className="h-8 w-auto shrink-0" />
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-[0.14em] text-snow">
          INF<span className="text-tech">·</span>INIHON
        </span>
        <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.28em] text-steel">Technology & Infrastructure</span>
      </span>
    </a>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-tech px-6 py-4 text-sm font-semibold text-snow transition-colors duration-300 hover:bg-[#1a75ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <ArrowIcon className="relative transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}

export function GhostButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-3 border border-steel/30 px-6 py-4 text-sm font-semibold text-snow transition-all duration-300 hover:border-volt/60 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt",
        className
      )}
    >
      {children}
      <span className="font-mono text-xs text-steel transition-colors group-hover:text-volt">→</span>
    </a>
  );
}

/** Corner brackets used for technical framing */
export function Corners({ className }: { className?: string }) {
  const c = "absolute h-3 w-3 border-volt/50";
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      <span className={cn(c, "left-0 top-0 border-l border-t")} />
      <span className={cn(c, "right-0 top-0 border-r border-t")} />
      <span className={cn(c, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(c, "bottom-0 right-0 border-b border-r")} />
    </div>
  );
}
