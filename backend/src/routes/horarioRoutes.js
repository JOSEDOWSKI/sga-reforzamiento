const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para horarios
router.get('/', horarioController.getAll);
router.get('/establecimiento/:establecimiento_id', horarioController.getByEstablecimiento);
router.post('/', horarioController.create);
router.put('/:id', horarioController.update);
router.delete('/:id', horarioController.delete);

// Ruta especial para crear horarios por defecto
router.post('/establecimiento/:establecimiento_id/default', horarioController.createDefaultHorarios);

module.exports = router;
