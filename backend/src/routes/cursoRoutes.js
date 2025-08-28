const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/cursos - Obtener todos los cursos
router.get('/', cursoController.getAllCursos);

// GET /api/cursos/:id - Obtener un curso por ID
router.get('/:id', cursoController.getCursoById);

// POST /api/cursos - Crear un nuevo curso (solo admin y vendedor)
router.post('/', roleMiddleware(['admin', 'vendedor']), cursoController.createCurso);

// PUT /api/cursos/:id - Actualizar un curso (solo admin y vendedor)
router.put('/:id', roleMiddleware(['admin', 'vendedor']), cursoController.updateCurso);

// DELETE /api/cursos/:id - Eliminar un curso (solo admin)
router.delete('/:id', roleMiddleware(['admin']), cursoController.deleteCurso);

// Anidar las rutas de los temas
const temaRoutes = require('./temaRoutes');
router.use('/:curso_id/temas', temaRoutes);

module.exports = router; 