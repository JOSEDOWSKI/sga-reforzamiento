// Obtener todos los temas
exports.getAllTemas = async (req, res) => {
    try {
        const sql = `
            SELECT t.*, c.nombre as curso_nombre 
            FROM temas t
            JOIN cursos c ON t.curso_id = c.id
            WHERE t.activo = true AND c.activo = true
            ORDER BY c.nombre, t.orden, t.nombre
        `;
        
        const { rows } = await req.db.query(sql);
        res.json({
            message: 'Lista de temas obtenida con éxito',
            data: rows,
            tenant: req.tenant
        });
    } catch (err) {
        console.error('Error getting temas:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Obtener todos los temas de un curso específico
exports.getTemasByCurso = async (req, res) => {
    const { curso_id } = req.params;
    try {
        const sql = `
            SELECT t.*, c.nombre as curso_nombre 
            FROM temas t
            JOIN cursos c ON t.curso_id = c.id
            WHERE t.curso_id = $1 AND t.activo = true AND c.activo = true
            ORDER BY t.orden, t.nombre
        `;
        
        const { rows } = await req.db.query(sql, [curso_id]);
        res.json({
            message: `Temas para el curso ${curso_id} obtenidos con éxito`,
            data: rows
        });
    } catch (err) {
        console.error('Error getting temas by curso:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Obtener un tema por ID
exports.getTemaById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT t.*, c.nombre as curso_nombre 
            FROM temas t
            JOIN cursos c ON t.curso_id = c.id
            WHERE t.id = $1 AND t.activo = true AND c.activo = true
        `;
        
        const { rows } = await req.db.query(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tema no encontrado' });
        }
        
        res.json({
            message: 'Tema obtenido con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting tema by ID:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Crear un nuevo tema para un curso
exports.createTema = async (req, res) => {
    const { nombre, descripcion, curso_id, orden } = req.body;
    
    if (!nombre || !curso_id) {
        return res.status(400).json({ 
            error: 'Los campos nombre y curso_id son obligatorios' 
        });
    }
    
    try {
        // Verificar que el curso existe y está activo
        const cursoCheck = await req.db.query(
            'SELECT id FROM cursos WHERE id = $1 AND activo = true',
            [curso_id]
        );
        
        if (cursoCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        
        const sql = `
            INSERT INTO temas (nombre, descripcion, curso_id, orden, updated_at) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
            RETURNING *
        `;
        
        const { rows } = await req.db.query(sql, [
            nombre, 
            descripcion || null, 
            curso_id, 
            orden || 1
        ]);
        
        // Emitir evento tiempo real
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('tema-created', {
                type: 'created',
                entity: 'tema',
                data: rows[0],
                timestamp: new Date().toISOString()
            });
        }

        res.status(201).json({
            message: 'Tema creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error creating tema:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Editar un tema existente
exports.updateTema = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, curso_id, orden, activo } = req.body;
    
    try {
        // Si se está cambiando el curso, verificar que existe
        if (curso_id) {
            const cursoCheck = await req.db.query(
                'SELECT id FROM cursos WHERE id = $1 AND activo = true',
                [curso_id]
            );
            
            if (cursoCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }
        }
        
        const sql = `
            UPDATE temas 
            SET nombre = COALESCE($1, nombre),
                descripcion = COALESCE($2, descripcion),
                curso_id = COALESCE($3, curso_id),
                orden = COALESCE($4, orden),
                activo = COALESCE($5, activo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND activo = true
            RETURNING *
        `;
        
        const { rows, rowCount } = await req.db.query(sql, [
            nombre, descripcion, curso_id, orden, activo, id
        ]);
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Tema no encontrado' });
        }
        
        // Emitir evento tiempo real
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('tema-updated', {
                type: 'updated',
                entity: 'tema',
                data: rows[0],
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            message: 'Tema actualizado con éxito',
            data: rows[0]
        });
    } catch (err) {
        console.error('Error updating tema:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
};

// Eliminar un tema (soft delete)
exports.deleteTema = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await req.db.query(
            'UPDATE temas SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND activo = true',
            [id]
        );
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Tema no encontrado' });
        }
        
        // Emitir evento tiempo real
        const io = req.app.get('io');
        if (io && req.tenant) {
            io.to(req.tenant).emit('tema-deleted', {
                type: 'deleted',
                entity: 'tema',
                data: { id: parseInt(id) },
                timestamp: new Date().toISOString()
            });
        }

        res.json({ message: 'Tema eliminado con éxito' });
    } catch (err) {
        console.error('Error deleting tema:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: err.message 
        });
    }
}; 