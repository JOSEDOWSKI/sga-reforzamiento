/**
 * Script para crear tablas de la app móvil en la BD global
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

async function createMobileTables() {
    const pool = new Pool(dbConfig);
    const schemaPath = path.join(__dirname, '../db/schema-mobile-app.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    try {
        console.log('🚀 Creando tablas para app móvil en weekly_global...\n');
        await pool.query(schemaSQL);
        console.log('✅ Tablas creadas exitosamente\n');

        // Verificar que las tablas se crearon
        const tables = [
            'usuarios_movil',
            'reservas_movil',
            'tenant_categorias',
            'tenant_reviews',
            'tenant_favoritos'
        ];

        console.log('📋 Verificando tablas creadas:');
        for (const table of tables) {
            const result = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                );
            `, [table]);

            if (result.rows[0].exists) {
                console.log(`  ✅ ${table}`);
            } else {
                console.log(`  ❌ ${table} - NO ENCONTRADA`);
            }
        }

        await pool.end();
        console.log('\n✅ Proceso completado');
    } catch (error) {
        console.error('❌ Error creando tablas:', error);
        await pool.end();
        process.exit(1);
    }
}

createMobileTables();


