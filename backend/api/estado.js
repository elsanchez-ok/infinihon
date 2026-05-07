// Archivo: api/estado.js
// Este código NO se ejecuta en el navegador del cliente, ¡se ejecuta en los servidores de Vercel!

export default function handler(req, res) {
    // Aquí podrías conectarte a bases de datos secretas, enviar correos, etc.
    // Por ahora, devolveremos un estado en formato JSON.
    
    const respuesta = {
        empresa: "InfiniHon Systems",
        estado: "ONLINE 🟢",
        latencia: Math.floor(Math.random() * 20) + 5 + "ms", // Simula una latencia entre 5 y 25ms
        nodos_activos: 128,
        mensaje: "Infraestructura operando al 100% de capacidad."
    };

    // Respondemos con código 200 (Éxito) y mandamos el JSON
    res.status(200).json(respuesta);
}
