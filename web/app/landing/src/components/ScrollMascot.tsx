import { useEffect, useRef, useState } from "react";

/* Zuri, la mascota del Hero, "camina" mientras el usuario hace scroll,
   trazando una ruta de izquierda a derecha a lo largo de toda la página:
   - `progress` (0 a 100) refleja cuánto se ha scrolleado del documento
     completo y posiciona a Zuri horizontalmente (0% = extremo izquierdo
     al tope de la página, 100% = extremo derecho al llegar al final).
   - Mientras hay scroll activo, alterna entre los dos fotogramas de
     caminata con un pequeño rebote ("mascot-walk").
   - En cuanto el scroll se detiene (~220ms sin eventos), se queda
     completamente quieta (sin rebote) mostrando la misma pose del Hero,
     en la posición horizontal donde se detuvo. */
export default function ScrollMascot() {
  const [walking, setWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setProgress(pct);
    };
    updateProgress();

    let stopTimer: number | undefined;
    const onScroll = () => {
      setWalking(true);
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setWalking(false), 220);
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          updateProgress();
          rafRef.current = null;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
      window.clearTimeout(stopTimer);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!walking) return;
    const id = window.setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 170);
    return () => window.clearInterval(id);
  }, [walking]);

  const src = walking ? (frame === 0 ? "/assets/zuri-walk-1.webp" : "/assets/zuri-walk-2.webp") : "/assets/mascot-hero.png";

  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-2 z-40 sm:inset-x-6 sm:bottom-4"
      aria-hidden="true"
    >
      {/* El truco left:pct% + translateX(-pct%) interpola la posición del
          elemento entre el borde izquierdo y el derecho del contenedor sin
          importar su propio ancho. Va en un div aparte del <img> para que
          esta transformación no choque con la animación de rebote
          (mascot-walk), que también anima `transform` pero en el <img>. */}
      <div className="absolute bottom-0" style={{ left: `${progress}%`, transform: `translateX(-${progress}%)` }}>
        <img
          src={src}
          alt=""
          className={`h-16 w-16 drop-shadow-[0_12px_28px_rgba(0,102,255,0.45)] sm:h-24 sm:w-24 ${
            walking ? "mascot-walk" : ""
          }`}
        />
      </div>
    </div>
  );
}
