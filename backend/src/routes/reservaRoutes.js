const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

// GET /api/reservas - Obtener todas las reservas
router.get('/', reservaController.getAllReservas);

// POST /api/reservas - Crear una nueva reserva
router.post('/', reservaController.createReserva);

module.exports = router; 