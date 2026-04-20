// ==========================================
// PANEL DE CONTROL VIP - INFINIHON
// ==========================================
const cerrarTodoElSitio = false; 
const paginasEnObras = ["index", "tienda"]; 
const paginasIntocables = ["fix", "404", "elsanchezok"];

// ==========================================
// LÓGICA DEL GUARDIÁN
// ==========================================
const rutaActual = window.location.pathname;
let guardiaDebeActuar = false;

const esIntocable = paginasIntocables.some(pagina => rutaActual.includes(pagina));

if (!esIntocable) {
    if (cerrarTodoElSitio === true) {
        guardiaDebeActuar = true; 
    } else if (paginasEnObras.some(pagina => rutaActual.includes(pagina))) {
        guardiaDebeActuar = true; 
    }

    if (guardiaDebeActuar) {
        const parametrosURL = new URLSearchParams(window.location.search);

        if (parametrosURL.get('admin') === 'salir') {
            localStorage.removeItem('paseAdministrador');
            window.location.href = "fix.html";
        }

        if (parametrosURL.get('admin') === 'joseph') {
            localStorage.setItem('paseAdministrador', 'activado');
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const esAdmin = localStorage.getItem('paseAdministrador');

        if (esAdmin !== 'activado') {
            window.location.href = "fix.html"; 
        } else {
            console.log("🟢 [Modo Admin] Pase VIP detectado.");
            
            // ==========================================
            // INYECCIÓN DEL BOTÓN SECRETO FLOTANTE
            // ==========================================
            // Esperamos a que la página cargue para dibujar el botón
            window.addEventListener('DOMContentLoaded', () => {
                const botonSalir = document.createElement('button');
                botonSalir.innerHTML = '🔒 Salir del Modo Admin';
                
                // Le damos estilo para que se vea profesional y moderno
                Object.assign(botonSalir.style, {
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#dc2626', // Rojo de alerta
                    color: '#ffffff',
                    border: '2px solid #991b1b',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    zIndex: '9999', // Se asegura de estar encima de cualquier otra cosa
                    transition: 'all 0.3s ease'
                });

                // Efecto al pasar el mouse por encima
                botonSalir.onmouseover = () => botonSalir.style.backgroundColor = '#b91c1c';
                botonSalir.onmouseout = () => botonSalir.style.backgroundColor = '#dc2626';

                // Lo que pasa al hacer clic: destruye la llave y te saca
                botonSalir.onclick = function() {
                    localStorage.removeItem('paseAdministrador');
                    window.location.href = "fix.html";
                };

                // Insertamos el botón en el cuerpo de tu página
                document.body.appendChild(botonSalir);
            });
            // ==========================================
        }
    } else {
        console.log("🟢 [Público] Esta página está abierta para todos.");
    }
}
