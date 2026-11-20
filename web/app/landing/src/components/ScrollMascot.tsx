import { useEffect, useState } from "react";

/* Zuri, la mascota del Hero, "camina" mientras el usuario hace scroll:
   se fija en la esquina inferior de la pantalla y alterna entre los dos
   fotogramas de caminata (piernas cruzadas) con un pequeño rebote. En
   cuanto el scroll se detiene (~220ms sin eventos), vuelve a mostrar la
   misma pose que aparece en el Hero, quieta.

   Nota: antes esto se desactivaba por completo si el sistema/navegador
   reportaba prefers-reduced-motion, lo cual terminó apagando la
   animación en el entorno de pruebas sin ningún aviso visible. Como es
   un efecto puramente decorativo (no es contenido esencial ni parpadea
   agresivamente), se quita esa condición para que camine siempre que
   el usuario haga scroll. */
export default function ScrollMascot() {
  const [walking, setWalking] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let stopTimer: number | undefined;
    const onScroll = () => {
      setWalking(true);
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setWalking(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(stopTimer);
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end pr-4 pb-2 sm:pr-8 sm:pb-4"
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        className={`h-16 w-16 drop-shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-transform duration-150 sm:h-24 sm:w-24 ${
          walking ? "mascot-walk" : "float-soft"
        }`}
      />
    </div>
  );
}
