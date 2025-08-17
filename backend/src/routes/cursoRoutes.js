const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');

// GET /api/cursos - Obtener todos los cursos
router.get('/', cursoController.getAllCursos);

// GET /api/cursos/:id - Obtener un curso por ID
router.get('/:id', cursoController.getCursoById);

// POST /api/cursos - Crear un nuevo curso
router.post('/', cursoController.createCurso);

// PUT /api/cursos/:id - Actualizar un curso
router.put('/:id', cursoController.updateCurso);

// DELETE /api/cursos/:id - Eliminar un curso (soft delete)
router.delete('/:id', cursoController.deleteCurso);

// Anidar las rutas de los temas
const temaRoutes = require('./temaRoutes');
router.use('/:curso_id/temas', temaRoutes);

module.exports = router; 