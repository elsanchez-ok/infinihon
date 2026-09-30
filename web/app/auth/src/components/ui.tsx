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

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
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
    <a href="#inicio" className={cn("group flex items-center gap-3", className)} aria-label="INF INIHON — inicio">
      <img src="/assets/infinihon.png" alt="INFINIHON" className="h-8 w-auto shrink-0" />
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
