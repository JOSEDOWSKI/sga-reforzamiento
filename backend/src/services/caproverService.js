/**
 * Servicio para automatizar la adición de dominios y SSL en CapRover
 * Requiere: CAPROVER_API_TOKEN y CAPROVER_SERVER_URL en variables de entorno
 * 
 * Para obtener el token:
 * 1. Inicia sesión en el panel de CapRover
 * 2. Abre las herramientas de desarrollador del navegador (F12)
 * 3. Ve a Network tab
 * 4. Haz cualquier acción en el panel (ej: ver apps)
 * 5. Busca una petición a /api/v2/ y revisa el header "x-captain-auth"
 * 6. Copia ese valor como CAPROVER_API_TOKEN
 * 
 * Referencia: https://caprover-api.readthedocs.io/en/latest/usage.html
 */

const https = require('https');
const http = require('http');

/**
 * Función helper para hacer requests a CapRover API
 * @private
 */
function makeCapRoverRequest(hostname, port, protocol, path, method, requestData, apiToken) {
    return new Promise((resolve) => {
        const options = {
            hostname: hostname,
            port: port,
            path: path,
            method: method,
            headers: {
                'x-captain-auth': apiToken,
                'x-namespace': 'captain',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData),
                'Referer': `${protocol === https ? 'https' : 'http'}://${hostname}/`
            }
        };
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    let response;
                    try {
                        response = JSON.parse(data);
                    } catch (e) {
                        response = { message: data, status: res.statusCode };
                    }
                    
                    resolve({
                        statusCode: res.statusCode,
                        data: response,
                        rawData: data
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode || 500,
                        error: error.message,
                        rawData: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                statusCode: 500,
                error: error.message
            });
        });
        
        req.write(requestData);
        req.end();
    });
}

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
    console.log(`[CAPROVER] URL: ${protocol === https ? 'https' : 'http'}://${hostname}${path}`);
    
    const result = await makeCapRoverRequest(hostname, port, protocol, path, 'POST', requestData, apiToken);
    
    // Log detallado para debugging
    console.log(`[CAPROVER] Respuesta HTTP ${result.statusCode} para ${domain}`);
    if (result.rawData) {
        console.log(`[CAPROVER] Response data:`, result.rawData.substring(0, 500));
    }
    
    if (result.statusCode === 200 || result.statusCode === 201) {
        console.log(`✅ [CAPROVER] Dominio agregado exitosamente: ${domain} a ${appName}`);
        return {
            success: true,
            message: 'Domain added successfully to CapRover',
            data: result.data
        };
    } else if (result.statusCode === 400 || result.statusCode === 409) {
        // Dominio ya existe o conflicto
        const rawData = result.rawData || '';
        if (rawData.includes('already') || rawData.includes('exists') || rawData.includes('duplicate')) {
            console.log(`ℹ️  [CAPROVER] Dominio ya existe en CapRover: ${domain}`);
            return {
                success: true,
                message: 'Domain already exists in CapRover',
                alreadyExists: true
            };
        } else {
            console.error(`❌ [CAPROVER] Error agregando dominio (${result.statusCode}):`, result.data);
            return {
                success: false,
                message: result.data?.message || result.data?.error || `Error adding domain: ${rawData}`,
                errors: result.data?.errors || result.data
            };
        }
    } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.error(`❌ [CAPROVER] Error de autenticación (token inválido o expirado)`);
        return {
            success: false,
            message: 'Authentication failed. Please check CAPROVER_API_TOKEN.',
            requiresManual: true
        };
    } else {
        console.error(`❌ [CAPROVER] Error agregando dominio (${result.statusCode}):`, result.data);
        return {
            success: false,
            message: result.data?.message || result.data?.error || `Error adding domain (${result.statusCode})`,
            errors: result.data?.errors || result.data,
            statusCode: result.statusCode
        };
    }
}

