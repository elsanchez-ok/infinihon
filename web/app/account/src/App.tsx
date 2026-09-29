import { useCallback, useEffect, useState } from "react";
import AccountApp from "./account/AccountApp";
import AuthApp from "./auth/AuthApp";
import AdminApp from "./admin/AdminApp";

/**
 * INFINIHON — tres experiencias separadas:
 *   /account   Portal del usuario (su espacio personal)
 *   /auth      Acceso y registro
 *   /admin     Centro de control (administradores)
 * La tienda pública ya no forma parte de la aplicación.
 */
export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (window.location.pathname !== to) window.history.pushState(null, "", to);
    setPathname(to);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // La raíz lleva al espacio del usuario.
  useEffect(() => {
    if (pathname === "/" || pathname === "") {
      window.history.replaceState(null, "", "/account");
      setPathname("/account");
    }
  }, [pathname]);

  if (pathname === "/admin" || pathname === "/admin.html" || pathname.startsWith("/admin/")) {
    return <AdminApp pathname={pathname.replace("/admin.html", "/admin")} navigate={navigate} />;
  }

  if (pathname === "/auth" || pathname === "/auth.html" || pathname.startsWith("/auth/")) {
    return <AuthApp pathname={pathname.replace("/auth.html", "/auth")} navigate={navigate} />;
  }

  return <AccountApp pathname={pathname === "/account.html" ? "/account" : pathname} navigate={navigate} />;
}
