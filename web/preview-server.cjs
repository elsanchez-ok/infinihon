#!/usr/bin/env node
/*
 * Servidor estático mínimo (sin dependencias) para la VISTA PREVIA local.
 * Replica las reglas de ../vercel.json (rewrites + 404.html) para que lo
 * que se ve en la vista previa coincida con el comportamiento real en
 * producción (Vercel). `npx serve` por sí solo ignora vercel.json y
 * devuelve un 404 genérico del navegador para rutas como /tienda,
 * /contacto, /terminos, etc. — lo cual parecía "la página 404 rota".
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;

const rewrites = JSON.parse(fs.readFileSync(path.join(ROOT, "..", "vercel.json"), "utf8")).rewrites.map((r) => ({
  regex: new RegExp(`^${r.source.replace(/:path\*/g, "(.*)")}$`),
  destination: r.destination,
}));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function send(res, status, filePath) {
  const ext = path.extname(filePath);
  res.writeHead(status, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function resolveDestination(pathname) {
  for (const { regex, destination } of rewrites) {
    const m = pathname.match(regex);
    if (m) return destination.replace(/\$(\d+)/g, (_, i) => m[Number(i)] ?? "");
  }
  return null;
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || "/").split("?")[0]);

  // 1) ¿Coincide con una regla de vercel.json? (tienda, auth, admin, account,
  //    member, proyectos, assets, fonts, contacto, terminos, privacidad, cookies, "/")
  const dest = resolveDestination(pathname);
  if (dest) {
    const file = path.join(ROOT, dest);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, 200, file);
  }

  // 2) ¿Es un archivo estático real (favicon, robots.txt, sitemap, etc.)?
  const direct = path.join(ROOT, pathname);
  if (pathname !== "/" && fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return send(res, 200, direct);
  }

  // 3) Nada coincidió: 404 real, igual que en producción (Vercel sirve
  //    automáticamente 404.html cuando ninguna ruta/archivo coincide).
  return send(res, 404, path.join(ROOT, "404.html"));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vista previa (con rewrites de vercel.json) en http://0.0.0.0:${PORT}`);
});
