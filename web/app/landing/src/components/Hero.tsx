import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PrimaryButton, GhostButton, useTypewriterCycle } from "./ui";
import { cn } from "../utils/cn";

const micro = ["Proyectos", "Redes", "Cloud", "Seguridad", "DevOps", "Automatización"];
// Palabras que rotan en el titular ("Ingeniería de ___ para tu empresa."),
// todas en relación directa con lo que describe el párrafo de debajo
// (sistemas, redes, nube, seguridad, monitoreo, software, IA).
// "sistemas" reemplaza a "infraestructura": decía lo mismo pero esa palabra
// era demasiado larga y la píldora azul se veía desproporcionada.
const HEADLINE_WORDS = ["sistemas", "redes", "nube", "seguridad", "monitoreo", "software", "IA"];
// Texto accesible fijo para lectores de pantalla (la animación de letras
// es solo decorativa y queda con aria-hidden).
const HEADLINE_WORD_A11Y = HEADLINE_WORDS.join(" / ");

export default function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  // La palabra del titular se escribe, se mantiene un momento, se borra y
  // pasa a la siguiente de la lista, en bucle, justo cuando el resto del
  // titular ya reveló su línea (260ms de delay + el tiempo de esa animación).
  const typedWord = useTypewriterCycle(HEADLINE_WORDS, ready, 55, 30, 1800, 520);

  // La píldora azul debe abrazar justo el texto que se está escribiendo en
  // cada instante (no quedarse fija al tamaño de la palabra más larga, que
  // se veía como una barra vacía enorme con palabras cortas). Se mide, en
  // cada letra que se escribe/borra, el ancho real que ocupa ese texto con
  // un clon invisible y fuera de pantalla (misma tipografía/padding que la
  // píldora visible), y ese ancho en píxeles se aplica como "width" de la
  // píldora visible junto con una transición CSS de "width": así, en vez de
  // saltar de golpe, el fondo azul crece/encoge con una animación fluida.
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [pillWidth, setPillWidth] = useState<number>();
  useEffect(() => {
    const measure = () => {
      if (sizerRef.current) setPillWidth(sizerRef.current.getBoundingClientRect().width);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [typedWord]);

  return (
    // data-theme="light" fija el Hero siempre en la paleta e imagen de fondo
    // del tema claro, sin importar el tema activo en el resto del sitio
    // (ThemeToggle en Navbar): las variables --color-obsidian/snow/steel/
    // volt/white que define [data-theme="light"] en index.css, y las reglas
    // .hero-ambient-glow / .hero-ambient-blob específicas de ese tema, se
    // heredan en todo este subárbol — así el Hero se ve igual aunque el
    // usuario tenga el tema oscuro activo en el resto de la página.
    <section
      id="inicio"
      data-theme="light"
      className={cn("relative isolate min-h-[100svh] overflow-hidden", ready && "in hero-in")}
    >
      {/* background layers */}
      <div className="absolute inset-0 -z-20 bg-obsidian" />
      <div
        className="hero-ambient-glow pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-full w-full"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-grid grid-drift mask-radial opacity-60" />
      <div className="hero-ambient-blob absolute left-1/2 top-[55%] -z-10 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hn/40 blur-[120px] lg:left-[68%]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-obsidian to-transparent" />

      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-x-5 top-[88px] bottom-6 hidden md:inset-x-10 md:block" aria-hidden>
        <div className="absolute bottom-0 right-0 hidden text-right font-mono text-[10px] uppercase leading-5 tracking-[0.2em] text-steel/60 lg:block">
          <div>14.0818° N · 87.2068° W</div>
          <div className="text-steel/40">Tegucigalpa · HN</div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col items-center justify-center px-5 pb-28 pt-32 text-center md:px-10">
        <div className="flex max-w-[780px] flex-col items-center">
          <h1 className="text-[12vw] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-[#F5F7FA] sm:text-[8vw] lg:text-[4.6rem] xl:text-[5.2rem]">
            <span className="line-reveal pb-[0.05em]" style={{ "--d": "260ms" } as CSSProperties}>
              <span>
                Ingeniería de{" "}
                {/* text-left: el contenedor del Hero tiene text-center, y sin
                    esto el texto quedaría centrado dentro de la píldora en
                    vez de salir siempre desde el borde izquierdo como una
                    escritura normal. overflow-hidden evita que el texto se
                    asome unos milisegundos durante la transición de ancho. */}
                <span
                  className="relative inline-block overflow-hidden whitespace-nowrap rounded-2xl bg-tech px-[0.35em] py-[0.05em] text-left transition-[width] duration-150 ease-out"
                  style={pillWidth ? ({ width: `${pillWidth}px` } as CSSProperties) : undefined}
                >
                  <span aria-hidden="true">
                    {typedWord}
                    <span className="blink -mb-[0.08em] ml-[0.02em] inline-block h-[0.82em] w-[0.06em] translate-y-[0.08em] bg-white/90" />
                  </span>
                  <span className="sr-only">{HEADLINE_WORD_A11Y}</span>
                </span>
              </span>
            </span>
            <span className="line-reveal pb-[0.08em]" style={{ "--d": "400ms" } as CSSProperties}>
              <span>para tu empresa.</span>
            </span>
          </h1>

          {/* Clon invisible, fuera de pantalla, con exactamente la misma
              tipografía/padding que la píldora azul de arriba, mostrando en
              todo momento el mismo texto que se está escribiendo/borrando.
              Solo existe para medir en píxeles reales (useEffect de arriba)
              el ancho que debe tener la píldora en cada instante. */}
          <span
            ref={sizerRef}
            aria-hidden="true"
            className="pointer-events-none invisible fixed left-[-9999px] top-0 inline-block whitespace-nowrap rounded-2xl px-[0.35em] py-[0.05em] text-[12vw] font-extrabold uppercase tracking-[-0.03em] sm:text-[8vw] lg:text-[4.6rem] xl:text-[5.2rem]"
          >
            {typedWord}
          </span>

          <p
            className="reveal mt-8 max-w-[560px] text-base leading-relaxed text-steel md:mt-10 md:text-lg"
            style={{ "--d": "650ms" } as CSSProperties}
          >
            Diseñamos, implementamos y protegemos la <span className="text-snow">infraestructura tecnológica</span> que mantiene
            conectadas a las empresas modernas. Y publicamos los <span className="text-snow">proyectos de software y plataformas</span>{" "}
            que construimos dentro del corporativo.
          </p>

          <div className="reveal -mb-4 mt-4 md:-mb-6 md:mt-6" style={{ "--d": "725ms" } as CSSProperties}>
            <img
              src="/assets/zuri-sparkle.png"
              alt=""
              aria-hidden="true"
              className="relative z-10 mx-auto h-44 w-auto drop-shadow-[0_18px_40px_rgba(0,102,255,0.45)] sm:h-52 md:h-60"
            />
          </div>

          <div className="reveal flex flex-col gap-3 sm:flex-row" style={{ "--d": "800ms" } as CSSProperties}>
            <PrimaryButton href="/contacto">Construir mi infraestructura</PrimaryButton>
            <GhostButton href="#servicios">Explorar servicios</GhostButton>
            <GhostButton href="/proyectos">Ver proyectos</GhostButton>
          </div>

          <div
            className="reveal mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-steel md:mt-16"
            style={{ "--d": "950ms" } as CSSProperties}
          >
            {micro.map((m, i) => (
              <span key={m} className="flex items-center gap-3">
                {i > 0 && <span className="text-tech">·</span>}
                <span className="transition-colors hover:text-snow">{m}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* bottom rail */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-steel/70 md:px-10">
          <a href="#problema" className="group flex items-center gap-3 hover:text-snow">
            <span className="relative h-8 w-px overflow-hidden bg-white/10">
              <span className="scan absolute inset-x-0 top-0 h-1/2 bg-volt" />
            </span>
            Scroll
          </a>
          <span className="hidden sm:block">Networking · Servers · Cloud · Security · Observability</span>
          <span>© INFINIHON CORP.</span>
        </div>
      </div>
    </section>
  );
}
