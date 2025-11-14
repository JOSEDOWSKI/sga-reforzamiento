/**
 * Controlador para discovery de tenants (búsqueda para app móvil)
 */

const tenantDiscoveryService = require('../services/tenantDiscoveryService');

class TenantDiscoveryController {
    /**
     * Buscar tenants (discovery)
     * GET /api/public/tenants?categoria=peluqueria&latitud=-12.0464&longitud=-77.0428&radio_km=5
     */
    async discover(req, res) {
        try {
            const {
                categoria,
                latitud,
                longitud,
                radio_km,
                search,
                limit,
                offset
            } = req.query;

            const filters = {
                categoria: categoria || null,
                latitud: latitud ? parseFloat(latitud) : null,
                longitud: longitud ? parseFloat(longitud) : null,
                radio_km: radio_km ? parseFloat(radio_km) : 10,
                search: search || null,
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0
            };

            const tenants = await tenantDiscoveryService.discoverTenants(filters);

            res.json({
                success: true,
                data: tenants,
                metadata: {
                    total: tenants.length,
                    filters: filters
                }
            });
        } catch (error) {
            console.error('Error en discovery de tenants:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener detalles de un tenant
     * GET /api/public/tenants/:tenantName/details
     */
    async getDetails(req, res) {
        try {
            const { tenantName } = req.params;

            const tenant = await tenantDiscoveryService.getTenantDetails(tenantName);

            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    error: 'Tenant no encontrado'
                });
            }

            res.json({
                success: true,
                data: tenant
            });
        } catch (error) {
            console.error('Error obteniendo detalles del tenant:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    /**
     * Obtener categorías disponibles
     * GET /api/public/categorias
     */
    async getCategories(req, res) {
        try {
            const categorias = await tenantDiscoveryService.getAvailableCategories();

            res.json({
                success: true,
                data: categorias
            });
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}

module.exports = new TenantDiscoveryController();


