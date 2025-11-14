const express = require('express');
const router = express.Router();
const tenantConfigController = require('../controllers/tenantConfigController');

// Obtener configuración pública de un tenant (sin autenticación)
// GET /api/tenants/config/:tenantName
router.get('/config/:tenantName', tenantConfigController.getPublicConfig.bind(tenantConfigController));

module.exports = router;
