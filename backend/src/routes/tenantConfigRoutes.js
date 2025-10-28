const express = require('express');
const router = express.Router();

// Obtener configuración de un tenant específico
router.get('/config/:tenantName', async (req, res) => {
    const { tenantName } = req.params;
    
    try {
        // En modo desarrollo, simular la respuesta
        if (process.env.NODE_ENV === 'development' || process.env.USE_DEV_MODE === 'true') {
            const mockConfigs = {
                'demo': {
                    id: 1,
                    tenant_name: 'demo',
                    display_name: 'Demo Tenant',
                    cliente_nombre: 'Cliente Demo',
                    cliente_email: 'demo@weekly.com',
                    cliente_telefono: '+51 987 654 321',
                    cliente_direccion: 'Lima, Perú',
                    estado: 'activo',
                    plan: 'basico',
                    tutorial_enabled: true,
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01')
                },
                'peluqueria': {
                    id: 3,
                    tenant_name: 'peluqueria',
                    display_name: 'Peluquería Bella Vista',
                    cliente_nombre: 'Peluquería Bella Vista',
                    cliente_email: 'info@bellavista.com',
                    cliente_telefono: '+51 987 654 321',
                    cliente_direccion: 'Av. Principal 123, Lima',
                    estado: 'activo',
                    plan: 'basico',
                    tutorial_enabled: false,
                    created_at: new Date('2024-01-20'),
                    updated_at: new Date('2024-01-20')
                },
                'academia': {
                    id: 4,
                    tenant_name: 'academia',
                    display_name: 'Academia Refuerzo Plus',
                    cliente_nombre: 'Academia Refuerzo Plus',
                    cliente_email: 'info@refuerzoplus.com',
                    cliente_telefono: '+51 987 123 456',
                    cliente_direccion: 'Jr. Educación 456, Lima',
                    estado: 'activo',
                    plan: 'premium',
                    tutorial_enabled: false,
                    created_at: new Date('2024-01-25'),
                    updated_at: new Date('2024-01-25')
                },
                'cliente': {
                    id: 2,
                    tenant_name: 'cliente',
                    display_name: 'Cliente Real',
                    cliente_nombre: 'Empresa Cliente',
                    cliente_email: 'cliente@weekly.com',
                    cliente_telefono: '+51 987 123 456',
                    cliente_direccion: 'Arequipa, Perú',
                    estado: 'activo',
                    plan: 'premium',
                    tutorial_enabled: false,
                    created_at: new Date('2024-01-15'),
                    updated_at: new Date('2024-01-15')
                }
            };

            const config = mockConfigs[tenantName] || mockConfigs['demo'];
            return res.status(200).json({ 
                success: true, 
                data: config 
            });
        }

        // En producción, buscar en la base de datos global
        const result = await req.db.query(
            'SELECT * FROM tenants WHERE tenant_name = $1',
            [tenantName]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tenant not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: result.rows[0] 
        });

    } catch (error) {
        console.error('Error fetching tenant config:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
