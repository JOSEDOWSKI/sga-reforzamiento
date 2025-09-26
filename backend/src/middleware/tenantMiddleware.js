const { getTenantDatabase } = require('../config/tenantDatabase');

/**
 * Middleware para detectar el tenant basado en el subdominio
 * Extrae el tenant del subdominio y configura la conexión a la base de datos correspondiente
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        // Extraer el subdominio del host
        const host = req.get('host') || '';
        const subdomain = extractSubdomain(host);
        
        // Si no hay subdominio, usar el tenant por defecto (para desarrollo)
        const tenant = subdomain || process.env.DEFAULT_TENANT || 'demo';
        
        // Validar que el tenant sea válido (solo letras, números y guiones)
        if (!isValidTenant(tenant)) {
            return res.status(400).json({
                error: 'Invalid tenant identifier',
                message: 'Tenant must contain only letters, numbers, and hyphens'
            });
        }
        
        // Lista blanca de tenants permitidos (para evitar creación automática de tenants aleatorios)
        const allowedTenants = (process.env.ALLOWED_TENANTS || 'demo,main,premier,api,www').split(',').map(t => t.trim());
        
        // Log para debugging en producción
        console.log(`🔍 Tenant detection: ${tenant} from host: ${host}`);
        console.log(`📋 Allowed tenants: [${allowedTenants.join(', ')}]`);
        console.log(`✅ Tenant authorized: ${allowedTenants.includes(tenant)}`);
        
        // Si el tenant no está en la lista blanca, rechazar la request
        if (!allowedTenants.includes(tenant)) {
            console.warn(`❌ UNAUTHORIZED tenant access attempt: ${tenant} from host: ${host}`);
            console.warn(`🚫 Tenant ${tenant} is not in allowed list: [${allowedTenants.join(', ')}]`);
            return res.status(403).json({
                error: 'Tenant not authorized',
                message: 'This tenant is not authorized to access the system'
            });
        }
        
        console.log(`✅ Tenant ${tenant} is authorized`);
        
        // Obtener la conexión a la base de datos del tenant
        const tenantDb = await getTenantDatabase(tenant);
        
        // Agregar información del tenant al request
        req.tenant = tenant;
        req.db = tenantDb;
        
        // Agregar headers de respuesta para identificar el tenant
        res.set('X-Tenant', tenant);
        
        next();
    } catch (error) {
        console.error('Error in tenant middleware:', error);
        res.status(500).json({
            error: 'Tenant configuration error',
            message: 'Unable to configure tenant database connection'
        });
    }
};

/**
 * Extrae el subdominio del host
 * @param {string} host - El host completo (ej: cliente1.agendate.promesa.tech)
 * @returns {string|null} - El subdominio o null si no existe
 */
function extractSubdomain(host) {
    // Remover puerto si existe
    const hostWithoutPort = host.split(':')[0];
    
    // Para desarrollo local (localhost)
    if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
        return null;
    }
    
    // Dividir por puntos
    const parts = hostWithoutPort.split('.');
    
    // Si tiene al menos 3 partes (subdominio.dominio.tld), extraer el subdominio
    if (parts.length >= 3) {
        return parts[0];
    }
    
    return null;
}

/**
 * Valida que el tenant tenga un formato válido
 * @param {string} tenant - El identificador del tenant
 * @returns {boolean} - True si es válido
 */
function isValidTenant(tenant) {
    // Solo letras, números y guiones, entre 2 y 50 caracteres
    const tenantRegex = /^[a-zA-Z0-9-]{2,50}$/;
    return tenantRegex.test(tenant);
}

module.exports = tenantMiddleware;