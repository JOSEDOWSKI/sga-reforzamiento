const pool = require('../config/database');

// Obtener todos los profesores
exports.getAllProfesores = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM profesores ORDER BY id ASC');
        res.json({
            message: 'Lista de profesores obtenida con éxito',
            data: rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo profesor (opcional, para poblar la BD)
exports.createProfesor = async (req, res) => {
    const { nombre, email } = req.body;
    if (!nombre || !email) {
        return res.status(400).json({ error: 'Los campos nombre y email son obligatorios' });
    }

    const sql = 'INSERT INTO profesores (nombre, email) VALUES ($1, $2) RETURNING *';
    try {
        const { rows } = await pool.query(sql, [nombre, email]);
        res.status(201).json({
            message: 'Profesor creado con éxito',
            data: rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 