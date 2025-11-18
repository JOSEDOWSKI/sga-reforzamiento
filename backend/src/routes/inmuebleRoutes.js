const express = require('express');
const router = express.Router();
const inmuebleController = require('../controllers/inmuebleController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para inmuebles
router.get('/', inmuebleController.getAll);
router.get('/:id', inmuebleController.getById);
router.post('/', inmuebleController.create);
router.put('/:id', inmuebleController.update);
router.delete('/:id', inmuebleController.delete);

// Rutas para horarios de inmuebles
router.get('/:id/horarios', inmuebleController.getHorarios);
router.put('/:id/horarios', inmuebleController.updateHorarios);

module.exports = router;

