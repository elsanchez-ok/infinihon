import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productosRouter from './routes/productos.js';
import pedidosRouter from './routes/pedidos.js';
import usuariosRouter from './routes/usuarios.js';
import { closeDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas de la API
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/usuarios', usuariosRouter);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        name: 'InfiniHon API',
        version: '1.0.0',
        endpoints: {
            productos: '/api/productos',
            pedidos: '/api/pedidos',
            usuarios: '/api/usuarios',
            health: '/api/health'
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado'
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await closeDatabase();
    process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 InfiniHon API Server            ║
║     Puerto: ${PORT}                      ║
║     Entorno: ${process.env.NODE_ENV || 'development'}          ║
║     Estado: ✅ Activo                   ║
╚════════════════════════════════════════╝
    `);
});

export default app;
