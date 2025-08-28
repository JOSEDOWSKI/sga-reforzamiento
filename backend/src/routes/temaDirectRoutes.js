const express = require('express');
const router = express.Router();
const temaController = require('../controllers/temaController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/temas - Obtener todos los temas
router.get('/', temaController.getAllTemas);

// GET /api/temas/:id - Obtener un tema por ID
router.get('/:id', temaController.getTemaById);

// POST /api/temas - Crear un nuevo tema (solo admin y vendedor)
router.post('/', roleMiddleware(['admin', 'vendedor']), temaController.createTema);

// PUT /api/temas/:id - Actualizar un tema (solo admin y vendedor)
router.put('/:id', roleMiddleware(['admin', 'vendedor']), temaController.updateTema);

// DELETE /api/temas/:id - Eliminar un tema (solo admin)
router.delete('/:id', roleMiddleware(['admin']), temaController.deleteTema);

module.exports = router; 