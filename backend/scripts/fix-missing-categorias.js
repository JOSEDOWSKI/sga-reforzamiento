/**
 * Script para agregar la tabla categorias si no existe
 */

const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const dbNamePrefix = process.env.DB_NAME_PREFIX || 'agendate_';

async function fixMissingCategorias(tenantName) {
    const tenantDbName = `${dbNamePrefix}${tenantName}`;
    const pool = new Pool({
        ...dbConfig,
        database: tenantDbName
    });

    let client;
    try {
        client = await pool.connect();
        
        console.log(`🔧 Verificando tabla categorias en ${tenantDbName}...`);
        
        // Verificar si la tabla existe
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'categorias'
            )
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log(`✅ La tabla categorias ya existe en ${tenantDbName}`);
            
            // Verificar si falta la columna establecimiento_id
            const columnCheck = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'categorias' 
                AND column_name = 'establecimiento_id'
            `);
            
            if (columnCheck.rows.length === 0) {
                console.log(`📝 Agregando columna establecimiento_id a categorias...`);
                await client.query(`
                    ALTER TABLE categorias 
                    ADD COLUMN establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE
                `);
                await client.query(`
                    CREATE INDEX IF NOT EXISTS idx_categorias_establecimiento ON categorias(establecimiento_id)
                `);
                console.log(`✅ Columna establecimiento_id agregada`);
            }
        } else {
            console.log(`📝 Creando tabla categorias en ${tenantDbName}...`);
            
            // Verificar si existe la columna establecimiento_id
            const columnCheck = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'categorias' 
                AND column_name = 'establecimiento_id'
            `);
            
            // Crear la tabla
            await client.query(`
                CREATE TABLE categorias (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(255) NOT NULL,
                    descripcion TEXT,
                    color VARCHAR(7) DEFAULT '#007bff',
                    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
                    activo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Crear índices
            await client.query(`
                CREATE INDEX idx_categorias_activo ON categorias(activo)
            `);
            await client.query(`
                CREATE INDEX idx_categorias_establecimiento ON categorias(establecimiento_id)
            `);
            
            console.log(`✅ Tabla categorias creada en ${tenantDbName}`);
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        throw error;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

async function fixAllTenants() {
    const globalPool = new Pool({
        ...dbConfig,
        database: 'weekly_global'
    });

    try {
        const result = await globalPool.query(`
            SELECT tenant_name FROM tenants WHERE estado = 'activo'
        `);
        
        console.log(`🔧 Arreglando tabla categorias en ${result.rows.length} tenants...\n`);
        
        for (const row of result.rows) {
            await fixMissingCategorias(row.tenant_name);
        }
        
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await globalPool.end();
    }
}

if (require.main === module) {
    const tenantName = process.argv[2];
    
    if (tenantName) {
        fixMissingCategorias(tenantName)
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    } else {
        fixAllTenants()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    }
}

module.exports = { fixMissingCategorias };

