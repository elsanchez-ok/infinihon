import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProblemSection from "../components/ProblemSection";
import ArchitectureSection from "../components/ArchitectureSection";
import ServicesSection from "../components/ServicesSection";
import NetworkSection from "../components/NetworkSection";
import CloudSection from "../components/CloudSection";
import MonitoringSection from "../components/MonitoringSection";
import SecuritySection from "../components/SecuritySection";
import TechnologySection from "../components/TechnologySection";
import HondurasSection from "../components/HondurasSection";
import ProcessSection from "../components/ProcessSection";
import AboutSection from "../components/AboutSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

/** Thin bridge between the corporate site and the store. */
function StoreBridge() {
  return (
    <div className="fixed bottom-0 left-0 z-40 hidden md:block">
      <a
        href="/tienda"
        className="group flex items-center gap-3 border-r border-t border-white/[0.08] bg-obsidian/85 px-5 py-3 backdrop-blur-md transition-colors hover:border-tech/60"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-volt pulse-soft" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel transition-colors group-hover:text-snow">
          Infinihon Store
        </span>
        <span className="font-mono text-[11px] text-volt">→</span>
      </a>
    </div>
  );
}

export default function Corporate() {
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
        <NetworkSection />
        <CloudSection />
        <MonitoringSection />
        <SecuritySection />
        <TechnologySection />
        <HondurasSection />
        <ProcessSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
      <StoreBridge />
    </div>
  );
}
