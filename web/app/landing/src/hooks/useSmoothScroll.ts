import { useEffect } from "react";

/**
 * Scroll suave "desde cero" (sin librerías) para todo el sitio, estilo
 * Apple/Lenis: en vez de que la página salte a cada "notch" de la rueda del
 * mouse, acumulamos un scroll "objetivo" y lo perseguimos cuadro a cuadro
 * con un lerp (interpolación lineal), aplicándolo con el `window.scrollTo`
 * real del documento — así el resto del sitio (position:sticky en
 * ProcessSection/ProblemSection, el IntersectionObserver de los
 * scroll-reveal, el progreso de ScrollMascot) sigue funcionando exactamente
 * igual, porque siguen leyendo el scroll real del navegador, no uno
 * simulado con transforms.
 *
 * - Rueda del mouse / trackpad: se intercepta y se suaviza.
 * - Teclado (flechas, Page Up/Down, Space, Home/End): también se suaviza,
 *   para que no sea la única forma de scroll que salta de golpe.
 * - Barra de scroll (arrastre) y scroll táctil (móvil/tablet): se dejan
 *   nativos — ya son fluidos por sí mismos, y re-implementarlos a mano
 *   casi siempre se siente peor que el comportamiento nativo del sistema.
 * - Clicks en enlaces ancla (`#seccion` o `/#seccion`, como los del menú)
 *   también usan este mismo motor para deslizarse en vez de saltar.
 * - Si el gesto es mayormente horizontal (p. ej. la tira de tarjetas con
 *   scroll horizontal en móvil), se deja pasar sin tocarlo.
 */

const EASE = 0.1;
const KEY_STEP = 90;
const SETTLE_THRESHOLD = 0.4;

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    // En táctil/coarse pointer (móvil, tablet) el scroll nativo ya es
    // suave e inercial: no lo tocamos, solo generaría jank.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let current = window.scrollY;
    let target = window.scrollY;
    let rafId = 0;
    let animating = false;
    let selfScrolling = false;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamp = (v: number) => Math.min(Math.max(v, 0), maxScroll());

    const applyScroll = (v: number) => {
      selfScrolling = true;
      // "auto" (no "smooth") es importante: el CSS global tiene
      // `scroll-behavior: smooth`, y si no lo sobreescribimos aquí el
      // navegador intenta animar CADA llamada por su cuenta además de
      // nuestro propio lerp cuadro a cuadro — dos animaciones peleando por
      // la misma posición, lo que se siente como "piques"/tirones.
      window.scrollTo({ top: v, left: 0, behavior: "auto" });
      // El navegador despacha el evento "scroll" antes del próximo frame de
      // animación; soltamos la bandera ahí para no reaccionar a nuestro
      // propio salto, pero sí a cualquier scroll externo (barra, teclado
      // del sistema, etc.) que ocurra después.
      requestAnimationFrame(() => { selfScrolling = false; });
    };

    const tick = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < SETTLE_THRESHOLD) {
        current = target;
        applyScroll(current);
        animating = false;
        return;
      }
      applyScroll(current);
      rafId = requestAnimationFrame(tick);
    };

    const startTicking = () => {
      if (!animating) {
        animating = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Gesto mayormente horizontal (tiras con scroll-x) → dejarlo nativo.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // Escape hatch para cualquier contenedor que necesite su propio scroll interno.
      if ((e.target as HTMLElement)?.closest?.("[data-scroll-ignore]")) return;

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 18; // líneas → px aprox.
      else if (e.deltaMode === 2) delta *= window.innerHeight; // páginas → px.

      e.preventDefault();
      target = clamp(target + delta);
      startTicking();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || el?.isContentEditable) return;
      if (el?.closest?.("[data-scroll-ignore]")) return;

      let delta = 0;
      switch (e.key) {
        case "ArrowDown": delta = KEY_STEP; break;
        case "ArrowUp": delta = -KEY_STEP; break;
        case "PageDown": delta = window.innerHeight * 0.9; break;
        case "PageUp": delta = -window.innerHeight * 0.9; break;
        case " ": delta = e.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9; break;
        case "Home":
          e.preventDefault();
          target = 0;
          startTicking();
          return;
        case "End":
          e.preventDefault();
          target = maxScroll();
          startTicking();
          return;
        default:
          return;
      }
      e.preventDefault();
      target = clamp(target + delta);
      startTicking();
    };

    // Si el scroll cambió por algo que no fuimos nosotros (arrastre de la
    // barra, scrollIntoView de otro componente, etc.), resincronizamos al
    // instante en vez de "perseguirlo" desde el valor viejo.
    const onScroll = () => {
      if (selfScrolling || animating) return;
      current = window.scrollY;
      target = window.scrollY;
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const hashIdx = href.indexOf("#");
      if (hashIdx === -1) return;
      const path = href.slice(0, hashIdx) || "/";
      // Solo interceptamos anclas que apuntan a la página actual.
      if (path !== "/" && path !== window.location.pathname) return;
      const hash = href.slice(hashIdx + 1);
      if (!hash) return;
      const el = document.getElementById(hash);
      if (!el) return;
      e.preventDefault();
      target = clamp(el.getBoundingClientRect().top + window.scrollY - 24);
      startTicking();
      history.pushState(null, "", `#${hash}`);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);
}
