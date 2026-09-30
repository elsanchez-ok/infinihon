const http = require('http');
const fs = require('fs');
const path = require('path');

// Fallback: si PORT es 0, inválido o no numérico, usar 3000
const RAW_PORT = Number(process.env.PORT);
const PORT = Number.isInteger(RAW_PORT) && RAW_PORT > 0 ? RAW_PORT : 3000;
const WEB = path.join(__dirname, 'web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

// Rutas de aplicaciones -> single-file HTML (igual que vercel.json)
const APP_ROUTES = [
  ['/tienda', 'tienda.html'],
  ['/auth', 'auth.html'],
  ['/admin', 'admin.html'],
  ['/account', 'account.html'],
  ['/member', 'member.html'],
];

function send(res, status, body, contentType) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        send(res, 404, '<h1>404 - Página no encontrada</h1>', 'text/html; charset=utf-8');
      } else {
        send(res, 500, 'Error del servidor: ' + error.code, 'text/plain; charset=utf-8');
      }
      return;
    }
    send(res, status, content, contentType);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    pathname = '/';
  }

  // Rutas SPA de las aplicaciones
  if (pathname === '/') return sendFile(res, path.join(WEB, 'index.html'));
  for (const [route, file] of APP_ROUTES) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return sendFile(res, path.join(WEB, file));
    }
  }

  // Archivos estáticos (imágenes, fuentes, etc.)
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(WEB, safePath);
  if (!filePath.startsWith(WEB)) return send(res, 403, 'Prohibido', 'text/plain');

  fs.stat(filePath, (error, stat) => {
    if (!error && stat.isFile()) return sendFile(res, filePath);
    // SPA fallback: solo rutas sin extensión (los assets inexistentes devuelven 404 real)
    if (!path.extname(pathname)) return sendFile(res, path.join(WEB, 'index.html'));
    send(res, 404, 'No encontrado', 'text/plain; charset=utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} (sirviendo web/)`);
  console.log(`- Landing:  http://localhost:${PORT}/`);
  console.log(`- Tienda:   http://localhost:${PORT}/tienda`);
  console.log(`- Login:    http://localhost:${PORT}/auth`);
  console.log(`- Admin:    http://localhost:${PORT}/admin`);
  console.log(`- Account:  http://localhost:${PORT}/account`);
  console.log(`- Miembro:  http://localhost:${PORT}/member`);
});
