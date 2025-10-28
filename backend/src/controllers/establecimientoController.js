const { Pool } = require('pg');

/**
 * Controlador para gestión de establecimientos
 */
class EstablecimientoController {
    
    /**
     * Obtener todos los establecimientos
     */
    async getAll(req, res) {
        try {
            const { db } = req;
            const result = await db.query(
                'SELECT * FROM establecimientos WHERE activo = true ORDER BY nombre ASC'
            );
            
            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error obteniendo establecimientos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Obtener establecimiento por ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'SELECT * FROM establecimientos WHERE id = $1 AND activo = true',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Establecimiento no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo establecimiento:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Crear nuevo establecimiento
     */
    async create(req, res) {
        try {
            const { nombre, descripcion, tipo_negocio, direccion, telefono, email } = req.body;
            const { db } = req;
            
            // Validaciones básicas
            if (!nombre || !tipo_negocio) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre y tipo de negocio son obligatorios'
                });
            }
            
            const result = await db.query(
                `INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, direccion, telefono, email)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [nombre, descripcion, tipo_negocio, direccion, telefono, email]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Establecimiento creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando establecimiento:', error);
            
            if (error.code === '23505') { // Violación de constraint único
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un establecimiento con ese nombre'
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
     * Actualizar establecimiento
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, tipo_negocio, direccion, telefono, email, activo } = req.body;
            const { db } = req;
            
            const result = await db.query(
                `UPDATE establecimientos 
                 SET nombre = $1, descripcion = $2, tipo_negocio = $3, direccion = $4, 
                     telefono = $5, email = $6, activo = $7, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $8
                 RETURNING *`,
                [nombre, descripcion, tipo_negocio, direccion, telefono, email, activo, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Establecimiento no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Establecimiento actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando establecimiento:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Eliminar establecimiento (soft delete)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'UPDATE establecimientos SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Establecimiento no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Establecimiento eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando establecimiento:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Obtener horarios de atención de un establecimiento
     */
    async getHorarios(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                `SELECT h.*, e.nombre as establecimiento_nombre
                 FROM horarios_atencion h
                 JOIN establecimientos e ON h.establecimiento_id = e.id
                 WHERE h.establecimiento_id = $1 AND h.activo = true
                 ORDER BY h.dia_semana ASC`,
                [id]
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
     * Obtener colaboradores de un establecimiento
     */
    async getColaboradores(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                `SELECT c.*, e.nombre as establecimiento_nombre
                 FROM colaboradores c
                 JOIN establecimientos e ON c.establecimiento_id = e.id
                 WHERE c.establecimiento_id = $1 AND c.activo = true
                 ORDER BY c.nombre ASC`,
                [id]
            );
            
            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error obteniendo colaboradores:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new EstablecimientoController();
