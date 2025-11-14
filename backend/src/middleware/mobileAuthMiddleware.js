/**
 * Middleware de autenticación para usuarios móviles
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const mobileAuthMiddleware = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticación requerido'
            });
        }

        // Formato: "Bearer <token>"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: 'Formato de token inválido. Use: Bearer <token>'
            });
        }

        const token = parts[1];

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verificar que sea un token de usuario móvil
        if (decoded.tipo !== 'mobile') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido para usuarios móviles'
            });
        }

        // Agregar información del usuario al request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            tipo: 'mobile'
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expirado'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Error en autenticación',
            message: error.message
        });
    }
};

module.exports = mobileAuthMiddleware;


