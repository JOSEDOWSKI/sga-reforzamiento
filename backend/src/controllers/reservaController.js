const pool = require('../config/database');

// Obtener todas las reservas
exports.getAllReservas = async (req, res) => {
    // Hago un JOIN para obtener los nombres en lugar de solo los IDs
    const sql = `
        SELECT 
            r.id,
            r.fecha_hora_inicio,
            r.fecha_hora_fin,
            r.nombre_alumno,
            c.nombre as curso_nombre,
            p.nombre as profesor_nombre,
            t.nombre as tema_nombre
        FROM reservas r
        JOIN cursos c ON r.curso_id = c.id
        JOIN profesores p ON r.profesor_id = p.id
        JOIN temas t ON r.tema_id = t.id
        ORDER BY r.fecha_hora_inicio ASC
    `;
    try {
        const { rows } = await pool.query(sql);
        res.json({
            message: 'Lista de reservas obtenida con éxito',
            data: rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una nueva reserva
exports.createReserva = async (req, res) => {
    const { fecha_hora_inicio, profesor_id, curso_id, tema_id, nombre_alumno } = req.body;

    if (!fecha_hora_inicio || !profesor_id || !curso_id || !tema_id || !nombre_alumno) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Calculo la fecha de fin (inicio + 1 hora)
    const fechaInicio = new Date(fecha_hora_inicio);
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

    const sql = `
        INSERT INTO reservas (fecha_hora_inicio, fecha_hora_fin, profesor_id, curso_id, tema_id, nombre_alumno) 
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 