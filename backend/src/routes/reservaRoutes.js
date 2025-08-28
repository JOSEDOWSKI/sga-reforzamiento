const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/reservas - Obtener todas las reservas
router.get('/', reservaController.getAllReservas);

// GET /api/reservas/:id - Obtener una reserva por ID
router.get('/:id', reservaController.getReservaById);

// POST /api/reservas - Crear una nueva reserva (todos los usuarios autenticados)
router.post('/', reservaController.createReserva);

// PUT /api/reservas/:id - Actualizar una reserva (todos los usuarios autenticados)
router.put('/:id', reservaController.updateReserva);

// PATCH /api/reservas/:id/cancel - Cancelar una reserva (todos los usuarios autenticados)
router.patch('/:id/cancel', reservaController.cancelReserva);

module.exports = router; 