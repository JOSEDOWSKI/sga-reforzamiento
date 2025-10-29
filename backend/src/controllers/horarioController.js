const { Pool } = require('pg');

/**
 * Controlador para gestión de horarios de atención
 */
class HorarioController {
    
    /**
     * Obtener todos los horarios
     */
    async getAll(req, res) {
        try {
            const { db } = req;
            const result = await db.query(
                `SELECT h.*, e.nombre as establecimiento_nombre, e.tipo_negocio
                 FROM horarios_atencion h
                 JOIN establecimientos e ON h.establecimiento_id = e.id
                 WHERE h.activo = true 
                 ORDER BY h.establecimiento_id, h.dia_semana ASC`
            );
            
            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error obteniendo horarios:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Obtener horarios por establecimiento
     */
    async getByEstablecimiento(req, res) {
        try {
            const { establecimiento_id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                `SELECT h.*, e.nombre as establecimiento_nombre, e.tipo_negocio
                 FROM horarios_atencion h
                 JOIN establecimientos e ON h.establecimiento_id = e.id
                 WHERE h.establecimiento_id = $1 AND h.activo = true
                 ORDER BY h.dia_semana ASC`,
                [establecimiento_id]
            );
            
            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error obteniendo horarios por establecimiento:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Crear nuevo horario
     */
    async create(req, res) {
        try {
            const { establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos } = req.body;
            const { db } = req;
            
            // Validaciones básicas
            if (!establecimiento_id || dia_semana === undefined || !hora_apertura || !hora_cierre) {
                return res.status(400).json({
                    success: false,
                    error: 'Establecimiento, día de semana, hora de apertura y cierre son obligatorios'
                });
            }
            
            // Validar día de semana
            if (dia_semana < 0 || dia_semana > 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Día de semana debe estar entre 0 (domingo) y 6 (sábado)'
                });
            }
            
            const result = await db.query(
                `INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos || 30]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Horario creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando horario:', error);
            
            if (error.code === '23505') { // Violación de constraint único
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un horario para este establecimiento en este día de la semana'
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Actualizar horario
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo } = req.body;
            const { db } = req;
            
            const result = await db.query(
                `UPDATE horarios_atencion 
                 SET dia_semana = $1, hora_apertura = $2, hora_cierre = $3, 
                     intervalo_minutos = $4, activo = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6
                 RETURNING *`,
                [dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Horario no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Horario actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando horario:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Eliminar horario (soft delete)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'UPDATE horarios_atencion SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Horario no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Horario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando horario:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Crear horarios por defecto para un establecimiento
     */
    async createDefaultHorarios(req, res) {
        try {
            const { establecimiento_id } = req.params;
            const { db } = req;
            
            // Verificar que el establecimiento existe
            const establecimientoResult = await db.query(
                'SELECT id FROM establecimientos WHERE id = $1 AND activo = true',
                [establecimiento_id]
            );
            
            if (establecimientoResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Establecimiento no encontrado'
                });
            }
            
            // Crear horarios por defecto (lunes a viernes)
            const horarios = [
                { dia_semana: 1, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30 },
                { dia_semana: 2, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30 },
                { dia_semana: 3, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30 },
                { dia_semana: 4, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30 },
                { dia_semana: 5, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30 },
                { dia_semana: 6, hora_apertura: '10:00', hora_cierre: '16:00', intervalo_minutos: 30 }
            ];
            
            const createdHorarios = [];
            
            for (const horario of horarios) {
                try {
                    const result = await db.query(
                        `INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos)
                         VALUES ($1, $2, $3, $4, $5)
                         RETURNING *`,
                        [establecimiento_id, horario.dia_semana, horario.hora_apertura, horario.hora_cierre, horario.intervalo_minutos]
                    );
                    createdHorarios.push(result.rows[0]);
                } catch (error) {
                    // Si ya existe el horario, continuar
                    if (error.code !== '23505') {
                        throw error;
                    }
                }
            }
            
            res.status(201).json({
                success: true,
                data: createdHorarios,
                message: 'Horarios por defecto creados exitosamente'
            });
        } catch (error) {
            console.error('Error creando horarios por defecto:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new HorarioController();