/**
 * Habilita SSL para un dominio custom en una app de CapRover
 * @param {string} appName - Nombre de la app (ej: 'weekly-frontend')
 * @param {string} domain - Dominio para habilitar SSL (ej: 'prueba3.weekly.pe')
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
async function enableSSL(appName, domain) {
    const apiToken = process.env.CAPROVER_API_TOKEN;
    const serverUrl = process.env.CAPROVER_SERVER_URL || process.env.CAPROVER_ROOT_DOMAIN;
    
    // Si no hay credenciales, retornar sin error (configuración manual)
    if (!apiToken || !serverUrl) {
        console.log(`[CAPROVER] Credenciales no configuradas - SSL debe habilitarse manualmente en CapRover: ${domain}`);
        return {
            success: false,
            message: 'CapRover credentials not configured. SSL must be enabled manually.',
            requiresManual: true
        };
    }
    
    // Normalizar URL
    let normalizedUrl = serverUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
    }
    
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname;
    const port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    // Endpoint para habilitar SSL: /api/v2/apps/{appName}/customdomain/enableSSL
    const path = `/api/v2/apps/${appName}/customdomain/enableSSL`;
    
    const requestData = JSON.stringify({
        customDomain: domain
    });
    
    console.log(`[CAPROVER] Intentando habilitar SSL para dominio: ${domain} en app: ${appName}`);
    console.log(`[CAPROVER] URL: ${protocol === https ? 'https' : 'http'}://${hostname}${path}`);
    
    const result = await makeCapRoverRequest(hostname, port, protocol, path, 'POST', requestData, apiToken);
    
    console.log(`[CAPROVER] Respuesta HTTP ${result.statusCode} para habilitar SSL en ${domain}`);
    if (result.rawData) {
        console.log(`[CAPROVER] Response data:`, result.rawData.substring(0, 500));
    }
    
    if (result.statusCode === 200 || result.statusCode === 201) {
        console.log(`✅ [CAPROVER] SSL habilitado exitosamente para: ${domain}`);
        return {
            success: true,
            message: 'SSL enabled successfully',
            data: result.data
        };
    } else if (result.statusCode === 400 || result.statusCode === 409) {
        const rawData = result.rawData || '';
        if (rawData.includes('already') || rawData.includes('enabled')) {
            console.log(`ℹ️  [CAPROVER] SSL ya está habilitado para: ${domain}`);
            return {
                success: true,
                message: 'SSL already enabled for this domain',
                alreadyEnabled: true
            };
        } else {
            console.error(`❌ [CAPROVER] Error habilitando SSL (${result.statusCode}):`, result.data);
            return {
                success: false,
                message: result.data?.message || result.data?.error || `Error enabling SSL: ${rawData}`,
                errors: result.data?.errors || result.data
            };
        }
    } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.error(`❌ [CAPROVER] Error de autenticación al habilitar SSL`);
        return {
            success: false,
            message: 'Authentication failed. Please check CAPROVER_API_TOKEN.',
            requiresManual: true
        };
    } else {
        console.error(`❌ [CAPROVER] Error habilitando SSL (${result.statusCode}):`, result.data);
        return {
            success: false,
            message: result.data?.message || result.data?.error || `Error enabling SSL (${result.statusCode})`,
            errors: result.data?.errors || result.data,
            statusCode: result.statusCode
        };
    }
}

/**
 * Agrega un dominio custom y habilita SSL automáticamente
 * Similar a cap.create_and_update_app() con enable_ssl=True de la librería Python
 * @param {string} appName - Nombre de la app (ej: 'weekly-frontend')
 * @param {string} domain - Dominio a agregar (ej: 'prueba3.weekly.pe')
 * @param {boolean} enableSSLAfterAdd - Si es true, habilita SSL después de agregar el dominio (default: true)
 * @returns {Promise<{success: boolean, message: string, domainAdded?: boolean, sslEnabled?: boolean}>}
 */
async function addCustomDomainAndEnableSSL(appName, domain, enableSSLAfterAdd = true) {
    console.log(`[CAPROVER] Agregando dominio y habilitando SSL: ${domain} a ${appName}`);
    
    // Paso 1: Agregar dominio
    const addResult = await addCustomDomain(appName, domain);
    
    if (!addResult.success && !addResult.alreadyExists) {
        return {
            success: false,
            message: `Failed to add domain: ${addResult.message}`,
            domainAdded: false,
            sslEnabled: false
        };
    }
    
    // Si el dominio ya existía, continuar con SSL
    const domainWasAdded = addResult.success || addResult.alreadyExists;
    
    // Paso 2: Habilitar SSL (si está configurado)
    if (enableSSLAfterAdd) {
        // Esperar un poco para que CapRover procese el dominio
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const sslResult = await enableSSL(appName, domain);
        
        return {
            success: domainWasAdded && (sslResult.success || sslResult.alreadyEnabled),
            message: domainWasAdded 
                ? (sslResult.success || sslResult.alreadyEnabled 
                    ? 'Domain added and SSL enabled successfully' 
                    : `Domain added but SSL failed: ${sslResult.message}`)
                : addResult.message,
            domainAdded: domainWasAdded,
            sslEnabled: sslResult.success || sslResult.alreadyEnabled || false,
            domainResult: addResult,
            sslResult: sslResult
        };
    }
    
    return {
        success: domainWasAdded,
        message: addResult.message,
        domainAdded: domainWasAdded,
        sslEnabled: false
    };
}

module.exports = {
    addCustomDomain,
    enableSSL,
    addCustomDomainAndEnableSSL
};

