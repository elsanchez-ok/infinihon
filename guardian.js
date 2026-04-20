// ==========================================
// PANEL DE CONTROL VIP - INFINIHON
// ==========================================
const cerrarTodoElSitio = true; 
const paginasEnObras = ["index", "tienda"]; 
const paginasIntocables = ["fix", "404", "elsanchezok"];

// ==========================================
// LÓGICA DEL GUARDIÁN
// ==========================================
const rutaActual = window.location.pathname;
const parametrosURL = new URLSearchParams(window.location.search);

// 1. GESTIÓN DE CREDENCIALES (Entrar/Salir)
if (parametrosURL.get('admin') === 'infinihonVIP') {
    localStorage.setItem('paseAdministrador', 'activado');
    window.history.replaceState({}, document.title, window.location.pathname);
}
if (parametrosURL.get('admin') === 'salir') {
    localStorage.removeItem('paseAdministrador');
    window.location.href = "fix.html";
}

const esAdmin = localStorage.getItem('paseAdministrador') === 'activado';

// 2. VERIFICACIÓN DE ACCESO
const esIntocable = paginasIntocables.some(pagina => rutaActual.includes(pagina));

if (!esIntocable && !esAdmin) {
    let guardiaDebeBloquear = false;

    if (cerrarTodoElSitio === true) {
        guardiaDebeBloquear = true; 
    } else if (paginasEnObras.some(pagina => rutaActual.includes(pagina))) {
        guardiaDebeBloquear = true; 
    }

    if (guardiaDebeBloquear) {
        window.location.href = "fix.html"; 
    }
}

// 3. INYECCIÓN DEL BOTÓN (Solo si eres Admin y NO estás en la página de fix)
if (esAdmin && !rutaActual.includes("fix")) {
    console.log("🟢 [Modo Admin] Acceso total concedido.");
    
    window.addEventListener('load', () => {
        const botonSalir = document.createElement('button');
        botonSalir.innerHTML = '🔒 Salir del Modo Admin';
        
        Object.assign(botonSalir.style, {
            position: 'fixed', bottom: '20px', right: '20px',
            backgroundColor: '#dc2626', color: '#ffffff',
            border: '2px solid #991b1b', padding: '12px 20px',
            borderRadius: '8px', fontFamily: 'system-ui, sans-serif',
            fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: '9999'
        });

        botonSalir.onclick = () => {
            localStorage.removeItem('paseAdministrador');
            window.location.href = "fix.html";
        };
        document.body.appendChild(botonSalir);
    });
}
