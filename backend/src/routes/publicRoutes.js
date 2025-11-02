const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

/**
 * Rutas públicas - No requieren autenticación
 * Para usuarios externos que quieren ver disponibilidad y agendar citas
 */

// Obtener disponibilidad (solo horarios, sin datos personales)
router.get('/availability', publicController.getAvailability);

// Obtener servicios disponibles
router.get('/servicios', publicController.getServicios);

// Obtener staff/colaboradores disponibles
router.get('/staff', publicController.getStaff);

// Obtener horarios de atención
router.get('/horarios', publicController.getHorarios);

// Crear reserva pública (sin autenticación)
router.post('/reservas', publicController.createPublicReserva);

// Obtener lista pública de tenants (para el mapa)
router.get('/tenants', publicController.getPublicTenants);

module.exports = router;

