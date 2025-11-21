const express = require('express');
const router = express.Router();
const {
    getActiveTenants,
    createTenantDatabase,
    removeTenantConnection
} = require('../config/tenantDatabase');
const logsController = require('../controllers/logsController');
const tenantConfigController = require('../controllers/tenantConfigController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Obtener información de todos los tenants activos
router.get('/tenants', async (req, res) => {
    try {
        const activeTenants = getActiveTenants();
        res.json({
            message: 'Active tenants retrieved successfully',
            data: {
                count: activeTenants.length,
                tenants: activeTenants
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve tenants',
            message: error.message
        });
    }
});

// Crear un nuevo tenant
router.post('/tenants', async (req, res) => {
    try {
        const { tenantId, displayName } = req.body;

        if (!tenantId || !displayName) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'tenantId and displayName are required'
            });
        }

        // Validar formato del tenant ID
        const tenantRegex = /^[a-zA-Z0-9-]{2,50}$/;
        if (!tenantRegex.test(tenantId)) {
            return res.status(400).json({
                error: 'Invalid tenant ID',
                message: 'Tenant ID must contain only letters, numbers, and hyphens (2-50 characters)'
            });
        }

        // Crear la base de datos del tenant
        await createTenantDatabase(tenantId);

        res.status(201).json({
            message: 'Tenant created successfully',
            data: {
                tenantId,
                displayName,
                databaseName: `${process.env.DB_NAME_PREFIX || 'agendate_'}${tenantId}`,
                subdomain: `${tenantId}.agendate.promesa.tech`
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create tenant',
            message: error.message
        });
    }
});

// Eliminar conexión de un tenant (no elimina la base de datos)
router.delete('/tenants/:tenantId/connection', async (req, res) => {
    try {
        const { tenantId } = req.params;
        await removeTenantConnection(tenantId);

        res.json({
            message: 'Tenant connection removed successfully',
            data: { tenantId }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to remove tenant connection',
            message: error.message
        });
    }
});

// Rutas de configuración del tenant (requieren autenticación)
router.get('/tenant/config', authMiddleware, tenantConfigController.getConfig.bind(tenantConfigController));
router.put('/tenant/config', authMiddleware, tenantConfigController.updateConfig.bind(tenantConfigController));

// Obtener estadísticas del sistema
// Rutas de logs
router.get('/logs', logsController.getLogs.bind(logsController));
router.get('/logs/stats', logsController.getLogStats.bind(logsController));

router.get('/stats', async (req, res) => {
    try {
        const activeTenants = getActiveTenants();

        res.json({
            message: 'System statistics retrieved successfully',
            data: {
                activeTenants: activeTenants.length,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve statistics',
            message: error.message
        });
    }
});

module.exports = router;