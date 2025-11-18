const { Pool } = require('pg');

/**
 * Controlador para gestión de inmuebles
 */
class InmuebleController {
    
    /**
     * Obtener todos los inmuebles
     */
    async getAll(req, res) {
        try {
            const { db } = req;
            const result = await db.query(
                `SELECT 
                    i.id,
                    i.nombre,
                    i.descripcion,
                    i.precio,
                    i.activo,
                    i.establecimiento_id,
                    e.nombre as establecimiento_nombre
                 FROM inmuebles i
                 LEFT JOIN establecimientos e ON i.establecimiento_id = e.id
                 WHERE i.activo = true 
                 ORDER BY i.nombre ASC`
            );
            
            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error obteniendo inmuebles:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Obtener inmueble por ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                `SELECT 
                    i.id,
                    i.nombre,
                    i.descripcion,
                    i.precio,
                    i.activo,
                    i.establecimiento_id,
                    e.nombre as establecimiento_nombre
                 FROM inmuebles i
                 LEFT JOIN establecimientos e ON i.establecimiento_id = e.id
                 WHERE i.id = $1 AND i.activo = true`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Inmueble no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo inmueble:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Crear nuevo inmueble
     */
    async create(req, res) {
        try {
            const { nombre, descripcion, precio, establecimiento_id } = req.body;
            const { db } = req;
            
            // Validaciones básicas
            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    error: 'El nombre es obligatorio'
                });
            }
            
            const result = await db.query(
                `INSERT INTO inmuebles (nombre, descripcion, precio, establecimiento_id)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [nombre, descripcion || null, precio || null, establecimiento_id || null]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Inmueble creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando inmueble:', error);
            
            if (error.code === '23505') { // Violación de constraint único
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un inmueble con ese nombre'
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
     * Actualizar inmueble
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, establecimiento_id, activo } = req.body;
            const { db } = req;
            
            const result = await db.query(
                `UPDATE inmuebles 
                 SET nombre = $1, descripcion = $2, precio = $3, establecimiento_id = $4, 
                     activo = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6
                 RETURNING *`,
                [nombre, descripcion || null, precio || null, establecimiento_id || null, activo !== undefined ? activo : true, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Inmueble no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Inmueble actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando inmueble:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Eliminar inmueble (soft delete)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'UPDATE inmuebles SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Inmueble no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Inmueble eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando inmueble:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Obtener horarios de un inmueble
     */
    async getHorarios(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                `SELECT * FROM horarios_inmuebles 
                 WHERE inmueble_id = $1 AND activo = true
                 ORDER BY dia_semana ASC`,
                [id]
            );
            
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error obteniendo horarios de inmueble:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Actualizar horarios de un inmueble
     */
    async updateHorarios(req, res) {
        try {
            const { id } = req.params;
            const { horarios } = req.body; // Array de horarios: [{dia_semana, hora_inicio, hora_fin, activo}]
            const { db } = req;
            
            // Iniciar transacción
            await db.query('BEGIN');
            
            try {
                // Eliminar horarios existentes
                await db.query(
                    'UPDATE horarios_inmuebles SET activo = false WHERE inmueble_id = $1',
                    [id]
                );
                
                // Insertar nuevos horarios
                if (horarios && Array.isArray(horarios)) {
                    for (const horario of horarios) {
                        await db.query(
                            `INSERT INTO horarios_inmuebles (inmueble_id, dia_semana, hora_inicio, hora_fin, activo)
                             VALUES ($1, $2, $3, $4, $5)
                             ON CONFLICT (inmueble_id, dia_semana) 
                             DO UPDATE SET hora_inicio = $3, hora_fin = $4, activo = $5, updated_at = CURRENT_TIMESTAMP`,
                            [id, horario.dia_semana, horario.hora_inicio, horario.hora_fin, horario.activo !== false]
                        );
                    }
                }
                
                await db.query('COMMIT');
                
                res.json({
                    success: true,
                    message: 'Horarios actualizados exitosamente'
                });
            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Error actualizando horarios de inmueble:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new InmuebleController();

