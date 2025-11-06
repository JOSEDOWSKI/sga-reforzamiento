const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Controlador de autenticación
 */
class AuthController {
    /**
     * Login de usuario
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Email y contraseña son requeridos'
                });
            }
            
            // Verificar que req.db esté disponible
            if (!req.db) {
                console.error('[AUTH LOGIN] req.db no disponible para tenant:', req.tenant);
                console.error('[AUTH LOGIN] Host:', req.get('host'));
                console.error('[AUTH LOGIN] Tenant type:', req.tenantType);
                
                // Si es un tenant, intentar crear la conexión manualmente
                if (req.tenant && req.tenant !== 'global' && req.tenant !== 'public') {
                    try {
                        const { getTenantDatabase } = require('../config/tenantDatabase');
                        req.db = await getTenantDatabase(req.tenant);
                        console.log(`[AUTH LOGIN] Conexión creada manualmente para tenant: ${req.tenant}`);
                    } catch (dbError) {
                        console.error('[AUTH LOGIN] Error creando conexión manual:', dbError);
                        return res.status(500).json({
                            error: 'Internal Server Error',
                            message: 'Error al conectar con la base de datos del tenant'
                        });
                    }
                } else {
                    return res.status(500).json({
                        error: 'Internal Server Error',
                        message: 'Conexión a base de datos no disponible'
                    });
                }
            }
            
            // Normalizar email
            const normalizedEmail = email.toLowerCase().trim();
            console.log(`[AUTH LOGIN] Intentando login para: ${normalizedEmail} en tenant: ${req.tenant}`);
            
            // Buscar usuario en la base de datos del tenant
            const query = 'SELECT * FROM usuarios WHERE email = $1 AND activo = true';
            const result = await req.db.query(query, [normalizedEmail]);
            
            console.log(`[AUTH LOGIN] Usuario encontrado: ${result.rows.length > 0 ? 'Sí' : 'No'}`);
            
            if (result.rows.length === 0) {
                // Registrar intento de login fallido
                try {
                    const loggingService = require('../services/loggingService');
                    await loggingService.logLoginFailed(req, normalizedEmail, req.tenant, 'usuario_no_encontrado');
                } catch (logError) {
                    // No fallar si el logging falla
                }
                
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Credenciales inválidas'
                });
            }
            
            const user = result.rows[0];
            
            // Verificar contraseña
            console.log(`[AUTH LOGIN] Verificando contraseña para usuario ID: ${user.id}`);
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                console.log(`[AUTH LOGIN] Contraseña incorrecta para: ${normalizedEmail}`);
                
                // Registrar intento de login fallido
                try {
                    const loggingService = require('../services/loggingService');
                    await loggingService.logLoginFailed(req, normalizedEmail, req.tenant, 'contraseña_incorrecta');
                } catch (logError) {
                    // No fallar si el logging falla
                }
                
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Credenciales inválidas'
                });
            }
            
            console.log(`[AUTH LOGIN] ✅ Login exitoso para: ${normalizedEmail}`);
            
            // Registrar login exitoso en logs
            try {
                const loggingService = require('../services/loggingService');
                // Obtener tenant_id si existe
                let tenantId = null;
                if (req.tenant && req.tenant !== 'public') {
                    const { Pool } = require('pg');
                    const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                    const globalPool = new Pool({
                        user: process.env.DB_USER || 'postgres',
                        host: dbHost,
                        database: 'weekly_global',
                        password: process.env.DB_PASSWORD || 'postgres',
                        port: parseInt(process.env.DB_PORT) || 5432,
                    });
                    const tenantResult = await globalPool.query(
                        'SELECT id FROM tenants WHERE tenant_name = $1',
                        [req.tenant]
                    );
                    if (tenantResult.rows.length > 0) {
                        tenantId = tenantResult.rows[0].id;
                    }
                    await globalPool.end();
                }
                await loggingService.logLogin(req, user.id, tenantId, req.tenant);
            } catch (logError) {
                console.error('[AUTH LOGIN] Error registrando log:', logError.message);
                // No fallar el login si el logging falla
            }
            
            // Actualizar último acceso
            await req.db.query(
                'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            // Generar JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    rol: user.rol,
                    tenant: req.tenant
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );
            
            // Respuesta exitosa (sin incluir password_hash)
            const { password_hash, ...userWithoutPassword } = user;
            
            res.json({
                message: 'Login exitoso',
                token,
                user: userWithoutPassword,
                tenant: req.tenant
            });
            
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Verificar token y obtener información del usuario
     */
    static async verifyToken(req, res) {
        try {
            // El middleware de auth ya verificó el token y agregó req.user
            const user = req.user;
            
            // Si es usuario global, buscar en usuarios_global
            if (user.userType === 'global') {
                // Si req.db no está disponible, crear conexión directa
                let db = req.db;
                if (!db) {
                    console.log('[AUTH VERIFY] req.db no disponible, creando conexión directa para usuario global...');
                    const { Pool } = require('pg');
                    const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                    db = new Pool({
                        user: process.env.DB_USER || 'postgres',
                        host: dbHost,
                        database: 'weekly_global',
                        password: process.env.DB_PASSWORD || 'postgres',
                        port: parseInt(process.env.DB_PORT) || 5432,
                    });
                }
                
                const query = 'SELECT id, email, nombre, rol, activo, ultimo_acceso, created_at FROM usuarios_global WHERE id = $1 AND activo = true';
                const result = await db.query(query, [user.userId]);
                
                // Cerrar conexión si la creamos nosotros
                if (!req.db && db) {
                    await db.end();
                }
                
                if (result.rows.length === 0) {
                    return res.status(401).json({
                        error: 'Authentication Error',
                        message: 'Usuario no encontrado o inactivo'
                    });
                }
                
                return res.json({
                    valid: true,
                    user: {
                        ...result.rows[0],
                        userType: 'global'
                    },
                    tenant: req.tenant
                });
            }
            
            // Para usuarios de tenant, buscar en usuarios
            if (!req.db) {
                return res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'Conexión a base de datos no disponible'
                });
            }
            
            const query = 'SELECT id, email, nombre, rol, activo, ultimo_acceso, created_at FROM usuarios WHERE id = $1 AND activo = true';
            const result = await req.db.query(query, [user.userId]);
            
            if (result.rows.length === 0) {
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Usuario no encontrado o inactivo'
                });
            }
            
            res.json({
                valid: true,
                user: result.rows[0],
                tenant: req.tenant
            });
            
        } catch (error) {
            console.error('Error en verificación de token:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Cambiar contraseña
     */
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }
            
            // Obtener usuario actual
            const userQuery = 'SELECT password_hash FROM usuarios WHERE id = $1 AND activo = true';
            const userResult = await req.db.query(userQuery, [userId]);
            
            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Usuario no encontrado'
                });
            }
            
            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Contraseña actual incorrecta'
                });
            }
            
            // Hashear nueva contraseña
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            
            // Actualizar contraseña
            await req.db.query(
                'UPDATE usuarios SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [newPasswordHash, userId]
            );
            
            res.json({
                message: 'Contraseña actualizada exitosamente'
            });
            
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Logout (invalidar token - en el frontend)
     */
    static async logout(req, res) {
        try {
            // En una implementación más avanzada, podrías mantener una blacklist de tokens
            // Por ahora, el logout se maneja en el frontend eliminando el token
            
            res.json({
                message: 'Logout exitoso'
            });
            
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = AuthController;