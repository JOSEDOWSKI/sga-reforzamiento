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
                origin.includes('0.0.0.0') ||
                origin.includes('.weekly:5173')) {
                return callback(null, true);
            }
        }
        
        // Para requests internos del servidor (health checks, curl localhost)
        if (!origin) {
            return callback(null, true);
        }
        
        // En producción, permitir automáticamente dominios weekly.pe y getdevtools.com
        // IMPORTANTE: Verificar tanto con http como https
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined || !process.env.NODE_ENV) {
            // Normalizar origin para comparación (sin protocolo)
            const originHost = origin ? origin.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
            
            // Permitir todos los subdominios de weekly.pe (incluyendo weekly.pe, merchants.weekly.pe, demo.weekly.pe, etc.)
            if (originHost && (
                originHost === 'weekly.pe' ||
                originHost.endsWith('.weekly.pe') ||
                originHost.includes('weekly.pe')
            )) {
                console.log(`✅ CORS allowed for weekly.pe domain: ${origin}`);
                return callback(null, true);
            }
            // Permitir dominios getdevtools.com (para desarrollo en CapRover)
            if (originHost && (originHost.includes('.getdevtools.com') || originHost.includes('getdevtools.com'))) {
                console.log(`✅ CORS allowed for getdevtools.com domain: ${origin}`);
                return callback(null, true);
            }
        }
        
        // Verificar si el origin está en la lista permitida
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (!allowedOrigin) return false;
            
            if (allowedOrigin.startsWith('*.')) {
                // Wildcard domain (ej: *.weekly.pe)
                const domain = allowedOrigin.substring(2);
                return origin && origin.endsWith(domain);
            }
            return origin === allowedOrigin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            // Log detallado para debugging
            const originHostForLog = origin ? origin.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'N/A';
            console.log(`❌ CORS blocked origin: ${origin}`);
            console.log(`   Origin host: ${originHostForLog}`);
            console.log(`   Allowed origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '(empty)'}`);
            console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
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