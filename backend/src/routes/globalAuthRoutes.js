const express = require('express');
const router = express.Router();
const globalAuthController = require('../controllers/globalAuthController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Rutas públicas de autenticación global
router.post('/login', globalAuthController.login);

// Rutas protegidas
router.use(authMiddleware);

router.get('/verify', globalAuthController.verifyToken);
router.get('/profile', globalAuthController.getProfile);
router.put('/profile', globalAuthController.updateProfile);
router.put('/change-password', globalAuthController.changePassword);

module.exports = router;
