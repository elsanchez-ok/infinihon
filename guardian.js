// ==========================================
// INTERRUPTOR MAESTRO DEL GUARDIÁN
// true = Guardián ACTIVADO (Página en mantenimiento)
// false = Guardián DESACTIVADO (Público general puede entrar)
// ==========================================
const modoMantenimiento = true; 

if (modoMantenimiento) {
    // --- INICIO DE LA LÓGICA DEL GUARDIÁN ---
    const rutaActual = window.location.pathname;
    
    // CORRECCIÓN AQUÍ: Quitamos el ".html" para que Vercel no confunda al Guardián
    const paginasLibres = ["fix", "404", "tienda", "registro_admin", "elsanchezok"];
    
    const esPaginaLibre = paginasLibres.some(pagina => rutaActual.includes(pagina));

    if (!esPaginaLibre) {
        const parametrosURL = new URLSearchParams(window.location.search);

        if (parametrosURL.get('admin') === 'salir') {
            localStorage.removeItem('paseAdministrador');
            window.location.href = "fix.html";
        }

        if (parametrosURL.get('admin') === 'infinihonVIP') {
            localStorage.setItem('paseAdministrador', 'activado');
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const esAdmin = localStorage.getItem('paseAdministrador');

        if (esAdmin !== 'activado') {
            window.location.href = "fix.html"; 
        }
    }
    // --- FIN DE LA LÓGICA DEL GUARDIÁN ---
} else {
    console.log("🟢 El Guardián está apagado. Acceso libre para todo el mundo.");
}
