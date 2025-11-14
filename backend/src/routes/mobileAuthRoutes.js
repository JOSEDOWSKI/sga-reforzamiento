const express = require('express');
const router = express.Router();
const mobileAuthController = require('../controllers/mobileAuthController');
const mobileAuthMiddleware = require('../middleware/mobileAuthMiddleware');

// Rutas públicas
router.post('/register', mobileAuthController.register.bind(mobileAuthController));
router.post('/login', mobileAuthController.login.bind(mobileAuthController));

// Rutas protegidas (requieren autenticación)
router.get('/profile', mobileAuthMiddleware, mobileAuthController.getProfile.bind(mobileAuthController));
router.put('/profile', mobileAuthMiddleware, mobileAuthController.updateProfile.bind(mobileAuthController));

module.exports = router;


