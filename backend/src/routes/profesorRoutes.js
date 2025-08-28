const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/profesores - Obtener todos los profesores
router.get('/', profesorController.getAllProfesores);

// GET /api/profesores/:id - Obtener un profesor por ID
router.get('/:id', profesorController.getProfesorById);

// POST /api/profesores - Crear un nuevo profesor (solo admin y vendedor)
router.post('/', roleMiddleware(['admin', 'vendedor']), profesorController.createProfesor);

// PUT /api/profesores/:id - Actualizar un profesor existente (solo admin y vendedor)
router.put('/:id', roleMiddleware(['admin', 'vendedor']), profesorController.updateProfesor);

// DELETE /api/profesores/:id - Eliminar un profesor (solo admin)
router.delete('/:id', roleMiddleware(['admin']), profesorController.deleteProfesor);

module.exports = router; 