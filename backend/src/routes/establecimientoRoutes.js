const express = require('express');
const router = express.Router();
const establecimientoController = require('../controllers/establecimientoController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas del dashboard
router.use(authMiddleware);

// Rutas para establecimientos
router.get('/', establecimientoController.getAll);
router.get('/:id', establecimientoController.getById);
router.post('/', establecimientoController.create);
router.put('/:id', establecimientoController.update);
router.delete('/:id', establecimientoController.delete);

// Rutas adicionales
router.get('/:id/horarios', establecimientoController.getHorarios);
router.get('/:id/colaboradores', establecimientoController.getColaboradores);

module.exports = router;
