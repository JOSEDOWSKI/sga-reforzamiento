const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Verificar que sea super admin
router.use(roleMiddleware(['super_admin']));

// Rutas de gestión de tenants
router.get('/', tenantController.getAllTenants);
router.get('/stats', tenantController.getTenantStats);
router.get('/:id', tenantController.getTenantById);
router.post('/', tenantController.createTenant);
router.put('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;
