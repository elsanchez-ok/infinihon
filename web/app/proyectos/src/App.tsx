import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Catalog from "./pages/Catalog";
import GhostBrowser from "./pages/GhostBrowser";

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isGhost = path.startsWith("/ghost-browser");

  useEffect(() => {
    document.title = isGhost ? "Ghost Browser — InfiniHon Corp." : "Proyectos — InfiniHon Corp.";
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [isGhost]);

  return (
    <>
      <Navbar />
      {isGhost ? <GhostBrowser /> : <Catalog />}
      <Footer />
    </>
  );
}
