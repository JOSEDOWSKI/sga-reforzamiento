#!/usr/bin/env node

/**
 * Script para crear un nuevo tenant en el sistema SaaS
 * Uso: npm run create-tenant -- --tenant=cliente1 --name="Cliente Demo"
 */

require('dotenv').config();
const { createTenantDatabase } = require('../src/config/tenantDatabase');

async function createTenant() {
    const args = process.argv.slice(2);
    
    // Parsear argumentos
    const tenant = args.find(arg => arg.startsWith('--tenant='))?.split('=')[1];
    const displayName = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
    
    if (!tenant) {
        console.error('❌ Error: Debes especificar el tenant con --tenant=nombre');
        console.log('📖 Uso: npm run create-tenant -- --tenant=cliente1 --name="Cliente Demo"');
        process.exit(1);
    }
    
    // Validar formato del tenant
    const tenantRegex = /^[a-zA-Z0-9-]{2,50}$/;
    if (!tenantRegex.test(tenant)) {
        console.error('❌ Error: El tenant debe contener solo letras, números y guiones (2-50 caracteres)');
        process.exit(1);
    }
    
    try {
        console.log(`🚀 Creando tenant: ${tenant}`);
        console.log(`📝 Nombre: ${displayName || tenant}`);
        
        // Crear la base de datos del tenant
        await createTenantDatabase(tenant);
        
        const dbName = `${process.env.DB_NAME_PREFIX || 'agendate_'}${tenant}`;
        const subdomain = `${tenant}.agendate.promesa.tech`;
        
        console.log('✅ Tenant creado exitosamente!');
        console.log('📊 Detalles:');
        console.log(`   - Tenant ID: ${tenant}`);
        console.log(`   - Base de datos: ${dbName}`);
        console.log(`   - Subdominio: ${subdomain}`);
        console.log(`   - URL: https://${subdomain}`);
        console.log('');
        console.log('🔧 Próximos pasos:');
        console.log('1. Configurar DNS wildcard en Cloudflare (si no está configurado)');
        console.log('2. El tenant ya tiene datos de ejemplo precargados');
        console.log('3. Acceder a la URL para probar el sistema');
        
    } catch (error) {
        console.error('❌ Error creando tenant:', error.message);
        process.exit(1);
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    createTenant();
}

module.exports = { createTenant };