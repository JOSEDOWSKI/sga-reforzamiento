#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 * Uso: node scripts/check-env-config.js
 */

require('dotenv').config();

console.log('🔍 Verificando configuración de variables de entorno...\n');

// Variables importantes para el sistema multi-tenant
const importantVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME_PREFIX',
    'ALLOWED_TENANTS',
    'DEFAULT_TENANT',
    'JWT_SECRET'
];

console.log('📋 Variables de entorno:');
importantVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Ocultar valores sensibles
        if (varName.includes('PASSWORD') || varName.includes('SECRET')) {
            console.log(`   ✅ ${varName}: ${'*'.repeat(value.length)}`);
        } else {
            console.log(`   ✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`   ❌ ${varName}: NOT SET`);
    }
});

console.log('\n🎯 Configuración de tenants:');
const allowedTenants = (process.env.ALLOWED_TENANTS || 'demo,main,premier,api,www').split(',').map(t => t.trim());
console.log(`   📋 ALLOWED_TENANTS: [${allowedTenants.join(', ')}]`);
console.log(`   🏠 DEFAULT_TENANT: ${process.env.DEFAULT_TENANT || 'demo'}`);

console.log('\n🔧 Recomendaciones:');
if (!process.env.ALLOWED_TENANTS) {
    console.log('   ⚠️  ALLOWED_TENANTS no está configurada - usando valores por defecto');
    console.log('   💡 Agregar ALLOWED_TENANTS=demo,main,premier,api,www al .env');
}

if (!process.env.DEFAULT_TENANT) {
    console.log('   ⚠️  DEFAULT_TENANT no está configurada - usando "demo"');
    console.log('   💡 Agregar DEFAULT_TENANT=demo al .env');
}

console.log('\n✅ Verificación completada');
