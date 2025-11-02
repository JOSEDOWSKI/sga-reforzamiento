/**
 * Servicio para automatizar la creación de registros DNS en Cloudflare
 * Requiere: CLOUDFLARE_API_TOKEN y CLOUDFLARE_ZONE_ID en variables de entorno
 */

const https = require('https');

/**
 * Crea un registro CNAME en Cloudflare para un tenant
 * @param {string} subdomain - El subdominio (ej: 'prueba1')
 * @param {string} target - El destino (ej: 'weekly-frontend.panel.getdevtools.com')
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
async function createCNAME(subdomain, target = null) {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    
    // Si no hay credenciales, retornar sin error (DNS manual)
    if (!apiToken || !zoneId) {
        console.log(`[CLOUDFLARE] Credenciales no configuradas - DNS debe configurarse manualmente para ${subdomain}.weekly.pe`);
        return {
            success: false,
            message: 'Cloudflare credentials not configured. DNS must be configured manually.',
            requiresManual: true
        };
    }
    
    // Target por defecto
    if (!target) {
        target = process.env.CLOUDFLARE_TARGET || 'weekly-frontend.panel.getdevtools.com';
    }
    
    const domain = process.env.CLOUDFLARE_DOMAIN || 'weekly.pe';
    const recordName = subdomain === '@' ? domain : `${subdomain}.${domain}`;
    
    const recordData = {
        type: 'CNAME',
        name: subdomain,
        content: target,
        ttl: 1, // Auto
        proxied: true // Activar proxy (nube naranja)
    };
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(recordData);
        
        const options = {
            hostname: 'api.cloudflare.com',
            port: 443,
            path: `/client/v4/zones/${zoneId}/dns_records`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200 && response.success) {
                        console.log(`✅ [CLOUDFLARE] DNS creado exitosamente: ${subdomain}.weekly.pe -> ${target}`);
                        resolve({
                            success: true,
                            message: `DNS record created successfully`,
                            data: response.result
                        });
                    } else if (res.statusCode === 409 || (response.errors && response.errors.some(e => e.code === 81057))) {
                        // El registro ya existe
                        console.log(`ℹ️  [CLOUDFLARE] DNS ya existe para ${subdomain}.weekly.pe`);
                        resolve({
                            success: true,
                            message: 'DNS record already exists',
                            alreadyExists: true
                        });
                    } else {
                        console.error(`❌ [CLOUDFLARE] Error creando DNS:`, response);
                        resolve({
                            success: false,
                            message: response.errors?.[0]?.message || 'Error creating DNS record',
                            errors: response.errors
                        });
                    }
                } catch (error) {
                    console.error(`❌ [CLOUDFLARE] Error parsing response:`, error);
                    resolve({
                        success: false,
                        message: 'Error parsing Cloudflare response'
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            console.error(`❌ [CLOUDFLARE] Error en request:`, error);
            resolve({
                success: false,
                message: `Network error: ${error.message}`
            });
        });
        
        req.write(postData);
        req.end();
    });
}

/**
 * Elimina un registro CNAME de Cloudflare
 * @param {string} subdomain - El subdominio
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function deleteCNAME(subdomain) {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    
    if (!apiToken || !zoneId) {
        return {
            success: false,
            message: 'Cloudflare credentials not configured'
        };
    }
    
    // Primero buscar el registro
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.cloudflare.com',
            port: 443,
            path: `/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${subdomain}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.success && response.result && response.result.length > 0) {
                        const recordId = response.result[0].id;
                        
                        // Eliminar el registro
                        const deleteOptions = {
                            hostname: 'api.cloudflare.com',
                            port: 443,
                            path: `/client/v4/zones/${zoneId}/dns_records/${recordId}`,
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${apiToken}`,
                                'Content-Type': 'application/json'
                            }
                        };
                        
                        const deleteReq = https.request(deleteOptions, (deleteRes) => {
                            let deleteData = '';
                            
                            deleteRes.on('data', (chunk) => {
                                deleteData += chunk;
                            });
                            
                            deleteRes.on('end', () => {
                                const deleteResponse = JSON.parse(deleteData);
                                if (deleteResponse.success) {
                                    console.log(`✅ [CLOUDFLARE] DNS eliminado: ${subdomain}.weekly.pe`);
                                    resolve({
                                        success: true,
                                        message: 'DNS record deleted successfully'
                                    });
                                } else {
                                    resolve({
                                        success: false,
                                        message: 'Error deleting DNS record'
                                    });
                                }
                            });
                        });
                        
                        deleteReq.on('error', (error) => {
                            resolve({
                                success: false,
                                message: `Error: ${error.message}`
                            });
                        });
                        
                        deleteReq.end();
                    } else {
                        resolve({
                            success: true,
                            message: 'DNS record not found (already deleted)'
                        });
                    }
                } catch (error) {
                    resolve({
                        success: false,
                        message: `Error: ${error.message}`
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                message: `Network error: ${error.message}`
            });
        });
        
        req.end();
    });
}

module.exports = {
    createCNAME,
    deleteCNAME
};

