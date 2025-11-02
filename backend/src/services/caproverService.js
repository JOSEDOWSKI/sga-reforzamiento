/**
 * Servicio para automatizar la adición de dominios en CapRover
 * Requiere: CAPROVER_API_TOKEN y CAPROVER_SERVER_URL en variables de entorno
 * 
 * Para obtener el token:
 * 1. Inicia sesión en el panel de CapRover
 * 2. Abre las herramientas de desarrollador del navegador (F12)
 * 3. Ve a Network tab
 * 4. Haz cualquier acción en el panel (ej: ver apps)
 * 5. Busca una petición a /api/v2/ y revisa el header "x-captain-auth"
 * 6. Copia ese valor como CAPROVER_API_TOKEN
 */

const https = require('https');
const http = require('http');

/**
 * Agrega un dominio custom a una app en CapRover
 * @param {string} appName - Nombre de la app (ej: 'weekly-frontend')
 * @param {string} domain - Dominio a agregar (ej: 'prueba3.weekly.pe')
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
async function addCustomDomain(appName, domain) {
    const apiToken = process.env.CAPROVER_API_TOKEN;
    const serverUrl = process.env.CAPROVER_SERVER_URL || process.env.CAPROVER_ROOT_DOMAIN;
    
    // Si no hay credenciales, retornar sin error (configuración manual)
    if (!apiToken || !serverUrl) {
        console.log(`[CAPROVER] Credenciales no configuradas - Dominio debe agregarse manualmente en CapRover: ${domain}`);
        return {
            success: false,
            message: 'CapRover credentials not configured. Domain must be added manually.',
            requiresManual: true
        };
    }
    
    // Normalizar URL (agregar https:// si no tiene protocolo)
    let normalizedUrl = serverUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Extraer hostname y puerto de la URL
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname;
    const port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    // Endpoint correcto de CapRover API - Probar diferentes formatos
    // Formato 1: /api/v2/apps/{appName}/customdomain
    const path = `/api/v2/apps/${appName}/customdomain`;
    
    const requestData = JSON.stringify({
        customDomain: domain
    });
    
    console.log(`[CAPROVER] Intentando agregar dominio: ${domain} a app: ${appName}`);
    console.log(`[CAPROVER] URL: https://${hostname}${path}`);
    
    return new Promise((resolve) => {
        const options = {
            hostname: hostname,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'x-captain-auth': apiToken, // Header de autenticación de CapRover
                'x-namespace': 'captain', // Namespace requerido por CapRover
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData),
                'Referer': `${normalizedUrl}/` // Agregar referer como en las peticiones del navegador
            }
        };
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    // CapRover puede devolver JSON o texto plano
                    let response;
                    try {
                        response = JSON.parse(data);
                    } catch (e) {
                        // Si no es JSON, es texto plano
                        response = { message: data, status: res.statusCode };
                    }
                    
                    // Log detallado para debugging
                    console.log(`[CAPROVER] Respuesta HTTP ${res.statusCode} para ${domain}`);
                    console.log(`[CAPROVER] Response data:`, data.substring(0, 500)); // Primeros 500 caracteres
                    
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        console.log(`✅ [CAPROVER] Dominio agregado exitosamente: ${domain} a ${appName}`);
                        resolve({
                            success: true,
                            message: 'Domain added successfully to CapRover',
                            data: response
                        });
                    } else if (res.statusCode === 400 || res.statusCode === 409) {
                        // Dominio ya existe o conflicto
                        if (data.includes('already') || data.includes('exists') || data.includes('duplicate')) {
                            console.log(`ℹ️  [CAPROVER] Dominio ya existe en CapRover: ${domain}`);
                            resolve({
                                success: true,
                                message: 'Domain already exists in CapRover',
                                alreadyExists: true
                            });
                        } else {
                            console.error(`❌ [CAPROVER] Error agregando dominio (${res.statusCode}):`, response);
                            resolve({
                                success: false,
                                message: response.message || response.error || `Error adding domain: ${data}`,
                                errors: response.errors || response
                            });
                        }
                    } else if (res.statusCode === 401 || res.statusCode === 403) {
                        console.error(`❌ [CAPROVER] Error de autenticación (token inválido o expirado)`);
                        resolve({
                            success: false,
                            message: 'Authentication failed. Please check CAPROVER_API_TOKEN.',
                            requiresManual: true
                        });
                    } else {
                        console.error(`❌ [CAPROVER] Error agregando dominio (${res.statusCode}):`, response);
                        resolve({
                            success: false,
                            message: response.message || response.error || `Error adding domain (${res.statusCode})`,
                            errors: response.errors || response,
                            statusCode: res.statusCode
                        });
                    }
                } catch (error) {
                    console.error(`❌ [CAPROVER] Error parsing response:`, error, 'Response:', data);
                    resolve({
                        success: false,
                        message: `Error parsing response: ${error.message}`,
                        rawResponse: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            console.error(`❌ [CAPROVER] Error en request:`, error);
            resolve({
                success: false,
                message: `Network error: ${error.message}`
            });
        });
        
        req.write(requestData);
        req.end();
    });
}

module.exports = {
    addCustomDomain
};

