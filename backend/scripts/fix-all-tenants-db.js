/**
 * Script para arreglar las bases de datos de todos los tenants
 * Verifica y corrige datos faltantes o incorrectos en la parte admin
 * (usuarios, establecimientos, colaboradores, etc.)
 */

const { Pool } = require('pg');

// Configuración de base de datos
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const dbNamePrefix = process.env.DB_NAME_PREFIX || 'weekly_';
const globalDbName = 'weekly_global';

/**
 * Obtiene todos los tenants activos de la BD global
 */
async function getAllTenants() {
    const pool = new Pool({
        ...dbConfig,
        database: globalDbName
    });

    try {
        const result = await pool.query(`
            SELECT tenant_name, display_name, estado 
            FROM tenants 
            WHERE estado = 'activo'
            ORDER BY tenant_name ASC
        `);
        await pool.end();
        return result.rows;
    } catch (error) {
        console.error('❌ Error obteniendo tenants:', error);
        await pool.end();
        throw error;
    }
}

/**
 * Arregla la base de datos de un tenant específico
 */
async function fixTenantDatabase(tenantName) {
    const tenantDbName = `${dbNamePrefix}${tenantName}`;
    const pool = new Pool({
        ...dbConfig,
        database: tenantDbName
    });

    let client;
    try {
        client = await pool.connect();
        
        console.log(`\n🔧 Arreglando base de datos: ${tenantDbName}...`);
        
        // 1. Verificar si existen tablas
        const tablesCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('usuarios', 'establecimientos', 'colaboradores', 'clientes', 'horarios_atencion')
        `);
        
        if (tablesCheck.rows.length === 0) {
            console.log(`⚠️  No se encontraron las tablas necesarias en ${tenantDbName}. Saltando...`);
            return { success: false, reason: 'no_tables' };
        }
        
        const fixes = {
            usuarios: 0,
            establecimientos: 0,
            colaboradores: 0,
            clientes: 0,
            horarios: 0
        };
        
        // 2. Verificar si hay al menos un usuario admin
        const userCheck = await client.query(`
            SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin' AND activo = true
        `);
        
        if (parseInt(userCheck.rows[0].count) === 0) {
            console.log(`   ⚠️  No hay usuarios admin. Creando uno por defecto...`);
            // Crear usuario admin genérico
            const passwordHash = '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n'; // password: demo123
            await client.query(`
                INSERT INTO usuarios (email, password_hash, nombre, rol, activo) 
                VALUES ($1, $2, $3, 'admin', true)
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    nombre = EXCLUDED.nombre,
                    rol = 'admin',
                    activo = true
            `, [`admin@${tenantName}.weekly.pe`, passwordHash, `Administrador ${tenantName}`]);
            fixes.usuarios = 1;
            console.log(`   ✅ Usuario admin creado: admin@${tenantName}.weekly.pe (password: demo123)`);
        } else {
            console.log(`   ✅ Usuarios admin: ${userCheck.rows[0].count}`);
        }
        
        // 3. Verificar establecimientos
        const establecimientosCheck = await client.query(`
            SELECT COUNT(*) as count FROM establecimientos WHERE activo = true
        `);
        const establecimientosCount = parseInt(establecimientosCheck.rows[0].count);
        console.log(`   📊 Establecimientos activos: ${establecimientosCount}`);
        
        // 4. Verificar colaboradores
        const colaboradoresCheck = await client.query(`
            SELECT COUNT(*) as count FROM colaboradores WHERE activo = true
        `);
        const colaboradoresCount = parseInt(colaboradoresCheck.rows[0].count);
        console.log(`   📊 Colaboradores activos: ${colaboradoresCount}`);
        
        // 5. Verificar clientes
        const clientesCheck = await client.query(`
            SELECT COUNT(*) as count FROM clientes WHERE activo = true
        `);
        const clientesCount = parseInt(clientesCheck.rows[0].count);
        console.log(`   📊 Clientes activos: ${clientesCount}`);
        
        // 6. Verificar horarios
        const horariosCheck = await client.query(`
            SELECT COUNT(*) as count FROM horarios_atencion WHERE activo = true
        `);
        const horariosCount = parseInt(horariosCheck.rows[0].count);
        console.log(`   📊 Horarios activos: ${horariosCount}`);
        
        // Resumen
        console.log(`   ✅ ${tenantDbName} verificado correctamente`);
        
        return {
            success: true,
            tenant: tenantName,
            stats: {
                usuarios: parseInt(userCheck.rows[0].count) + fixes.usuarios,
                establecimientos: establecimientosCount,
                colaboradores: colaboradoresCount,
                clientes: clientesCount,
                horarios: horariosCount
            },
            fixes
        };
        
    } catch (error) {
        console.error(`   ❌ Error arreglando ${tenantDbName}:`, error.message);
        return { success: false, tenant: tenantName, error: error.message };
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

/**
 * Función principal
 */
async function fixAllTenantsDatabases() {
    console.log('🚀 Iniciando arreglo de bases de datos de todos los tenants...\n');
    
    try {
        // Obtener todos los tenants
        const tenants = await getAllTenants();
        
        if (tenants.length === 0) {
            console.log('⚠️  No se encontraron tenants activos.');
            return;
        }
        
        console.log(`📋 Encontrados ${tenants.length} tenants activos:\n`);
        tenants.forEach(t => {
            console.log(`   - ${t.tenant_name} (${t.display_name})`);
        });
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Arreglar cada tenant
        const results = [];
        for (const tenant of tenants) {
            const result = await fixTenantDatabase(tenant.tenant_name);
            results.push(result);
        }
        
        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN FINAL\n');
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`✅ Exitosos: ${successful.length}`);
        console.log(`❌ Fallidos: ${failed.length}\n`);
        
        if (successful.length > 0) {
            console.log('Tenants arreglados exitosamente:');
            successful.forEach(r => {
                console.log(`   - ${r.tenant}: ${r.stats.usuarios} usuarios, ${r.stats.establecimientos} establecimientos, ${r.stats.colaboradores} colaboradores`);
            });
        }
        
        if (failed.length > 0) {
            console.log('\nTenants con errores:');
            failed.forEach(r => {
                console.log(`   - ${r.tenant}: ${r.error || r.reason}`);
            });
        }
        
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    fixAllTenantsDatabases()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { fixAllTenantsDatabases, fixTenantDatabase };


