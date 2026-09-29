import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode, type MouseEvent,
} from "react";
import { bySlug, type Product } from "./catalog";

/* ------------------------------------------------------------------ router */

/** Store base path: served as a single page under /tienda (clean routes, no hashes). */
const BASE = "/tienda";
const stripBase = (p: string) => {
  if (p.endsWith("/tienda.html")) return "/"; // archivo estático abierto directo (local/preview)
  if (p === BASE) return "/";
  if (p.startsWith(BASE + "/")) return p.slice(BASE.length);
  return p;
};

/**
 * Route shape is `/segment?query` read from the pathname (after the /tienda base).
 * Back/forward navigation is handled via popstate; pushState on navigate().
 */
const parse = () => {
  const raw = stripBase(window.location.pathname) || "/";
  const [p, q = ""] = raw.split("?");
  return { segments: p.split("/").filter(Boolean), query: new URLSearchParams(q), raw: p.startsWith("/") ? p : "/" };
};

interface RouteInfo { segments: string[]; query: URLSearchParams; raw: string }

export function navigate(to: string) {
  const target = `${BASE}${to === "/" ? "" : to}`;
  if (window.location.pathname !== target) window.history.pushState(null, "", target);
  window.scrollTo({ top: 0, behavior: "auto" });
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function Link({
  to, children, className, onClick, ...rest
}: { to: string; children: ReactNode; className?: string; onClick?: () => void } & Record<string, unknown>) {
  const handle = (e: MouseEvent) => {
    e.preventDefault();
    onClick?.();
    navigate(to);
  };
  return (
    <a href={`${BASE}${to === "/" ? "" : to}`} onClick={handle} className={className} {...rest}>
      {children}
    </a>
  );
}

/* --------------------------------------------------------------- app state */

interface CartLine { slug: string; qty: number }
interface Toast { id: number; title: string; note?: string; kind: "cart" | "info" }

interface Store {
  route: RouteInfo;
  cart: CartLine[];
  cartCount: number;
  cartLines: { product: Product; qty: number }[];
  subtotal: number | null;
  add: (slug: string, qty?: number, from?: DOMRect | null) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  drawer: boolean;
  setDrawer: (v: boolean) => void;
  compare: string[];
  toggleCompare: (slug: string) => void;
  clearCompare: () => void;
  toasts: Toast[];
  notify: (title: string, note?: string, kind?: Toast["kind"]) => void;
  demoNotice: boolean;
  setDemoNotice: (v: boolean) => void;
  search: boolean;
  setSearch: (v: boolean) => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
};

/** Flying dot animation from a clicked element to the cart icon. */
function flyToCart(from?: DOMRect | null) {
  if (!from) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("cart-anchor");
  if (!target) return;
  const to = target.getBoundingClientRect();
  const el = document.createElement("div");
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  el.style.cssText = `position:fixed;left:${from.left + from.width / 2 - 5}px;top:${from.top + from.height / 2 - 5}px;width:10px;height:10px;border-radius:9999px;background:#00A8FF;box-shadow:0 0 14px 3px rgba(0,168,255,.55);z-index:120;pointer-events:none;transition:transform .55s cubic-bezier(.4,0,.2,1),opacity .55s ease;`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = `translate(${dx}px,${dy}px) scale(.35)`;
    el.style.opacity = "0.2";
  });
  setTimeout(() => el.remove(), 620);
}

/** Clave de persistencia del carrito entre recargas y sesiones del navegador. */
const CART_KEY = "infinihon.cart.v1";

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is CartLine => Boolean(l) && typeof l === "object" && typeof (l as CartLine).slug === "string" && (l as CartLine).slug !== "")
      .map((l) => ({ slug: l.slug, qty: Math.min(99, Math.max(1, Number(l.qty) || 1)) }));
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteInfo>(parse);
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [drawer, setDrawer] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [search, setSearch] = useState(false);
  const [demoNotice, setDemoNotice] = useState(true);
  const tid = useRef(0);

  /* El carrito sobrevive recargas, enlaces directos y aperturas en otra pestaña. */
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* almacenamiento bloqueado: el carrito sigue funcionando en memoria */
    }
  }, [cart]);

  useEffect(() => {
    const fn = () => setRoute(parse());
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer || search ? "hidden" : "";
  }, [drawer, search]);

  const notify = useCallback((title: string, note?: string, kind: Toast["kind"] = "info") => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, title, note, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const add = useCallback((slug: string, qty = 1, from?: DOMRect | null) => {
    flyToCart(from);
    setCart((c) => {
      const i = c.findIndex((l) => l.slug === slug);
      if (i === -1) return [...c, { slug, qty }];
      const n = [...c];
      n[i] = { slug, qty: n[i].qty + qty };
      return n;
    });
    const p = bySlug(slug);
    if (p?.status === "soon") {
      notify("Añadido a la lista de interés", "Este producto está en fase de definición: te contactaremos para confirmar.", "info");
    } else {
      notify("Añadido al carrito", p?.name, "cart");
    }
  }, [notify]);

  const setQty = useCallback((slug: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.slug !== slug) : c.map((l) => (l.slug === slug ? { ...l, qty } : l))));
  }, []);

  const remove = useCallback((slug: string) => setCart((c) => c.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setCart([]), []);

  const toggleCompare = useCallback((slug: string) => {
    setCompare((c) => {
      if (c.includes(slug)) return c.filter((s) => s !== slug);
      if (c.length >= 4) {
        notify("Comparación llena", "Puedes comparar hasta 4 productos a la vez.");
        return c;
      }
      return [...c, slug];
    });
  }, [notify]);

  const cartLines = useMemo(
    () => cart.map((l) => ({ product: bySlug(l.slug)!, qty: l.qty })).filter((l) => l.product),
    [cart]
  );
  const cartCount = cartLines.reduce((a, l) => a + l.qty, 0);
  const subtotal = useMemo(() => {
    if (!cartLines.length) return null;
    return cartLines.some((l) => l.product.price === null) ? null : cartLines.reduce((a, l) => a + (l.product.price ?? 0) * l.qty, 0);
  }, [cartLines]);

  const value: Store = {
    route, cart, cartCount, cartLines, subtotal, add, setQty, remove, clear,
    drawer, setDrawer, compare, toggleCompare, clearCompare: () => setCompare([]),
    toasts, notify, demoNotice, setDemoNotice, search, setSearch,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
