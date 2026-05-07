const CACHE_NAME = 'infinihon-cache-v1';

// Cuando el archivo se instala, guarda la página de inicio y el CSS
self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/estilos.css'
            ]);
        })
    );
});

// Cuando el navegador pide un archivo, se lo damos desde la caché si existe
self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        caches.match(evento.request).then((respuesta) => {
            // Si está en caché, lo devuelve al instante. Si no, lo descarga de internet.
            return respuesta || fetch(evento.request);
        })
    );
});
