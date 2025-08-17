const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

// GET /api/reservas - Obtener todas las reservas
router.get('/', reservaController.getAllReservas);

// GET /api/reservas/:id - Obtener una reserva por ID
router.get('/:id', reservaController.getReservaById);

// POST /api/reservas - Crear una nueva reserva
router.post('/', reservaController.createReserva);

// PUT /api/reservas/:id - Actualizar una reserva
router.put('/:id', reservaController.updateReserva);

// PATCH /api/reservas/:id/cancel - Cancelar una reserva
router.patch('/:id/cancel', reservaController.cancelReserva);

module.exports = router; 