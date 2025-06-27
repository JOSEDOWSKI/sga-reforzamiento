const pool = require('../config/database');

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

// Crear un nuevo tema para un curso
exports.createTema = async (req, res) => {
    const { curso_id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }

    const sql = 'INSERT INTO temas (nombre, curso_id) VALUES ($1, $2) RETURNING *';
    try {
        const { rows } = await pool.query(sql, [nombre, curso_id]);
        res.status(201).json({
            message: 'Tema creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 