import { useState } from "react";
import { Corners, GhostButton, PrimaryButton, Reveal, RevealTitle, SectionLabel } from "../components/ui";
import { benchmark, ghostDownload, shortcuts } from "../data/projects";
import { cn } from "../utils/cn";

const capabilities = [
  {
    n: "01",
    t: "Gestión real de pestañas",
    d: "Abre, cierra, navega entre pestañas, reabre las cerradas recientemente con Ctrl+Shift+T y mantén sesiones restauradas en pausa.",
  },
  {
    n: "02",
    t: "Nueva pestaña 100% nativa",
    d: "La pantalla inicial se dibuja directo en la interfaz de Rust (egui-wgpu) sin levantar procesos de Chromium en segundo plano.",
  },
  {
    n: "03",
    t: "Controles de privacidad",
    d: "Filtrado opcional de dominios conocidos en navegación y fetch/XHR, pausa de audio/video en segundo plano y limpieza de cookies y caché.",
  },
  {
    n: "04",
    t: "Marcadores e historial",
    d: "Consulta y administra tus sitios guardados e historial completo desde paneles integrados, almacenados localmente en tu equipo.",
  },
  {
    n: "05",
    t: "Descargas seguras",
    d: "Elige tu carpeta de destino; Ghost evita sobrescrituras accidentales añadiendo sufijos automáticos cuando un archivo ya existe.",
  },
  {
    n: "06",
    t: "Temas y herramientas",
    d: "Tema claro y oscuro, página de inicio configurable, búsqueda integrada con DuckDuckGo, control de zoom y DevTools integradas.",
  },
];

const engines = [
  {
    name: "Wisp Engine",
    badge: "Beta · 100% Rust",
    desc: "Motor experimental escrito en Rust pensado para lectura, artículos y documentación con consumo mínimo de memoria dentro del proceso principal.",
    items: [
      ["HTML5 + Cascada CSS real", "especificidad, @media por ancho de pestaña, variables var(--token), calc(), em/rem/% y bordes por lado."],
      ["Layout moderno con Taffy", "soporte de Flexbox y CSS Grid integrado en el flujo de renderizado."],
      ["JavaScript acotado con Boa", "scripts inline, externos y módulos ES sobre DOM mutable con eventos, timers y localStorage bajo límites seguros."],
      ["Modo Lectura listo para IA", "extrae el texto limpio del DOM sin anuncios ni scripts, listo para copiar o alimentar directamente a un modelo de IA."],
    ],
  },
  {
    name: "WebView2 (Chromium)",
    badge: "Bajo demanda · wry",
    desc: "Motor predeterminado para aplicaciones web interactivas complejas. Nunca arranca al abrir Ghost ni en la página de nueva pestaña nativa.",
    items: [
      ["Compatibilidad completa", "formularios complejos, fetch/XHR, WebSockets, video y apps modernas de alto dinamismo."],
      ["Suspensión automática inteligente", "ajusta el tiempo de inactividad y define un límite máximo de webviews activos al mismo tiempo."],
      ["Restauración bajo demanda", "las pestañas guardadas inician suspendidas y solo consumen recursos cuando las seleccionas."],
      ["Herramientas de desarrollo", "abre DevTools con F12, zoom, impresión y pausa automática de medios en segundo plano."],
    ],
  },
];

const requirements = [
  "Rust estable reciente y el target x86_64-pc-windows-msvc.",
  "Visual Studio Build Tools con Desarrollo para el escritorio con C++ y un Windows SDK (provee rc.exe para el icono).",
  "Microsoft Edge WebView2 Runtime instalado en Windows.",
];

const stack = ["Rust Edition 2024", "egui 0.37", "wgpu 30", "winit 0.30", "wry 0.57 (WebView2)", "wisp-engine", "Taffy (Flex/Grid)", "Boa JS Runtime", "serde / serde_json"];

