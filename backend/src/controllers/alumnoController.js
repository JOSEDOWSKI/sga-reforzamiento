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
    const sql = `
        INSERT INTO alumnos (nombre, telefono, dni, email, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
    `;
    try {
        const { rows } = await req.db.query(sql, [nombre, telefono, dni || null, email || null]);
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
        res.json({ message: 'Alumno eliminado con éxito' });
    } catch (err) {
        console.error('Error deleting alumno:', err);
        res.status(500).json({ error: 'Error interno del servidor', message: err.message });
    }
};


