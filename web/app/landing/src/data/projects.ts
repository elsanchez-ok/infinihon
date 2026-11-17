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
  featured?: boolean;
  stats: { label: string; value: string }[];
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  software: "Software & I+D",
  infraestructura: "Infraestructura",
  plataformas: "Plataformas",
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
    featured: true,
    stats: [
      { label: "Memoria @ 20 pestañas", value: "229.1 MB" },
      { label: "Procesos", value: "1 (ghost.exe)" },
      { label: "VS Edge", value: "~10× menos" },
      { label: "Motores", value: "Wisp + WebView2" },
    ],
  },
];
