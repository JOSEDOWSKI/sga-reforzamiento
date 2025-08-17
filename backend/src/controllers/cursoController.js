// Obtener todos los cursos
exports.getAllCursos = async (req, res) => {
    try {
        const { rows } = await req.db.query(
            'SELECT * FROM cursos WHERE activo = true ORDER BY nombre ASC'
        );
        res.json({
            message: 'Lista de cursos obtenida con éxito',
            data: rows,
            tenant: req.tenant
        });
    } catch (err) {
        console.error('Error getting cursos:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Obtener un curso por ID
exports.getCursoById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await req.db.query(
            'SELECT * FROM cursos WHERE id = $1 AND activo = true',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        
        res.json({
            message: 'Curso obtenido con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting curso by ID:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Crear un nuevo curso
exports.createCurso = async (req, res) => {
    const { nombre, descripcion, precio, duracion_minutos } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }

    const sql = `
        INSERT INTO cursos (nombre, descripcion, precio, duracion_minutos, updated_at) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
        RETURNING *
    `;
    
    try {
        const { rows } = await req.db.query(sql, [
            nombre, 
            descripcion || null, 
            precio || null, 
            duracion_minutos || 60
        ]);
        
        res.status(201).json({
            message: 'Curso creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error creating curso:', err);
        
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ 
                error: 'Ya existe un curso con ese nombre' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Actualizar un curso
exports.updateCurso = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracion_minutos, activo } = req.body;
    
    try {
        const sql = `
            UPDATE cursos 
            SET nombre = COALESCE($1, nombre),
                descripcion = COALESCE($2, descripcion),
                precio = COALESCE($3, precio),
                duracion_minutos = COALESCE($4, duracion_minutos),
                activo = COALESCE($5, activo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND activo = true
            RETURNING *
        `;
        
        const { rows, rowCount } = await req.db.query(sql, [
            nombre, descripcion, precio, duracion_minutos, activo, id
        ]);
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        
        res.json({
            message: 'Curso actualizado con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error updating curso:', err);
        
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ 
                error: 'Ya existe un curso con ese nombre' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Eliminar un curso por ID (soft delete)
exports.deleteCurso = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await req.db.query(
            'UPDATE cursos SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND activo = true',
            [id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        
        res.json({ message: 'Curso eliminado con éxito' });
    } catch (err) {
        console.error('Error deleting curso:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
}; 