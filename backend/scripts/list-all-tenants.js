/**
 * Script para listar todos los tenants y sus bases de datos
 */

const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

async function listAllTenants() {
    console.log('🔍 Listando todos los tenants y bases de datos...\n');
    
    // 1. Listar todos los tenants en la BD global
    const globalPool = new Pool({
        ...dbConfig,
        database: 'weekly_global'
    });
    
    try {
        const tenantsResult = await globalPool.query(`
            SELECT tenant_name, display_name, estado, plan, created_at
            FROM tenants 
            ORDER BY tenant_name
        `);
        
        console.log('📋 Tenants registrados en BD global:');
        if (tenantsResult.rows.length === 0) {
            console.log('   ❌ No hay tenants registrados');
        } else {
            const dbPrefix = process.env.DB_NAME_PREFIX || 'agendate_';
            tenantsResult.rows.forEach(row => {
                const expectedDbName = `${dbPrefix}${row.tenant_name}`;
                console.log(`   - ${row.tenant_name}`);
                console.log(`     Display: ${row.display_name}`);
                console.log(`     Estado: ${row.estado}`);
                console.log(`     Plan: ${row.plan}`);
                console.log(`     BD esperada: ${expectedDbName}`);
                console.log('');
            });
        }
    } catch (error) {
        console.log(`⚠️  Error accediendo a weekly_global: ${error.message}`);
    } finally {
        await globalPool.end();
    }
    
    // 2. Listar todas las bases de datos que empiezan con el prefijo
    const postgresPool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });
    
    try {
        const dbPrefix = process.env.DB_NAME_PREFIX || 'agendate_';
        const result = await postgresPool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datname LIKE $1
            ORDER BY datname
        `, [`${dbPrefix}%`]);
        
        console.log(`\n📊 Bases de datos con prefijo "${dbPrefix}":`);
        if (result.rows.length === 0) {
            console.log('   ❌ No se encontraron bases de datos con ese prefijo');
        } else {
            result.rows.forEach(row => {
                console.log(`   - ${row.datname}`);
            });
        }
        
        // También listar todas las BDs para referencia
        const allDbsResult = await postgresPool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false
            AND datname NOT IN ('postgres', 'template0', 'template1')
            ORDER BY datname
        `);
        
        console.log(`\n📊 Todas las bases de datos (excluyendo system):`);
        allDbsResult.rows.forEach(row => {
            console.log(`   - ${row.datname}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await postgresPool.end();
    }
}

if (require.main === module) {
    listAllTenants()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { listAllTenants };


