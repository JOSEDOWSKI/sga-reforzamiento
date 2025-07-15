const express = require('express');
const router = express.Router();
const temaController = require('../controllers/temaController');

// GET /api/temas - Obtener todos los temas
router.get('/', temaController.getAllTemas);

// POST /api/temas - Crear un nuevo tema
router.post('/', temaController.createTema);

// PUT /api/temas/:id - Actualizar un tema
router.put('/:id', temaController.updateTema);

// DELETE /api/temas/:id - Eliminar un tema
router.delete('/:id', temaController.deleteTema);

module.exports = router; 