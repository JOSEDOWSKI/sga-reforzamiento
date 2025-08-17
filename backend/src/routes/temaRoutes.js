const express = require('express');
// La opción { mergeParams: true } es importante para poder acceder a :curso_id desde esta ruta
const router = express.Router({ mergeParams: true }); 
const temaController = require('../controllers/temaController');

// GET /api/cursos/:curso_id/temas - Obtener temas de un curso
router.get('/', temaController.getTemasByCurso);

// GET /api/cursos/:curso_id/temas/:id - Obtener un tema específico
router.get('/:id', temaController.getTemaById);

// POST /api/cursos/:curso_id/temas - Crear un tema para un curso
router.post('/', temaController.createTema);

// PUT /api/cursos/:curso_id/temas/:id - Actualizar un tema
router.put('/:id', temaController.updateTema);

// DELETE /api/cursos/:curso_id/temas/:id - Eliminar un tema (soft delete)
router.delete('/:id', temaController.deleteTema);

module.exports = router; 