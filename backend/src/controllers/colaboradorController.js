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
            // LEFT JOIN para incluir colaboradores sin establecimiento asignado
            const result = await db.query(
                `SELECT 
                    c.id,
                    c.nombre,
                    c.apellido,
                    c.email,
                    c.telefono,
                    c.dni,
                    c.especialidades,
                    c.precio,
                    c.tarifa_por_hora,
                    c.activo,
                    c.establecimiento_id,
                    e.nombre as establecimiento_nombre,
                    e.tipo_negocio
                 FROM colaboradores c
                 LEFT JOIN establecimientos e ON c.establecimiento_id = e.id
                 WHERE c.activo = true 
                 ORDER BY c.nombre ASC, c.apellido ASC`
            );
            
            // Mapear especialidades a especialidad para compatibilidad con frontend
            const mappedData = result.rows.map(row => ({
                ...row,
                especialidad: row.especialidades || '',
                nombre_completo: `${row.nombre || ''} ${row.apellido || ''}`.trim() || row.nombre
            }));
            
            res.json({
                success: true,
                data: mappedData,
                count: mappedData.length
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
                `SELECT 
                    c.id,
                    c.nombre,
                    c.apellido,
                    c.email,
                    c.telefono,
                    c.dni,
                    c.especialidades,
                    c.precio,
                    c.tarifa_por_hora,
                    c.activo,
                    c.establecimiento_id,
                    e.nombre as establecimiento_nombre,
                    e.tipo_negocio
                 FROM colaboradores c
                 LEFT JOIN establecimientos e ON c.establecimiento_id = e.id
                 WHERE c.id = $1 AND c.activo = true`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Colaborador no encontrado'
                });
            }
            
            // Mapear especialidades a especialidad para compatibilidad con frontend
            const mappedData = {
                ...result.rows[0],
                especialidad: result.rows[0].especialidades || '',
                nombre_completo: `${result.rows[0].nombre || ''} ${result.rows[0].apellido || ''}`.trim() || result.rows[0].nombre
            };
            
            res.json({
                success: true,
                data: mappedData
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
            const { nombre, apellido, email, telefono, dni, especialidades, precio, tarifa_por_hora, establecimiento_id } = req.body;
            const { db } = req;
            
            // Validaciones básicas
            if (!nombre || !email) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre y email son obligatorios'
                });
            }
            
            // Si no hay establecimiento_id, permitir NULL (opcional)
            const result = await db.query(
                `INSERT INTO colaboradores (nombre, apellido, email, telefono, dni, especialidades, precio, tarifa_por_hora, establecimiento_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [nombre, apellido || null, email, telefono || null, dni || null, especialidades || null, precio || null, tarifa_por_hora || null, establecimiento_id || null]
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
            const { nombre, apellido, email, telefono, dni, especialidades, precio, tarifa_por_hora, establecimiento_id, activo } = req.body;
            const { db } = req;
            
            const result = await db.query(
                `UPDATE colaboradores 
                 SET nombre = $1, apellido = $2, email = $3, telefono = $4, dni = $5, especialidades = $6, 
                     precio = $7, tarifa_por_hora = $8, establecimiento_id = $9, activo = $10, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $11
                 RETURNING *`,
                [nombre, apellido || null, email, telefono || null, dni || null, especialidades || null, precio || null, tarifa_por_hora || null, establecimiento_id || null, activo !== undefined ? activo : true, id]
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
