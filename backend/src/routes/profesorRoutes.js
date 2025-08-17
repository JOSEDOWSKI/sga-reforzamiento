const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

// GET /api/profesores - Obtener todos los profesores
router.get('/', profesorController.getAllProfesores);

// GET /api/profesores/:id - Obtener un profesor por ID
router.get('/:id', profesorController.getProfesorById);

// POST /api/profesores - Crear un nuevo profesor
router.post('/', profesorController.createProfesor);

// PUT /api/profesores/:id - Actualizar un profesor existente
router.put('/:id', profesorController.updateProfesor);

// DELETE /api/profesores/:id - Eliminar un profesor (soft delete)
router.delete('/:id', profesorController.deleteProfesor);

module.exports = router; 