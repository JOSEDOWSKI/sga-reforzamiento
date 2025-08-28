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
            
            // Buscar usuario en la base de datos del tenant
            const query = 'SELECT * FROM usuarios WHERE email = $1 AND activo = true';
            const result = await req.db.query(query, [email.toLowerCase()]);
            
            if (result.rows.length === 0) {
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Credenciales inválidas'
                });
            }
            
            const user = result.rows[0];
            
            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Credenciales inválidas'
                });
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
            
            // Obtener información actualizada del usuario
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