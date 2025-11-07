const { getTenantDatabase } = require('../config/tenantDatabase');

/**
 * Middleware para detectar el tenant basado en el subdominio
 * Maneja tanto el panel global (admin.weekly) como tenants individuales (cliente.weekly)
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        // Primero verificar si hay un header X-Tenant (viene del frontend)
        const headerTenant = req.get('X-Tenant');
        
        // Extraer el subdominio del host
        const host = req.get('host') || '';
        const subdomain = extractSubdomain(host);
        
        console.log(`[TENANT MIDDLEWARE] Host: ${host}, Subdomain: ${subdomain}, X-Tenant header: ${headerTenant || 'none'}`);
        
        // Si hay header X-Tenant y no es 'api' ni 'panel', usar ese tenant
        let targetTenant = subdomain;
        if (headerTenant && headerTenant !== 'api' && headerTenant !== 'panel' && headerTenant !== 'public') {
            targetTenant = headerTenant;
            console.log(`[TENANT MIDDLEWARE] Usando tenant del header X-Tenant: ${targetTenant}`);
        }
        
        // Determinar el tipo de acceso
        if (subdomain === 'api' || subdomain === 'panel') {
            // Si hay X-Tenant header y es un tenant válido, usar ese en lugar de global
            if (headerTenant && headerTenant !== 'api' && headerTenant !== 'panel' && headerTenant !== 'public') {
                // Es una petición a api.weekly.pe pero con tenant específico en el header
                req.tenant = headerTenant;
                req.tenantType = 'tenant';
                req.database = `weekly_${headerTenant}`;
                
                // Validar formato del tenant
                if (!isValidTenant(headerTenant)) {
                    return res.status(400).json({
                        error: 'Invalid tenant identifier',
                        message: 'Tenant must contain only letters, numbers, and hyphens'
                    });
                }
                
                // Validar que el tenant exista en la base de datos
                try {
                    const { Pool } = require('pg');
                    const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                    const globalDbConfig = {
                        user: process.env.DB_USER || 'postgres',
                        host: dbHost,
                        database: 'weekly_global',
                        password: process.env.DB_PASSWORD || 'postgres',
                        port: parseInt(process.env.DB_PORT) || 5432,
                    };
                    
                    const globalPool = new Pool(globalDbConfig);
                    const tenantCheck = await globalPool.query(
                        'SELECT id, estado FROM tenants WHERE tenant_name = $1',
                        [headerTenant]
                    );
                    await globalPool.end();
                    
                    if (tenantCheck.rows.length === 0) {
                        console.warn(`❌ UNAUTHORIZED tenant access attempt: ${headerTenant} - Tenant no existe en BD`);
                        return res.status(403).json({
                            error: 'Tenant not found',
                            message: 'This tenant does not exist in the system'
                        });
                    }
                    
                    const tenant = tenantCheck.rows[0];
                    if (tenant.estado === 'suspendido' || tenant.estado === 'cancelado') {
                        console.warn(`❌ UNAUTHORIZED tenant access attempt: ${headerTenant} - Estado: ${tenant.estado}`);
                        return res.status(403).json({
                            error: 'Tenant not active',
                            message: `This tenant is ${tenant.estado === 'suspendido' ? 'suspended' : 'cancelled'}`
                        });
                    }
                } catch (dbError) {
                    console.error('Error verificando tenant en BD:', dbError);
                }
                
                // Obtener conexión a la base de datos del tenant
                req.db = await getTenantDatabase(headerTenant);
                res.set('X-Tenant', req.tenant);
                res.set('X-Tenant-Type', req.tenantType);
                return next();
            }
            
            // API endpoint o panel global - ambos necesitan acceso a BD global
            req.tenant = 'global';
            req.tenantType = 'global';
            req.database = 'weekly_global';
            
            // Para el API y panel global, usar conexión directa a la BD global
            const { Pool } = require('pg');
            // En CapRover, usar el nombre del servicio PostgreSQL si DB_HOST no está definido
            const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
            const globalDbConfig = {
                user: process.env.DB_USER || 'postgres',
                host: dbHost,
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            };
            console.log(`[TENANT MIDDLEWARE] ${subdomain === 'api' ? 'API' : 'Panel'} global detectado, conectando a: ${dbHost}:${globalDbConfig.port}/weekly_global`);
            req.db = new Pool(globalDbConfig);
            
            res.set('X-Tenant', req.tenant);
            res.set('X-Tenant-Type', req.tenantType);
            return next();
        } else if (subdomain) {
            // Panel de cliente específico
            req.tenant = subdomain;
            req.tenantType = 'tenant';
            req.database = `weekly_${subdomain}`;
            
            // Validar que el tenant sea válido (formato)
            if (!isValidTenant(subdomain)) {
                return res.status(400).json({
                    error: 'Invalid tenant identifier',
                    message: 'Tenant must contain only letters, numbers, and hyphens'
                });
            }
            
            // Validar que el tenant exista en la base de datos (en lugar de lista blanca)
            try {
                // Conectar a BD global para verificar si el tenant existe
                const { Pool } = require('pg');
                const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                const globalDbConfig = {
                    user: process.env.DB_USER || 'postgres',
                    host: dbHost,
                    database: 'weekly_global',
                    password: process.env.DB_PASSWORD || 'postgres',
                    port: parseInt(process.env.DB_PORT) || 5432,
                };
                
                const globalPool = new Pool(globalDbConfig);
                const tenantCheck = await globalPool.query(
                    'SELECT id, estado FROM tenants WHERE tenant_name = $1',
                    [subdomain]
                );
                await globalPool.end();
                
                // Si el tenant no existe en la BD, rechazar
                if (tenantCheck.rows.length === 0) {
                    console.warn(`❌ UNAUTHORIZED tenant access attempt: ${subdomain} from host: ${host} - Tenant no existe en BD`);
                    return res.status(403).json({
                        error: 'Tenant not found',
                        message: 'This tenant does not exist in the system'
                    });
                }
                
                // Si el tenant está suspendido o cancelado, rechazar
                const tenant = tenantCheck.rows[0];
                if (tenant.estado === 'suspendido' || tenant.estado === 'cancelado') {
                    console.warn(`❌ UNAUTHORIZED tenant access attempt: ${subdomain} from host: ${host} - Estado: ${tenant.estado}`);
                    return res.status(403).json({
                        error: 'Tenant not active',
                        message: `This tenant is ${tenant.estado === 'suspendido' ? 'suspended' : 'cancelled'}`
                    });
                }
            } catch (dbError) {
                console.error('Error verificando tenant en BD:', dbError);
                // En caso de error de BD, usar lista blanca como fallback (solo en producción)
                if (process.env.NODE_ENV === 'production') {
                    const allowedTenants = (process.env.ALLOWED_TENANTS || '').split(',').map(t => t.trim()).filter(t => t);
                    if (allowedTenants.length > 0 && !allowedTenants.includes(subdomain)) {
                        return res.status(403).json({
                            error: 'Tenant not authorized',
                            message: 'This tenant is not authorized to access the system'
                        });
                    }
                    // Si ALLOWED_TENANTS está vacío, permitir (modo automático)
                }
                // En desarrollo, permitir siempre si falla la BD
            }
            
            // Obtener conexión a la base de datos del tenant
            req.db = await getTenantDatabase(subdomain);
            
        } else {
            // Acceso público (sin subdominio) - En desarrollo usar el tenant demo
            if (process.env.NODE_ENV === 'development') {
                req.tenant = 'demo';
                req.tenantType = 'tenant';
                req.database = 'sga_reforzamiento';
                req.db = await getTenantDatabase('demo');
            } else {
                req.tenant = 'public';
                req.tenantType = 'public';
                req.database = null;
                req.db = null;
            }
        }
        
        // Agregar headers de respuesta para identificar el tenant
        res.set('X-Tenant', req.tenant);
        res.set('X-Tenant-Type', req.tenantType);
        
        next();
    } catch (error) {
        console.error('Error in tenant middleware:', error);
        console.error('Error stack:', error.stack);
        
        // Si es panel global y falla la conexión, permitir continuar (puede ser que aún no se haya inicializado la BD)
        if (req.tenant === 'global' && error.message && error.message.includes('connect')) {
            console.warn('[TENANT MIDDLEWARE] Error de conexión a BD global, pero continuando...');
            // Permitir que la petición continúe, el controlador manejará el error
            req.db = null; // Marcar como null para que el controlador lo maneje
        }
        
        res.status(500).json({
            error: 'Tenant configuration error',
            message: 'Unable to configure tenant database connection',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    // Para el dominio weekly.pe: panel.weekly.pe -> "panel", demo.weekly.pe -> "demo"
    if (hostWithoutPort.endsWith('.weekly.pe')) {
        const parts = hostWithoutPort.split('.');
        if (parts.length >= 3) {
            return parts[0]; // Retorna "panel" de "panel.weekly.pe"
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