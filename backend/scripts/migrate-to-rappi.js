/**
 * Script de migración: Multi-Tenant → Modelo Rappi (BD Compartida)
 * 
 * Este script migra todos los datos de múltiples BDs de tenants
 * a una sola BD compartida (weekly_peru)
 * 
 * USO:
 *   node scripts/migrate-to-rappi.js
 * 
 * IMPORTANTE:
 *   - Hacer backup de todas las BDs antes de ejecutar
 *   - Ejecutar en ambiente de desarrollo primero
 *   - Validar datos después de la migración
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de BDs
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_PORT = parseInt(process.env.DB_PORT) || 5432;
const DB_NAME_PREFIX = process.env.DB_NAME_PREFIX || 'weekly_';

// BD Global (origen)
const globalDbConfig = {
    user: DB_USER,
    host: DB_HOST,
    database: 'weekly_global',
    password: DB_PASSWORD,
    port: DB_PORT,
};

// BD Nueva (destino - modelo Rappi)
const rappiDbConfig = {
    user: DB_USER,
    host: DB_HOST,
    database: 'weekly_peru', // Cambiar según país
    password: DB_PASSWORD,
    port: DB_PORT,
};

// Mapeo de tenant_name → aliado_id (se llena durante la migración)
const tenantToAliadoMap = new Map();

/**
 * Obtener lista de todos los tenants activos
 */
async function getTenants() {
    const pool = new Pool(globalDbConfig);
    try {
        const result = await pool.query(
            'SELECT * FROM tenants WHERE estado = $1 ORDER BY id',
            ['activo']
        );
        return result.rows;
    } finally {
        await pool.end();
    }
}

/**
 * Migrar tenant a aliado
 */
async function migrateTenantToAliado(tenant, rappiPool) {
    try {
        const result = await rappiPool.query(`
            INSERT INTO aliados (
                nombre, email, telefono, direccion, latitud, longitud, ciudad,
                pais, logo_url, primary_color, secondary_color, timezone, locale,
                categoria, estado, plan, show_in_marketplace, config,
                created_at, updated_at, ultimo_acceso
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $20)
            RETURNING id
        `, [
            tenant.cliente_nombre,
            tenant.cliente_email,
            tenant.cliente_telefono,
            tenant.cliente_direccion,
            tenant.latitud,
            tenant.longitud,
            tenant.city,
            'peru', // Ajustar según país
            tenant.logo_url,
            tenant.primary_color,
            tenant.secondary_color,
            tenant.timezone,
            tenant.locale,
            null, // categoria
            tenant.estado,
            tenant.plan,
            tenant.show_in_marketplace,
            tenant.config || '{}',
            tenant.created_at,
            tenant.updated_at,
            tenant.ultimo_acceso
        ]);
        
        const aliadoId = result.rows[0].id;
        tenantToAliadoMap.set(tenant.tenant_name, aliadoId);
        console.log(`✅ Migrado tenant "${tenant.tenant_name}" → aliado ID: ${aliadoId}`);
        return aliadoId;
    } catch (error) {
        console.error(`❌ Error migrando tenant ${tenant.tenant_name}:`, error.message);
        throw error;
    }
}

/**
 * Migrar usuarios de un tenant
 */
async function migrateUsuarios(tenantName, aliadoId, tenantPool, rappiPool) {
    try {
        const usuarios = await tenantPool.query('SELECT * FROM usuarios');
        
        for (const usuario of usuarios.rows) {
            await rappiPool.query(`
                INSERT INTO usuarios (
                    email, password_hash, nombre, rol, aliado_id, activo,
                    ultimo_acceso, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (email) DO NOTHING
            `, [
                usuario.email,
                usuario.password_hash,
                usuario.nombre,
                usuario.rol,
                aliadoId,
                usuario.activo,
                usuario.ultimo_acceso,
                usuario.created_at,
                usuario.updated_at
            ]);
        }
        
        console.log(`  ✅ Migrados ${usuarios.rows.length} usuarios`);
    } catch (error) {
        console.error(`  ❌ Error migrando usuarios:`, error.message);
    }
}

/**
 * Migrar establecimientos
 */
