const { Pool } = require('pg');

/**
 * Controlador para gestión de colaboradores
 */
class ColaboradorController {
    
    /**
     * Obtener todos los colaboradores
     */
    async getAll(req, res) {
        try {
            const { db } = req;
            const result = await db.query(
                `SELECT c.*, e.nombre as establecimiento_nombre, e.tipo_negocio
                 FROM colaboradores c
                 JOIN establecimientos e ON c.establecimiento_id = e.id
                 WHERE c.activo = true 
                 ORDER BY c.nombre ASC`
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
    
    /**
     * Obtener colaborador por ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                `SELECT c.*, e.nombre as establecimiento_nombre, e.tipo_negocio
                 FROM colaboradores c
                 JOIN establecimientos e ON c.establecimiento_id = e.id
                 WHERE c.id = $1 AND c.activo = true`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Colaborador no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo colaborador:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Crear nuevo colaborador
     */
    async create(req, res) {
        try {
            const { nombre, email, telefono, especialidades, tarifa_por_hora, establecimiento_id } = req.body;
            const { db } = req;
            
            // Validaciones básicas
            if (!nombre || !email || !establecimiento_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre, email y establecimiento son obligatorios'
                });
            }
            
            const result = await db.query(
                `INSERT INTO colaboradores (nombre, email, telefono, especialidades, tarifa_por_hora, establecimiento_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [nombre, email, telefono, especialidades, tarifa_por_hora, establecimiento_id]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Colaborador creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando colaborador:', error);
            
            if (error.code === '23505') { // Violación de constraint único
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un colaborador con ese email'
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
     * Actualizar colaborador
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, email, telefono, especialidades, tarifa_por_hora, establecimiento_id, activo } = req.body;
            const { db } = req;
            
            const result = await db.query(
                `UPDATE colaboradores 
                 SET nombre = $1, email = $2, telefono = $3, especialidades = $4, 
                     tarifa_por_hora = $5, establecimiento_id = $6, activo = $7, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $8
                 RETURNING *`,
                [nombre, email, telefono, especialidades, tarifa_por_hora, establecimiento_id, activo, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Colaborador no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Colaborador actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando colaborador:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Eliminar colaborador (soft delete)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'UPDATE colaboradores SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Colaborador no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Colaborador eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando colaborador:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new ColaboradorController();
