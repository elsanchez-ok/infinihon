import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "../utils/cn";
import type { CartLine, CatalogProduct, ProductCategory } from "./data";
import { StoreNavbar } from "./StoreNavbar";
import { CartDrawer, CheckoutOverlay, CompareOverlay, ContactOverlay, ProductDetail, SearchOverlay } from "./StoreOverlays";
import { CategoryGrid, FeaturedProducts, HondurasAndTrust, InfrastructureBundles, Insights, Solutions, StoreFooter, StoreHero, Support } from "./StoreSections";

type Flight = { x: number; y: number; id: number } | null;

export default function StoreApp() {
  useEffect(() => {
    document.title = "INFINIHON Store — Tecnología e infraestructura";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "INFINIHON Store — tecnología, infraestructura y servicios para construir lo que sigue.",
    );
  }, []);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [detail, setDetail] = useState<CatalogProduct | null>(null);
  const [compare, setCompare] = useState<CatalogProduct[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [category, setCategory] = useState<ProductCategory | "Todo">("Todo");
  const [notice, setNotice] = useState("");
  const [flight, setFlight] = useState<Flight>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3500);
  };
  const addToCart = (product: CatalogProduct, origin?: HTMLElement) => {
    setCart((current) => {
      const line = current.find((item) => item.product.id === product.id);
      return line ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }];
    });
    if (origin) {
      const r = origin.getBoundingClientRect();
      const item = { x: r.left + r.width / 2, y: r.top + r.height / 2, id: Date.now() };
      setFlight(item);
      window.setTimeout(() => setFlight(null), 720);
    }
    showNotice(`${product.name} se añadió al carrito de consulta.`);
  };
  const changeQty = (id: string, quantity: number) => setCart((current) => quantity <= 0 ? current.filter((x) => x.product.id !== id) : current.map((x) => x.product.id === id ? { ...x, quantity } : x));
  const removeLine = (id: string) => setCart((current) => current.filter((x) => x.product.id !== id));
  const toggleCompare = (product: CatalogProduct) => {
    setCompare((current) => {
      if (current.some((x) => x.id === product.id)) return current.filter((x) => x.id !== product.id);
      if (current.length >= 3) { showNotice("Puedes comparar hasta 3 referencias a la vez."); return current; }
      return [...current, product];
    });
  };
  const openCategory = (cat: ProductCategory) => {
    setCategory(cat);
    window.setTimeout(() => document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };
  const openContact = () => {
    setDetail(null);
    setSearchOpen(false);
    setContactOpen(true);
  };
  return (
    <div className="min-h-screen overflow-x-clip bg-obsidian text-snow">
      <a href="#tienda" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-tech focus:px-4 focus:py-2">Saltar a productos</a>
      <StoreNavbar cartCount={cartCount} onSearch={() => setSearchOpen(true)} onCart={() => setCartOpen(true)} />
      <main>
        <StoreHero />
        <CategoryGrid onCategory={openCategory} />
        <FeaturedProducts onOpen={setDetail} onAdd={addToCart} compared={compare} onCompare={toggleCompare} selectedCategory={category} onSelectCategory={setCategory} />
        <Solutions onContact={openContact} />
        <InfrastructureBundles onContact={openContact} />
        <Support onContact={openContact} />
        <HondurasAndTrust />
        <Insights />
      </main>
      <StoreFooter />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onChangeQty={changeQty} onRemove={removeLine} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onOpenProduct={setDetail} onContact={openContact} />}
      {detail && <ProductDetail product={detail} onClose={() => setDetail(null)} onAdd={addToCart} onContact={openContact} />}
      {checkoutOpen && <CheckoutOverlay items={cart} onClose={() => setCheckoutOpen(false)} onDone={() => showNotice("Solicitud demostrativa preparada. No se procesó ningún pago.")} />}
      {compareOpen && <CompareOverlay items={compare} onClose={() => setCompareOpen(false)} onOpenProduct={setDetail} />}
      {contactOpen && <ContactOverlay onClose={() => setContactOpen(false)} />}

      <div aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 border border-volt/50 bg-ink px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,.45)] transition-all duration-300", notice ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0 pointer-events-none")}>
        <span className="mr-2 text-volt">●</span>{notice}
      </div>
      {flight && <span key={flight.id} className="cart-flight fixed z-[120] h-3 w-3 rounded-full bg-volt shadow-[0_0_14px_#00A8FF]" style={{ left: flight.x, top: flight.y, "--from-x": `${flight.x}px`, "--from-y": `${flight.y}px` } as CSSProperties} aria-hidden />}
      {compare.length > 0 && <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center justify-between gap-4 border border-tech/60 bg-ink/95 p-3 shadow-2xl backdrop-blur-xl md:bottom-5"><div className="min-w-0"><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">Comparación</div><div className="truncate text-sm font-semibold">{compare.length} referencia{compare.length > 1 ? "s" : ""} seleccionada{compare.length > 1 ? "s" : ""}</div></div><div className="flex shrink-0 gap-2"><button onClick={() => setCompare([])} className="px-3 text-xs text-steel hover:text-snow">Limpiar</button><button onClick={() => setCompareOpen(true)} className="bg-tech px-4 py-2.5 text-xs font-semibold">Comparar →</button></div></div>}
    </div>
  );
}