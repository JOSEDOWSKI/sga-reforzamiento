const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');
const fs = require('fs');

/**
 * Servicio de CapRover usando CLI (Método Recomendado)
 * 
 * Este servicio usa el CLI oficial de CapRover para gestionar dominios personalizados.
 * Es más confiable que la API HTTP directa ya que es el método oficialmente soportado.
 */

/**
 * Verifica si el CLI de CapRover está instalado
 */
async function checkCLIInstalled() {
    try {
        await execPromise('which caprover');
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Instala el CLI de CapRover si no está instalado
 */
async function ensureCLIInstalled() {
    const isInstalled = await checkCLIInstalled();
    
    if (!isInstalled) {
        console.log('[CAPROVER CLI] Instalando CapRover CLI...');
        try {
            await execPromise('npm install -g caprover');
            console.log('[CAPROVER CLI] ✅ CLI instalado correctamente');
            return true;
        } catch (error) {
            console.error('[CAPROVER CLI] ❌ Error instalando CLI:', error.message);
            return false;
        }
    }
    
    return true;
}

/**
 * Autentica el CLI con el servidor CapRover
 */
async function authenticateCLI(serverUrl, apiToken) {
    try {
        // Autenticar usando el token
        const authCommand = `caprover login -t ${apiToken} -s ${serverUrl}`;
        console.log('[CAPROVER CLI] Autenticando...');
        
        const { stdout, stderr } = await execPromise(authCommand);
        
        if (stderr && !stderr.includes('already logged in')) {
            console.error('[CAPROVER CLI] Error en autenticación:', stderr);
            return false;
        }
        
        console.log('[CAPROVER CLI] ✅ Autenticado correctamente');
        return true;
    } catch (error) {
        // Si ya está autenticado, puede dar error pero continuar
        if (error.message.includes('already logged in') || error.stdout) {
            console.log('[CAPROVER CLI] Ya autenticado');
            return true;
        }
        console.error('[CAPROVER CLI] Error en autenticación:', error.message);
        return false;
    }
}

/**
 * Agrega un dominio personalizado usando el CLI
 */
async function addCustomDomainCLI(appName, domain) {
    const apiToken = process.env.CAPROVER_API_TOKEN;
    const serverUrl = process.env.CAPROVER_SERVER_URL || process.env.CAPROVER_ROOT_DOMAIN;
    
    if (!apiToken || !serverUrl) {
        console.log(`[CAPROVER CLI] Credenciales no configuradas - Dominio debe agregarse manualmente: ${domain}`);
        return {
            success: false,
            message: 'CapRover credentials not configured. Domain must be added manually.',
            requiresManual: true
        };
    }
    
    // Normalizar URL
    let normalizedUrl = serverUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
    }
    
    try {
        // 1. Asegurar que el CLI está instalado
        const cliReady = await ensureCLIInstalled();
        if (!cliReady) {
            return {
                success: false,
                message: 'CapRover CLI not available. Please install with: npm install -g caprover',
                requiresManual: true
            };
        }
        
        // 2. Autenticar
        const authenticated = await authenticateCLI(normalizedUrl, apiToken);
        if (!authenticated) {
            return {
                success: false,
                message: 'Failed to authenticate with CapRover CLI',
                requiresManual: true
            };
        }
        
        // 3. Agregar dominio usando CLI
        console.log(`[CAPROVER CLI] Agregando dominio: ${domain} a app: ${appName}`);
        const addDomainCommand = `caprover add-domain -a ${appName} -d ${domain}`;
        
        const { stdout, stderr } = await execPromise(addDomainCommand, {
            timeout: 30000 // 30 segundos timeout
        });
        
        if (stderr && !stderr.includes('already') && !stderr.includes('exists')) {
            console.error(`[CAPROVER CLI] Error agregando dominio:`, stderr);
            return {
                success: false,
                message: stderr || 'Error adding domain',
                rawOutput: { stdout, stderr }
            };
        }
        
        // Verificar si el dominio ya existe
        if (stdout.includes('already') || stdout.includes('exists') || stderr?.includes('already')) {
            console.log(`[CAPROVER CLI] ℹ️  Dominio ya existe: ${domain}`);
            return {
                success: true,
                message: 'Domain already exists in CapRover',
                alreadyExists: true
            };
        }
        
        console.log(`[CAPROVER CLI] ✅ Dominio agregado exitosamente: ${domain}`);
        return {
            success: true,
            message: 'Domain added successfully via CLI',
            data: stdout
        };
        
    } catch (error) {
        console.error(`[CAPROVER CLI] ❌ Error:`, error.message);
        
        // Si el dominio ya existe, tratarlo como éxito
        if (error.message.includes('already') || error.message.includes('exists') || error.stdout?.includes('already')) {
            return {
                success: true,
                message: 'Domain already exists in CapRover',
                alreadyExists: true
            };
        }
        
        return {
            success: false,
            message: error.message || 'Error adding domain via CLI',
            requiresManual: true,
            error: error.message
        };
    }
}

/**
 * Habilita SSL para un dominio usando el CLI
 */
async function enableSSLCLI(appName, domain) {
    const apiToken = process.env.CAPROVER_API_TOKEN;
    const serverUrl = process.env.CAPROVER_SERVER_URL || process.env.CAPROVER_ROOT_DOMAIN;
    
    if (!apiToken || !serverUrl) {
        return {
            success: false,
            message: 'CapRover credentials not configured',
            requiresManual: true
        };
    }
    
    let normalizedUrl = serverUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
    }
    
    try {
        // Asegurar autenticación
        await authenticateCLI(normalizedUrl, apiToken);
        
        console.log(`[CAPROVER CLI] Habilitando SSL para dominio: ${domain} en app: ${appName}`);
        
        // Usar el comando enable-ssl del CLI
        // Nota: El CLI de CapRover puede tener diferentes comandos según la versión
        // Intentar con el comando más común
        const enableSSLCommand = `caprover enable-ssl -a ${appName} -d ${domain}`;
        
        const { stdout, stderr } = await execPromise(enableSSLCommand, {
            timeout: 60000 // 60 segundos para SSL (puede tardar)
        });
        
        if (stderr && !stderr.includes('already') && !stderr.includes('enabled')) {
            console.error(`[CAPROVER CLI] Error habilitando SSL:`, stderr);
            return {
                success: false,
                message: stderr || 'Error enabling SSL',
                rawOutput: { stdout, stderr }
            };
        }
        
        if (stdout.includes('already') || stdout.includes('enabled') || stderr?.includes('already')) {
            console.log(`[CAPROVER CLI] ℹ️  SSL ya está habilitado para: ${domain}`);
            return {
                success: true,
                message: 'SSL already enabled',
                alreadyEnabled: true
            };
        }
        
        console.log(`[CAPROVER CLI] ✅ SSL habilitado exitosamente para: ${domain}`);
        return {
            success: true,
            message: 'SSL enabled successfully via CLI',
            data: stdout
        };
        
    } catch (error) {
        console.error(`[CAPROVER CLI] ❌ Error habilitando SSL:`, error.message);
        
        if (error.message.includes('already') || error.message.includes('enabled')) {
            return {
                success: true,
                message: 'SSL already enabled',
                alreadyEnabled: true
            };
        }
        
        return {
            success: false,
            message: error.message || 'Error enabling SSL via CLI',
            requiresManual: true,
            error: error.message
        };
    }
}

