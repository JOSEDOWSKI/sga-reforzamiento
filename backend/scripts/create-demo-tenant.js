/**
 * Script para crear el tenant demo y su base de datos
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

const dbNamePrefix = process.env.DB_NAME_PREFIX || 'agendate_';
const globalDbName = 'weekly_global';
const demoDbName = `${dbNamePrefix}demo`;

async function createDemoTenant() {
    console.log('🚀 Creando tenant demo y su base de datos...\n');
    
    // 1. Crear la base de datos demo
    const adminPool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });
    
    try {
        const adminClient = await adminPool.connect();
        
        // Verificar si la BD ya existe
        const dbCheck = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [demoDbName]
        );
        
        if (dbCheck.rows.length > 0) {
            console.log(`✅ La base de datos ${demoDbName} ya existe`);
        } else {
            // Crear la BD
            await adminClient.query(`CREATE DATABASE "${demoDbName}"`);
            console.log(`✅ Base de datos ${demoDbName} creada`);
        }
        
        adminClient.release();
        await adminPool.end();
    } catch (error) {
        console.error(`❌ Error creando base de datos: ${error.message}`);
        await adminPool.end();
        process.exit(1);
    }
    
    // 2. Inicializar el esquema en la BD demo
    const demoPool = new Pool({
        ...dbConfig,
        database: demoDbName
    });
    
    try {
        const demoClient = await demoPool.connect();
        
        // Verificar si ya tiene tablas
        const tablesCheck = await demoClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('usuarios', 'establecimientos')
        `);
        
        if (tablesCheck.rows.length === 0) {
            console.log('📝 Inicializando esquema en la BD demo...');
            const schemaPath = path.resolve(__dirname, '../db/schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await demoClient.query(schema);
            console.log('✅ Esquema inicializado');
        } else {
            console.log('✅ El esquema ya está inicializado');
        }
        
        // Ejecutar seed de demo
        const demoSeedPath = path.resolve(__dirname, '../db/demo-seed.sql');
        if (fs.existsSync(demoSeedPath)) {
            console.log('📦 Ejecutando seed de demo...');
            const demoSeedData = fs.readFileSync(demoSeedPath, 'utf8');
            await demoClient.query(demoSeedData);
            console.log('✅ Seed de demo ejecutado');
        }
        
        demoClient.release();
        await demoPool.end();
    } catch (error) {
        console.error(`❌ Error inicializando esquema: ${error.message}`);
        await demoPool.end();
        process.exit(1);
    }
    
    // 3. Agregar tenant a la BD global
    const globalPool = new Pool({
        ...dbConfig,
        database: globalDbName
    });
    
    try {
        const globalClient = await globalPool.connect();
        
        // Verificar si el tenant ya existe
        const tenantCheck = await globalClient.query(
            `SELECT id FROM tenants WHERE tenant_name = $1`,
            ['demo']
        );
        
        if (tenantCheck.rows.length > 0) {
            console.log('✅ El tenant demo ya existe en la BD global');
        } else {
            await globalClient.query(`
                INSERT INTO tenants (tenant_name, display_name, cliente_nombre, cliente_email, estado, plan)
                VALUES ($1, $2, $3, $4, 'activo', 'basico')
            `, ['demo', 'Demo Tenant', 'Demo Tenant', 'admin@demo.weekly.pe']);
            console.log('✅ Tenant demo agregado a la BD global');
        }
        
        globalClient.release();
        await globalPool.end();
    } catch (error) {
        console.error(`❌ Error agregando tenant a BD global: ${error.message}`);
        await globalPool.end();
        process.exit(1);
    }
    
    console.log('\n✅ Tenant demo creado exitosamente!');
    console.log(`📊 Base de datos: ${demoDbName}`);
    console.log('🌐 URL: https://demo.weekly.pe');
    console.log('\n💡 Ahora puedes ejecutar: npm run fix-demo-db');
}

if (require.main === module) {
    createDemoTenant()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { createDemoTenant };


