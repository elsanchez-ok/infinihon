// ==========================================
// MODO MANTENIMIENTO INFINIHON
// ==========================================

// Cambia esto a 'false' cuando quieras que la tienda vuelva a la normalidad
const MANTENIMIENTO_ACTIVO = true; 

// Lista de páginas que SÍ pueden visitarse durante el mantenimiento
const paginasPermitidas = [
    '/fix.html',
    '/login.html',
    '/404.html',
    '/elsanchezok.html',
];

// Obtener la página que el usuario está intentando ver
const paginaActual = window.location.pathname;

// Lógica de redirección
if (MANTENIMIENTO_ACTIVO) {
    // Si la página en la que están NO está en la lista de permitidas...
    if (!paginasPermitidas.includes(paginaActual)) {
        // ...los enviamos directamente a la pantalla de trabajo
        window.location.replace('/fix.html');
    }
}
