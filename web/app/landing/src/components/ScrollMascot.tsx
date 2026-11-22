import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* Zuri, la mascota del Hero, "camina" mientras el usuario hace scroll,
   trazando una ruta de izquierda a derecha a lo largo de toda la página:
   - `progress` (0 a 100) refleja cuánto se ha scrolleado del documento
     completo y posiciona a Zuri horizontalmente (0% = extremo izquierdo
     al tope de la página, 100% = extremo derecho al llegar al final).
   - Mientras hay scroll activo, alterna entre los dos fotogramas de
     caminata con un pequeño rebote ("mascot-walk").
   - En cuanto el scroll se detiene (~220ms sin eventos), se queda
     completamente quieta (sin rebote) mostrando la misma pose del Hero,
     en la posición horizontal donde se detuvo.

   Nota: se renderiza con un portal directo a document.body. El
   contenedor raíz de la página usa overflow-x-clip (para evitar el
   scroll horizontal del sitio), y aunque Zuri es position:fixed, ese
   overflow-x-clip igual recorta su drop-shadow cuando se acerca a los
   bordes izquierdo/derecho — se veía "estrecharse" de un lado. Al
   montarla fuera de ese contenedor, su sombra ya no se recorta (el
   `body` tampoco debe tener overflow-x:hidden/clip propio, o volvería a
   recortarla pese al portal — ver index.css). */
const WALK_FRAME_MS = 170;
const WALK_STOP_DELAY_MS = 220;

function ScrollMascotOverlay() {
  const [walking, setWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const lastScrollRef = useRef(0);
  const walkStartRef = useRef<number | null>(null);
  const rafLoopRef = useRef<number | null>(null);

  // Precarga los tres fotogramas (reposo + 2 de caminata): sin esto, la
  // primera vez que se scrollea en la sesión el navegador recién empieza
  // a descargar zuri-walk-1/2.webp en ese instante, así que el primer
  // cambio de pose puede tardar en pintarse (se veía como si "no
  // caminara": la posición ya se movió, pero la imagen tarda en
  // cambiar). Al precargarlas apenas monta, ya están en caché del
  // navegador antes de que el usuario llegue a tocar el scroll.
  useEffect(() => {
    for (const src of ["/assets/mascot-hero.png", "/assets/zuri-walk-1.webp", "/assets/zuri-walk-2.webp"]) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setProgress(pct);
    };
    updateProgress();

    const onScroll = () => {
      lastScrollRef.current = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);

    // Un único bucle de rAF decide, en cada fotograma, si seguimos "en
    // caminata" (hubo scroll hace menos de WALK_STOP_DELAY_MS) y qué pose
    // corresponde mostrar, calculando el fotograma a partir del tiempo
    // real transcurrido desde que empezó a caminar (walkStartRef), en vez
    // de depender de un setInterval que solo arrancaba *después* de que
    // el estado "walking" ya se había confirmado en React. Con ese
    // setInterval, un scroll corto (el primer scroll de la página, un
    // solo golpe de rueda) podía terminar —se detenía a los 220ms— antes
    // de que el intervalo llegara a dispararse ni una vez: la pose pasaba
    // de reposo a "caminando" una sola vez y volvía a reposo sin alternar
    // nunca entre los dos fotogramas de caminata — se veía como "se mueve
    // pero no camina". Calculando el fotograma por tiempo transcurrido,
    // la alternancia es inmediata y no depende de que un timer alcance a
    // dispararse primero.
    const tick = () => {
      const now = performance.now();
      const isWalking = now - lastScrollRef.current < WALK_STOP_DELAY_MS;
      if (isWalking) {
        if (walkStartRef.current == null) walkStartRef.current = now;
        const elapsed = now - walkStartRef.current;
        const nextFrame = Math.floor(elapsed / WALK_FRAME_MS) % 2;
        setFrame((f) => (f === nextFrame ? f : nextFrame));
      } else {
        walkStartRef.current = null;
      }
      setWalking((w) => (w === isWalking ? w : isWalking));
      updateProgress();
      rafLoopRef.current = requestAnimationFrame(tick);
    };
    rafLoopRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
      if (rafLoopRef.current != null) cancelAnimationFrame(rafLoopRef.current);
    };
  }, []);

  const src = walking ? (frame === 0 ? "/assets/zuri-walk-1.webp" : "/assets/zuri-walk-2.webp") : "/assets/mascot-hero.png";

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-2 z-40 sm:inset-x-8 sm:bottom-4"
      aria-hidden="true"
    >
      {/* El truco left:pct% + translateX(-pct%) interpola la posición del
          elemento entre el borde izquierdo y el derecho del contenedor sin
          importar su propio ancho. Va en un div aparte del <img> para que
          esta transformación no choque con la animación de rebote
          (mascot-walk), que también anima `transform` pero en el <img>. */}
      <div className="absolute bottom-0" style={{ left: `${progress}%`, transform: `translateX(-${progress}%)` }}>
        {/* Las imágenes de caminata (zuri-walk-1/2.webp) son una pose de
            perfil donde el personaje ocupa ~53% del ancho de su lienzo,
            mientras que la pose de reposo (mascot-hero.png) ocupa ~61%.
            Es una diferencia real entre los archivos de arte, no un
            recorte por CSS: sin corrección, Zuri se ve "más angosta" cada
            vez que empieza a caminar (es decir, en cada scroll). Se
            compensa con un escalado horizontal fijo solo mientras camina,
            en un div propio para no chocar con la animación de rebote
            (mascot-walk) que anima `transform` en el <img>. */}
        <div style={walking ? { transform: "scaleX(1.14)" } : undefined}>
          <img
            src={src}
            alt=""
            className={`h-16 w-16 drop-shadow-[0_12px_28px_rgba(0,102,255,0.45)] sm:h-24 sm:w-24 ${
              walking ? "mascot-walk" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default function ScrollMascot() {
  return createPortal(<ScrollMascotOverlay />, document.body);
}
