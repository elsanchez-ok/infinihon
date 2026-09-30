import { useEffect, useRef, useState } from "react";
import { byId, MEMBER, type Member } from "./data/members";

/* ------------------------------------------------------------------ utils */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Logo() {
  return (
    <a href="/" className="group flex flex-col items-center gap-1.5" aria-label="INFINIHON — sitio oficial">
      <img src="/assets/infinihon.png" alt="INFINIHON" className="h-9 w-auto shrink-0" />
      <span className="block font-mono text-[8px] uppercase leading-none tracking-[0.28em] text-steel">Infrastructure · Innovation · Honduras</span>
    </a>
  );
}

function MemberNotFound({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-24 md:px-8">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Error 404</div>
      <h1 className="mt-6 text-[12vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-snow sm:text-6xl lg:text-[5rem]">
        Miembro no encontrado.
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-steel">
        La dirección <span className="font-mono text-snow">/member/{id}</span> no corresponde a ningún miembro del equipo.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href="/" className="bg-tech px-6 py-4 text-center text-sm font-semibold text-snow hover:bg-[#1a75ff]">Ir a INFINIHON</a>
        <a href="mailto:contacto@infinihon.com" className="border border-white/15 px-6 py-4 text-center text-sm font-semibold hover:border-volt/60">Contactar</a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ página */

function Profile({ m }: { m: Member }) {
  return (
    <div className="min-h-screen bg-obsidian text-snow">
      {/* barra superior */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-obsidian/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 md:px-8">
          <Logo />
          <span className="hidden font-mono text-[11px] text-steel sm:block">
            infinihon.vercel.app<span className="text-volt">/member/{m.handle}</span>
          </span>
        </div>
      </header>

      <main className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-grid mask-radial opacity-60" aria-hidden />

        {/* hero del miembro */}
        <section className="relative mx-auto max-w-[1500px] px-4 pb-16 pt-14 md:px-8 md:pt-20">
          <Reveal>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Perfil oficial · /member/{m.handle}</div>
          </Reveal>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
            <Reveal delay={100}>
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center border border-white/10 bg-ink md:h-44 md:w-44">
                <div className="absolute inset-2 border border-white/[0.06]" aria-hidden />
                <span className="text-5xl font-extrabold tracking-[0.08em] text-snow md:text-6xl">{m.initials}</span>
                <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-obsidian bg-volt pulse-soft" aria-label="Activo" />
              </div>
            </Reveal>

            <div className="min-w-0">
              <Reveal delay={180}>
                <h1 className="text-[13vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-snow sm:text-6xl lg:text-[5.4rem]">
                  {m.name}
                </h1>
              </Reveal>
              <Reveal delay={260}>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="bg-tech px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-snow">{m.role}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">{m.roleEn}</span>
                </div>
              </Reveal>
              <Reveal delay={340}>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-[13.5px] text-steel">
                  <span className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-volt" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
                    {m.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
                    {m.status}
                  </span>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={420}>
            <p className="mt-10 max-w-3xl text-[16.5px] leading-relaxed text-steel">{m.bio}</p>
          </Reveal>
        </section>

        {/* foco técnico */}
        <section className="relative mx-auto max-w-[1500px] px-4 py-14 md:px-8">
          <Reveal>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Foco técnico</h2>
          </Reveal>
          <div className="mt-8 grid gap-px bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {m.focus.map((f, i) => (
              <Reveal key={f} delay={100 + i * 80}>
                <div className="h-full bg-ink/50 p-6 transition-colors hover:bg-ink">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70">0{i + 1}</div>
                  <div className="mt-3 text-[15px] font-bold leading-snug text-snow">{f}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* responsabilidades */}
        <section className="relative mx-auto max-w-[1500px] px-4 py-14 md:px-8">
          <Reveal>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Qué hace en INFINIHON</h2>
          </Reveal>
          <div className="mt-8 grid gap-px bg-white/[0.08] sm:grid-cols-2">
            {m.duties.map((d, i) => (
              <Reveal key={d.title} delay={100 + i * 80}>
                <div className="h-full bg-ink/50 p-6">
                  <h3 className="flex items-center gap-3 text-[15px] font-bold text-snow">
                    <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                    {d.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{d.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* enlaces oficiales */}
        <section className="relative mx-auto max-w-[1500px] px-4 py-14 md:px-8">
          <Reveal>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">Enlaces oficiales</h2>
          </Reveal>
          <div className="mt-8 border border-white/[0.08]">
            {m.links.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`group flex items-center justify-between gap-4 bg-ink/40 px-5 py-5 transition-colors hover:bg-ink ${i > 0 ? "border-t border-white/[0.07]" : ""}`}
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] font-bold text-snow">{l.label}</span>
                  {l.note && <span className="hidden truncate font-mono text-[12px] text-steel sm:block">{l.note}</span>}
                </span>
                <span className="font-mono text-[13px] text-steel transition-colors group-hover:text-volt">→</span>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-[1500px] px-4 pb-24 md:px-8">
          <Reveal>
            <div className="relative overflow-hidden border border-white/[0.08] bg-ink/40 px-6 py-14 text-center md:px-12">
              <div className="absolute inset-0 bg-grid-fine opacity-50" aria-hidden />
              <div className="relative">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">¿Trabajamos juntos?</div>
                <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] md:text-5xl">
                  Infraestructura que sí responde.
                </h2>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <a href="/" className="bg-tech px-6 py-4 text-sm font-semibold text-snow hover:bg-[#1a75ff]">Conocer INFINIHON</a>
                  <a href="/tienda" className="border border-white/15 px-6 py-4 text-sm font-semibold hover:border-volt/60">Ver la tienda</a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] py-8">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70 sm:flex-row md:px-8">
          <span>INFINIHON — Technology &amp; Infrastructure</span>
          <span>Tegucigalpa · Honduras</span>
          <span>© {new Date().getFullYear()} · infinihon.vercel.app</span>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ root */

export default function App() {
  // /member/<id> → perfil · /member → 404 · /member.html (archivo directo) → perfil por defecto
  const path = window.location.pathname.replace(/\/$/, "");
  let id = "";
  if (path === "/member.html") id = MEMBER.id;
  else if (path.startsWith("/member/")) id = path.slice("/member/".length);
  const m = id ? byId(id) : undefined;
  return m ? <Profile m={m} /> : <MemberNotFound id={id || "??"} />;
}
