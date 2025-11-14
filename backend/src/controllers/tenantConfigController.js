/**
 * Controlador para gestión de configuración personalizada de tenants
 */

const tenantConfigService = require('../services/tenantConfigService');

class TenantConfigController {
    /**
     * Obtener configuración del tenant actual
     * GET /api/admin/tenant/config
     */
    async getConfig(req, res) {
        try {
            const { db } = req;
            const tenantId = req.tenantId || req.user?.tenant_id;

            if (!tenantId) {
                return res.status(400).json({
                    success: false,
                    error: 'No se pudo identificar el tenant'
                });
            }

            // Obtener tenant desde BD global
            const { Pool } = require('pg');
            const globalPool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            });

            const result = await globalPool.query(
                'SELECT * FROM tenants WHERE id = $1',
                [tenantId]
            );

            await globalPool.end();

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tenant no encontrado'
                });
            }

            const tenant = result.rows[0];
            const config = tenantConfigService.getTenantConfig(tenant);

            res.json({
                success: true,
                data: {
                    tenant: {
                        id: tenant.id,
                        tenant_name: tenant.tenant_name,
                        display_name: tenant.display_name
                    },
                    config: config,
                    raw: tenant.config || {}
                }
            });
        } catch (error) {
            console.error('Error obteniendo configuración del tenant:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Actualizar configuración del tenant actual
     * PUT /api/admin/tenant/config
     */
    async updateConfig(req, res) {
        try {
            const { config, display_name, logo_url } = req.body;
            const tenantId = req.tenantId || req.user?.tenant_id;

            if (!tenantId) {
                return res.status(400).json({
                    success: false,
                    error: 'No se pudo identificar el tenant'
                });
            }

            if (!config || typeof config !== 'object') {
                return res.status(400).json({
                    success: false,
                    error: 'Configuración inválida'
                });
            }

            // Validar y normalizar configuración
            const normalizedConfig = tenantConfigService.validateAndNormalizeConfig(config);

            // Actualizar en BD global
            const { Pool } = require('pg');
            const globalPool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            });

            // Construir query dinámicamente según qué campos se envían
            const updates = ['config = $1', 'updated_at = CURRENT_TIMESTAMP'];
            const values = [JSON.stringify(normalizedConfig)];
            let paramIndex = 2;

            if (display_name) {
                updates.push(`display_name = $${paramIndex}`);
                values.push(display_name);
                paramIndex++;
            }

            if (logo_url !== undefined) {
                updates.push(`logo_url = $${paramIndex}`);
                values.push(logo_url);
                paramIndex++;
            }

            values.push(tenantId);

            const result = await globalPool.query(
                `UPDATE tenants 
                 SET ${updates.join(', ')}
                 WHERE id = $${paramIndex}
                 RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                await globalPool.end();
                return res.status(404).json({
                    success: false,
                    error: 'Tenant no encontrado'
                });
            }

            const tenant = result.rows[0];
            const tenantName = tenant.tenant_name;

            await globalPool.end();

            // Emitir evento WebSocket a todos los usuarios del tenant para actualizar configuración globalmente
            const io = req.app.get('io');
            if (io && tenantName) {
                io.to(tenantName).emit('tenant-config-updated', {
                    type: 'updated',
                    entity: 'tenant-config',
                    data: normalizedConfig,
                    timestamp: new Date().toISOString()
                });
                console.log(`📡 Emitiendo evento tenant-config-updated al tenant ${tenantName}`);
            }

            res.json({
                success: true,
                data: {
                    config: normalizedConfig,
                    message: 'Configuración actualizada exitosamente'
                }
            });
        } catch (error) {
            console.error('Error actualizando configuración del tenant:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener configuración pública de un tenant (sin autenticación)
     * GET /api/public/tenant/config/:tenantName
     */
    async getPublicConfig(req, res) {
        try {
            const { tenantName } = req.params;

            const { Pool } = require('pg');
            const globalPool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            });

            const result = await globalPool.query(
                'SELECT * FROM tenants WHERE tenant_name = $1 AND estado = $2',
                [tenantName, 'activo']
            );

            await globalPool.end();

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tenant no encontrado'
                });
            }

            const tenant = result.rows[0];
            const config = tenantConfigService.getTenantConfig(tenant);

            // Retornar solo información pública
            res.json({
                success: true,
                data: {
                    tenant_name: tenant.tenant_name,
                    display_name: tenant.display_name,
                    config: {
                        entityNames: config.entityNames,
                        uiLabels: config.uiLabels,
                        reservationMode: config.reservationMode
                        // No incluir features (información interna)
                    }
                }
            });
        } catch (error) {
            console.error('Error obteniendo configuración pública:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new TenantConfigController();