async function migrateEstablecimientos(tenantName, aliadoId, tenantPool, rappiPool) {
    try {
        const establecimientos = await tenantPool.query('SELECT * FROM establecimientos');
        const establecimientoMap = new Map(); // old_id → new_id
        
        for (const est of establecimientos.rows) {
            const result = await rappiPool.query(`
                INSERT INTO establecimientos (
                    aliado_id, nombre, descripcion, tipo_negocio, direccion,
                    telefono, email, activo, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                aliadoId,
                est.nombre,
                est.descripcion,
                est.tipo_negocio,
                est.direccion,
                est.telefono,
                est.email,
                est.activo,
                est.created_at,
                est.updated_at
            ]);
            
            establecimientoMap.set(est.id, result.rows[0].id);
        }
        
        console.log(`  ✅ Migrados ${establecimientos.rows.length} establecimientos`);
        return establecimientoMap;
    } catch (error) {
        console.error(`  ❌ Error migrando establecimientos:`, error.message);
        return new Map();
    }
}

/**
 * Migrar colaboradores
 */
async function migrateColaboradores(tenantName, aliadoId, establecimientoMap, tenantPool, rappiPool) {
    try {
        const colaboradores = await tenantPool.query('SELECT * FROM colaboradores');
        const colaboradorMap = new Map(); // old_id → new_id
        
        for (const colab of colaboradores.rows) {
            const nuevoEstId = establecimientoMap.get(colab.establecimiento_id) || null;
            
            const result = await rappiPool.query(`
                INSERT INTO colaboradores (
                    aliado_id, nombre, email, telefono, especialidades,
                    tarifa_por_hora, establecimiento_id, activo, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                aliadoId,
                colab.nombre,
                colab.email,
                colab.telefono,
                colab.especialidades,
                colab.tarifa_por_hora,
                nuevoEstId,
                colab.activo,
                colab.created_at,
                colab.updated_at
            ]);
            
            colaboradorMap.set(colab.id, result.rows[0].id);
        }
        
        console.log(`  ✅ Migrados ${colaboradores.rows.length} colaboradores`);
        return colaboradorMap;
    } catch (error) {
        console.error(`  ❌ Error migrando colaboradores:`, error.message);
        return new Map();
    }
}

/**
 * Migrar clientes
 */
async function migrateClientes(tenantName, aliadoId, tenantPool, rappiPool) {
    try {
        const clientes = await tenantPool.query('SELECT * FROM clientes');
        const clienteMap = new Map(); // old_id → new_id
        
        for (const cliente of clientes.rows) {
            const result = await rappiPool.query(`
                INSERT INTO clientes (
                    aliado_id, nombre, telefono, dni, email, notes,
                    activo, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `, [
                aliadoId,
                cliente.nombre,
                cliente.telefono,
                cliente.dni,
                cliente.email,
                cliente.notes,
                cliente.activo,
                cliente.created_at,
                cliente.updated_at
            ]);
            
            clienteMap.set(cliente.id, result.rows[0].id);
        }
        
        console.log(`  ✅ Migrados ${clientes.rows.length} clientes`);
        return clienteMap;
    } catch (error) {
        console.error(`  ❌ Error migrando clientes:`, error.message);
        return new Map();
    }
}

/**
 * Migrar reservas
 */
