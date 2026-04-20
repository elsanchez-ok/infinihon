// Obtenemos la ruta en la que está el usuario actualmente
const rutaActual = window.location.pathname;

// 1. LA LISTA BLANCA: ¿Qué páginas están abiertas al público?
// IMPORTANTE: Asegúrate de incluir fix.html y 404.html aquí
const paginasLibres = [
    "panel_admin.html",
    "fix.html",
    "404.html",
    "elsanchezok.html" // Ejemplo: si esta sección ya está terminada
];

// Comprobamos si la página en la que estamos está en la lista blanca
const esPaginaLibre = paginasLibres.some(pagina => rutaActual.includes(pagina));

if (esPaginaLibre) {
    // Si la página está en la lista, el Guardián se echa a dormir. Todos pasan.
    console.log("🟢 Página pública detectada. Guardián en reposo.");
} else {
    // 2. SI NO ES PÁGINA LIBRE (Ej. index.html), ACTIVAMOS PROTOCOLO VIP
    const parametrosURL = new URLSearchParams(window.location.search);

    // Salir del modo admin
    if (parametrosURL.get('admin') === 'salir') {
        localStorage.removeItem('paseAdministrador');
        window.location.href = "fix.html";
    }

    // Entrar al modo admin
    if (parametrosURL.get('admin') === 'infinihonVIP') {
        localStorage.setItem('paseAdministrador', 'activado');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Verificar el pase
    const esAdmin = localStorage.getItem('paseAdministrador');

    if (esAdmin === 'activado') {
        // ERES TÚ: Te dejamos trabajar en las obras
        console.log("🟢 Modo Administrador: Puedes ver las páginas en construcción.");
    } else {
        // SON LOS DEMÁS: Los mandamos a la sala de espera
        console.log("🔴 Zona en obras. Redirigiendo a fix.html...");
        window.location.href = "fix.html"; 
    }
}
