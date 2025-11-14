/**
 * Script para verificar qué base de datos demo existe
 */

const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

async function checkDemoDatabase() {
    const pool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });

    try {
        console.log('🔍 Buscando bases de datos demo...\n');
        
        // Buscar todas las BDs que contengan "demo"
        const result = await pool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datname LIKE '%demo%' OR datname = 'demo'
            ORDER BY datname
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ No se encontraron bases de datos con "demo" en el nombre');
        } else {
            console.log('✅ Bases de datos encontradas:');
            result.rows.forEach(row => {
                console.log(`   - ${row.datname}`);
            });
        }
        
        // Verificar en la BD global si existe el tenant demo
        console.log('\n🔍 Verificando tenant "demo" en BD global...\n');
        const globalPool = new Pool({
            ...dbConfig,
            database: 'weekly_global'
        });
        
        try {
            const tenantResult = await globalPool.query(`
                SELECT tenant_name, display_name, estado 
                FROM tenants 
                WHERE tenant_name = 'demo' OR tenant_name LIKE '%demo%'
                ORDER BY tenant_name
            `);
            
            if (tenantResult.rows.length === 0) {
                console.log('❌ No se encontró el tenant "demo" en la BD global');
            } else {
                console.log('✅ Tenants encontrados:');
                tenantResult.rows.forEach(row => {
                    const dbPrefix = process.env.DB_NAME_PREFIX || 'agendate_';
                    const expectedDbName = `${dbPrefix}${row.tenant_name}`;
                    console.log(`   - Tenant: ${row.tenant_name}`);
                    console.log(`     Display: ${row.display_name}`);
                    console.log(`     Estado: ${row.estado}`);
                    console.log(`     BD esperada: ${expectedDbName}`);
                });
            }
        } catch (error) {
            console.log(`⚠️  Error accediendo a weekly_global: ${error.message}`);
        } finally {
            await globalPool.end();
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

if (require.main === module) {
    checkDemoDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { checkDemoDatabase };


