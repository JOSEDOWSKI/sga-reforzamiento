/**
 * Script para poblar el tenant demo con datos de ejemplo
 * Útil cuando la BD demo ya existe pero no tiene datos
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

const dbNamePrefix = process.env.DB_NAME_PREFIX || 'weekly_';
const demoDbName = `${dbNamePrefix}demo`;

async function seedDemo() {
    const pool = new Pool({
        ...dbConfig,
        database: demoDbName
    });

    let client;
    try {
        client = await pool.connect();
        
        console.log(`📦 Poblando base de datos ${demoDbName} con datos de demo...`);
        
        // Verificar si ya hay datos
        const checkResult = await client.query('SELECT COUNT(*) as count FROM establecimientos');
        const existingCount = parseInt(checkResult.rows[0].count);
        
        if (existingCount > 0) {
            console.log(`⚠️  Ya existen ${existingCount} servicios en el demo. ¿Deseas continuar? (y/n)`);
            console.log('   Continuando de todas formas...');
        }
        
        // Ejecutar seed de demo
        const demoSeedPath = path.resolve(__dirname, '../db/demo-seed.sql');
        if (!fs.existsSync(demoSeedPath)) {
            throw new Error(`Archivo de seed no encontrado: ${demoSeedPath}`);
        }
        
        const demoSeedData = fs.readFileSync(demoSeedPath, 'utf8');
        await client.query(demoSeedData);
        
        // Verificar resultado
        const resultCheck = await client.query('SELECT COUNT(*) as count FROM establecimientos');
        const newCount = parseInt(resultCheck.rows[0].count);
        
        console.log(`✅ Seed de demo ejecutado correctamente`);
        console.log(`📊 Total de servicios en demo: ${newCount}`);
        
    } catch (error) {
        console.error(`❌ Error al poblar demo: ${error.message}`);
        throw error;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    seedDemo()
        .then(() => {
            console.log('\n✅ Proceso completado exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error(`\n❌ Error: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { seedDemo };

