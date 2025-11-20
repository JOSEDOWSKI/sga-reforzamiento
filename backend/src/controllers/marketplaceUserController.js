const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

/**
 * Controlador para perfiles de usuarios del marketplace
 */
class MarketplaceUserController {
    /**
     * Crear o actualizar perfil de usuario (sin autenticación)
     * POST /api/public/marketplace-user/profile
     * Body: { nombre, telefono, email?, dni?, direccion?, ciudad? }
     */
    async saveProfile(req, res) {
        try {
            const { nombre, telefono, email, dni, direccion, ciudad, latitud, longitud } = req.body;

            if (!nombre || !telefono) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre y teléfono son requeridos'
                });
            }

            const globalDbConfig = {
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            };

            const pool = new Pool(globalDbConfig);

            // Buscar si ya existe un perfil con este email o teléfono
            let existingProfile = null;
            if (email) {
                const emailResult = await pool.query(
                    'SELECT * FROM clientes_marketplace WHERE email = $1',
                    [email.toLowerCase().trim()]
                );
                if (emailResult.rows.length > 0) {
                    existingProfile = emailResult.rows[0];
                }
            }

            if (!existingProfile && telefono) {
                const phoneResult = await pool.query(
                    'SELECT * FROM clientes_marketplace WHERE telefono = $1',
                    [telefono]
                );
                if (phoneResult.rows.length > 0) {
                    existingProfile = phoneResult.rows[0];
                }
            }

            let result;
            if (existingProfile) {
                // Actualizar perfil existente
                result = await pool.query(
                    `UPDATE clientes_marketplace 
                     SET nombre = $1, telefono = $2, dni = $3, direccion = $4, 
                         ciudad = $5, latitud = $6, longitud = $7, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $8
                     RETURNING id, nombre, telefono, email, dni, direccion, ciudad, latitud, longitud, created_at`,
                    [nombre, telefono, dni || null, direccion || null, ciudad || null, 
                     latitud || null, longitud || null, existingProfile.id]
                );
            } else {
                // Crear nuevo perfil
                result = await pool.query(
                    `INSERT INTO clientes_marketplace 
                     (nombre, telefono, email, dni, direccion, ciudad, latitud, longitud)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id, nombre, telefono, email, dni, direccion, ciudad, latitud, longitud, created_at`,
                    [nombre, telefono, email ? email.toLowerCase().trim() : null, dni || null, 
                     direccion || null, ciudad || null, latitud || null, longitud || null]
                );
            }

            await pool.end();

            res.json({
                success: true,
                data: result.rows[0],
                message: existingProfile ? 'Perfil actualizado' : 'Perfil creado'
            });
        } catch (error) {
            console.error('Error guardando perfil de marketplace:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener perfil por email o teléfono
     * GET /api/public/marketplace-user/profile?email=xxx o ?telefono=xxx
     */
    async getProfile(req, res) {
        try {
            const { email, telefono } = req.query;

            if (!email && !telefono) {
                return res.status(400).json({
                    success: false,
                    error: 'Email o teléfono es requerido'
                });
            }

            const globalDbConfig = {
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: 'weekly_global',
                password: process.env.DB_PASSWORD || 'postgres',
                port: parseInt(process.env.DB_PORT) || 5432,
            };

            const pool = new Pool(globalDbConfig);

            let result;
            if (email) {
                result = await pool.query(
                    'SELECT id, nombre, telefono, email, dni, direccion, ciudad, latitud, longitud, created_at FROM clientes_marketplace WHERE email = $1 AND activo = true',
                    [email.toLowerCase().trim()]
                );
            } else {
                result = await pool.query(
                    'SELECT id, nombre, telefono, email, dni, direccion, ciudad, latitud, longitud, created_at FROM clientes_marketplace WHERE telefono = $1 AND activo = true',
                    [telefono]
                );
            }

            await pool.end();

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Perfil no encontrado'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo perfil de marketplace:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new MarketplaceUserController();

