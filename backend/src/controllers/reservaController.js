// Obtener todas las reservas
exports.getAllReservas = async (req, res) => {
    try {
        const { page = 1, limit = 50, estado, profesor_id, fecha_desde, fecha_hasta } = req.query;
        const offset = (page - 1) * limit;
        
        let whereConditions = [];
        let params = [];
        let paramCount = 0;
        
        // Filtros opcionales
        if (estado) {
            whereConditions.push(`r.estado = $${++paramCount}`);
            params.push(estado);
        }
        
        if (profesor_id) {
            whereConditions.push(`r.profesor_id = $${++paramCount}`);
            params.push(profesor_id);
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
                r.fecha_hora_fin,
                r.nombre_alumno,
                r.email_alumno,
                r.telefono_alumno,
                r.notas,
                r.precio,
                r.estado,
                r.created_at,
                r.updated_at,
                c.nombre as curso_nombre,
                p.nombre as profesor_nombre,
                t.nombre as tema_nombre,
                u.nombre as creado_por_nombre
            FROM reservas r
            JOIN cursos c ON r.curso_id = c.id
            JOIN profesores p ON r.profesor_id = p.id
            JOIN temas t ON r.tema_id = t.id
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
    try {
        const sql = `
            SELECT 
                r.*,
                c.nombre as curso_nombre,
                p.nombre as profesor_nombre,
                p.email as profesor_email,
                t.nombre as tema_nombre,
                u.nombre as creado_por_nombre
            FROM reservas r
            JOIN cursos c ON r.curso_id = c.id
            JOIN profesores p ON r.profesor_id = p.id
            JOIN temas t ON r.tema_id = t.id
            LEFT JOIN usuarios u ON r.creado_por = u.id
            WHERE r.id = $1
        `;
        
        const { rows } = await req.db.query(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        
        res.json({
            message: 'Reserva obtenida con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting reserva by ID:', err);
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
        profesor_id, 
        curso_id, 
        tema_id, 
        nombre_alumno,
        email_alumno,
        telefono_alumno,
        notas,
        precio
    } = req.body;

    if (!fecha_hora_inicio || !fecha_hora_fin || !profesor_id || !curso_id || !tema_id || !nombre_alumno) {
        return res.status(400).json({ 
            error: 'Los campos fecha_hora_inicio, fecha_hora_fin, profesor_id, curso_id, tema_id y nombre_alumno son obligatorios' 
        });
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    const fechaInicio = new Date(fecha_hora_inicio);
    const fechaFin = new Date(fecha_hora_fin);
    
    if (fechaFin <= fechaInicio) {
        return res.status(400).json({ 
            error: 'La fecha de fin debe ser posterior a la fecha de inicio' 
        });
    }

    // Verificar que no haya conflictos de horario con el profesor
    try {
        const conflictSql = `
            SELECT id FROM reservas 
            WHERE profesor_id = $1 
            AND estado != 'cancelada'
            AND (
                (fecha_hora_inicio <= $2 AND fecha_hora_fin > $2) OR
                (fecha_hora_inicio < $3 AND fecha_hora_fin >= $3) OR
                (fecha_hora_inicio >= $2 AND fecha_hora_fin <= $3)
            )
        `;
        
        const { rows: conflicts } = await req.db.query(conflictSql, [
            profesor_id, fechaInicio, fechaFin
        ]);
        
        if (conflicts.length > 0) {
            return res.status(409).json({
                error: 'Conflicto de horario',
                message: 'El profesor ya tiene una reserva en ese horario'
            });
        }

        const sql = `
            INSERT INTO reservas (
                fecha_hora_inicio, 
                fecha_hora_fin, 
                profesor_id, 
                curso_id, 
                tema_id, 
                nombre_alumno,
                email_alumno,
                telefono_alumno,
                notas,
                precio,
                creado_por,
                updated_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP) 
            RETURNING *
        `;
        
        const params = [
            fechaInicio, 
            fechaFin, 
            profesor_id, 
            curso_id, 
            tema_id, 
            nombre_alumno,
            email_alumno || null,
            telefono_alumno || null,
            notas || null,
            precio || null,
            req.user?.id || null // Si hay sistema de autenticación
        ];

        const { rows } = await req.db.query(sql, params);
        
        res.status(201).json({
            message: 'Reserva creada con éxito',
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
    const { 
        fecha_hora_inicio, 
        fecha_hora_fin, 
        profesor_id, 
        curso_id, 
        tema_id, 
        nombre_alumno,
        email_alumno,
        telefono_alumno,
        notas,
        precio,
        estado
    } = req.body;
    
    try {
        // Si se están actualizando fechas, verificar conflictos
        if (fecha_hora_inicio && fecha_hora_fin && profesor_id) {
            const fechaInicio = new Date(fecha_hora_inicio);
            const fechaFin = new Date(fecha_hora_fin);
            
            if (fechaFin <= fechaInicio) {
                return res.status(400).json({ 
                    error: 'La fecha de fin debe ser posterior a la fecha de inicio' 
                });
            }
            
            const conflictSql = `
                SELECT id FROM reservas 
                WHERE profesor_id = $1 
                AND id != $2
                AND estado != 'cancelada'
                AND (
                    (fecha_hora_inicio <= $3 AND fecha_hora_fin > $3) OR
                    (fecha_hora_inicio < $4 AND fecha_hora_fin >= $4) OR
                    (fecha_hora_inicio >= $3 AND fecha_hora_fin <= $4)
                )
            `;
            
            const { rows: conflicts } = await req.db.query(conflictSql, [
                profesor_id, id, fechaInicio, fechaFin
            ]);
            
            if (conflicts.length > 0) {
                return res.status(409).json({
                    error: 'Conflicto de horario',
                    message: 'El profesor ya tiene una reserva en ese horario'
                });
            }
        }
        
        const sql = `
            UPDATE reservas 
            SET fecha_hora_inicio = COALESCE($1, fecha_hora_inicio),
                fecha_hora_fin = COALESCE($2, fecha_hora_fin),
                profesor_id = COALESCE($3, profesor_id),
                curso_id = COALESCE($4, curso_id),
                tema_id = COALESCE($5, tema_id),
                nombre_alumno = COALESCE($6, nombre_alumno),
                email_alumno = COALESCE($7, email_alumno),
                telefono_alumno = COALESCE($8, telefono_alumno),
                notas = COALESCE($9, notas),
                precio = COALESCE($10, precio),
                estado = COALESCE($11, estado),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *
        `;
        
        const { rows, rowCount } = await req.db.query(sql, [
            fecha_hora_inicio ? new Date(fecha_hora_inicio) : null,
            fecha_hora_fin ? new Date(fecha_hora_fin) : null,
            profesor_id, curso_id, tema_id, nombre_alumno,
            email_alumno, telefono_alumno, notas, precio, estado, id
        ]);
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        
        res.json({
            message: 'Reserva actualizada con éxito',
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
    try {
        const { rowCount } = await req.db.query(
            'UPDATE reservas SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['cancelada', id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        
        res.json({ message: 'Reserva cancelada con éxito' });
    } catch (err) {
        console.error('Error canceling reserva:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};