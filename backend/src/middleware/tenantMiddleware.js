const { getTenantDatabase } = require('../config/tenantDatabase');

/**
 * Middleware para detectar el tenant basado en el subdominio
 * Maneja tanto el panel global (admin.weekly) como tenants individuales (cliente.weekly)
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        // Extraer el subdominio del host
        const host = req.get('host') || '';
        const subdomain = extractSubdomain(host);
        
        // Determinar el tipo de acceso
        if (subdomain === 'panel') {
            // Panel global de super administración
            req.tenant = 'global';
            req.tenantType = 'global';
            req.database = 'weekly_global';
            
            // Para el panel global, usar conexión directa a la BD global
            req.db = await getTenantDatabase('global');
            
        } else if (subdomain) {
            // Panel de cliente específico
            req.tenant = subdomain;
            req.tenantType = 'tenant';
            req.database = `weekly_${subdomain}`;
            
            // Validar que el tenant sea válido
            if (!isValidTenant(subdomain)) {
                return res.status(400).json({
                    error: 'Invalid tenant identifier',
                    message: 'Tenant must contain only letters, numbers, and hyphens'
                });
            }
            
            // Lista blanca de tenants permitidos
            const allowedTenants = (process.env.ALLOWED_TENANTS || 'demo,cliente,peluqueria,academia,cancha,veterinaria,odontologia,gimnasio').split(',').map(t => t.trim());
            
            if (!allowedTenants.includes(subdomain)) {
                console.warn(`❌ UNAUTHORIZED tenant access attempt: ${subdomain} from host: ${host}`);
                return res.status(403).json({
                    error: 'Tenant not authorized',
                    message: 'This tenant is not authorized to access the system'
                });
            }
            
            // Obtener conexión a la base de datos del tenant
            req.db = await getTenantDatabase(subdomain);
            
        } else {
            // Acceso público (sin subdominio)
            req.tenant = 'public';
            req.tenantType = 'public';
            req.database = null;
            req.db = null;
        }
        
        // Agregar headers de respuesta para identificar el tenant
        res.set('X-Tenant', req.tenant);
        res.set('X-Tenant-Type', req.tenantType);
        
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
 * Extrae el subdominio del host para el dominio weekly
 * @param {string} host - El host completo (ej: cliente.weekly, admin.weekly)
 * @returns {string|null} - El subdominio o null si no existe
 */
function extractSubdomain(host) {
    // Remover puerto si existe
    const hostWithoutPort = host.split(':')[0];
    
    // Para desarrollo local (localhost)
    if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
        return null;
    }
    
    // Para el dominio getdevtools.com: cliente.getdevtools.com -> "cliente", admin.getdevtools.com -> "admin"
    if (hostWithoutPort.endsWith('.getdevtools.com')) {
        const parts = hostWithoutPort.split('.');
        if (parts.length >= 2) {
            return parts[0]; // Retorna "cliente" de "cliente.getdevtools.com"
        }
    }
    
    // Para el dominio weekly: cliente.weekly -> "cliente", admin.weekly -> "admin" (desarrollo)
    if (hostWithoutPort.endsWith('.weekly')) {
        const parts = hostWithoutPort.split('.');
        if (parts.length >= 2) {
            return parts[0]; // Retorna "cliente" de "cliente.weekly"
        }
    }
    
    // Para otros dominios con subdominios (compatibilidad)
    const parts = hostWithoutPort.split('.');
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