const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/colaboradorController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para colaboradores
router.get('/', colaboradorController.getAll);
router.get('/:id', colaboradorController.getById);
router.post('/', colaboradorController.create);
router.put('/:id', colaboradorController.update);
router.delete('/:id', colaboradorController.delete);

module.exports = router;
