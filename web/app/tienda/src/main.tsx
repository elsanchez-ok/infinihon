import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { loadRemoteCatalog } from "./store/catalog";

// Catálogo real desde Supabase en segundo plano (si falla, queda el catálogo local).
void loadRemoteCatalog();

// Compatibilidad: los enlaces antiguos usaban rutas hash (#/catalogo, #/sitio…).
// Se reescriben una vez a rutas limpias /tienda/… y el router pathname toma el control.
(() => {
  const h = window.location.hash;
  if (!h.startsWith("#/")) return;
  const rest = h.slice(2);
  window.location.replace(rest === "sitio" ? "/tienda/sitio" : `/tienda/${rest}`);
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
