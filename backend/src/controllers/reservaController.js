const pool = require('../config/database');

// Obtener todas las reservas
exports.getAllReservas = async (req, res) => {
    const sql = `
        SELECT r.id, r.fecha_hora_inicio, r.fecha_hora_fin, p.nombre AS profesor, c.nombre AS curso, t.nombre AS tema, a.nombre AS alumno
        FROM reservas r
        JOIN profesores p ON r.profesor_id = p.id
        JOIN cursos c ON r.curso_id = c.id
        JOIN temas t ON r.tema_id = t.id
        JOIN alumnos a ON r.alumno_id = a.id
        ORDER BY r.fecha_hora_inicio ASC
    `;
    try {
        const { rows } = await pool.query(sql);
        res.json({
            message: 'Lista de reservas obtenida con éxito',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las reservas',
            error: error.message
        });
    }
};

// Crear una nueva reserva
exports.createReserva = async (req, res) => {
    const { fechaInicio, fechaFin, profesor_id, curso_id, tema_id, nombre_alumno } = req.body;
    const sql = `
        INSERT INTO reservas (fecha_hora_inicio, fecha_hora_fin, profesor_id, curso_id, tema_id, alumno_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const params = [fechaInicio, fechaFin, profesor_id, curso_id, tema_id, nombre_alumno];

    try {
        const { rows } = await pool.query(sql, params);
        res.status(201).json({
            message: 'Reserva creada con éxito',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear la reserva',
            error: error.message
        });
    }
}; 