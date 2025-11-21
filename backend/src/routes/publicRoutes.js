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

// Obtener un tenant por ID (público)
router.get('/tenants/:id', publicController.getPublicTenantById);

// Geocodificar dirección (para selector de ubicación)
router.post('/geocode', publicController.geocodeAddress);

// Rutas de perfil de usuario del marketplace
const marketplaceUserController = require('../controllers/marketplaceUserController');
router.post('/marketplace-user/profile', marketplaceUserController.saveProfile);
router.get('/marketplace-user/profile', marketplaceUserController.getProfile);

// Obtener lista de ciudades disponibles
router.get('/cities', publicController.getCities);

// Obtener lista de categorías disponibles
router.get('/categories', publicController.getCategories);

module.exports = router;

