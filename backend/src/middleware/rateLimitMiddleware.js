/**
 * Rate limiting middleware para prevenir abuso del API
 * Implementación simple sin dependencias externas
 */

// Cache en memoria para tracking de requests por IP y tenant
const requestCounts = new Map();

/**
 * Middleware de rate limiting
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @param {number} maxRequests - Máximo número de requests por ventana
 */
function createRateLimit(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    return (req, res, next) => {
        // Permitir preflight CORS sin rate limiting
        if (req.method === 'OPTIONS') {
            return next();
        }
        const key = `${req.ip}-${req.tenant || 'unknown'}`;
        const now = Date.now();
        
        // Limpiar entradas expiradas
        cleanExpiredEntries(now, windowMs);
        
        // Obtener o crear entrada para esta IP/tenant
        if (!requestCounts.has(key)) {
            requestCounts.set(key, {
                count: 0,
                resetTime: now + windowMs
            });
        }
        
        const entry = requestCounts.get(key);
        
        // Si la ventana ha expirado, resetear
        if (now > entry.resetTime) {
            entry.count = 0;
            entry.resetTime = now + windowMs;
        }
        
        // Incrementar contador
        entry.count++;
        
        // Headers informativos
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count),
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
        });
        
        // Verificar si se excedió el límite
        if (entry.count > maxRequests) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Try again after ${new Date(entry.resetTime).toISOString()}`,
                retryAfter: Math.ceil((entry.resetTime - now) / 1000)
            });
        }
        
        next();
    };
}

/**
 * Limpia entradas expiradas del cache
 * @param {number} now - Timestamp actual
 * @param {number} windowMs - Ventana de tiempo
 */
function cleanExpiredEntries(now, windowMs) {
    // Ejecutar limpieza solo ocasionalmente para no impactar performance
    if (Math.random() > 0.01) return;
    
    for (const [key, entry] of requestCounts.entries()) {
        if (now > entry.resetTime + windowMs) {
            requestCounts.delete(key);
        }
    }
}

// Rate limit por defecto usando variables de entorno
const defaultRateLimit = createRateLimit(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // 100 requests
);

module.exports = {
    createRateLimit,
    defaultRateLimit
};