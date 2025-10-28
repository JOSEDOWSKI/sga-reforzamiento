const { Pool } = require('pg');

/**
 * Controlador para gestión de clientes
 */
class ClienteController {
    
    /**
     * Obtener todos los clientes
     */
    async getAll(req, res) {
        try {
            const { db } = req;
            const result = await db.query(
                'SELECT * FROM clientes WHERE activo = true ORDER BY nombre ASC'
            );
            
            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Obtener cliente por ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'SELECT * FROM clientes WHERE id = $1 AND activo = true',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Cliente no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo cliente:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Crear nuevo cliente
     */
    async create(req, res) {
        try {
            const { nombre, telefono, dni, email } = req.body;
            const { db } = req;
            
            // Validaciones básicas
            if (!nombre || !telefono) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre y teléfono son obligatorios'
                });
            }
            
            const result = await db.query(
                `INSERT INTO clientes (nombre, telefono, dni, email)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [nombre, telefono, dni, email]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Cliente creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando cliente:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Actualizar cliente
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, telefono, dni, email, activo } = req.body;
            const { db } = req;
            
            const result = await db.query(
                `UPDATE clientes 
                 SET nombre = $1, telefono = $2, dni = $3, email = $4, activo = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6
                 RETURNING *`,
                [nombre, telefono, dni, email, activo, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Cliente no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Cliente actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    
    /**
     * Eliminar cliente (soft delete)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { db } = req;
            
            const result = await db.query(
                'UPDATE clientes SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Cliente no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new ClienteController();
