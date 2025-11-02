const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

/**
 * Rutas DEMO - Acceso público sin autenticación solo para demo.weekly.pe
 * Estas rutas devuelven datos de solo lectura del tenant demo
 */

// Obtener servicios del demo (público)
router.get('/servicios', async (req, res) => {
    try {
        if (!req.db) {
            return res.status(500).json({ error: 'Base de datos no disponible' });
        }

        const result = await req.db.query(`
            SELECT id, nombre, descripcion, tipo_negocio, activo
            FROM establecimientos
            WHERE activo = true
            ORDER BY nombre ASC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo servicios demo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener staff del demo (público)
router.get('/staff', async (req, res) => {
    try {
        const { establecimiento_id } = req.query;
        
        if (!req.db) {
            return res.status(500).json({ error: 'Base de datos no disponible' });
        }

        let query = `
            SELECT c.id, c.nombre, c.email, c.telefono, c.especialidades, c.activo, e.nombre as establecimiento_nombre
            FROM colaboradores c
            JOIN establecimientos e ON c.establecimiento_id = e.id
            WHERE c.activo = true
        `;
        const params = [];

        if (establecimiento_id) {
            query += ` AND c.establecimiento_id = $1`;
            params.push(establecimiento_id);
        }

        query += ` ORDER BY c.nombre ASC`;

        const result = await req.db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo staff demo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener clientes del demo (solo lectura, público)
router.get('/clientes', async (req, res) => {
    try {
        if (!req.db) {
            return res.status(500).json({ error: 'Base de datos no disponible' });
        }

        const result = await req.db.query(`
            SELECT id, nombre, telefono, email, dni, activo
            FROM clientes
            WHERE activo = true
            ORDER BY nombre ASC
            LIMIT 50
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo clientes demo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener categorías del demo (público)
router.get('/categorias', async (req, res) => {
    try {
        if (!req.db) {
            return res.status(500).json({ error: 'Base de datos no disponible' });
        }

        const result = await req.db.query(`
            SELECT id, nombre, descripcion, color, activo
            FROM categorias
            WHERE activo = true
            ORDER BY nombre ASC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo categorías demo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener reservas del demo (solo lectura, público)
router.get('/reservas', async (req, res) => {
    try {
        if (!req.db) {
            return res.status(500).json({ error: 'Base de datos no disponible' });
        }

        const result = await req.db.query(`
            SELECT 
                r.id,
                r.fecha_hora_inicio,
                r.fecha_hora_inicio as fecha_hora_inicio,
                r.fecha_hora_fin,
                r.servicio_descripcion,
                r.notas,
                r.precio,
                r.estado,
                r.created_at,
                e.nombre as establecimiento_nombre,
                e.id as establecimiento_id,
                c.nombre as colaborador_nombre,
                c.id as colaborador_id,
                cl.nombre as cliente_nombre,
                cl.telefono as cliente_telefono,
                cl.email as cliente_email
            FROM reservas r
            JOIN establecimientos e ON r.establecimiento_id = e.id
            JOIN colaboradores c ON r.colaborador_id = c.id
            JOIN clientes cl ON r.cliente_id = cl.id
            ORDER BY r.fecha_hora_inicio DESC
            LIMIT 100
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo reservas demo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener estadísticas del demo (público, solo lectura)
router.get('/estadisticas', async (req, res) => {
    try {
        if (!req.db) {
            return res.status(500).json({ error: 'Base de datos no disponible' });
        }

        // Estadísticas básicas
        const [
            serviciosCount,
            staffCount,
            clientesCount,
            reservasCount
        ] = await Promise.all([
            req.db.query('SELECT COUNT(*) as total FROM establecimientos WHERE activo = true'),
            req.db.query('SELECT COUNT(*) as total FROM colaboradores WHERE activo = true'),
            req.db.query('SELECT COUNT(*) as total FROM clientes WHERE activo = true'),
            req.db.query('SELECT COUNT(*) as total FROM reservas WHERE estado = \'confirmada\'')
        ]);

        res.json({
            success: true,
            data: {
                servicios: parseInt(serviciosCount.rows[0].total),
                staff: parseInt(staffCount.rows[0].total),
                clientes: parseInt(clientesCount.rows[0].total),
                reservas: parseInt(reservasCount.rows[0].total)
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas demo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;

