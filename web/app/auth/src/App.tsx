import { useCallback, useEffect, useState } from "react";
import StoreApp from "./store/StoreApp";
import AuthApp from "./auth/AuthApp";

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    // `to` puede traer query string (p. ej. "/auth/register?redirect=..."). La URL
    // del navegador se actualiza completa, pero el estado de ruta interno solo
    // guarda el path: así la comparación de rutas no se rompe con el query string.
    const current = window.location.pathname + window.location.search;
    if (current !== to) window.history.pushState(null, "", to);
    setPathname(to.split("?")[0]);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return <AuthApp pathname={pathname} navigate={navigate} />;
  }

  return <StoreApp />;
}
