const pool = require('../config/database');

// Obtener todos los temas
exports.getAllTemas = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM temas ORDER BY id ASC');
        res.json({
            message: 'Lista de temas obtenida con éxito',
            data: rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todos los temas de un curso específico
exports.getTemasByCurso = async (req, res) => {
    const { curso_id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM temas WHERE curso_id = $1 ORDER BY id ASC', [curso_id]);
        res.json({
            message: `Temas para el curso ${curso_id} obtenidos con éxito`,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo tema
exports.createTema = async (req, res) => {
    const { nombre, descripcion, curso_id } = req.body;
    if (!nombre || !curso_id) {
        return res.status(400).json({ error: 'Los campos nombre y curso_id son obligatorios' });
    }

    const sql = 'INSERT INTO temas (nombre, descripcion, curso_id) VALUES ($1, $2, $3) RETURNING *';
    try {
        const { rows } = await pool.query(sql, [nombre, descripcion || null, curso_id]);
        res.status(201).json({
            message: 'Tema creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un tema existente
exports.updateTema = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, curso_id } = req.body;
    
    if (!nombre || !curso_id) {
        return res.status(400).json({ error: 'Los campos nombre y curso_id son obligatorios' });
    }

    const sql = 'UPDATE temas SET nombre = $1, descripcion = $2, curso_id = $3 WHERE id = $4 RETURNING *';
    try {
        const { rows } = await pool.query(sql, [nombre, descripcion || null, curso_id, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tema no encontrado' });
        }
        res.json({
            message: 'Tema actualizado con éxito',
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un tema
exports.deleteTema = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('DELETE FROM temas WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tema no encontrado' });
        }
        res.json({
            message: 'Tema eliminado con éxito',
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 