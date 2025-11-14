/**
 * Script para ejecutar migrate_improve_horarios.sql en todas las bases de datos de tenants
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const DB_NAME_PREFIX = process.env.DB_NAME_PREFIX || 'agendate_';

async function getTenantDatabases() {
    const pool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });

    try {
        const result = await pool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datname LIKE $1
            AND datname != 'postgres'
            AND datname != 'template0'
            AND datname != 'template1'
            ORDER BY datname
        `, [`${DB_NAME_PREFIX}%`]);

        await pool.end();
        return result.rows.map(row => row.datname);
    } catch (error) {
        await pool.end();
        throw error;
    }
}

async function executeMigration(dbName) {
    const pool = new Pool({
        ...dbConfig,
        database: dbName
    });

    const migrationPath = path.join(__dirname, '../db/migrate_improve_horarios.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    try {
        console.log(`\n🔧 Ejecutando migración en ${dbName}...`);
        await pool.query(migrationSQL);
        console.log(`✅ Migración completada en ${dbName}`);
        await pool.end();
        return { success: true, dbName };
    } catch (error) {
        console.error(`❌ Error en ${dbName}:`, error.message);
        await pool.end();
        return { success: false, dbName, error: error.message };
    }
}

async function main() {
    console.log('🚀 Iniciando migración de horarios en todas las BDs de tenants...\n');

    try {
        // Obtener lista de bases de datos de tenants
        const databases = await getTenantDatabases();
        
        if (databases.length === 0) {
            console.log('⚠️  No se encontraron bases de datos de tenants');
            return;
        }

        console.log(`📋 Encontradas ${databases.length} bases de datos:`);
        databases.forEach(db => console.log(`   - ${db}`));

        // Ejecutar migración en cada base de datos
        const results = [];
        for (const dbName of databases) {
            const result = await executeMigration(dbName);
            results.push(result);
        }

        // Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log('='.repeat(60));
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`✅ Exitosos: ${successful.length}`);
        successful.forEach(r => console.log(`   - ${r.dbName}`));

        if (failed.length > 0) {
            console.log(`\n❌ Fallidos: ${failed.length}`);
            failed.forEach(r => console.log(`   - ${r.dbName}: ${r.error}`));
        }

        console.log('\n✅ Proceso completado');
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

main();