/**
 * Agrega dominio y habilita SSL usando CLI
 */
async function addCustomDomainAndEnableSSLCLI(appName, domain, enableSSLAfterAdd = true) {
    console.log(`[CAPROVER CLI] Agregando dominio y habilitando SSL: ${domain} a ${appName}`);
    
    // Paso 1: Agregar dominio
    const addResult = await addCustomDomainCLI(appName, domain);
    
    if (!addResult.success && !addResult.alreadyExists) {
        return {
            success: false,
            message: `Failed to add domain: ${addResult.message}`,
            domainAdded: false,
            sslEnabled: false
        };
    }
    
    const domainWasAdded = addResult.success || addResult.alreadyExists;
    
    // Paso 2: Habilitar SSL
    if (enableSSLAfterAdd) {
        // Esperar un poco para que CapRover procese el dominio
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const sslResult = await enableSSLCLI(appName, domain);
        
        return {
            success: domainWasAdded && (sslResult.success || sslResult.alreadyEnabled),
            message: domainWasAdded 
                ? (sslResult.success || sslResult.alreadyEnabled 
                    ? 'Domain added and SSL enabled successfully via CLI' 
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
    addCustomDomainCLI,
    enableSSLCLI,
    addCustomDomainAndEnableSSLCLI,
    checkCLIInstalled,
    ensureCLIInstalled
};

