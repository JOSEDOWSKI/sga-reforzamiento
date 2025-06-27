const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

// GET /api/profesores - Obtener todos los profesores
router.get('/', profesorController.getAllProfesores);

// POST /api/profesores - Crear un nuevo profesor
router.post('/', profesorController.createProfesor);

// PUT /api/profesores/:id - Actualizar un profesor existente
router.put('/:id', profesorController.updateProfesor);

module.exports = router; 