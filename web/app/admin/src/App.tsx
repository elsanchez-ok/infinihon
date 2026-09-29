import { useCallback, useEffect, useState } from "react";
import StoreApp from "./store/StoreApp";
import AuthApp from "./auth/AuthApp";
import AdminApp from "./admin/AdminApp";

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
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  if (pathname === "/admin" || pathname === "/admin.html" || pathname.startsWith("/admin/")) {
    return <AdminApp pathname={pathname.replace("/admin.html", "/admin")} navigate={navigate} />;
  }

  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return <AuthApp pathname={pathname} navigate={navigate} />;
  }

  return <StoreApp />;
}
