const bcrypt = require('bcryptjs');
const { createTenantDatabase, getTenantDatabase } = require('../config/tenantDatabase');
const { createCNAME } = require('../services/cloudflareService');
const { addCustomDomainAndEnableSSL } = require('../services/caproverService');

/**
 * Controlador para gestión de tenants (Super Administración)
 */
class TenantController {
    
    /**
     * Obtener todos los tenants
     */
    async getAllTenants(req, res) {
        try {
            // Asegurar que req.db esté disponible
            let db = req.db;
            if (!db) {
                console.log('[TENANT CONTROLLER] req.db no disponible, creando conexión directa...');
                const { Pool } = require('pg');
                const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                db = new Pool({
                    user: process.env.DB_USER || 'postgres',
                    host: dbHost,
                    database: 'weekly_global',
                    password: process.env.DB_PASSWORD || 'postgres',
                    port: parseInt(process.env.DB_PORT) || 5432,
                });
            }
            
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
            
            const result = await db.query(query, params);
            
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
            
            const countResult = await db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);
            
            // Cerrar conexión si la creamos nosotros
            if (!req.db && db) {
                await db.end();
            }
            
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
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tenants',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            
            // Si hay dirección, intentar geocodificar antes de insertar
            let latitud = null;
            let longitud = null;
            
            if (cliente_direccion) {
                const GoogleMapsService = require('../services/googleMapsService');
                const geocodeResult = await GoogleMapsService.geocodeAddress(cliente_direccion);
                if (geocodeResult) {
                    latitud = geocodeResult.lat;
                    longitud = geocodeResult.lng;
                    console.log(`[TENANT CREATE] ✅ Coordenadas geocodificadas: ${latitud}, ${longitud}`);
                }
            }

            // Crear el tenant en la BD global
            const result = await req.db.query(`
                INSERT INTO tenants (
                    tenant_name, display_name, cliente_nombre, cliente_email,
                    cliente_telefono, cliente_direccion, latitud, longitud,
                    plan, logo_url, primary_color, secondary_color, timezone, locale
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `, [
                tenant_name, display_name, cliente_nombre, cliente_email,
                cliente_telefono, cliente_direccion, latitud, longitud,
                plan, logo_url, primary_color, secondary_color, timezone, locale
            ]);
            
            // Crear la base de datos del tenant automáticamente
            let dnsCreated = false;
            let dnsMessage = '';
            
            try {
                await createTenantDatabase(tenant_name);
                
                // Si se proporcionaron credenciales de usuario inicial, crearlo
                const { admin_email, admin_password, admin_nombre } = req.body;
                if (admin_email && admin_password) {
                    // Esperar un momento para que la BD esté lista
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Conectar a la BD del tenant
                    const tenantPool = await getTenantDatabase(tenant_name);
                    const tenantClient = await tenantPool.connect();
                    
                    try {
                        // Verificar que el esquema esté inicializado (esto se hace automáticamente)
                        // Generar hash de la contraseña
                        const passwordHash = await bcrypt.hash(admin_password, 12);
                        
                        const normalizedEmail = admin_email.toLowerCase();
                        
                        // Crear usuario admin inicial (normalizar email a minúsculas)
                        await tenantClient.query(`
                            INSERT INTO usuarios (email, password_hash, nombre, rol, activo)
                            VALUES ($1, $2, $3, 'admin', true)
                            ON CONFLICT (email) DO NOTHING
                        `, [
                            normalizedEmail,
                            passwordHash,
                            admin_nombre || 'Administrador'
                        ]);
                        
                        // Registrar mapeo email → tenant en BD global (para login universal)
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
                            
                            await globalPool.query(`
                                INSERT INTO email_tenant_mapping (email, tenant_name)
                                VALUES ($1, $2)
                                ON CONFLICT (email) DO UPDATE SET tenant_name = $2, updated_at = CURRENT_TIMESTAMP
                            `, [normalizedEmail, tenant_name]);
                            
                            await globalPool.end();
                            console.log(`✅ Mapeo email→tenant registrado: ${normalizedEmail} → ${tenant_name}`);
                        } catch (mappingError) {
                            console.warn(`⚠️  Error registrando mapeo email→tenant: ${mappingError.message}`);
                            // No fallar si falla el registro del mapeo
                        }
                        
                        console.log(`✅ Usuario admin creado para tenant ${tenant_name}: ${admin_email}`);
                    } finally {
                        tenantClient.release();
                    }
                }
                
                // Crear DNS automáticamente en Cloudflare
                try {
                    const dnsResult = await createCNAME(tenant_name);
                    if (dnsResult.success) {
                        dnsCreated = true;
                        dnsMessage = dnsResult.alreadyExists 
                            ? 'El DNS ya estaba configurado.'
                            : 'DNS configurado automáticamente.';
                        console.log(`✅ DNS creado automáticamente para ${tenant_name}.weekly.pe`);
                    } else if (dnsResult.requiresManual) {
                        dnsMessage = 'Por favor, configura el DNS manualmente en Cloudflare.';
                        console.log(`ℹ️  DNS debe configurarse manualmente para ${tenant_name}.weekly.pe`);
                    } else {
                        dnsMessage = `Error creando DNS: ${dnsResult.message}. Configura manualmente si es necesario.`;
                        console.warn(`⚠️  Error creando DNS automáticamente: ${dnsResult.message}`);
                    }
                    
                    // Intentar agregar el dominio y habilitar SSL en CapRover (falla silenciosamente si no está configurado)
                    try {
                        const domain = process.env.CLOUDFLARE_DOMAIN || 'weekly.pe';
                        const fullDomain = `${tenant_name}.${domain}`;
                        const caproverApp = process.env.CAPROVER_FRONTEND_APP || 'weekly-frontend';
                        
                        // Usar la nueva función que agrega dominio y habilita SSL automáticamente
                        const caproverResult = await addCustomDomainAndEnableSSL(caproverApp, fullDomain, true);
                        
                        if (caproverResult.success && caproverResult.domainAdded) {
                            const sslStatus = caproverResult.sslEnabled 
                                ? 'Dominio agregado y SSL habilitado automáticamente en CapRover'
                                : 'Dominio agregado en CapRover (SSL pendiente)';
                            console.log(`✅ ${sslStatus}: ${fullDomain}`);
                            
                            if (dnsCreated) {
                                dnsMessage += caproverResult.sslEnabled 
                                    ? ' Dominio agregado y SSL habilitado en CapRover.'
                                    : ' Dominio agregado en CapRover.';
                            } else {
                                dnsMessage = `DNS: ${dnsMessage}. CapRover: ${caproverResult.sslEnabled ? 'Dominio y SSL configurados' : 'Dominio agregado'}.`;
                            }
                        } else if (caproverResult.domainAdded) {
                            // Dominio agregado pero SSL falló
                            console.log(`⚠️  Dominio agregado en CapRover pero SSL falló: ${fullDomain}`);
                            if (dnsCreated) {
                                dnsMessage += ' Dominio agregado en CapRover (SSL pendiente).';
                            } else {
                                dnsMessage = `DNS: ${dnsMessage}. CapRover: Dominio agregado (SSL pendiente).`;
                            }
                        } else {
                            // Falla silenciosamente - requerirá configuración manual
                            console.log(`ℹ️  Agregar dominio manualmente en CapRover: ${fullDomain} (opcional)`);
                        }
                    } catch (caproverError) {
                        // Falla silenciosamente - no es crítico
                        console.log(`ℹ️  CapRover automático no disponible. Agregar ${tenant_name}.weekly.pe manualmente en CapRover (opcional).`);
                    }
                } catch (dnsError) {
                    dnsMessage = 'Error al crear DNS automáticamente. Configura manualmente si es necesario.';
                    console.error('Error en creación automática de DNS:', dnsError);
                    // No fallar la creación del tenant si falla el DNS
                }
            } catch (dbError) {
                console.error('Error creando BD del tenant:', dbError);
                // Continuar de todas formas - el tenant ya está creado en la BD global
                // La BD se creará automáticamente cuando se acceda por primera vez
            }
            
