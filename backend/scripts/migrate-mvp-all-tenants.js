/**
 * Script para aplicar migrate_mvp_schema.sql en todas las bases de datos de tenants
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

    const migrationPath = path.join(__dirname, '../db/migrate_mvp_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Separar SQL de BD global y BD tenant
    // Solo ejecutar la parte de BD tenant (desde "-- BD TENANT" en adelante)
    const tenantSQL = migrationSQL.split('-- BD TENANT')[1];
    
    if (!tenantSQL) {
        console.log(`⚠️  No se encontró sección de BD tenant en la migración`);
        await pool.end();
        return { success: false, dbName, error: 'SQL de tenant no encontrado' };
    }

    try {
        console.log(`\n🔧 Ejecutando migración MVP en ${dbName}...`);
        await pool.query(tenantSQL);
        console.log(`✅ Migración MVP completada en ${dbName}`);
        await pool.end();
        return { success: true, dbName };
    } catch (error) {
        console.error(`❌ Error en ${dbName}:`, error.message);
        await pool.end();
        return { success: false, dbName, error: error.message };
    }
}

async function migrateGlobal() {
    const pool = new Pool({
        ...dbConfig,
        database: 'weekly_global'
    });

    const migrationPath = path.join(__dirname, '../db/migrate_mvp_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Solo ejecutar la parte de BD global (hasta "-- BD TENANT")
    const globalSQL = migrationSQL.split('-- BD TENANT')[0];

    try {
        console.log('\n🌐 Ejecutando migración MVP en weekly_global...');
        await pool.query(globalSQL);
        console.log('✅ Migración MVP completada en weekly_global');
        await pool.end();
        return { success: true, dbName: 'weekly_global' };
    } catch (error) {
        console.error('❌ Error en weekly_global:', error.message);
        await pool.end();
        return { success: false, dbName: 'weekly_global', error: error.message };
    }
}

async function main() {
    console.log('🚀 Iniciando migración MVP en todas las BDs de tenants...\n');
    console.log('⚠️  Nota: Ejecuta "npm run migrate-mvp-global" primero para migrar weekly_global\n');

    try {
        // Obtener lista de bases de datos de tenants
        const databases = await getTenantDatabases();
        
        if (databases.length === 0) {
            console.log('⚠️  No se encontraron bases de datos de tenants');
            return;
        }

        console.log(`\n📋 Encontradas ${databases.length} bases de datos de tenants:`);
        databases.forEach(db => console.log(`   - ${db}`));

        // 2. Ejecutar migración en cada base de datos
        const results = [];
        for (const dbName of databases) {
            const result = await executeMigration(dbName);
            results.push(result);
        }

        // 3. Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE MIGRACIÓN MVP');
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

