import express from 'express';
import { query, connectToDatabase } from '../config/database.js';

const router = express.Router();

/**
 * @route GET /api/productos
 * @description Obtiene todos los productos
 */
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM productos ORDER BY nombre');
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos'
        });
    }
});

/**
 * @route GET /api/productos/:id
 * @description Obtiene un producto por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`SELECT * FROM productos WHERE id = ${id}`);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener producto'
        });
    }
});

/**
 * @route POST /api/productos
 * @description Crea un nuevo producto
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
        
        if (!nombre || !precio) {
            return res.status(400).json({
                success: false,
                error: 'Nombre y precio son requeridos'
            });
        }

        const sql = `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) 
                     VALUES ('${nombre}', '${descripcion}', ${precio}, ${stock || 0}, '${categoria}', '${imagen}')`;
        
        await query(sql);

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear producto'
        });
    }
});

/**
 * @route PUT /api/productos/:id
 * @description Actualiza un producto existente
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

        const sql = `UPDATE productos 
                     SET nombre='${nombre}', descripcion='${descripcion}', precio=${precio}, 
                         stock=${stock || 0}, categoria='${categoria}', imagen='${imagen}'
                     WHERE id=${id}`;
        
        await query(sql);

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar producto'
        });
    }
});

/**
 * @route DELETE /api/productos/:id
 * @description Elimina un producto
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM productos WHERE id = ${id}`);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar producto'
        });
    }
});

export default router;
