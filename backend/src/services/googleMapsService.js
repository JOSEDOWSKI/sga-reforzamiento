/**
 * Servicio para interactuar con Google Maps API
 * - Geocodificación: convertir direcciones en coordenadas
 * - Reverse Geocoding: convertir coordenadas en direcciones
 */

const axios = require('axios');

class GoogleMapsService {
    /**
     * Geocodificar una dirección a coordenadas usando Google Maps Geocoding API
     * @param {string} address - Dirección a geocodificar
     * @returns {Promise<{lat: number, lng: number, formatted_address: string}|null>}
     */
    static async geocodeAddress(address) {
        try {
            // Si no hay API key, retornar null
            if (!process.env.GOOGLE_MAPS_API_KEY) {
                console.warn('[GOOGLE MAPS] API key no configurada, omitiendo geocodificación');
                return null;
            }

            if (!address || address.trim() === '') {
                return null;
            }

            // Construir URL de la API
            const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
            const params = {
                address: address.trim(),
                key: process.env.GOOGLE_MAPS_API_KEY,
                language: 'es', // Español
                region: 'pe' // Perú
            };

            console.log(`[GOOGLE MAPS] Geocodificando: "${address}"`);

            const response = await axios.get(apiUrl, { params, timeout: 10000 });

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const result = response.data.results[0];
                const location = result.geometry.location;

                console.log(`[GOOGLE MAPS] ✅ Coordenadas encontradas: ${location.lat}, ${location.lng}`);

                return {
                    lat: parseFloat(location.lat),
                    lng: parseFloat(location.lng),
                    formatted_address: result.formatted_address,
                    place_id: result.place_id
                };
            } else {
                console.warn(`[GOOGLE MAPS] ⚠️  Estado: ${response.data.status} para: "${address}"`);
                return null;
            }
        } catch (error) {
            console.error('[GOOGLE MAPS] Error en geocodificación:', error.message);
            return null;
        }
    }

    /**
     * Reverse geocoding: convertir coordenadas en dirección
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {Promise<string|null>}
     */
    static async reverseGeocode(lat, lng) {
        try {
            if (!process.env.GOOGLE_MAPS_API_KEY) {
                return null;
            }

            const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
            const params = {
                latlng: `${lat},${lng}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
                language: 'es',
                region: 'pe'
            };

            const response = await axios.get(apiUrl, { params, timeout: 10000 });

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                return response.data.results[0].formatted_address;
            }

            return null;
        } catch (error) {
            console.error('[GOOGLE MAPS] Error en reverse geocoding:', error.message);
            return null;
        }
    }

    /**
     * Geocodificar y actualizar coordenadas de un tenant
     * @param {object} tenant - Objeto tenant con cliente_direccion
     * @returns {Promise<{lat: number, lng: number}|null>}
     */
    static async geocodeAndUpdateTenant(tenant) {
        try {
            // Si ya tiene coordenadas, no hacer nada
            if (tenant.latitud && tenant.longitud) {
                return {
                    lat: parseFloat(tenant.latitud),
                    lng: parseFloat(tenant.longitud)
                };
            }

            // Si no tiene dirección, no se puede geocodificar
            if (!tenant.cliente_direccion) {
                return null;
            }

            // Geocodificar
            const geocodeResult = await this.geocodeAddress(tenant.cliente_direccion);

            if (geocodeResult) {
                // Actualizar coordenadas en la base de datos
                const { Pool } = require('pg');
                const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'srv-captain--weekly-postgres' : 'localhost');
                const globalDbConfig = {
                    user: process.env.DB_USER || 'postgres',
                    host: dbHost,
                    database: 'weekly_global',
                    password: process.env.DB_PASSWORD || 'postgres',
                    port: parseInt(process.env.DB_PORT) || 5432,
                };

                const globalPool = new Pool(globalDbConfig);
                
                await globalPool.query(
                    `UPDATE tenants 
                     SET latitud = $1, longitud = $2, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $3`,
                    [geocodeResult.lat, geocodeResult.lng, tenant.id]
                );

                await globalPool.end();

                console.log(`[GOOGLE MAPS] ✅ Coordenadas actualizadas para tenant ${tenant.tenant_name}`);
                
                return {
                    lat: geocodeResult.lat,
                    lng: geocodeResult.lng
                };
            }

            return null;
        } catch (error) {
            console.error('[GOOGLE MAPS] Error geocodificando tenant:', error);
            return null;
        }
    }
}

module.exports = GoogleMapsService;

