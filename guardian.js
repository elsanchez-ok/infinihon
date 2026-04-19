// ==========================================
// MODO MANTENIMIENTO INFINIHON 🛡️
// ==========================================

// Cambia a 'false' para abrir la tienda al público
const MANTENIMIENTO_ACTIVO = true; 

// Obtenemos la ruta en la que está el usuario
const rutaActual = window.location.pathname;

if (MANTENIMIENTO_ACTIVO) {
    // Verificamos si la ruta "contiene" alguna de estas palabras clave.
    // Así no importa si Vercel le pone o le quita el ".html" o la "/" al final.
    const esPaginaPermitida = rutaActual.includes('/fix') || 
                              rutaActual.includes('/login') || 
                              rutaActual.includes('/elsanchezok') ||
                              rutaActual.includes('/404');

    // Si NO es una página permitida, lo pateamos a mantenimiento
    if (!esPaginaPermitida) {
        // Redirigimos a /fix (sin el .html, dejamos que Vercel haga su magia)
        window.location.replace('/fix');
    }
}
