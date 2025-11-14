/**
 * Controlador para autenticación de usuarios móviles
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'weekly_global',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

class MobileAuthController {
    /**
     * Registro de usuario móvil
     * POST /api/auth/mobile/register
     */
    async register(req, res) {
        try {
            const { email, telefono, nombre, password, fecha_nacimiento } = req.body;

            // Validaciones
            if (!email || !telefono || !nombre || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email, teléfono, nombre y contraseña son requeridos'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            const pool = new Pool(dbConfig);

            // Verificar si el email ya existe
            const emailCheck = await pool.query(
                'SELECT id FROM usuarios_movil WHERE email = $1',
                [email.toLowerCase()]
            );

            if (emailCheck.rows.length > 0) {
                await pool.end();
                return res.status(400).json({
                    success: false,
                    error: 'El email ya está registrado'
                });
            }

            // Verificar si el teléfono ya existe
            const telefonoCheck = await pool.query(
                'SELECT id FROM usuarios_movil WHERE telefono = $1',
                [telefono]
            );

            if (telefonoCheck.rows.length > 0) {
                await pool.end();
                return res.status(400).json({
                    success: false,
                    error: 'El teléfono ya está registrado'
                });
            }

            // Hash de la contraseña
            const passwordHash = await bcrypt.hash(password, 12);

            // Crear usuario
            const result = await pool.query(
                `INSERT INTO usuarios_movil (email, telefono, nombre, password_hash, fecha_nacimiento)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, email, telefono, nombre, foto_url, created_at`,
                [email.toLowerCase(), telefono, nombre, passwordHash, fecha_nacimiento || null]
            );

            const usuario = result.rows[0];

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    tipo: 'mobile'
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            await pool.end();

            res.status(201).json({
                success: true,
                data: {
                    usuario: {
                        id: usuario.id,
                        email: usuario.email,
                        telefono: usuario.telefono,
                        nombre: usuario.nombre,
                        foto_url: usuario.foto_url
                    },
                    token
                },
                message: 'Usuario registrado exitosamente'
            });
        } catch (error) {
            console.error('Error en registro móvil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Login de usuario móvil
     * POST /api/auth/mobile/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email y contraseña son requeridos'
                });
            }

            const pool = new Pool(dbConfig);

            // Buscar usuario
            const result = await pool.query(
                'SELECT * FROM usuarios_movil WHERE email = $1 AND activo = true',
                [email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                await pool.end();
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas'
                });
            }

            const usuario = result.rows[0];

            // Verificar contraseña
            const passwordValid = await bcrypt.compare(password, usuario.password_hash);

            if (!passwordValid) {
                await pool.end();
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas'
                });
            }

            // Actualizar último acceso
            await pool.query(
                'UPDATE usuarios_movil SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [usuario.id]
            );

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    tipo: 'mobile'
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            await pool.end();

            res.json({
                success: true,
                data: {
                    usuario: {
                        id: usuario.id,
                        email: usuario.email,
                        telefono: usuario.telefono,
                        nombre: usuario.nombre,
                        foto_url: usuario.foto_url
                    },
                    token
                },
                message: 'Login exitoso'
            });
        } catch (error) {
            console.error('Error en login móvil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener perfil del usuario móvil
     * GET /api/auth/mobile/profile
     */
    async getProfile(req, res) {
        try {
            const userId = req.user.id;

            const pool = new Pool(dbConfig);

            const result = await pool.query(
                `SELECT 
                    id, email, telefono, nombre, foto_url, fecha_nacimiento, 
                    created_at, updated_at
                FROM usuarios_movil
                WHERE id = $1 AND activo = true`,
                [userId]
            );

            if (result.rows.length === 0) {
                await pool.end();
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            // Obtener estadísticas
            const statsResult = await pool.query(
                `SELECT 
                    COUNT(*) as total_reservas,
                    COUNT(*) FILTER (WHERE estado = 'confirmada') as reservas_activas,
                    COUNT(*) FILTER (WHERE estado = 'completada') as reservas_completadas
                FROM reservas_movil
                WHERE usuario_movil_id = $1`,
                [userId]
            );

            const usuario = result.rows[0];
            usuario.estadisticas = statsResult.rows[0];

            await pool.end();

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error obteniendo perfil móvil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Actualizar perfil del usuario móvil
     * PUT /api/auth/mobile/profile
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { nombre, telefono, foto_url, fecha_nacimiento } = req.body;

            const pool = new Pool(dbConfig);

            // Verificar si el teléfono ya está en uso por otro usuario
            if (telefono) {
                const telefonoCheck = await pool.query(
                    'SELECT id FROM usuarios_movil WHERE telefono = $1 AND id != $2',
                    [telefono, userId]
                );

                if (telefonoCheck.rows.length > 0) {
                    await pool.end();
                    return res.status(400).json({
                        success: false,
                        error: 'El teléfono ya está en uso'
                    });
                }
            }

            // Construir query dinámico
            const updates = [];
            const params = [];
            let paramCount = 0;

            if (nombre) {
                updates.push(`nombre = $${++paramCount}`);
                params.push(nombre);
            }
            if (telefono) {
                updates.push(`telefono = $${++paramCount}`);
                params.push(telefono);
            }
            if (foto_url !== undefined) {
                updates.push(`foto_url = $${++paramCount}`);
                params.push(foto_url);
            }
            if (fecha_nacimiento !== undefined) {
                updates.push(`fecha_nacimiento = $${++paramCount}`);
                params.push(fecha_nacimiento);
            }

            if (updates.length === 0) {
                await pool.end();
                return res.status(400).json({
                    success: false,
                    error: 'No hay campos para actualizar'
                });
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            params.push(userId);

            const result = await pool.query(
                `UPDATE usuarios_movil 
                 SET ${updates.join(', ')}
                 WHERE id = $${++paramCount}
                 RETURNING id, email, telefono, nombre, foto_url, fecha_nacimiento, updated_at`,
                params
            );

            await pool.end();

            res.json({
                success: true,
                data: result.rows[0],
                message: 'Perfil actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando perfil móvil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new MobileAuthController();


