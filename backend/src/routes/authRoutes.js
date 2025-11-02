const express = require('express');
const AuthController = require('../controllers/authController');
const UniversalAuthController = require('../controllers/universalAuthController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/auth/universal-login
 * @desc Login universal - busca el usuario en todas las bases de datos
 * @access Public
 */
router.post('/universal-login', UniversalAuthController.universalLogin);

/**
 * @route POST /api/auth/login
 * @desc Login de usuario (requiere header X-Tenant o subdominio)
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/verify
 * @desc Verificar token y obtener información del usuario
 * @access Private
 */
router.get('/verify', authMiddleware, AuthController.verifyToken);

/**
 * @route POST /api/auth/change-password
 * @desc Cambiar contraseña del usuario
 * @access Private
 */
router.post('/change-password', authMiddleware, AuthController.changePassword);

/**
 * @route POST /api/auth/logout
 * @desc Logout de usuario
 * @access Private
 */
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;