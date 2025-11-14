/**
 * Script para aplicar migración MVP solo en BD global
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'weekly_global',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

async function migrateGlobal() {
    const pool = new Pool(dbConfig);
    const migrationPath = path.join(__dirname, '../db/migrate_mvp_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Solo ejecutar la parte de BD global (hasta "-- BD TENANT")
    const globalSQL = migrationSQL.split('-- BD TENANT')[0];

    try {
        console.log('🌐 Ejecutando migración MVP en weekly_global...\n');
        await pool.query(globalSQL);
        console.log('✅ Migración MVP completada en weekly_global');
        await pool.end();
    } catch (error) {
        console.error('❌ Error en weekly_global:', error.message);
        await pool.end();
        process.exit(1);
    }
}

migrateGlobal();


