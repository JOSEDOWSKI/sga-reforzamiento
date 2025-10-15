const cors = require('cors');

/**
 * Configuración de CORS para el sistema SaaS multi-tenant
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Lista de orígenes permitidos desde variables de entorno
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
        
        // En desarrollo, permitir localhost y requests sin origin
        if (process.env.NODE_ENV === 'development') {
            // Permitir localhost en cualquier puerto para desarrollo
            if (!origin || 
                origin.includes('localhost') || 
                origin.includes('127.0.0.1') ||
                origin.includes('0.0.0.0')) {
                return callback(null, true);
            }
        }
        
        // Para requests internos del servidor (health checks, curl localhost)
        if (!origin) {
            return callback(null, true);
        }
        
        // Verificar si el origin está en la lista permitida
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.startsWith('*.')) {
                // Wildcard domain (ej: *.agendate.promesa.tech)
                const domain = allowedOrigin.substring(2);
                return origin && origin.endsWith(domain);
            }
            return origin === allowedOrigin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true, // Permitir cookies y headers de autenticación
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Tenant'
    ],
    exposedHeaders: ['X-Tenant', 'X-Total-Count']
};

module.exports = cors(corsOptions);