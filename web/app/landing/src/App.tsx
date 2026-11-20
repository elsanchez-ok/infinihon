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
import AboutSection from "./components/AboutSection";
import FAQSection from "./components/FAQSection";
import ContactPage from "./components/ContactPage";
import Footer from "./components/Footer";

export default function App() {
  const isContact = window.location.pathname.replace(/\/+$/, "") === "/contacto";

  useEffect(() => {
    if (!isContact) return;
    document.title = "Contacto — InfiniHon Corp.";
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", "https://infinihon.vercel.app/contacto");
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", "https://infinihon.vercel.app/contacto");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [isContact]);

  if (isContact) {
    return (
      <div className="relative min-h-screen overflow-x-clip bg-obsidian text-snow">
        <Navbar />
        <main>
          <ContactPage />
        </main>
        <Footer />
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
        <AboutSection />
        <FounderSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