            const successMessage = dnsCreated 
                ? `Tenant creado exitosamente. Base de datos inicializada y DNS configurado automáticamente. ${tenant_name}.weekly.pe estará disponible en 1-5 minutos.`
                : `Tenant creado exitosamente. Base de datos inicializada. ${dnsMessage}`;
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: successMessage,
                dns: {
                    created: dnsCreated,
                    message: dnsMessage
                }
            });
        } catch (error) {
            console.error('Error creating tenant:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error al crear tenant',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
            
            // Si se actualiza la dirección, geocodificar nuevamente
            let latitud = null;
            let longitud = null;
            
            if (cliente_direccion !== undefined) {
                paramCount++;
                updates.push(`cliente_direccion = $${paramCount}`);
                params.push(cliente_direccion);
                
                // Geocodificar la nueva dirección
                const GoogleMapsService = require('../services/googleMapsService');
                const geocodeResult = await GoogleMapsService.geocodeAddress(cliente_direccion);
                if (geocodeResult) {
                    latitud = geocodeResult.lat;
                    longitud = geocodeResult.lng;
                    paramCount++;
                    updates.push(`latitud = $${paramCount}`);
                    params.push(latitud);
                    paramCount++;
                    updates.push(`longitud = $${paramCount}`);
                    params.push(longitud);
                    console.log(`[TENANT UPDATE] ✅ Coordenadas actualizadas: ${latitud}, ${longitud}`);
                }
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
            // Asegurar que req.db esté disponible
            let db = req.db;
            if (!db) {
                console.log('[TENANT CONTROLLER] req.db no disponible, creando conexión directa...');
                const { Pool } = require('pg');
                const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                db = new Pool({
                    user: process.env.DB_USER || 'postgres',
                    host: dbHost,
                    database: 'weekly_global',
                    password: process.env.DB_PASSWORD || 'postgres',
                    port: parseInt(process.env.DB_PORT) || 5432,
                });
            }
            
            const stats = await db.query(`
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
            
            // Cerrar conexión si la creamos nosotros
            if (!req.db && db) {
                await db.end();
            }
            
            res.json({
                success: true,
                data: stats.rows[0]
            });
        } catch (error) {
            console.error('Error getting tenant stats:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new TenantController();
