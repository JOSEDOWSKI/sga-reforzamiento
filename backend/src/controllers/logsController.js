/**
 * Controlador para gestión de logs del sistema
 * Permite a super admins ver actividad de tenants y usuarios
 */

class LogsController {
    /**
     * Obtener logs del sistema con filtros
     * GET /api/super-admin/logs?tenant_id=X&accion=Y&fecha_desde=Z&fecha_hasta=W&limit=100&offset=0
     */
    async getLogs(req, res) {
        try {
            const { tenant_id, usuario_id, accion, fecha_desde, fecha_hasta, limit = 100, offset = 0 } = req.query;
            
            // Conectar a BD global
            const { Pool } = require('pg');
            const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
            const pool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: dbHost,
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            });

            // Construir query con filtros
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            if (tenant_id) {
                whereConditions.push(`l.tenant_id = $${paramIndex}`);
                queryParams.push(parseInt(tenant_id));
                paramIndex++;
            }

            if (usuario_id) {
                whereConditions.push(`l.usuario_id = $${paramIndex}`);
                queryParams.push(parseInt(usuario_id));
                paramIndex++;
            }

            if (accion) {
                whereConditions.push(`l.accion = $${paramIndex}`);
                queryParams.push(accion);
                paramIndex++;
            }

            if (fecha_desde) {
                whereConditions.push(`l.created_at >= $${paramIndex}`);
                queryParams.push(fecha_desde);
                paramIndex++;
            }

            if (fecha_hasta) {
                whereConditions.push(`l.created_at <= $${paramIndex}`);
                queryParams.push(fecha_hasta + ' 23:59:59');
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            // Query principal con JOINs para obtener nombres
            const query = `
                SELECT 
                    l.id,
                    l.tenant_id,
                    l.usuario_id,
                    l.accion,
                    l.descripcion,
                    l.ip_address,
                    l.user_agent,
                    l.metadata,
                    l.created_at,
                    t.tenant_name,
                    t.display_name as tenant_display_name,
                    u.email as usuario_email,
                    u.nombre as usuario_nombre
                FROM logs_sistema l
                LEFT JOIN tenants t ON l.tenant_id = t.id
                LEFT JOIN usuarios_global u ON l.usuario_id = u.id
                ${whereClause}
                ORDER BY l.created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(parseInt(limit));
            queryParams.push(parseInt(offset));

            const result = await pool.query(query, queryParams);

            // Contar total para paginación
            const countQuery = `
                SELECT COUNT(*) as total
                FROM logs_sistema l
                ${whereClause}
            `;
            const countParams = queryParams.slice(0, -2); // Remover limit y offset
            const countResult = await pool.query(
                countQuery,
                countParams.length > 0 ? countParams : []
            );
            const total = parseInt(countResult.rows[0].total);

            await pool.end();

            res.json({
                success: true,
                data: result.rows.map(row => ({
                    ...row,
                    metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : null
                })),
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < total
                }
            });
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo logs',
                message: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de logs
     * GET /api/super-admin/logs/stats?tenant_id=X&fecha_desde=Y&fecha_hasta=Z
     */
    async getLogStats(req, res) {
        try {
            const { tenant_id, fecha_desde, fecha_hasta } = req.query;
            
            const { Pool } = require('pg');
            const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
            const pool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: dbHost,
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            });

            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            if (tenant_id) {
                whereConditions.push(`tenant_id = $${paramIndex}`);
                queryParams.push(parseInt(tenant_id));
                paramIndex++;
            }

            if (fecha_desde) {
                whereConditions.push(`created_at >= $${paramIndex}`);
                queryParams.push(fecha_desde);
                paramIndex++;
            }

            if (fecha_hasta) {
                whereConditions.push(`created_at <= $${paramIndex}`);
                queryParams.push(fecha_hasta + ' 23:59:59');
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            // Estadísticas por acción
            const statsQuery = `
                SELECT 
                    accion,
                    COUNT(*) as total
                FROM logs_sistema
                ${whereClause}
                GROUP BY accion
                ORDER BY total DESC
            `;

            const statsResult = await pool.query(
                statsQuery,
                queryParams.length > 0 ? queryParams : []
            );

            // Estadísticas por tenant
            const tenantStatsQuery = `
                SELECT 
                    t.tenant_name,
                    t.display_name,
                    COUNT(*) as total
                FROM logs_sistema l
                LEFT JOIN tenants t ON l.tenant_id = t.id
                ${whereClause}
                GROUP BY t.tenant_name, t.display_name
                ORDER BY total DESC
                LIMIT 10
            `;

            const tenantStatsResult = await pool.query(
                tenantStatsQuery,
                queryParams.length > 0 ? queryParams : []
            );

            // Total de eventos
            const totalQuery = `
                SELECT COUNT(*) as total
                FROM logs_sistema
                ${whereClause}
            `;
            const totalResult = await pool.query(
                totalQuery,
                queryParams.length > 0 ? queryParams : []
            );

            await pool.end();

            res.json({
                success: true,
                data: {
                    total: parseInt(totalResult.rows[0].total),
                    por_accion: statsResult.rows,
                    por_tenant: tenantStatsResult.rows
                }
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas de logs:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo estadísticas',
                message: error.message
            });
        }
    }
}

module.exports = new LogsController();

