/**
 * Servicio de logging para fase beta
 * Registra eventos importantes del sistema para análisis y monitoreo
 */

const { Pool } = require('pg');

/**
 * Obtener conexión a la BD global
 */
function getGlobalPool() {
    const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
    return new Pool({
        user: process.env.DB_USER || 'postgres',
        host: dbHost,
        database: 'weekly_global',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT) || 5432,
    });
}

/**
 * Registrar un evento en el sistema
 * @param {Object} logData - Datos del evento
 * @param {number|null} logData.tenant_id - ID del tenant (opcional)
 * @param {number|null} logData.usuario_id - ID del usuario (opcional)
 * @param {string} logData.accion - Tipo de acción (ej: 'login', 'logout', 'create_reserva', etc.)
 * @param {string|null} logData.descripcion - Descripción detallada
 * @param {string|null} logData.ip_address - IP del usuario
 * @param {string|null} logData.user_agent - User agent del navegador
 * @param {Object|null} logData.metadata - Datos adicionales en JSON
 */
async function logEvent(logData) {
    try {
        const pool = getGlobalPool();
        
        const {
            tenant_id = null,
            usuario_id = null,
            accion,
            descripcion = null,
            ip_address = null,
            user_agent = null,
            metadata = null
        } = logData;

        // Validar que la acción sea requerida
        if (!accion) {
            console.error('[LOGGING] Error: accion es requerida');
            return;
        }

        const query = `
            INSERT INTO logs_sistema (
                tenant_id, usuario_id, accion, descripcion, 
                ip_address, user_agent, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `;

        const metadataJson = metadata ? JSON.stringify(metadata) : null;

        await pool.query(query, [
            tenant_id,
            usuario_id,
            accion,
            descripcion,
            ip_address,
            user_agent,
            metadataJson
        ]);

        await pool.end();
    } catch (error) {
        // No fallar si el logging falla, solo loggear el error
        console.error('[LOGGING] Error registrando evento:', error.message);
    }
}

/**
 * Helper para obtener IP del request
 */
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           null;
}

/**
 * Helper para obtener User Agent
 */
function getUserAgent(req) {
    return req.headers['user-agent'] || null;
}

/**
 * Registrar login exitoso
 */
async function logLogin(req, userId, tenantId = null, tenantName = null) {
    await logEvent({
        tenant_id: tenantId,
        usuario_id: userId,
        accion: 'login_exitoso',
        descripcion: `Usuario inició sesión${tenantName ? ` en tenant: ${tenantName}` : ''}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            tenant_name: tenantName,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar intento de login fallido
 */
async function logLoginFailed(req, email, tenantName = null, reason = 'credenciales_invalidas') {
    await logEvent({
        tenant_id: null, // No sabemos el tenant si falló
        usuario_id: null,
        accion: 'login_fallido',
        descripcion: `Intento de login fallido para: ${email}${tenantName ? ` en tenant: ${tenantName}` : ''}. Razón: ${reason}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            email: email,
            tenant_name: tenantName,
            reason: reason,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar logout
 */
async function logLogout(req, userId, tenantId = null, tenantName = null) {
    await logEvent({
        tenant_id: tenantId,
        usuario_id: userId,
        accion: 'logout',
        descripcion: `Usuario cerró sesión${tenantName ? ` en tenant: ${tenantName}` : ''}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            tenant_name: tenantName,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar creación de reserva
 */
async function logReservaCreated(req, reservaId, tenantId, tenantName, metadata = {}) {
    await logEvent({
        tenant_id: tenantId,
        usuario_id: null, // Puede ser reserva pública
        accion: 'reserva_creada',
        descripcion: `Nueva reserva creada en tenant: ${tenantName}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            reserva_id: reservaId,
            tenant_name: tenantName,
            ...metadata,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar acción de usuario (CRUD)
 */
async function logUserAction(req, action, entity, entityId, tenantId, tenantName, metadata = {}) {
    const actionMap = {
        'create': 'crear',
        'update': 'actualizar',
        'delete': 'eliminar',
        'view': 'ver',
        'list': 'listar'
    };

    const accionNombre = actionMap[action] || action;
    
    await logEvent({
        tenant_id: tenantId,
        usuario_id: req.user?.userId || null,
        accion: `${action}_${entity}`,
        descripcion: `Usuario ${accionNombre} ${entity}${entityId ? ` (ID: ${entityId})` : ''} en tenant: ${tenantName}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            entity: entity,
            entity_id: entityId,
            tenant_name: tenantName,
            ...metadata,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar acceso a tenant
 */
async function logTenantAccess(req, tenantId, tenantName, path = null) {
    await logEvent({
        tenant_id: tenantId,
        usuario_id: req.user?.userId || null,
        accion: 'tenant_acceso',
        descripcion: `Acceso a tenant: ${tenantName}${path ? ` (ruta: ${path})` : ''}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            tenant_name: tenantName,
            path: path,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar creación de tenant
 */
async function logTenantCreated(req, tenantId, tenantName, metadata = {}) {
    await logEvent({
        tenant_id: tenantId,
        usuario_id: req.user?.userId || null,
        accion: 'tenant_creado',
        descripcion: `Nuevo tenant creado: ${tenantName}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            tenant_name: tenantName,
            ...metadata,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Registrar error importante
 */
async function logError(req, error, tenantId = null, tenantName = null, metadata = {}) {
    await logEvent({
        tenant_id: tenantId,
        usuario_id: req.user?.userId || null,
        accion: 'error',
        descripcion: `Error en sistema${tenantName ? ` (tenant: ${tenantName})` : ''}: ${error.message || error}`,
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req),
        metadata: {
            tenant_name: tenantName,
            error: error.message || String(error),
            stack: error.stack || null,
            ...metadata,
            timestamp: new Date().toISOString()
        }
    });
}

module.exports = {
    logEvent,
    logLogin,
    logLoginFailed,
    logLogout,
    logReservaCreated,
    logUserAction,
    logTenantAccess,
    logTenantCreated,
    logError,
    getClientIp,
    getUserAgent
};

