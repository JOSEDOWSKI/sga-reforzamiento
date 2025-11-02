/**
 * Controlador para endpoints públicos (sin autenticación)
 * Permite que usuarios externos vean disponibilidad y agenden citas
 */

class PublicController {
    /**
     * Obtener disponibilidad (solo horarios ocupados/libres, sin datos personales)
     * GET /api/public/availability?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD&servicio_id=X&staff_id=Y
     */
    async getAvailability(req, res) {
        try {
            const { fecha_desde, fecha_hasta, servicio_id, staff_id } = req.query;
            const { db } = req;

            if (!fecha_desde || !fecha_hasta) {
                return res.status(400).json({
                    success: false,
                    error: 'fecha_desde y fecha_hasta son requeridos (formato: YYYY-MM-DD)'
                });
            }

            let sql = `
                SELECT 
                    r.id,
                    r.fecha_hora_inicio,
                    r.fecha_hora_fin,
                    r.establecimiento_id,
                    r.colaborador_id,
                    e.nombre as establecimiento_nombre,
                    c.nombre as colaborador_nombre
                FROM reservas r
                JOIN establecimientos e ON r.establecimiento_id = e.id
                JOIN colaboradores c ON r.colaborador_id = c.id
                WHERE r.estado = 'confirmada'
                AND r.fecha_hora_inicio >= $1
                AND r.fecha_hora_inicio <= $2
            `;

            const params = [fecha_desde, fecha_hasta];
            let paramCount = 2;

            if (servicio_id) {
                sql += ` AND r.establecimiento_id = $${++paramCount}`;
                params.push(servicio_id);
            }

            if (staff_id) {
                sql += ` AND r.colaborador_id = $${++paramCount}`;
                params.push(staff_id);
            }

            sql += ` ORDER BY r.fecha_hora_inicio ASC`;

            const result = await db.query(sql, params);

            // Retornar solo información de disponibilidad (sin datos personales)
            const availability = result.rows.map(row => ({
                id: row.id,
                inicio: row.fecha_hora_inicio,
                fin: row.fecha_hora_fin,
                establecimiento_id: row.establecimiento_id,
                establecimiento_nombre: row.establecimiento_nombre,
                colaborador_id: row.colaborador_id,
                colaborador_nombre: row.colaborador_nombre,
                ocupado: true
            }));

            res.json({
                success: true,
                data: availability,
                message: 'Disponibilidad obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo disponibilidad pública:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener servicios disponibles (público)
     * GET /api/public/servicios
     */
    async getServicios(req, res) {
        try {
            const { db } = req;
            const result = await db.query(
                `SELECT id, nombre, descripcion, tipo_negocio, activo 
                 FROM establecimientos 
                 WHERE activo = true 
                 ORDER BY nombre ASC`
            );

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error obteniendo servicios públicos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener staff/colaboradores disponibles (público)
     * GET /api/public/staff?servicio_id=X
     */
    async getStaff(req, res) {
        try {
            const { servicio_id } = req.query;
            const { db } = req;

            let sql = `
                SELECT id, nombre, email, telefono, especialidades, activo
                FROM colaboradores
                WHERE activo = true
            `;

            const params = [];
            if (servicio_id) {
                sql += ` AND establecimiento_id = $1`;
                params.push(servicio_id);
            }

            sql += ` ORDER BY nombre ASC`;

            const result = await db.query(sql, params);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error obteniendo staff público:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Crear reserva pública (sin autenticación)
     * POST /api/public/reservas
     */
    async createPublicReserva(req, res) {
        try {
            const {
                fecha_hora_inicio,
                fecha_hora_fin,
                establecimiento_id,
                colaborador_id,
                cliente_nombre,
                cliente_telefono,
                cliente_email,
                cliente_dni,
                servicio_descripcion,
                precio,
                notas
            } = req.body;

            const { db } = req;

            // Validaciones
            if (!fecha_hora_inicio || !fecha_hora_fin || !establecimiento_id || 
                !colaborador_id || !cliente_nombre || !cliente_telefono) {
                return res.status(400).json({
                    success: false,
                    error: 'Los campos fecha_hora_inicio, fecha_hora_fin, establecimiento_id, colaborador_id, cliente_nombre y cliente_telefono son obligatorios'
                });
            }

            // Validar que la fecha de fin sea posterior a la fecha de inicio
            const fechaInicio = new Date(fecha_hora_inicio);
            const fechaFin = new Date(fecha_hora_fin);

            if (fechaFin <= fechaInicio) {
                return res.status(400).json({
                    success: false,
                    error: 'La fecha de fin debe ser posterior a la fecha de inicio'
                });
            }

            // Verificar conflictos de horario
            const conflictSql = `
                SELECT id FROM reservas 
                WHERE colaborador_id = $1 
                AND estado != 'cancelada'
                AND (
                    (fecha_hora_inicio <= $2 AND fecha_hora_fin > $2) OR
                    (fecha_hora_inicio < $3 AND fecha_hora_fin >= $3) OR
                    (fecha_hora_inicio >= $2 AND fecha_hora_fin <= $3)
                )
            `;

            const { rows: conflicts } = await db.query(conflictSql, [
                colaborador_id, fechaInicio, fechaFin
            ]);

            if (conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Conflicto de horario',
                    message: 'Este horario ya está ocupado. Por favor, selecciona otro horario.'
                });
            }

            // Buscar o crear cliente
            let cliente_id = null;
            
            // Buscar cliente existente por teléfono
            if (cliente_telefono) {
                const clienteResult = await db.query(
                    'SELECT id FROM clientes WHERE telefono = $1 LIMIT 1',
                    [cliente_telefono]
                );

                if (clienteResult.rows.length > 0) {
                    cliente_id = clienteResult.rows[0].id;
                    // Actualizar datos del cliente si cambió algo
                    await db.query(
                        'UPDATE clientes SET nombre = $1, email = COALESCE($2, email), dni = COALESCE($3, dni), updated_at = CURRENT_TIMESTAMP WHERE id = $4',
                        [cliente_nombre, cliente_email || null, cliente_dni || null, cliente_id]
                    );
                } else {
                    // Crear nuevo cliente
                    const newClienteResult = await db.query(
                        `INSERT INTO clientes (nombre, telefono, email, dni, activo, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                         RETURNING id`,
                        [cliente_nombre, cliente_telefono, cliente_email || null, cliente_dni || null]
                    );
                    cliente_id = newClienteResult.rows[0].id;
                }
            }

            // Crear la reserva
            const reservaSql = `
                INSERT INTO reservas (
                    fecha_hora_inicio,
                    fecha_hora_fin,
                    colaborador_id,
                    establecimiento_id,
                    cliente_id,
                    servicio_descripcion,
                    precio,
                    notas,
                    estado,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmada', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `;

            const reservaParams = [
                fechaInicio,
                fechaFin,
                colaborador_id,
                establecimiento_id,
                cliente_id,
                servicio_descripcion || null,
                precio || null,
                notas || null
            ];

            const { rows: reservaRows } = await db.query(reservaSql, reservaParams);

            // Emitir evento WebSocket
            const io = req.app.get('io');
            if (io && req.tenant) {
                io.to(req.tenant).emit('reserva-created', {
                    type: 'created',
                    data: reservaRows[0],
                    timestamp: new Date().toISOString()
                });
            }

            res.status(201).json({
                success: true,
                message: 'Reserva creada exitosamente',
                data: reservaRows[0]
            });
        } catch (error) {
            console.error('Error creando reserva pública:', error);
            
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    error: 'Ya existe una reserva en este horario'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener horarios de atención de un establecimiento
     * GET /api/public/horarios?establecimiento_id=X
     */
    async getHorarios(req, res) {
        try {
            const { establecimiento_id } = req.query;
            const { db } = req;

            if (!establecimiento_id) {
                return res.status(400).json({
                    success: false,
                    error: 'establecimiento_id es requerido'
                });
            }

            const result = await db.query(
                `SELECT dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo
                 FROM horarios_atencion
                 WHERE establecimiento_id = $1 AND activo = true
                 ORDER BY dia_semana ASC`,
                [establecimiento_id]
            );

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error obteniendo horarios públicos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener lista pública de tenants activos con ubicaciones
     * GET /api/public/tenants
     */
    async getPublicTenants(req, res) {
        try {
            // Para obtener tenants, necesitamos acceder a la BD global
            // Esto requiere una conexión especial a weekly_global
            const { Pool } = require('pg');
            
            const globalDbConfig = {
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            };

            const globalPool = new Pool(globalDbConfig);
            
            const result = await globalPool.query(
                `SELECT 
                    id,
                    tenant_name,
                    display_name,
                    cliente_nombre,
                    cliente_direccion,
                    cliente_telefono,
                    cliente_email,
                    estado,
                    plan
                 FROM tenants
                 WHERE estado = 'activo'
                 ORDER BY display_name ASC`
            );

            await globalPool.end();

            // Mapear a formato del frontend con coordenadas reales o geocodificadas
            const GoogleMapsService = require('../services/googleMapsService');
            
            const tenantsWithLocation = await Promise.all(
                result.rows.map(async (tenant) => {
                    // Intentar obtener coordenadas
                    let coordinates = null;
                    
                    // Si tiene coordenadas en la BD, usarlas
                    if (tenant.latitud && tenant.longitud) {
                        coordinates = [parseFloat(tenant.latitud), parseFloat(tenant.longitud)];
                    }
                    // Si no tiene coordenadas pero tiene dirección, geocodificar (solo una vez, se guarda en BD)
                    else if (tenant.cliente_direccion) {
                        const geocodeResult = await GoogleMapsService.geocodeAndUpdateTenant(tenant);
                        if (geocodeResult) {
                            coordinates = [geocodeResult.lat, geocodeResult.lng];
                        }
                    }
                    
                    // Fallback: coordenadas por defecto para Arequipa
                    if (!coordinates) {
                        const defaultCoords = {
                            'peluqueria': [-16.3980, -71.5400],
                            'academia': [-16.4090, -71.5375],
                            'demo': [-16.4090, -71.5375],
                            'cliente': [-16.4200, -71.5200]
                        };
                        coordinates = defaultCoords[tenant.tenant_name] || [-16.4090, -71.5375];
                    }

                    // Categoría basada en tipo de negocio o nombre
                    let category = 'Otros';
                    if (tenant.tenant_name.includes('peluqueria') || tenant.tenant_name.includes('salon')) {
                        category = 'Peluquería';
                    } else if (tenant.tenant_name.includes('academia') || tenant.tenant_name.includes('clases')) {
                        category = 'Academia';
                    } else if (tenant.tenant_name.includes('clinica') || tenant.tenant_name.includes('dental')) {
                        category = 'Clínica';
                    } else if (tenant.tenant_name.includes('gimnasio') || tenant.tenant_name.includes('fitness')) {
                        category = 'Gimnasio';
                    } else if (tenant.tenant_name.includes('spa')) {
                        category = 'Spa';
                    }

                    return {
                        id: tenant.id,
                        tenant_name: tenant.tenant_name,
                        name: tenant.display_name || tenant.cliente_nombre,
                        category: category,
                        address: tenant.cliente_direccion || 'Arequipa, Perú',
                        phone: tenant.cliente_telefono || '',
                        email: tenant.cliente_email || '',
                        coordinates: coordinates,
                        plan: tenant.plan,
                        estado: tenant.estado
                    };
                })
            );

            res.json({
                success: true,
                data: tenantsWithLocation
            });
        } catch (error) {
            console.error('Error obteniendo tenants públicos:', error);
            
            // Fallback con datos de prueba si falla la BD
            const fallbackTenants = [
                {
                    id: 1,
                    tenant_name: 'demo',
                    name: 'Demo Tenant',
                    category: 'Otros',
                    address: 'Arequipa, Perú',
                    phone: '+51 987 654 321',
                    coordinates: [-16.4090, -71.5375],
                    plan: 'basico',
                    estado: 'activo'
                }
            ];

            res.json({
                success: true,
                data: fallbackTenants,
                warning: 'Usando datos de prueba'
            });
        }
    }
}

module.exports = new PublicController();

