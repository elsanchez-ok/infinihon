export type ProjectCategory = "software" | "infraestructura" | "plataformas";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  status: "En desarrollo" | "Beta" | "Activo";
  stack: string[];
  links: { demo?: string; repo?: string };
  download?: { url: string; file: string; meta: string; checksum: string };
  featured?: boolean;
  stats: { label: string; value: string }[];
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  software: "Software & I+D",
  infraestructura: "Infraestructura",
  plataformas: "Plataformas",
};

export const ghostDownload = {
  url: "https://github.com/sarch-codelab/ghost-browser/releases/download/v0.1.0/GhostSetup.exe",
  file: "GhostSetup.exe",
  meta: "v0.1.0 · Windows x64 · 10.3 MB",
  checksum: "sha256:5cda40822f78045751b444c65a16b3608e3c07d850b01430c54c266efe53376b",
};

export const projects: Project[] = [
  {
    slug: "ghost-browser",
    name: "Ghost Browser",
    tagline: "Navegador de escritorio ligero, hecho con Rust y WebView2.",
    description:
      "Navegador de escritorio ligero con arquitectura híbrida: motor propio Wisp para páginas documentales en un solo proceso y WebView2 (Chromium) bajo demanda para aplicaciones web complejas, con suspensión automática de pestañas.",
    category: "software",
    status: "En desarrollo",
    stack: ["Rust 2024", "egui", "wgpu", "Wisp Engine", "WebView2", "Taffy", "Boa JS"],
    links: {
      demo: "/ghost-browser",
      repo: "https://github.com/sarch-codelab/ghost-browser",
    },
    download: ghostDownload,
    featured: true,
    stats: [
      { label: "Memoria @ 20 pestañas", value: "229.1 MB" },
      { label: "Procesos", value: "1 (ghost.exe)" },
      { label: "VS Edge", value: "~10× menos" },
      { label: "Motores", value: "Wisp + WebView2" },
    ],
  },
];

export const benchmark = {
  description:
    "Medición real de memoria RAM, reproducible con ram_bench.ps1 (Windows, build --release): N pestañas de artículos de Wikipedia tras 35 s de carga, midiendo el árbol completo de procesos.",
  columns: ["Pestañas", "Ghost + Wisp", "Ghost + WV2", "Edge"],
  rows: [
    { tabs: 1, wisp: "140.9 / 135.4", wv2: "476.3 / 298.8", edge: "1131.2 / 649.4" },
    { tabs: 5, wisp: "141.7 / 143.6", wv2: "763.0 / 480.3", edge: "1068.9 / 552.5" },
    { tabs: 10, wisp: "151.9 / 154.3", wv2: "1100.3 / 704.9", edge: "1471.3 / 760.8" },
    { tabs: 20, wisp: "229.1 / 231.5", wv2: "2641.0 / 1937.2", edge: "2398.8 / 1319.5" },
  ] as const,
  note: "Comparación deliberadamente conservadora con artículos de Wikipedia. En webs pesadas en JS o video la brecha es aún mayor porque Wisp no levanta procesos ni GPU de Chromium.",
};

export const shortcuts: [string, string][] = [
  ["Ctrl+T", "Abrir una pestaña"],
  ["Ctrl+W", "Cerrar la pestaña actual"],
  ["Ctrl+Shift+T", "Reabrir la última pestaña cerrada"],
  ["Ctrl+L", "Enfocar la barra de direcciones"],
  ["Ctrl+R / F5", "Recargar la página"],
  ["Alt+← / Alt+→", "Atrás / adelante"],
  ["Ctrl+Tab / Ctrl+Shift+Tab", "Pestaña siguiente / anterior"],
  ["Ctrl+D", "Añadir o quitar un marcador"],
  ["Ctrl+B", "Abrir marcadores"],
  ["Ctrl+H", "Abrir historial"],
  ["Ctrl++ / Ctrl+- / Ctrl+0", "Aumentar / reducir / restablecer zoom"],
  ["Ctrl+P", "Imprimir"],
  ["F12", "Abrir herramientas de desarrollo"],
  ["Ctrl+Shift+W", "Cambiar el motor de la pestaña (Wisp ↔ WebView2)"],
];
