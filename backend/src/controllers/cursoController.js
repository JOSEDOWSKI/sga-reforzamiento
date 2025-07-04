const pool = require('../config/database');

// Obtener todos los cursos
exports.getAllCursos = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM cursos ORDER BY id ASC');
        res.json({
            message: 'Lista de cursos obtenida con éxito',
            data: rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo curso
exports.createCurso = async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }

    const sql = 'INSERT INTO cursos (nombre, descripcion) VALUES ($1, $2) RETURNING *';
    try {
        const { rows } = await pool.query(sql, [nombre, descripcion]);
        res.status(201).json({
            message: 'Curso creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un curso por ID
exports.deleteCurso = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM cursos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.json({ message: 'Curso eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 