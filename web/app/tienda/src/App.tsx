import { useEffect, useState } from "react";
import Store from "./pages/Store";
import Corporate from "./pages/Corporate";

/** Clean-route router: `/tienda/…` → tienda · `/tienda/sitio` → landing corporativa. */
function useIsCorporate() {
  const [corp, setCorp] = useState(() => window.location.pathname === "/tienda/sitio");
  useEffect(() => {
    const fn = () => setCorp(window.location.pathname === "/tienda/sitio");
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);
  return corp;
}

export default function App() {
  const corp = useIsCorporate();
  // el catálogo remoto (Supabase) llega después del primer render:
  // este listener re-monta la tienda con los datos frescos
  const [rev, setRev] = useState(0);
  useEffect(() => {
    const fn = () => setRev((r) => r + 1);
    window.addEventListener("infinihon:catalog", fn);
    return () => window.removeEventListener("infinihon:catalog", fn);
  }, []);

  // keep scroll position coherent on route swap
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [corp]);

  return corp ? <Corporate /> : <Store key={rev} />;
}
