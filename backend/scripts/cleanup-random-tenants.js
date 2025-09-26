#!/usr/bin/env node

/**
 * Script para limpiar bases de datos de tenants aleatorios
 * Uso: npm run cleanup-tenants
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

// Lista de tenants válidos que NO deben ser eliminados
const validTenants = [
    'demo',
    'main', 
    'premier',
    'api',
    'www',
    '52', // Si este es un tenant válido
    'crznm', // Si este es un tenant válido
    'dnylz', // Si este es un tenant válido
    'eiiww', // Si este es un tenant válido
    'evgfg', // Si este es un tenant válido
    'ezwex', // Si este es un tenant válido
    'fmjgj', // Si este es un tenant válido
    'fzsrd', // Si este es un tenant válido
    'htxwq', // Si este es un tenant válido
    'hwdap', // Si este es un tenant válido
    'iwztk', // Si este es un tenant válido
    'iysim', // Si este es un tenant válido
    'kvdaw', // Si este es un tenant válido
    'laxzt', // Si este es un tenant válido
    'lywfu', // Si este es un tenant válido
    'mqpnh', // Si este es un tenant válido
    'ncibk', // Si este es un tenant válido
    'nqwgu', // Si este es un tenant válido
    'obrdx', // Si este es un tenant válido
    'omhch', // Si este es un tenant válido
    'qdnfj', // Si este es un tenant válido
    'qvbip', // Si este es un tenant válido
    'sdiam', // Si este es un tenant válido
    'tdyah', // Si este es un tenant válido
    'thmnb', // Si este es un tenant válido
    'tzpjk', // Si este es un tenant válido
    'xdfhi', // Si este es un tenant válido
    'yzwoi'  // Si este es un tenant válido
];

async function cleanupRandomTenants() {
    const pool = new Pool(adminConfig);
    let client;
    
    try {
        console.log('🔍 Searching for random tenant databases...');
        
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
        
        console.log(`📊 Found ${databases.length} databases with prefix '${dbPrefix}'`);
        
        // Filtrar bases de datos que parecen ser aleatorias
        const randomDatabases = databases.filter(dbName => {
            const tenantId = dbName.replace(dbPrefix, '');
            return !validTenants.includes(tenantId);
        });
        
        console.log(`🎯 Found ${randomDatabases.length} potentially random databases:`);
        randomDatabases.forEach(db => console.log(`   - ${db}`));
        
        if (randomDatabases.length === 0) {
            console.log('✅ No random databases found to clean up');
            return;
        }
        
        // Confirmar eliminación
        console.log('\n⚠️  WARNING: This will permanently delete the above databases!');
        console.log('Type "DELETE" to confirm, or anything else to cancel:');
        
        // En un entorno de producción, esto debería ser más seguro
        // Por ahora, solo mostramos lo que se eliminaría
        console.log('\n🔧 To delete these databases, run the following SQL commands:');
        randomDatabases.forEach(dbName => {
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
    cleanupRandomTenants();
}

module.exports = { cleanupRandomTenants };
