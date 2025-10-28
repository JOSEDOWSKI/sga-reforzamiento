const bcrypt = require('bcryptjs');

/**
 * Controlador para gestión de tenants (Super Administración)
 */
class TenantController {
    
    /**
     * Obtener todos los tenants
     */
    async getAllTenants(req, res) {
        try {
            const { page = 1, limit = 10, estado, plan } = req.query;
            const offset = (page - 1) * limit;
            
            let query = 'SELECT * FROM tenants WHERE 1=1';
            const params = [];
            let paramCount = 0;
            
            if (estado) {
                paramCount++;
                query += ` AND estado = $${paramCount}`;
                params.push(estado);
            }
            
            if (plan) {
                paramCount++;
                query += ` AND plan = $${paramCount}`;
                params.push(plan);
            }
            
            query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(limit, offset);
            
            const result = await req.db.query(query, params);
            
            // Contar total de tenants
            let countQuery = 'SELECT COUNT(*) as total FROM tenants WHERE 1=1';
            const countParams = [];
            let countParamCount = 0;
            
            if (estado) {
                countParamCount++;
                countQuery += ` AND estado = $${countParamCount}`;
                countParams.push(estado);
            }
            
            if (plan) {
                countParamCount++;
                countQuery += ` AND plan = $${countParamCount}`;
                countParams.push(plan);
            }
            
            const countResult = await req.db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);
            
            res.json({
                success: true,
                data: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting tenants:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tenants'
            });
        }
    }
    
    /**
     * Obtener un tenant por ID
     */
    async getTenantById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await req.db.query(
                'SELECT * FROM tenants WHERE id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error getting tenant:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tenant'
            });
        }
    }
    
    /**
     * Crear un nuevo tenant
     */
    async createTenant(req, res) {
        try {
            const {
                tenant_name,
                display_name,
                cliente_nombre,
                cliente_email,
                cliente_telefono,
                cliente_direccion,
                plan = 'basico',
                logo_url,
                primary_color = '#007bff',
                secondary_color = '#6c757d',
                timezone = 'UTC',
                locale = 'es-ES'
            } = req.body;
            
            // Validar datos requeridos
            if (!tenant_name || !display_name || !cliente_nombre || !cliente_email) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos'
                });
            }
            
            // Verificar que el tenant_name no exista
            const existingTenant = await req.db.query(
                'SELECT id FROM tenants WHERE tenant_name = $1',
                [tenant_name]
            );
            
            if (existingTenant.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del tenant ya existe'
                });
            }
            
            // Crear el tenant
            const result = await req.db.query(`
                INSERT INTO tenants (
                    tenant_name, display_name, cliente_nombre, cliente_email,
                    cliente_telefono, cliente_direccion, plan, logo_url,
                    primary_color, secondary_color, timezone, locale
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `, [
                tenant_name, display_name, cliente_nombre, cliente_email,
                cliente_telefono, cliente_direccion, plan, logo_url,
                primary_color, secondary_color, timezone, locale
            ]);
            
            // TODO: Crear la base de datos del tenant
            // await createTenantDatabase(tenant_name);
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Tenant creado exitosamente'
            });
        } catch (error) {
            console.error('Error creating tenant:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear tenant'
            });
        }
    }
    
    /**
     * Actualizar un tenant
     */
    async updateTenant(req, res) {
        try {
            const { id } = req.params;
            const {
                display_name,
                cliente_nombre,
                cliente_email,
                cliente_telefono,
                cliente_direccion,
                plan,
                estado,
                logo_url,
                primary_color,
                secondary_color,
                timezone,
                locale
            } = req.body;
            
            // Construir query dinámicamente
            const updates = [];
            const params = [];
            let paramCount = 0;
            
            if (display_name !== undefined) {
                paramCount++;
                updates.push(`display_name = $${paramCount}`);
                params.push(display_name);
            }
            
            if (cliente_nombre !== undefined) {
                paramCount++;
                updates.push(`cliente_nombre = $${paramCount}`);
                params.push(cliente_nombre);
            }
            
            if (cliente_email !== undefined) {
                paramCount++;
                updates.push(`cliente_email = $${paramCount}`);
                params.push(cliente_email);
            }
            
            if (cliente_telefono !== undefined) {
                paramCount++;
                updates.push(`cliente_telefono = $${paramCount}`);
                params.push(cliente_telefono);
            }
            
            if (cliente_direccion !== undefined) {
                paramCount++;
                updates.push(`cliente_direccion = $${paramCount}`);
                params.push(cliente_direccion);
            }
            
            if (plan !== undefined) {
                paramCount++;
                updates.push(`plan = $${paramCount}`);
                params.push(plan);
            }
            
            if (estado !== undefined) {
                paramCount++;
                updates.push(`estado = $${paramCount}`);
                params.push(estado);
            }
            
            if (logo_url !== undefined) {
                paramCount++;
                updates.push(`logo_url = $${paramCount}`);
                params.push(logo_url);
            }
            
            if (primary_color !== undefined) {
                paramCount++;
                updates.push(`primary_color = $${paramCount}`);
                params.push(primary_color);
            }
            
            if (secondary_color !== undefined) {
                paramCount++;
                updates.push(`secondary_color = $${paramCount}`);
                params.push(secondary_color);
            }
            
            if (timezone !== undefined) {
                paramCount++;
                updates.push(`timezone = $${paramCount}`);
                params.push(timezone);
            }
            
            if (locale !== undefined) {
                paramCount++;
                updates.push(`locale = $${paramCount}`);
                params.push(locale);
            }
            
            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No hay datos para actualizar'
                });
            }
            
            paramCount++;
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            params.push(id);
            
            const query = `
                UPDATE tenants 
                SET ${updates.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;
            
            const result = await req.db.query(query, params);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Tenant actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error updating tenant:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar tenant'
            });
        }
    }
    
    /**
     * Eliminar un tenant
     */
    async deleteTenant(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el tenant existe
            const tenant = await req.db.query(
                'SELECT tenant_name FROM tenants WHERE id = $1',
                [id]
            );
            
            if (tenant.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }
            
            // Eliminar el tenant
            await req.db.query('DELETE FROM tenants WHERE id = $1', [id]);
            
            // TODO: Eliminar la base de datos del tenant
            // await deleteTenantDatabase(tenant.rows[0].tenant_name);
            
            res.json({
                success: true,
                message: 'Tenant eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error deleting tenant:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar tenant'
            });
        }
    }
    
    /**
     * Obtener estadísticas de tenants
     */
    async getTenantStats(req, res) {
        try {
            const stats = await req.db.query(`
                SELECT 
                    COUNT(*) as total_tenants,
                    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as active_tenants,
                    COUNT(CASE WHEN estado = 'suspendido' THEN 1 END) as suspended_tenants,
                    COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelled_tenants,
                    COUNT(CASE WHEN plan = 'basico' THEN 1 END) as basic_plan,
                    COUNT(CASE WHEN plan = 'premium' THEN 1 END) as premium_plan,
                    COUNT(CASE WHEN plan = 'enterprise' THEN 1 END) as enterprise_plan
                FROM tenants
            `);
            
            res.json({
                success: true,
                data: stats.rows[0]
            });
        } catch (error) {
            console.error('Error getting tenant stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }
}

module.exports = new TenantController();
