// Obtener todos los alumnos
exports.getAllAlumnos = async (req, res) => {
    try {
        const { rows } = await req.db.query(
            'SELECT * FROM alumnos WHERE activo = true ORDER BY nombre ASC'
        );
        res.json({
            message: 'Lista de alumnos obtenida con éxito',
            data: rows,
            tenant: req.tenant
        });
    } catch (err) {
        console.error('Error getting alumnos:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Obtener un alumno por ID
exports.getAlumnoById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await req.db.query(
            'SELECT * FROM alumnos WHERE id = $1 AND activo = true',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        res.json({ message: 'Alumno obtenido con éxito', data: rows[0] });
    } catch (err) {
        console.error('Error getting alumno by ID:', err);
        res.status(500).json({ error: 'Error interno del servidor', message: err.message });
    }
};

// Crear un nuevo alumno
exports.createAlumno = async (req, res) => {
    const { nombre, telefono, dni, email } = req.body;
    if (!nombre || !telefono) {
        return res.status(400).json({ error: 'Los campos nombre y telefono son obligatorios' });
    }
    
    try {
        // Verificar si ya existe un alumno con el mismo nombre
        const checkSql = 'SELECT id FROM alumnos WHERE nombre = $1 AND activo = true';
        const checkResult = await req.db.query(checkSql, [nombre.trim()]);
        
        if (checkResult.rows.length > 0) {
            return res.status(409).json({ error: 'Ya existe un alumno con este nombre' });
        }
        
        // Solo incluir dni y email si tienen valores válidos
        const hasDni = dni && dni.trim() !== '';
        const hasEmail = email && email.trim() !== '';
        
        let sql, params;
        
        if (hasDni && hasEmail) {
            sql = `
                INSERT INTO alumnos (nombre, telefono, dni, email, updated_at)
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            params = [nombre.trim(), telefono.trim(), dni.trim(), email.trim()];
        } else if (hasDni) {
            sql = `
                INSERT INTO alumnos (nombre, telefono, dni, updated_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            params = [nombre.trim(), telefono.trim(), dni.trim()];
        } else if (hasEmail) {
            sql = `
                INSERT INTO alumnos (nombre, telefono, email, updated_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            params = [nombre.trim(), telefono.trim(), email.trim()];
        } else {
            sql = `
                INSERT INTO alumnos (nombre, telefono, updated_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            params = [nombre.trim(), telefono.trim()];
        }
        
        const { rows } = await req.db.query(sql, params);

        // Emitir evento tiempo real
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('alumno-created', {
                type: 'created',
                entity: 'alumno',
                data: rows[0],
                timestamp: new Date().toISOString()
            });
        }

        res.status(201).json({ message: 'Alumno creado con éxito', data: rows[0] });
    } catch (err) {
        console.error('Error creating alumno:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'DNI o email ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor', message: err.message });
    }
};

// Actualizar un alumno existente
exports.updateAlumno = async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, dni, email, activo } = req.body;
    try {
        const sql = `
            UPDATE alumnos
            SET nombre = COALESCE($1, nombre),
                telefono = COALESCE($2, telefono),
                dni = COALESCE($3, dni),
                email = COALESCE($4, email),
                activo = COALESCE($5, activo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND activo = true
            RETURNING *
        `;
        const { rows, rowCount } = await req.db.query(sql, [nombre, telefono, dni, email, activo, id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        // Emitir evento tiempo real
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('alumno-updated', {
                type: 'updated',
                entity: 'alumno',
                data: rows[0],
                timestamp: new Date().toISOString()
            });
        }

        res.json({ message: 'Alumno actualizado con éxito', data: rows[0] });
    } catch (err) {
        console.error('Error updating alumno:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'DNI o email ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor', message: err.message });
    }
};

// Eliminar un alumno (soft delete)
exports.deleteAlumno = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await req.db.query(
            'UPDATE alumnos SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND activo = true',
            [id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        // Emitir evento tiempo real
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('alumno-deleted', {
                type: 'deleted',
                entity: 'alumno',
                data: { id: parseInt(id) },
                timestamp: new Date().toISOString()
            });
        }

        res.json({ message: 'Alumno eliminado con éxito' });
    } catch (err) {
        console.error('Error deleting alumno:', err);
        res.status(500).json({ error: 'Error interno del servidor', message: err.message });
    }
};

// Buscar alumnos por nombre (búsqueda inteligente optimizada)
exports.searchAlumnos = async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 1) {
        return res.json({
            message: 'Búsqueda de alumnos',
            data: [],
            tenant: req.tenant
        });
    }

    try {
        const searchTerm = `%${q.trim()}%`;
        const exactTerm = q.trim();
        
        const { rows } = await req.db.query(
            `SELECT id, nombre, telefono, email, dni 
             FROM alumnos 
             WHERE activo = true 
             AND (nombre ILIKE $1 OR telefono ILIKE $1 OR email ILIKE $1 OR dni ILIKE $1)
             ORDER BY 
                 CASE 
                     WHEN nombre ILIKE $2 THEN 1
                     WHEN nombre ILIKE $3 THEN 2
                     WHEN telefono ILIKE $2 THEN 3
                     WHEN email ILIKE $2 THEN 4
                     WHEN dni ILIKE $2 THEN 5
                     ELSE 6
                 END,
                 nombre ASC
             LIMIT 8`,
            [searchTerm, `${exactTerm}%`, `%${exactTerm}%`]
        );
        
        res.json({
            message: 'Búsqueda de alumnos completada',
            data: rows,
            tenant: req.tenant
        });
    } catch (err) {
        console.error('Error searching alumnos:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};


