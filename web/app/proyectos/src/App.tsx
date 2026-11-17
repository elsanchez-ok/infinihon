import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Catalog from "./pages/Catalog";
import GhostBrowser from "./pages/GhostBrowser";

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isGhost = path.startsWith("/ghost-browser");

  useEffect(() => {
    const canonicalUrl = isGhost
      ? "https://infinihon.vercel.app/ghost-browser"
      : "https://infinihon.vercel.app/proyectos";
    document.title = isGhost ? "Ghost Browser — InfiniHon Corp." : "Proyectos — InfiniHon Corp.";
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
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
