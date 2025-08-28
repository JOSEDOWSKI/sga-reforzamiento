const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario esté autenticado y tenga un token válido
 */
const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication Error',
                message: 'Token de acceso requerido'
            });
        }
        
        const token = authHeader.substring(7); // Remover 'Bearer '
        
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el tenant del token coincida con el tenant actual
        if (decoded.tenant !== req.tenant) {
            return res.status(401).json({
                error: 'Authentication Error',
                message: 'Token no válido para este tenant'
            });
        }
        
        // Agregar información del usuario al request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            rol: decoded.rol,
            tenant: decoded.tenant
        };
        
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Authentication Error',
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Authentication Error',
                message: 'Token expirado'
            });
        }
        
        console.error('Error en middleware de autenticación:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware de autorización por rol
 * Verifica que el usuario tenga uno de los roles permitidos
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication Error',
                    message: 'Usuario no autenticado'
                });
            }
            
            if (!allowedRoles.includes(req.user.rol)) {
                return res.status(403).json({
                    error: 'Authorization Error',
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('Error en middleware de autorización:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware opcional de autenticación
 * Verifica el token si está presente, pero no requiere autenticación
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Solo agregar usuario si el tenant coincide
                if (decoded.tenant === req.tenant) {
                    req.user = {
                        userId: decoded.userId,
                        email: decoded.email,
                        rol: decoded.rol,
                        tenant: decoded.tenant
                    };
                }
            } catch (tokenError) {
                // Token inválido o expirado, pero continuamos sin usuario
                console.log('Token opcional inválido:', tokenError.message);
            }
        }
        
        next();
        
    } catch (error) {
        console.error('Error en middleware de autenticación opcional:', error);
        next(); // Continuar sin autenticación
    }
};

module.exports = {
    authMiddleware,
    roleMiddleware,
    optionalAuthMiddleware
};