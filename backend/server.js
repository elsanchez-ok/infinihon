const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Importar rutas de API
const productosRouter = require('./routes/productos');
const pedidosRouter = require('./routes/pedidos');
const usuariosRouter = require('./routes/usuarios');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // 1. Manejo de APIs
  if (pathname.startsWith('/api/productos')) return productosRouter(req, res, parsedUrl);
  if (pathname.startsWith('/api/pedidos')) return pedidosRouter(req, res, parsedUrl);
  if (pathname.startsWith('/api/usuarios')) return usuariosRouter(req, res, parsedUrl);

  // 2. Manejo de Archivos Estáticos con URLs Limpias
  if (pathname === '/') pathname = '/index.html';
  
  // Si no tiene extensión, intentar agregar .html
  if (!path.extname(pathname) && !pathname.startsWith('/assets')) {
    const testPath = path.join(process.cwd(), pathname + '.html');
    if (fs.existsSync(testPath)) {
      pathname += '.html';
    }
  }

  const filePath = path.join(process.cwd(), pathname);
  const extname = path.extname(filePath);
  
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';
  else if (extname === '.png') contentType = 'image/png';
  else if (extname === '.jpg' || extname === '.jpeg') contentType = 'image/jpeg';
  else if (extname === '.svg') contentType = 'image/svg+xml';
  else if (extname === '.json') contentType = 'application/json';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback a 404.html
        fs.readFile(path.join(process.cwd(), '404.html'), (e, c404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(c404 || 'Not Found', 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Clean URLs enabled: /tienda serves tienda.html`);
});
