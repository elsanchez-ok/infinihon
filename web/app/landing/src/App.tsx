import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSection from "./components/ProblemSection";
import ArchitectureSection from "./components/ArchitectureSection";
import ServicesSection from "./components/ServicesSection";
import ProjectsSection from "./components/ProjectsSection";
import NetworkSection from "./components/NetworkSection";
import CloudSection from "./components/CloudSection";
import MonitoringSection from "./components/MonitoringSection";
import SecuritySection from "./components/SecuritySection";
import TechnologySection from "./components/TechnologySection";
import HondurasSection from "./components/HondurasSection";
import ProcessSection from "./components/ProcessSection";
import FounderSection from "./components/FounderSection";
import AboutTeaser from "./components/AboutTeaser";
import FAQSection from "./components/FAQSection";
import ContactPage from "./components/ContactPage";
import NosotrosPage from "./components/NosotrosPage";
import { TerminosPage, PrivacidadPage, CookiesPage } from "./components/LegalPages";
import Footer from "./components/Footer";
import ScrollMascot from "./components/ScrollMascot";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

/* Páginas estáticas adicionales que este SPA sirve bajo index.html (ver
   rewrites en vercel.json: cada una de estas rutas apunta a /index.html,
   y aquí se decide qué pintar según la URL actual). Cada entrada define
   el <title> y la ruta canónica/OG para esa página. */
const staticPages: Record<string, { title: string; Component: () => JSX.Element }> = {
  "/contacto": { title: "Contacto — InfiniHon Corp.", Component: ContactPage },
  "/nosotros": { title: "Nosotros — InfiniHon Corp.", Component: NosotrosPage },
  "/terminos": { title: "Términos y condiciones — InfiniHon Corp.", Component: TerminosPage },
  "/privacidad": { title: "Política de privacidad — InfiniHon Corp.", Component: PrivacidadPage },
  "/cookies": { title: "Política de cookies — InfiniHon Corp.", Component: CookiesPage },
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const page = staticPages[path];

  // Scroll suave en todo el sitio (rueda, teclado y anclas del menú) —
  // ver hooks/useSmoothScroll.ts para el detalle de cómo funciona.
  useSmoothScroll();

  useEffect(() => {
    if (!page) return;
    document.title = page.title;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `https://infinihon.vercel.app${path}`);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", `https://infinihon.vercel.app${path}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (page) {
    const { Component } = page;
    return (
      <div className="relative min-h-screen overflow-x-clip bg-obsidian text-snow">
        <Navbar />
        <main>
          <Component />
        </main>
        <Footer />
        <ScrollMascot />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-obsidian text-snow">
      <a href="#servicios" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-tech focus:px-4 focus:py-2">
        Saltar a servicios
      </a>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <ArchitectureSection />
        <ServicesSection />
        <ProjectsSection />
        <NetworkSection />
        <CloudSection />
        <MonitoringSection />
        <SecuritySection />
        <TechnologySection />
        <HondurasSection />
        <ProcessSection />
        <AboutTeaser />
        <FounderSection />
        <FAQSection />
      </main>
      <Footer />
      <ScrollMascot />
    </div>
  );
}
