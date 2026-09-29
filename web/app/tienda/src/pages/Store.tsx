import { StoreProvider, useStore } from "../store/app";
import { CartDrawer, FloatingBars, SearchOverlay, StoreFooter, StoreNavbar, Toaster } from "../components/store/chrome";
import { AlsoViewed, BundlesSection, CategoryGrid, FeaturedProducts, HondurasStore, SolutionsSection, StoreHero, SupportSection, TechInsights, TrustSection } from "../components/store/home";
import CatalogPage from "../components/store/CatalogPage";
import ProductPage from "../components/store/ProductPage";
import { CartPage, CheckoutPage, ComparePage } from "../components/store/CartCheckout";
import { ServicesPage, SolutionsPage, SupportPage } from "../components/store/InfoPages";
import {
  ContactoPage,
  EnviosPage,
  FaqPage,
  GarantiasPage,
  InsightPage,
  InsightsIndexPage,
  NosotrosPage,
  PagosPage,
  PrivacidadPage,
  SeguimientoPage,
  SolicitudesPage,
  TerminosPage,
} from "../components/store/LegalPages";


function StoreHome() {
  return (
    <>
      <StoreHero />
      <CategoryGrid />
      <FeaturedProducts />
      <SolutionsSection />
      <BundlesSection />
      <HondurasStore />
      <SupportSection />
      <AlsoViewed />
      <TrustSection />
      <TechInsights />
    </>
  );
}

function NotFound({ path }: { path: string }) {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-24 md:px-8">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-volt">Error 404</div>
      <h1 className="mt-6 text-[12vw] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-snow sm:text-6xl lg:text-[5rem]">
        Ruta no encontrada.
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-steel">
        La dirección <span className="font-mono text-snow">{path}</span> no existe en la tienda. Puede que el enlace haya cambiado.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href="/tienda" className="bg-tech px-6 py-4 text-center text-sm font-semibold text-snow hover:bg-[#1a75ff]">Ir a la tienda</a>
        <a href="/tienda/soporte" className="border border-white/15 px-6 py-4 text-center text-sm font-semibold hover:border-volt/60">Contactar soporte</a>
      </div>
    </div>
  );
}

function Router() {
  const { route } = useStore();
  const [a, b] = route.segments;

  if (!a) return <StoreHome />;
  if (a === "catalogo") return <CatalogPage />;
  if (a === "producto" && b) return <ProductPage slug={b} />;
  if (a === "carrito") return <CartPage />;
  if (a === "checkout") return <CheckoutPage />;
  if (a === "comparar") return <ComparePage />;
  if (a === "servicios") return <ServicesPage />;
  if (a === "soluciones") return <SolutionsPage />;
  if (a === "soporte") return <SupportPage />;
  // Páginas estáticas: legales, compra, empresa y cuenta
  if (a === "terminos") return <TerminosPage />;
  if (a === "privacidad") return <PrivacidadPage />;
  if (a === "garantias") return <GarantiasPage />;
  if (a === "envios") return <EnviosPage />;
  if (a === "pagos") return <PagosPage />;
  if (a === "faq") return <FaqPage />;
  if (a === "nosotros") return <NosotrosPage />;
  if (a === "contacto") return <ContactoPage />;
  if (a === "solicitudes") return <SolicitudesPage />;
  if (a === "seguimiento") return <SeguimientoPage />;
  if (a === "insights") return b ? <InsightPage slug={b} /> : <InsightsIndexPage />;
  return <NotFound path={route.raw} />;
}

export default function Store() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-obsidian text-snow">
        <StoreNavbar />
        <main id="top">
          <Router />
        </main>
        <StoreFooter />
        <CartDrawer />
        <SearchOverlay />
        <FloatingBars />
        <Toaster />
      </div>
    </StoreProvider>
  );
}
