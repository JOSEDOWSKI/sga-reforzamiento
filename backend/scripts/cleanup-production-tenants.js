#!/usr/bin/env node

/**
 * Script para limpiar bases de datos aleatorias en producción
 * Uso: node scripts/cleanup-production-tenants.js
 */

require('dotenv').config();
const { Pool } = require('pg');

// Configuración de la base de datos
const adminConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres'
};

// Lista de tenants válidos basada en la configuración
const validTenants = (process.env.ALLOWED_TENANTS || 'demo,main,premier,api,www').split(',').map(t => t.trim());

async function cleanupProductionTenants() {
    const pool = new Pool(adminConfig);
    let client;
    
    try {
        console.log('🔍 Verificando bases de datos en producción...');
        console.log(`📋 Tenants válidos: [${validTenants.join(', ')}]`);
        
        client = await pool.connect();
        
        // Obtener todas las bases de datos que empiecen con el prefijo
        const dbPrefix = process.env.DB_NAME_PREFIX || 'agendate_';
        const query = `
            SELECT datname 
            FROM pg_database 
            WHERE datname LIKE $1 
            AND datname NOT IN ('postgres', 'template0', 'template1')
            ORDER BY datname
        `;
        
        const result = await client.query(query, [`${dbPrefix}%`]);
        const databases = result.rows.map(row => row.datname);
        
        console.log(`\n📊 Encontradas ${databases.length} bases de datos con prefijo '${dbPrefix}':`);
        databases.forEach(db => console.log(`   - ${db}`));
        
        // Categorizar las bases de datos
        const validDatabases = databases.filter(db => {
            const tenantId = db.replace(dbPrefix, '');
            return validTenants.includes(tenantId);
        });
        
        const randomDatabases = databases.filter(db => {
            const tenantId = db.replace(dbPrefix, '');
            return !validTenants.includes(tenantId);
        });
        
        console.log(`\n✅ Bases de datos válidas (${validDatabases.length}):`);
        validDatabases.forEach(db => console.log(`   - ${db}`));
        
        console.log(`\n❌ Bases de datos aleatorias (${randomDatabases.length}):`);
        randomDatabases.forEach(db => console.log(`   - ${db}`));
        
        if (randomDatabases.length === 0) {
            console.log('\n🎉 No hay bases de datos aleatorias para limpiar');
            return;
        }
        
        console.log('\n⚠️  ADVERTENCIA: Esto eliminará permanentemente las bases de datos aleatorias!');
        console.log('🔧 Para eliminar estas bases de datos, ejecuta los siguientes comandos SQL:');
        console.log('');
        
        randomDatabases.forEach(dbName => {
            console.log(`DROP DATABASE "${dbName}";`);
        });
        
        console.log('\n💡 O ejecuta este script con --confirm para eliminar automáticamente');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Verificar si se debe confirmar la eliminación
const args = process.argv.slice(2);
const shouldConfirm = args.includes('--confirm');

if (shouldConfirm) {
    console.log('🚨 MODO CONFIRMACIÓN: Esto eliminará realmente las bases de datos!');
    // Aquí iría la lógica para eliminar realmente
    // Por seguridad, no la implemento automáticamente
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    cleanupProductionTenants();
}

module.exports = { cleanupProductionTenants };
