/**
 * Servicio para búsqueda y discovery de tenants
 * Para la aplicación móvil tipo Rappi
 */

const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'weekly_global',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

/**
 * Calcular distancia entre dos puntos (Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Obtener todos los tenants activos con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de tenants
 */
async function discoverTenants(filters = {}) {
    const {
        categoria,
        latitud,
        longitud,
        radio_km = 10,
        search,
        limit = 50,
        offset = 0
    } = filters;

    const pool = new Pool(dbConfig);

    try {
        let sql = `
            SELECT 
                t.id,
                t.tenant_name,
                t.display_name,
                t.cliente_nombre,
                t.cliente_direccion,
                t.cliente_telefono,
                t.cliente_email,
                t.latitud,
                t.longitud,
                t.logo_url,
                t.primary_color,
                t.secondary_color,
                t.estado,
                t.plan,
                t.created_at,
                COALESCE(
                    (SELECT AVG(calificacion)::NUMERIC(3,2)
                     FROM tenant_reviews
                     WHERE tenant_id = t.id),
                    0
                ) as rating,
                COALESCE(
                    (SELECT COUNT(*)
                     FROM tenant_reviews
                     WHERE tenant_id = t.id),
                    0
                ) as total_reviews,
                COALESCE(
                    (SELECT COUNT(*)
                     FROM tenant_categorias
                     WHERE tenant_id = t.id),
                    0
                ) as categorias_count
            FROM tenants t
            WHERE t.estado = 'activo'
        `;

        const params = [];
        let paramCount = 0;

        // Filtro por categoría
        if (categoria) {
            sql += ` AND EXISTS (
                SELECT 1 FROM tenant_categorias tc
                WHERE tc.tenant_id = t.id
                AND tc.categoria = $${++paramCount}
            )`;
            params.push(categoria);
        }

        // Filtro por búsqueda de texto
        if (search) {
            sql += ` AND (
                t.display_name ILIKE $${++paramCount}
                OR t.cliente_nombre ILIKE $${paramCount}
                OR t.cliente_direccion ILIKE $${paramCount}
            )`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY t.display_name ASC`;

        // Límite y offset
        if (limit) {
            sql += ` LIMIT $${++paramCount}`;
            params.push(limit);
        }
        if (offset) {
            sql += ` OFFSET $${++paramCount}`;
            params.push(offset);
        }

        const result = await pool.query(sql, params);
        let tenants = result.rows;

        // Si hay coordenadas, calcular distancia y filtrar por radio
        if (latitud && longitud) {
            tenants = tenants
                .map(tenant => {
                    if (tenant.latitud && tenant.longitud) {
                        const distancia = calculateDistance(
                            latitud,
                            longitud,
                            parseFloat(tenant.latitud),
                            parseFloat(tenant.longitud)
                        );
                        tenant.distancia_km = parseFloat(distancia.toFixed(2));
                        return tenant;
                    }
                    return null;
                })
                .filter(tenant => tenant !== null)
                .filter(tenant => tenant.distancia_km <= radio_km)
                .sort((a, b) => a.distancia_km - b.distancia_km);
        }

        // Obtener categorías de cada tenant
        for (const tenant of tenants) {
            const categoriasResult = await pool.query(
                'SELECT categoria FROM tenant_categorias WHERE tenant_id = $1',
                [tenant.id]
            );
            tenant.categorias = categoriasResult.rows.map(r => r.categoria);
        }

        await pool.end();
        return tenants;
    } catch (error) {
        await pool.end();
        throw error;
    }
}

/**
 * Obtener detalles completos de un tenant
 * @param {string} tenantName - Nombre del tenant
 * @returns {Promise<Object>} Detalles del tenant
 */
async function getTenantDetails(tenantName) {
    const pool = new Pool(dbConfig);

    try {
        // Obtener información del tenant
        const tenantResult = await pool.query(
            `SELECT 
                t.*,
                COALESCE(
                    (SELECT AVG(calificacion)::NUMERIC(3,2)
                     FROM tenant_reviews
                     WHERE tenant_id = t.id),
                    0
                ) as rating,
                COALESCE(
                    (SELECT COUNT(*)
                     FROM tenant_reviews
                     WHERE tenant_id = t.id),
                    0
                ) as total_reviews
            FROM tenants t
            WHERE t.tenant_name = $1 AND t.estado = 'activo`,
            [tenantName]
        );

        if (tenantResult.rows.length === 0) {
            await pool.end();
            return null;
        }

        const tenant = tenantResult.rows[0];

        // Obtener categorías
        const categoriasResult = await pool.query(
            'SELECT categoria FROM tenant_categorias WHERE tenant_id = $1',
            [tenant.id]
        );
        tenant.categorias = categoriasResult.rows.map(r => r.categoria);

        // Obtener reviews recientes
        const reviewsResult = await pool.query(
            `SELECT 
                r.calificacion,
                r.comentario,
                r.created_at,
                u.nombre as usuario_nombre
            FROM tenant_reviews r
            JOIN usuarios_movil u ON r.usuario_movil_id = u.id
            WHERE r.tenant_id = $1
            ORDER BY r.created_at DESC
            LIMIT 10`,
            [tenant.id]
        );
        tenant.reviews = reviewsResult.rows;

        await pool.end();
        return tenant;
    } catch (error) {
        await pool.end();
        throw error;
    }
}

/**
 * Obtener categorías disponibles
 * @returns {Promise<Array>} Lista de categorías con conteo
 */
async function getAvailableCategories() {
    const pool = new Pool(dbConfig);

    try {
        const result = await pool.query(`
            SELECT 
                categoria,
                COUNT(*) as total_tenants
            FROM tenant_categorias tc
            JOIN tenants t ON tc.tenant_id = t.id
            WHERE t.estado = 'activo'
            GROUP BY categoria
            ORDER BY total_tenants DESC, categoria ASC
        `);

        await pool.end();
        return result.rows;
    } catch (error) {
        await pool.end();
        throw error;
    }
}

module.exports = {
    discoverTenants,
    getTenantDetails,
    getAvailableCategories,
    calculateDistance
};


