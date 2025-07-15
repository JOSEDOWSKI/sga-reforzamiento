const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');

// GET /api/cursos - Obtener todos los cursos
router.get('/', cursoController.getAllCursos);

// POST /api/cursos - Crear un nuevo curso
router.post('/', cursoController.createCurso);

// DELETE /api/cursos/:id - Eliminar un curso
router.delete('/:id', cursoController.deleteCurso);

// Anidar las rutas de los temas
const temaRoutes = require('./temaRoutes');
router.use('/:curso_id/temas', temaRoutes);

module.exports = router; 