async function migrateReservas(tenantName, aliadoId, colaboradorMap, establecimientoMap, clienteMap, tenantPool, rappiPool) {
    try {
        const reservas = await tenantPool.query('SELECT * FROM reservas ORDER BY created_at');
        let migradas = 0;
        let errores = 0;
        
        for (const reserva of reservas.rows) {
            try {
                const nuevoColabId = colaboradorMap.get(reserva.colaborador_id);
                const nuevoEstId = establecimientoMap.get(reserva.establecimiento_id);
                const nuevoClienteId = clienteMap.get(reserva.cliente_id);
                
                if (!nuevoColabId || !nuevoEstId || !nuevoClienteId) {
                    console.warn(`  ⚠️  Reserva ${reserva.id} tiene referencias inválidas, omitiendo`);
                    errores++;
                    continue;
                }
                
                await rappiPool.query(`
                    INSERT INTO reservas (
                        aliado_id, fecha_hora_inicio, fecha_hora_fin,
                        colaborador_id, establecimiento_id, cliente_id,
                        service_id, resource_id, servicio_descripcion,
                        notas, precio, estado, creado_por, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [
                    aliadoId,
                    reserva.fecha_hora_inicio,
                    reserva.fecha_hora_fin,
                    nuevoColabId,
                    nuevoEstId,
                    nuevoClienteId,
                    reserva.service_id,
                    reserva.resource_id,
                    reserva.servicio_descripcion,
                    reserva.notas,
                    reserva.precio,
                    reserva.estado,
                    reserva.creado_por, // Nota: este ID puede no existir en la nueva BD
                    reserva.created_at,
                    reserva.updated_at
                ]);
                
                migradas++;
            } catch (error) {
                console.error(`  ⚠️  Error migrando reserva ${reserva.id}:`, error.message);
                errores++;
            }
        }
        
        console.log(`  ✅ Migradas ${migradas} reservas (${errores} errores)`);
    } catch (error) {
        console.error(`  ❌ Error migrando reservas:`, error.message);
    }
}

/**
 * Migrar un tenant completo
 */
async function migrateTenant(tenant, rappiPool) {
    const tenantDbName = `${DB_NAME_PREFIX}${tenant.tenant_name}`;
    console.log(`\n📦 Migrando tenant: ${tenant.tenant_name} (BD: ${tenantDbName})`);
    
    // Conectar a BD del tenant
    const tenantDbConfig = {
        user: DB_USER,
        host: DB_HOST,
        database: tenantDbName,
        password: DB_PASSWORD,
        port: DB_PORT,
    };
    
    const tenantPool = new Pool(tenantDbConfig);
    
    try {
        // 1. Migrar tenant → aliado
        const aliadoId = await migrateTenantToAliado(tenant, rappiPool);
        
        // 2. Migrar usuarios
        await migrateUsuarios(tenant.tenant_name, aliadoId, tenantPool, rappiPool);
        
        // 3. Migrar establecimientos
        const establecimientoMap = await migrateEstablecimientos(tenant.tenant_name, aliadoId, tenantPool, rappiPool);
        
        // 4. Migrar colaboradores
        const colaboradorMap = await migrateColaboradores(tenant.tenant_name, aliadoId, establecimientoMap, tenantPool, rappiPool);
        
        // 5. Migrar clientes
        const clienteMap = await migrateClientes(tenant.tenant_name, aliadoId, tenantPool, rappiPool);
        
        // 6. Migrar reservas
        await migrateReservas(tenant.tenant_name, aliadoId, colaboradorMap, establecimientoMap, clienteMap, tenantPool, rappiPool);
        
        console.log(`✅ Tenant ${tenant.tenant_name} migrado completamente\n`);
    } catch (error) {
        console.error(`❌ Error migrando tenant ${tenant.tenant_name}:`, error);
    } finally {
        await tenantPool.end();
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🚀 Iniciando migración: Multi-Tenant → Modelo Rappi\n');
    console.log('⚠️  IMPORTANTE: Asegúrate de haber hecho backup de todas las BDs\n');
    
    // Conectar a BD Rappi (destino)
    const rappiPool = new Pool(rappiDbConfig);
    
    try {
        // Verificar que la BD existe y tiene el esquema
        await rappiPool.query('SELECT 1 FROM aliados LIMIT 1');
        console.log('✅ BD destino (weekly_peru) está lista\n');
    } catch (error) {
        console.error('❌ Error: La BD weekly_peru no existe o no tiene el esquema correcto');
        console.error('   Ejecuta primero: schema-rappi.sql');
        process.exit(1);
    }
    
    try {
        // Obtener lista de tenants
        const tenants = await getTenants();
        console.log(`📋 Encontrados ${tenants.length} tenants para migrar\n`);
        
        if (tenants.length === 0) {
            console.log('⚠️  No hay tenants para migrar');
            return;
        }
        
        // Migrar cada tenant
        for (const tenant of tenants) {
            await migrateTenant(tenant, rappiPool);
        }
        
        console.log('\n✅ Migración completada');
        console.log(`📊 Total de aliados migrados: ${tenantToAliadoMap.size}`);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    } finally {
        await rappiPool.end();
    }
}

// Ejecutar
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };

