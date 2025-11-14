const express = require('express');
const router = express.Router();
const tenantDiscoveryController = require('../controllers/tenantDiscoveryController');

// Rutas públicas (sin autenticación)
router.get('/tenants', tenantDiscoveryController.discover.bind(tenantDiscoveryController));
router.get('/tenants/:tenantName/details', tenantDiscoveryController.getDetails.bind(tenantDiscoveryController));
router.get('/categorias', tenantDiscoveryController.getCategories.bind(tenantDiscoveryController));

module.exports = router;


