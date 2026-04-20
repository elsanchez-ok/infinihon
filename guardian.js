// ==========================================
// PANEL DE CONTROL VIP - INFINIHON
// ==========================================

// CONTROL 1: Interruptor Global
// true = TODA LA WEB se pone en mantenimiento (cierra todas las puertas).
// false = LA WEB ESTÁ ABIERTA, pero el guardián solo vigilará las páginas de la "Lista Negra".
const cerrarTodoElSitio = true; 

// CONTROL 2: Lista Negra (Páginas en remodelación)
// Si el Control 1 está en "false", el guardián SOLO bloqueará las páginas que escribas aquí.
// Ejemplo: Toda tu web funciona, pero el "index" está en remodelación.
const paginasEnObras = ["index", "tienda"]; 

// CONTROL 3: Páginas Intocables (Sistema de seguridad)
// Estas páginas NUNCA se bloquean para evitar el bucle infinito del que hablamos.
const paginasIntocables = ["fix", "404", "elsanchezok"];

// ==========================================
// LÓGICA DEL GUARDIÁN (No necesitas tocar nada de aquí para abajo)
// ==========================================

const rutaActual = window.location.pathname;
let guardiaDebeActuar = false;

// 1. Primero, revisamos si estamos en una página intocable
const esIntocable = paginasIntocables.some(pagina => rutaActual.includes(pagina));

if (!esIntocable) {
    // 2. Si no es intocable, decidimos si el guardián debe despertarse
    if (cerrarTodoElSitio === true) {
        // Cierra todo
        guardiaDebeActuar = true; 
    } else if (paginasEnObras.some(pagina => rutaActual.includes(pagina))) {
        // Cierra solo las que están en obras
        guardiaDebeActuar = true; 
    }

    // 3. Ejecutamos la seguridad si el guardián se despertó
    if (guardiaDebeActuar) {
        const parametrosURL = new URLSearchParams(window.location.search);

        // Sistema para destruir el pase
        if (parametrosURL.get('admin') === 'salir') {
            localStorage.removeItem('paseAdministrador');
            window.location.href = "fix.html";
        }

        // Sistema para crear el pase
        if (parametrosURL.get('admin') === 'infinihonVIP') {
            localStorage.setItem('paseAdministrador', 'activado');
            // Limpiamos la URL por seguridad
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Verificación final del pase VIP
        const esAdmin = localStorage.getItem('paseAdministrador');

        if (esAdmin !== 'activado') {
            // No tiene pase -> A la sala de espera
            window.location.href = "fix.html"; 
        } else {
            console.log("🟢 [Modo Admin] Pase VIP detectado. Tienes acceso a esta zona en obras.");
        }
    } else {
        console.log("🟢 [Público] Esta página está abierta para todos los clientes.");
    }
}
