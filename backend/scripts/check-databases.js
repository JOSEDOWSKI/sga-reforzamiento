#!/usr/bin/env node

/**
 * Script para verificar el estado actual de las bases de datos
 * Uso: node scripts/check-databases.js
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

async function checkDatabases() {
    const pool = new Pool(adminConfig);
    let client;
    
    try {
        console.log('🔍 Checking current database status...');
        
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
        
        console.log(`📊 Found ${databases.length} databases with prefix '${dbPrefix}':`);
        databases.forEach(db => console.log(`   - ${db}`));
        
        // Categorizar las bases de datos
        const validTenants = ['main', 'premier', 'api', 'demo'];
        const validDatabases = databases.filter(db => {
            const tenantId = db.replace(dbPrefix, '');
            return validTenants.includes(tenantId);
        });
        
        const randomDatabases = databases.filter(db => {
            const tenantId = db.replace(dbPrefix, '');
            return !validTenants.includes(tenantId);
        });
        
        console.log(`\n✅ Valid databases (${validDatabases.length}):`);
        validDatabases.forEach(db => console.log(`   - ${db}`));
        
        console.log(`\n❌ Random/suspicious databases (${randomDatabases.length}):`);
        randomDatabases.forEach(db => console.log(`   - ${db}`));
        
        if (randomDatabases.length > 0) {
            console.log('\n🔧 To delete random databases, run:');
            randomDatabases.forEach(dbName => {
                console.log(`DROP DATABASE "${dbName}";`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking databases:', error.message);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    checkDatabases();
}

module.exports = { checkDatabases };
