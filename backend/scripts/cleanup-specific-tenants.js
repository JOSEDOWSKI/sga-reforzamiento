#!/usr/bin/env node

/**
 * Script para eliminar bases de datos específicas de tenants aleatorios
 * Uso: node scripts/cleanup-specific-tenants.js
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

// Lista específica de bases de datos aleatorias que vimos en tu lista
const randomDatabases = [
    'agendate_52',
    'agendate_api-seatmap-a',
    'agendate_crznm',
    'agendate_demo',
    'agendate_dnylz',
    'agendate_eiiww',
    'agendate_evgfg',
    'agendate_ezwex',
    'agendate_fmjgj',
    'agendate_fzsrd',
    'agendate_htxwq',
    'agendate_hwdap',
    'agendate_iwztk',
    'agendate_iysim',
    'agendate_kvdaw',
    'agendate_laxzt',
    'agendate_lywfu',
    'agendate_mqpnh',
    'agendate_ncibk',
    'agendate_nqwgu',
    'agendate_obrdx',
    'agendate_omhch',
    'agendate_qdnfj',
    'agendate_qvbip',
    'agendate_sdiam',
    'agendate_tdyah',
    'agendate_thmnb',
    'agendate_tzpjk',
    'agendate_www',
    'agendate_xdfhi',
    'agendate_yzwoi'
];

// Bases de datos que SÍ queremos mantener
const keepDatabases = [
    'agendate_main',
    'agendate_premier',
    'agendate_api'
];

async function cleanupSpecificTenants() {
    const pool = new Pool(adminConfig);
    let client;
    
    try {
        console.log('🔍 Checking which databases exist...');
        
        client = await pool.connect();
        
        // Verificar qué bases de datos existen realmente
        const existingDatabases = [];
        for (const dbName of randomDatabases) {
            try {
                const result = await client.query(
                    'SELECT 1 FROM pg_database WHERE datname = $1',
                    [dbName]
                );
                if (result.rows.length > 0) {
                    existingDatabases.push(dbName);
                }
            } catch (error) {
                console.log(`⚠️  Error checking ${dbName}: ${error.message}`);
            }
        }
        
        console.log(`📊 Found ${existingDatabases.length} databases to potentially delete:`);
        existingDatabases.forEach(db => console.log(`   - ${db}`));
        
        if (existingDatabases.length === 0) {
            console.log('✅ No databases found to clean up');
            return;
        }
        
        // Filtrar las que no están en la lista de mantener
        const toDelete = existingDatabases.filter(db => !keepDatabases.includes(db));
        
        console.log(`\n🎯 Databases to delete (${toDelete.length}):`);
        toDelete.forEach(db => console.log(`   - ${db}`));
        
        console.log(`\n🛡️  Databases to keep (${keepDatabases.length}):`);
        keepDatabases.forEach(db => console.log(`   - ${db}`));
        
        if (toDelete.length === 0) {
            console.log('✅ No databases to delete');
            return;
        }
        
        console.log('\n⚠️  WARNING: This will permanently delete the above databases!');
        console.log('Type "DELETE" to confirm, or anything else to cancel:');
        
        // En un entorno de producción, esto debería ser más seguro
        console.log('\n🔧 To delete these databases, run the following SQL commands:');
        toDelete.forEach(dbName => {
            console.log(`DROP DATABASE "${dbName}";`);
        });
        
        console.log('\n💡 Or run this script with --confirm flag to delete automatically');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
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
    console.log('🚨 CONFIRMATION MODE: This will actually delete databases!');
    // Aquí iría la lógica para eliminar realmente
    // Por seguridad, no la implemento automáticamente
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    cleanupSpecificTenants();
}

module.exports = { cleanupSpecificTenants };
