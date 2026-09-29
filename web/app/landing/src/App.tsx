import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSection from "./components/ProblemSection";
import ArchitectureSection from "./components/ArchitectureSection";
import ServicesSection from "./components/ServicesSection";
import NetworkSection from "./components/NetworkSection";
import CloudSection from "./components/CloudSection";
import MonitoringSection from "./components/MonitoringSection";
import SecuritySection from "./components/SecuritySection";
import TechnologySection from "./components/TechnologySection";
import HondurasSection from "./components/HondurasSection";
import ProcessSection from "./components/ProcessSection";
import AboutSection from "./components/AboutSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function App() {
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
    </div>
  );
}
