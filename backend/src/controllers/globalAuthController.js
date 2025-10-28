const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Controlador de autenticación para usuarios globales (Super Admin)
 */
class GlobalAuthController {
    
    /**
     * Login de usuario global
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }
            
            // Buscar usuario en la base de datos global
            const result = await req.db.query(
                'SELECT * FROM usuarios_global WHERE email = $1 AND activo = true',
                [email]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            const user = result.rows[0];
            
            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            // Actualizar último acceso
            await req.db.query(
                'UPDATE usuarios_global SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            // Generar token JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    rol: user.rol,
                    userType: 'global'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        rol: user.rol,
                        userType: 'global'
                    }
                },
                message: 'Login exitoso'
            });
            
        } catch (error) {
            console.error('Error en login global:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Verificar token de usuario global
     */
    async verifyToken(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }
            
            // Buscar usuario actualizado en la base de datos
            const result = await req.db.query(
                'SELECT id, email, nombre, rol, activo, ultimo_acceso FROM usuarios_global WHERE id = $1',
                [req.user.userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            const user = result.rows[0];
            
            if (!user.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario inactivo'
                });
            }
            
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        rol: user.rol,
                        userType: 'global',
                        ultimo_acceso: user.ultimo_acceso
                    }
                }
            });
            
        } catch (error) {
            console.error('Error verificando token global:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Obtener perfil del usuario global
     */
    async getProfile(req, res) {
        try {
            const result = await req.db.query(
                'SELECT id, email, nombre, rol, activo, ultimo_acceso, created_at FROM usuarios_global WHERE id = $1',
                [req.user.userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
            
        } catch (error) {
            console.error('Error obteniendo perfil global:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Actualizar perfil del usuario global
     */
    async updateProfile(req, res) {
        try {
            const { nombre, email } = req.body;
            
            if (!nombre || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y email son requeridos'
                });
            }
            
            // Verificar que el email no esté en uso por otro usuario
            const existingUser = await req.db.query(
                'SELECT id FROM usuarios_global WHERE email = $1 AND id != $2',
                [email, req.user.userId]
            );
            
            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                });
            }
            
            const result = await req.db.query(
                'UPDATE usuarios_global SET nombre = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, nombre, rol, updated_at',
                [nombre, email, req.user.userId]
            );
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Perfil actualizado exitosamente'
            });
            
        } catch (error) {
            console.error('Error actualizando perfil global:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    
    /**
     * Cambiar contraseña del usuario global
     */
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }
            
            // Obtener usuario actual
            const userResult = await req.db.query(
                'SELECT password_hash FROM usuarios_global WHERE id = $1',
                [req.user.userId]
            );
            
            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }
            
            // Encriptar nueva contraseña
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            
            // Actualizar contraseña
            await req.db.query(
                'UPDATE usuarios_global SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [newPasswordHash, req.user.userId]
            );
            
            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
            
        } catch (error) {
            console.error('Error cambiando contraseña global:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = new GlobalAuthController();
