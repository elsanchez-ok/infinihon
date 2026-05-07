import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @route GET /api/pedidos
 * @description Obtiene todos los pedidos
 */
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM pedidos ORDER BY fecha DESC');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener pedidos' });
    }
});

/**
 * @route GET /api/pedidos/:id
 * @description Obtiene un pedido por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`SELECT * FROM pedidos WHERE id = ${id}`);
        
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        res.json({ success: true, data: result[0] });
    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        res.status(500).json({ success: false, error: 'Error al obtener pedido' });
    }
});

/**
 * @route POST /api/pedidos
 * @description Crea un nuevo pedido
 */
router.post('/', async (req, res) => {
    try {
        const { usuario_id, productos, total, estado } = req.body;
        
        if (!usuario_id || !total) {
            return res.status(400).json({
                success: false,
                error: 'Usuario ID y total son requeridos'
            });
        }

        const sql = `INSERT INTO pedidos (usuario_id, productos, total, estado, fecha) 
                     VALUES (${usuario_id}, '${JSON.stringify(productos)}', ${total}, '${estado || 'pendiente'}', datetime('now'))`;
        
        await query(sql);

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente'
        });
    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({ success: false, error: 'Error al crear pedido' });
    }
});

export default router;
