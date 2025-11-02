// Controlador de reservas actualizado para el nuevo schema (establecimientos, colaboradores, clientes)

// Obtener todas las reservas (filtra por usuario si no es admin)
exports.getAllReservas = async (req, res) => {
    try {
        const { page = 1, limit = 50, estado, colaborador_id, establecimiento_id, fecha_desde, fecha_hasta } = req.query;
        const offset = (page - 1) * limit;
        const userId = req.user?.userId;
        const userRol = req.user?.rol;
        const isAdmin = userRol === 'admin';
        
        let whereConditions = [];
        let params = [];
        let paramCount = 0;
        
        // Si no es admin, solo mostrar reservas creadas por el usuario
        if (!isAdmin && userId) {
            whereConditions.push(`r.creado_por = $${++paramCount}`);
            params.push(userId);
        }
        
        // Filtros opcionales
        if (estado) {
            whereConditions.push(`r.estado = $${++paramCount}`);
            params.push(estado);
        }
        
        if (colaborador_id) {
            whereConditions.push(`r.colaborador_id = $${++paramCount}`);
            params.push(colaborador_id);
        }
        
        if (establecimiento_id) {
            whereConditions.push(`r.establecimiento_id = $${++paramCount}`);
            params.push(establecimiento_id);
        }
        
        if (fecha_desde) {
            whereConditions.push(`r.fecha_hora_inicio >= $${++paramCount}`);
            params.push(fecha_desde);
        }
        
        if (fecha_hasta) {
            whereConditions.push(`r.fecha_hora_inicio <= $${++paramCount}`);
            params.push(fecha_hasta);
        }
        
        const whereClause = whereConditions.length > 0 ? 
            `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const sql = `
            SELECT 
                r.id,
                r.fecha_hora_inicio,
                r.fecha_hora_inicio as fecha_hora_inicio,
                r.fecha_hora_fin,
                r.cliente_id,
                r.servicio_descripcion,
                r.notas,
                r.precio,
                r.estado,
                r.created_at,
                r.updated_at,
                e.nombre as establecimiento_nombre,
                e.id as establecimiento_id,
                c.nombre as colaborador_nombre,
                c.id as colaborador_id,
                cl.nombre as cliente_nombre,
                cl.telefono as cliente_telefono,
                cl.email as cliente_email,
                cl.dni as cliente_dni,
                u.nombre as creado_por_nombre
            FROM reservas r
            JOIN establecimientos e ON r.establecimiento_id = e.id
            JOIN colaboradores c ON r.colaborador_id = c.id
            JOIN clientes cl ON r.cliente_id = cl.id
            LEFT JOIN usuarios u ON r.creado_por = u.id
            ${whereClause}
            ORDER BY r.fecha_hora_inicio DESC
            LIMIT $${++paramCount} OFFSET $${++paramCount}
        `;
        
        params.push(limit, offset);
        
        const { rows } = await req.db.query(sql, params);
        
        // Contar total de registros para paginación
        const countSql = `
            SELECT COUNT(*) as total
            FROM reservas r
            ${whereClause}
        `;
        const countParams = params.slice(0, -2); // Remover limit y offset
        const { rows: countRows } = await req.db.query(countSql, countParams);
        
        res.json({
            message: 'Lista de reservas obtenida con éxito',
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countRows[0].total),
                pages: Math.ceil(countRows[0].total / limit)
            },
            tenant: req.tenant
        });
    } catch (err) {
        console.error('Error getting reservas:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Obtener una reserva por ID
exports.getReservaById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRol = req.user?.rol;
    const isAdmin = userRol === 'admin';
    
    try {
        let sql = `
            SELECT 
                r.id,
                r.fecha_hora_inicio,
                r.fecha_hora_fin,
                r.cliente_id,
                r.servicio_descripcion,
                r.notas,
                r.precio,
                r.estado,
                r.created_at,
                r.updated_at,
                e.nombre as establecimiento_nombre,
                e.id as establecimiento_id,
                c.nombre as colaborador_nombre,
                c.id as colaborador_id,
                cl.nombre as cliente_nombre,
                cl.telefono as cliente_telefono,
                cl.email as cliente_email,
                cl.dni as cliente_dni,
                u.nombre as creado_por_nombre
            FROM reservas r
            JOIN establecimientos e ON r.establecimiento_id = e.id
            JOIN colaboradores c ON r.colaborador_id = c.id
            JOIN clientes cl ON r.cliente_id = cl.id
            LEFT JOIN usuarios u ON r.creado_por = u.id
            WHERE r.id = $1
        `;
        
        const params = [id];
        
        // Si no es admin, verificar que la reserva sea del usuario
        if (!isAdmin && userId) {
            sql += ` AND r.creado_por = $2`;
            params.push(userId);
        }
        
        const { rows } = await req.db.query(sql, params);
        
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Reserva no encontrada',
                message: 'La reserva solicitada no existe o no tienes permiso para verla'
            });
        }
        
        res.json({
            message: 'Reserva obtenida con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting reserva by id:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Crear una nueva reserva
exports.createReserva = async (req, res) => {
    const { 
        fecha_hora_inicio, 
        fecha_hora_fin, 
        colaborador_id, 
        establecimiento_id,
        cliente_id,
        cliente_nombre,
        cliente_telefono,
        cliente_email,
        cliente_dni,
        servicio_descripcion,
        notas,
        precio
    } = req.body;
    
    const userId = req.user?.userId;
    
    if (!fecha_hora_inicio || !fecha_hora_fin || !colaborador_id || !establecimiento_id) {
        return res.status(400).json({
            error: 'Datos incompletos',
            message: 'fecha_hora_inicio, fecha_hora_fin, colaborador_id y establecimiento_id son requeridos'
        });
    }

    try {
        // Verificar o crear cliente
        let finalClienteId = cliente_id;
        
        if (!finalClienteId && cliente_nombre && cliente_telefono) {
            // Buscar cliente existente o crear uno nuevo
            const clienteQuery = `
                SELECT id FROM clientes 
                WHERE telefono = $1 
                LIMIT 1
            `;
            const clienteResult = await req.db.query(clienteQuery, [cliente_telefono]);
            
            if (clienteResult.rows.length > 0) {
                finalClienteId = clienteResult.rows[0].id;
            } else {
                // Crear nuevo cliente
                const insertCliente = `
                    INSERT INTO clientes (nombre, telefono, email, dni, activo)
                    VALUES ($1, $2, $3, $4, true)
                    RETURNING id
                `;
                const newCliente = await req.db.query(insertCliente, [
                    cliente_nombre,
                    cliente_telefono,
                    cliente_email || null,
                    cliente_dni || null
                ]);
                finalClienteId = newCliente.rows[0].id;
            }
        }
        
        if (!finalClienteId) {
            return res.status(400).json({
                error: 'Cliente requerido',
                message: 'Debes proporcionar cliente_id o los datos del cliente (nombre, teléfono)'
            });
        }

        const fechaInicio = new Date(fecha_hora_inicio);
        const fechaFin = new Date(fecha_hora_fin);

        if (fechaFin <= fechaInicio) {
            return res.status(400).json({
                error: 'Fecha inválida',
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            });
        }

        // Verificar que no haya conflictos de horario con el colaborador
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
        
        const { rows: conflicts } = await req.db.query(conflictSql, [
            colaborador_id, fechaInicio, fechaFin
        ]);
        
        if (conflicts.length > 0) {
            return res.status(409).json({
                error: 'Conflicto de horario',
                message: 'El colaborador ya tiene una reserva en ese horario'
            });
        }

        const sql = `
            INSERT INTO reservas (
                fecha_hora_inicio, 
                fecha_hora_fin, 
                colaborador_id, 
                establecimiento_id,
                cliente_id,
                servicio_descripcion,
                notas,
                precio,
                estado,
                creado_por
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmada', $9) 
            RETURNING *
        `;
        
        const params = [
            fechaInicio, 
            fechaFin, 
            colaborador_id, 
            establecimiento_id,
            finalClienteId,
            servicio_descripcion || null,
            notas || null,
            precio || null,
            userId || null
        ];

        const { rows } = await req.db.query(sql, params);
        
        // Emitir evento WebSocket para notificar a los clientes conectados
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('reserva-created', rows[0]);
        }
        
        res.status(201).json({
            message: 'Reserva creada exitosamente',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error creating reserva:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Actualizar una reserva
exports.updateReserva = async (req, res) => {
    const { id } = req.params;
    const { fecha_hora_inicio, fecha_hora_fin, estado, notas, precio } = req.body;
    const userId = req.user?.userId;
    const userRol = req.user?.rol;
    const isAdmin = userRol === 'admin';
    
    try {
        // Verificar que la reserva exista y que el usuario tenga permiso
        let checkSql = `SELECT creado_por FROM reservas WHERE id = $1`;
        const checkParams = [id];
        
        if (!isAdmin && userId) {
            checkSql += ` AND creado_por = $2`;
            checkParams.push(userId);
        }
        
        const { rows: checkRows } = await req.db.query(checkSql, checkParams);
        
        if (checkRows.length === 0) {
            return res.status(404).json({
                error: 'Reserva no encontrada',
                message: 'La reserva no existe o no tienes permiso para modificarla'
            });
        }

        const updates = [];
        const params = [];
        let paramCount = 0;

        if (fecha_hora_inicio !== undefined) {
            updates.push(`fecha_hora_inicio = $${++paramCount}`);
            params.push(new Date(fecha_hora_inicio));
        }

        if (fecha_hora_fin !== undefined) {
            updates.push(`fecha_hora_fin = $${++paramCount}`);
            params.push(new Date(fecha_hora_fin));
        }

        if (estado !== undefined) {
            updates.push(`estado = $${++paramCount}`);
            params.push(estado);
        }

        if (notas !== undefined) {
            updates.push(`notas = $${++paramCount}`);
            params.push(notas);
        }

        if (precio !== undefined) {
            updates.push(`precio = $${++paramCount}`);
            params.push(precio);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Sin cambios',
                message: 'No se proporcionaron datos para actualizar'
            });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const sql = `
            UPDATE reservas 
            SET ${updates.join(', ')}
            WHERE id = $${++paramCount}
            RETURNING *
        `;

        const { rows } = await req.db.query(sql, params);
        
        // Emitir evento WebSocket
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('reserva-updated', rows[0]);
        }
        
        res.json({
            message: 'Reserva actualizada exitosamente',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error updating reserva:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Cancelar una reserva
exports.cancelReserva = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRol = req.user?.rol;
    const isAdmin = userRol === 'admin';
    
    try {
        // Verificar que la reserva exista y que el usuario tenga permiso
        let checkSql = `SELECT id, estado FROM reservas WHERE id = $1`;
        const checkParams = [id];
        
        if (!isAdmin && userId) {
            checkSql += ` AND creado_por = $2`;
            checkParams.push(userId);
        }
        
        const { rows: checkRows } = await req.db.query(checkSql, checkParams);
        
        if (checkRows.length === 0) {
            return res.status(404).json({
                error: 'Reserva no encontrada',
                message: 'La reserva no existe o no tienes permiso para cancelarla'
            });
        }

        if (checkRows[0].estado === 'cancelada') {
            return res.status(400).json({
                error: 'Reserva ya cancelada',
                message: 'Esta reserva ya está cancelada'
            });
        }

        const sql = `
            UPDATE reservas 
            SET estado = 'cancelada', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const { rows } = await req.db.query(sql, [id]);
        
        // Emitir evento WebSocket
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('reserva-cancelled', rows[0]);
        }
        
        res.json({
            message: 'Reserva cancelada exitosamente',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error canceling reserva:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Eliminar una reserva (solo admin)
exports.deleteReserva = async (req, res) => {
    const { id } = req.params;
    const userRol = req.user?.rol;
    const isAdmin = userRol === 'admin';
    
    if (!isAdmin) {
        return res.status(403).json({
            error: 'Permiso denegado',
            message: 'Solo los administradores pueden eliminar reservas'
        });
    }
    
    try {
        const sql = `DELETE FROM reservas WHERE id = $1 RETURNING *`;
        const { rows } = await req.db.query(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Reserva no encontrada',
                message: 'La reserva no existe'
            });
        }
        
        // Emitir evento WebSocket
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('reserva-deleted', { id });
        }
        
        res.json({
            message: 'Reserva eliminada exitosamente'
        });
    } catch (err) {
        console.error('Error deleting reserva:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

