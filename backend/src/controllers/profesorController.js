// Obtener todos los profesores
exports.getAllProfesores = async (req, res) => {
    try {
        const { rows } = await req.db.query(
            'SELECT * FROM profesores WHERE activo = true ORDER BY nombre ASC'
        );
        res.json({
            message: 'Lista de profesores obtenida con éxito',
            data: rows,
            tenant: req.tenant
        });
    } catch (err) {
        console.error('Error getting profesores:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Obtener un profesor por ID
exports.getProfesorById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await req.db.query(
            'SELECT * FROM profesores WHERE id = $1 AND activo = true',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        
        res.json({
            message: 'Profesor obtenido con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting profesor by ID:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Crear un nuevo profesor
exports.createProfesor = async (req, res) => {
    const { nombre, email, telefono, especialidades, tarifa_por_hora } = req.body;
    
    if (!nombre || !email) {
        return res.status(400).json({ 
            error: 'Los campos nombre y email son obligatorios' 
        });
    }

    const sql = `
        INSERT INTO profesores (nombre, email, telefono, especialidades, tarifa_por_hora, updated_at) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
        RETURNING *
    `;
    
    try {
        const { rows } = await req.db.query(sql, [
            nombre, 
            email, 
            telefono || null, 
            especialidades || [], 
            tarifa_por_hora || null
        ]);
        
        res.status(201).json({
            message: 'Profesor creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error creating profesor:', err);
        
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ 
                error: 'Ya existe un profesor con ese email' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Actualizar un profesor existente
exports.updateProfesor = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, especialidades, tarifa_por_hora, activo } = req.body;
    
    try {
        const sql = `
            UPDATE profesores 
            SET nombre = COALESCE($1, nombre),
                email = COALESCE($2, email),
                telefono = COALESCE($3, telefono),
                especialidades = COALESCE($4, especialidades),
                tarifa_por_hora = COALESCE($5, tarifa_por_hora),
                activo = COALESCE($6, activo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 AND activo = true
            RETURNING *
        `;
        
        const { rows, rowCount } = await req.db.query(sql, [
            nombre, email, telefono, especialidades, tarifa_por_hora, activo, id
        ]);
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        
        res.json({
            message: 'Profesor actualizado con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error updating profesor:', err);
        
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ 
                error: 'Ya existe un profesor con ese email' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Eliminar un profesor (soft delete)
exports.deleteProfesor = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await req.db.query(
            'UPDATE profesores SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND activo = true',
            [id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        
        res.json({ message: 'Profesor eliminado con éxito' });
    } catch (err) {
        console.error('Error deleting profesor:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
}; 