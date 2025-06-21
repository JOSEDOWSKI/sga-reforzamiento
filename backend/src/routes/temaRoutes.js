const express = require('express');
// La opción { mergeParams: true } es importante para poder acceder a :curso_id desde esta ruta
const router = express.Router({ mergeParams: true }); 
const temaController = require('../controllers/temaController');

// GET /api/cursos/:curso_id/temas - Obtener temas de un curso
router.get('/', temaController.getTemasByCurso);

// POST /api/cursos/:curso_id/temas - Crear un tema para un curso
router.post('/', temaController.createTema);

module.exports = router; 