function BrowserPreview() {
  const [engine, setEngine] = useState<"wisp" | "wv2">("wisp");
  const wisp = engine === "wisp";

  return (
    <div className="relative border border-white/[0.09] bg-ink/80">
      <Corners />
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
          Ghost Browser · vista previa interactiva
        </div>
        <button
          type="button"
          onClick={() => setEngine((e) => (e === "wisp" ? "wv2" : "wisp"))}
          className="border border-tech/60 bg-tech/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-snow transition-colors hover:bg-tech"
        >
          Ctrl+Shift+W · {wisp ? "Wisp" : "WebView2"}
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2.5">
        {["Nueva pestaña nativa", "Wikipedia · zzz", "Docs Rust · zzz"].map((t, i) => (
          <span
            key={t}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 font-mono text-[11px]",
              i === 0 ? "border border-tech/40 bg-tech/10 text-snow" : "text-steel"
            )}
          >
            {t}
          </span>
        ))}
        <span className="ml-auto hidden font-mono text-[10px] text-steel/60 sm:block">ghost://newtab</span>
      </div>

      <div className="grid gap-px bg-white/[0.06] md:grid-cols-[1fr_260px]">
        <div className="bg-obsidian p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Contenido</div>
          <h4 className="mt-4 text-2xl font-extrabold tracking-tight text-snow">
            {wisp ? "Renderizada con Wisp" : "Renderizada con WebView2"}
          </h4>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-steel">
            {wisp
              ? "La página de nueva pestaña nativa se pinta con la propia interfaz (egui + wgpu). Cero procesos de Chromium hasta que una webapp lo requiera."
              : "WebView2 (Chromium) se activa bajo demanda para aplicaciones web complejas: fetch/XHR, WebSockets, video y webapps modernas."}
          </p>
          <div className="mt-8 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <span>
              Motor: <span className="text-volt">{wisp ? "Wisp (Rust)" : "WebView2"}</span>
            </span>
            <span>
              Procesos: <span className="text-volt">{wisp ? "1 (ghost.exe)" : "ghost.exe + Chromium"}</span>
            </span>
          </div>
        </div>
        <div className="bg-obsidian p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">Memoria (20 tabs)</div>
          <div className="mt-3 text-4xl font-extrabold tracking-tight text-snow">
            {wisp ? "229.1" : "2641.0"}
            <span className="ml-1 text-lg font-semibold text-steel">MB</span>
          </div>
          <div className="mt-6 space-y-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
            <div className="flex justify-between border-b border-dashed border-white/[0.08] pb-2">
              <span>Modo</span>
              <span className="text-volt">{wisp ? "Wisp Beta" : "WebView2"}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-white/[0.08] pb-2">
              <span>Suspensión</span>
              <span className="text-snow">Activa</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-white/[0.08] pb-2">
              <span>Modo lectura IA</span>
              <span className="text-snow">Wisp</span>
            </div>
          </div>
          <p className="mt-6 text-[12.5px] leading-relaxed text-steel">
            Pulsa <span className="font-mono text-volt">Ctrl+Shift+W</span> en la vista previa para alternar entre Wisp (Rust) y
            WebView2 (Chromium).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GhostBrowser() {
  const [tabs, setTabs] = useState<(typeof benchmark.rows)[number]["tabs"]>(20);
  const row = benchmark.rows.find((r) => r.tabs === tabs) ?? benchmark.rows[benchmark.rows.length - 1];
  const edgeWs = Number(row.edge.split(" / ")[0]);
  const wispWs = Number(row.wisp.split(" / ")[0]);
  const ratio = (edgeWs / wispWs).toFixed(1);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-obsidian text-snow">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06] pb-20 pt-36 md:pb-28 md:pt-48">
          {/* Imagen de fondo del hero */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/ghost-hero.webp"
              alt=""
              aria-hidden
              className="h-full w-full object-cover object-center opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/25" />
          </div>
          <div className="absolute inset-0 z-0 bg-grid grid-drift mask-radial opacity-40" />
          <div className="absolute left-[60%] top-[30%] z-0 h-[60vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[130px]" />

          {/* Fantasma en el espacio vacío de la derecha */}
          <img
            src="/assets/ghost.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute right-[3%] top-[47%] z-[1] hidden h-[340px] w-auto -translate-y-1/2 select-none xl:block 2xl:h-[400px]"
          />

          <div className="relative z-10 mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
              <a href="/" className="hover:text-snow">Inicio</a>
              <span className="text-steel/40">/</span>
              <a href="/proyectos" className="hover:text-snow">Proyectos</a>
              <span className="text-steel/40">/</span>
              <span className="text-volt">Ghost Browser</span>
            </Reveal>

            <Reveal delay={100} className="mt-10 flex flex-wrap items-center gap-3">
              <span className="border border-tech/50 bg-tech/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-snow">
                InfiniHon Corp. · Proyecto de software
              </span>
              <span className="border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
                v0.1.0 · Rust 2024
              </span>
            </Reveal>

            <RevealTitle
              className="mt-8 text-[13vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-[7.4rem]"
              lines={["Ghost", "Browser"]}
            />

            <Reveal delay={200} className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[12px] text-steel">
              <span className="text-steel/50">Ruta oficial:</span>
              <span className="border border-white/10 bg-ink px-3 py-1.5 text-volt">infinihon.vercel.app/ghost-browser</span>
            </Reveal>

            <Reveal delay={280} className="mt-10 max-w-3xl text-lg leading-relaxed text-steel">
              Un navegador de escritorio ligero hecho con <span className="text-snow">Rust</span>, interfaz nativa en{" "}
              <span className="text-snow">egui/wgpu</span> y arquitectura de <span className="text-snow">doble motor</span>:{" "}
              <span className="text-snow">Wisp</span> para páginas documentales en un solo proceso y{" "}
              <span className="text-snow">WebView2</span> (Chromium) bajo demanda para aplicaciones web complejas.
            </Reveal>

            <Reveal delay={380} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={ghostDownload.url} download={ghostDownload.file}>
                Descargar {ghostDownload.file}
              </PrimaryButton>
              <GhostButton href="https://github.com/sarch-codelab/ghost-browser">Ver código en GitHub</GhostButton>
              <GhostButton href="#compilar">Compilar para Windows</GhostButton>
            </Reveal>
            <Reveal delay={420} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
              <span className="text-volt">{ghostDownload.meta}</span>
              <span className="text-steel/50">·</span>
              <span className="break-all text-steel/70">{ghostDownload.checksum}</span>
            </Reveal>

            <Reveal delay={480} className="mt-14 grid grid-cols-2 gap-px border border-white/[0.08] bg-white/[0.06] lg:grid-cols-4">
              {[
                ["229.1 MB", "RAM @ 20 pestañas · Wisp"],
                ["1 proceso", "Árbol completo en ghost.exe"],
                ["~10×", "Menos RAM que Edge con 20 pestañas"],
                ["2 motores", "Wisp (Rust) + WebView2 (Chromium)"],
              ].map(([v, l]) => (
                <div key={l} className="bg-obsidian px-5 py-6">
                  <div className="text-2xl font-extrabold tracking-tight text-snow md:text-3xl">{v}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase leading-4 tracking-[0.16em] text-steel">{l}</div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Preview */}
        <section className="relative border-b border-white/[0.06] bg-ink py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="01">Vista previa interactiva</SectionLabel>
            </Reveal>
            <Reveal delay={100} className="mt-10">
              <BrowserPreview />
            </Reveal>
          </div>
        </section>

        {/* Benchmarks */}
        <section className="relative border-b border-white/[0.06] py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="02">Rendimiento y memoria</SectionLabel>
            </Reveal>
            <RevealTitle
              className="mt-8 max-w-4xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
              lines={["Medición real", "de memoria RAM."]}
              accentLast
            />
            <Reveal delay={200} className="mt-8 max-w-2xl text-[15px] leading-relaxed text-steel">
              {benchmark.description}
            </Reveal>

            <Reveal delay={250} className="mt-10 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Selecciona cantidad de pestañas:</span>
              {benchmark.rows.map((r) => (
                <button
                  key={r.tabs}
                  type="button"
                  onClick={() => setTabs(r.tabs)}
                  className={cn(
                    "border px-4 py-2 font-mono text-[12px] transition-all duration-300",
                    tabs === r.tabs ? "border-tech bg-tech text-snow" : "border-white/10 text-steel hover:border-volt/50 hover:text-snow"
                  )}
                >
                  {r.tabs}
                </button>
              ))}
            </Reveal>

            <Reveal delay={300} className="mt-8 overflow-x-auto border border-white/[0.08]">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-ink font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    <th className="px-5 py-4 font-medium">Pestañas</th>
                    <th className="px-5 py-4 font-medium">Ghost + Wisp</th>
                    <th className="px-5 py-4 font-medium">Ghost + WV2</th>
                    <th className="px-5 py-4 font-medium">Edge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-obsidian">
                    <td className="px-5 py-5 font-mono text-sm text-snow">{row.tabs}</td>
                    <td className="px-5 py-5 font-mono text-sm text-volt">{row.wisp}</td>
                    <td className="px-5 py-5 font-mono text-sm text-snow/85">{row.wv2}</td>
                    <td className="px-5 py-5 font-mono text-sm text-snow/85">{row.edge}</td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t border-white/[0.08] bg-ink px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                Working Set (WS) / Private Bytes (PB) en MB
              </div>
            </Reveal>

            <Reveal delay={350} className="mt-8 max-w-3xl border-l-2 border-tech pl-5 text-lg leading-relaxed text-snow/90">
              Con <span className="text-volt">{row.tabs} pestañas</span>, Ghost + Wisp consume{" "}
              <span className="text-volt">{ratio}× menos Working Set</span> que Microsoft Edge.
            </Reveal>
            <Reveal delay={400} className="mt-4 max-w-3xl text-[13.5px] leading-relaxed text-steel">
              {benchmark.note}
            </Reveal>
          </div>
        </section>

        {/* Architecture */}
        <section className="relative border-b border-white/[0.06] bg-ink py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="03">Arquitectura híbrida</SectionLabel>
            </Reveal>
            <RevealTitle
              className="mt-8 max-w-4xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
              lines={["Dos motores,", "una sola interfaz."]}
              accentLast
            />
            <Reveal delay={200} className="mt-8 max-w-2xl text-[15px] leading-relaxed text-steel">
              Ghost te permite alternar el motor en cualquier pestaña con{" "}
              <span className="font-mono text-volt">Ctrl+Shift+W</span> o activar el enrutamiento automático por URL en Ajustes
              para enviar documentación, wikis y artículos a <span className="text-snow">Wisp</span> y dejar las webapps
              modernas en <span className="text-snow">WebView2</span>.
            </Reveal>

            <div className="mt-14 grid gap-10 lg:grid-cols-2">
              {engines.map((e, i) => (
                <Reveal key={e.name} delay={i * 100} className="relative h-full border border-white/[0.08] bg-obsidian p-8">
                  <Corners />
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight text-snow md:text-3xl">{e.name}</h3>
                    <span className="shrink-0 border border-tech/50 bg-tech/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-volt">
                      {e.badge}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-steel">{e.desc}</p>
                  <ul className="mt-8 space-y-5">
                    {e.items.map(([t, d]) => (
                      <li key={t} className="grid grid-cols-[20px_1fr] gap-3">
                        <span className="mt-1 text-volt">▸</span>
                        <div>
                          <div className="text-[15px] font-bold text-snow">{t}</div>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-steel">{d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="relative border-b border-white/[0.06] py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="04">Capacidades</SectionLabel>
            </Reveal>
            <RevealTitle
              className="mt-8 max-w-4xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
              lines={["Diseñado para velocidad", "y control diario."]}
              accentLast
            />
            <div className="mt-14 grid gap-px border border-white/[0.08] bg-white/[0.06] md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((c, i) => (
                <Reveal key={c.n} delay={i * 70} className="group bg-obsidian p-8 transition-colors duration-500 hover:bg-ink">
                  <div className="font-mono text-sm text-tech">/{c.n}</div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-snow">{c.t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-steel">{c.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Shortcuts */}
        <section className="relative border-b border-white/[0.06] bg-ink py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="05">Productividad · Atajos de teclado</SectionLabel>
            </Reveal>
            <div className="mt-12 grid gap-px border border-white/[0.08] bg-white/[0.06] md:grid-cols-2">
              {shortcuts.map(([k, a]) => (
                <div key={k} className="flex items-center justify-between gap-6 bg-obsidian px-5 py-4">
                  <span className="text-[14px] text-snow/90">{a}</span>
                  <kbd className="shrink-0 border border-white/15 bg-ink px-2.5 py-1 font-mono text-[11px] text-volt">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compile */}
        <section id="compilar" className="relative border-b border-white/[0.06] py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <Reveal>
              <SectionLabel index="06">Descargar · Compilar y probar</SectionLabel>
            </Reveal>
            <RevealTitle
              className="mt-8 max-w-4xl text-[10vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
              lines={["Cómo compilar", "Ghost en Windows."]}
              accentLast
            />
            <Reveal delay={200} className="mt-8 max-w-2xl text-[15px] leading-relaxed text-steel">
              Ghost está orientado actualmente a Windows (<span className="font-mono text-snow">x86_64-pc-windows-msvc</span>) y
              usa el runtime de Microsoft Edge WebView2.
            </Reveal>

            <Reveal delay={240} className="mt-10 border border-tech/30 bg-tech/[0.06] p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-extrabold uppercase tracking-tight text-snow">Descargar Ghost Browser</h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-steel">
                    Instalador listo para Windows: no requiere compilar. Si Windows no tiene el runtime de WebView2, el propio
                    instalador te lo indica.
                  </p>
                  <p className="mt-4 font-mono text-[11px] uppercase leading-5 tracking-[0.16em] text-steel">
                    <span className="text-volt">{ghostDownload.meta}</span>
                    <span className="text-steel/50"> · </span>
                    <span className="break-all text-steel/70">{ghostDownload.checksum}</span>
                  </p>
                </div>
                <PrimaryButton href={ghostDownload.url} download={ghostDownload.file} className="shrink-0">
                  Descargar {ghostDownload.file}
                </PrimaryButton>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <Reveal className="border border-white/[0.08] bg-ink p-8">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-volt">Requisitos previos</h3>
                <ul className="mt-6 space-y-4">
                  {requirements.map((r, i) => (
                    <li key={r} className="grid grid-cols-[28px_1fr] gap-3 text-[14.5px] leading-relaxed text-steel">
                      <span className="font-mono text-sm text-tech">{String(i + 1).padStart(2, "0")}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-volt">Stack técnico real (Cargo.toml)</h3>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {stack.map((s) => (
                    <li key={s} className="border border-white/10 px-3 py-1.5 font-mono text-[11px] text-snow/85">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120} className="border border-white/[0.08] bg-ink p-8">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-volt">1. Clonar y ejecutar en modo release</h3>
                <div className="mt-5 border border-white/10 bg-obsidian p-5 font-mono text-[12.5px] leading-relaxed text-snow/90">
                  <div><span className="text-steel">$</span> git clone https://github.com/sarch-codelab/ghost-browser.git</div>
                  <div><span className="text-steel">$</span> cd ghost-browser</div>
                  <div><span className="text-steel">$</span> cargo run --release</div>
                </div>
                <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-volt">2. Compilar binario y correr pruebas</h3>
                <div className="mt-5 border border-white/10 bg-obsidian p-5 font-mono text-[12.5px] leading-relaxed text-snow/90">
                  <div><span className="text-steel">$</span> cargo build --release</div>
                  <div><span className="text-steel">$</span> cargo fmt --all -- --check</div>
                  <div><span className="text-steel">$</span> cargo test --bin ghost</div>
                </div>
                <p className="mt-8 text-[13.5px] leading-relaxed text-steel">
                  Si no se encuentra <span className="font-mono text-snow">rc.exe</span>, instala el Windows SDK o define la
                  variable de entorno <span className="font-mono text-snow">RC</span> con la ruta completa al compilador de
                  recursos.
                </p>
              </Reveal>
            </div>

            <Reveal delay={200} className="mt-10 border border-white/[0.08] bg-ink p-8">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-volt">Transparencia sobre privacidad y datos</h3>
              <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-steel">
                El bloqueador integrado utiliza una lista acotada de dominios conocidos: no es un bloqueador exhaustivo ni hace
                anónima la navegación. Los sitios que visitas siguen recibiendo solicitudes desde tu dispositivo.
              </p>
              <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-steel">
                Tus marcadores, historial, ajustes y sesión se guardan únicamente en local dentro de{" "}
                <span className="font-mono text-snow">%LOCALAPPDATA%\Ghost\ghost.json</span>. Puedes borrar cookies y caché de
                WebView2 desde <span className="text-snow">Ajustes → Borrar cookies y datos de navegación</span>.
              </p>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-ink py-24 md:py-32">
          <div className="absolute inset-0 -z-10 bg-grid-fine mask-radial opacity-50" />
          <div className="mx-auto max-w-[1440px] px-5 text-center md:px-10">
            <Reveal className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
              <span className="text-volt">07</span> — Corporativo InfiniHon
            </Reveal>
            <RevealTitle
              as="h2"
              className="mx-auto mt-8 max-w-4xl text-[11vw] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-[4.8rem]"
              lines={["Parte del ecosistema", "InfiniHon Corp."]}
              accentLast
            />
            <Reveal delay={250} className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-steel">
              Creado y publicado por <span className="text-snow">Joseph Sánchez (@sarch-codelab)</span> dentro del portafolio
              oficial de proyectos de InfiniHon Corp.
            </Reveal>
            <Reveal delay={400} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/proyectos">Ver más proyectos →</PrimaryButton>
              <GhostButton href="https://github.com/sarch-codelab/ghost-browser">Repositorio oficial</GhostButton>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
