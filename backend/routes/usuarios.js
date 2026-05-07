import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @route GET /api/usuarios
 * @description Obtiene todos los usuarios
 */
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT id, email, nombre, rol, created_at FROM usuarios ORDER BY nombre');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    }
});

/**
 * @route GET /api/usuarios/:id
 * @description Obtiene un usuario por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`SELECT id, email, nombre, rol, created_at FROM usuarios WHERE id = ${id}`);
        
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        res.json({ success: true, data: result[0] });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ success: false, error: 'Error al obtener usuario' });
    }
});

/**
 * @route POST /api/usuarios/login
 * @description Autentica un usuario
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        // NOTA: En producción, usar hashing de contraseñas (bcrypt)
        const result = await query(`SELECT * FROM usuarios WHERE email = '${email}' AND password = '${password}'`);
        
        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const user = result[0];
        // No devolver la contraseña en la respuesta
        delete user.password;

        res.json({
            success: true,
            message: 'Login exitoso',
            data: user
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: 'Error en autenticación' });
    }
});

/**
 * @route POST /api/usuarios/register
 * @description Registra un nuevo usuario
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre } = req.body;
        
        if (!email || !password || !nombre) {
            return res.status(400).json({
                success: false,
                error: 'Email, contraseña y nombre son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const existing = await query(`SELECT id FROM usuarios WHERE email = '${email}'`);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        const sql = `INSERT INTO usuarios (email, password, nombre, rol, created_at) 
                     VALUES ('${email}', '${password}', '${nombre}', 'user', datetime('now'))`;
        
        await query(sql);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente'
        });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
});

export default router;
