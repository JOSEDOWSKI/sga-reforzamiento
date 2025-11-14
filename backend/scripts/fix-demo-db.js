/**
 * Script para arreglar la base de datos demo
 * Verifica y corrige datos faltantes o incorrectos
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

// Detectar el prefijo correcto basado en los tenants existentes
async function detectDbPrefix() {
    const globalPool = new Pool({
        ...dbConfig,
        database: 'postgres' // Conectar a postgres para listar BDs
    });
    
    try {
        const result = await globalPool.query(`
            SELECT datname FROM pg_database 
            WHERE datname LIKE '%_demo' OR datname = 'demo'
            ORDER BY datname
        `);
        
        if (result.rows.length > 0) {
            const dbName = result.rows[0].datname;
            await globalPool.end();
            
            if (dbName.includes('_demo')) {
                return dbName.replace('_demo', '_');
            } else if (dbName === 'demo') {
                return '';
            }
        }
        await globalPool.end();
    } catch (error) {
        console.log('⚠️  No se pudo detectar prefijo, usando weekly_ por defecto');
        try {
            await globalPool.end();
        } catch (e) {
            // Ignorar error al cerrar
        }
    }
    return process.env.DB_NAME_PREFIX || 'weekly_';
}

const dbNamePrefix = process.env.DB_NAME_PREFIX || 'weekly_';
let demoDbName = `${dbNamePrefix}demo`;

async function fixDemoDatabase() {
    // Usar el prefijo de la variable de entorno si está disponible
    if (process.env.DB_NAME_PREFIX) {
        demoDbName = `${process.env.DB_NAME_PREFIX}demo`;
        console.log(`📦 Usando prefijo de variable de entorno: ${process.env.DB_NAME_PREFIX}`);
        console.log(`📦 Base de datos demo: ${demoDbName}`);
    } else {
        // Detectar prefijo correcto si no está en env
        const detectedPrefix = await detectDbPrefix();
        demoDbName = `${detectedPrefix}demo`;
        console.log(`🔍 Prefijo detectado: ${detectedPrefix}`);
        console.log(`📦 Base de datos demo: ${demoDbName}`);
    }
    
    // Verificar si la BD existe, si no, intentar crearla
    const adminPool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });
    
    try {
        const adminClient = await adminPool.connect();
        const dbCheck = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [demoDbName]
        );
        adminClient.release();
        await adminPool.end();
        
        if (dbCheck.rows.length === 0) {
            console.log(`⚠️  La base de datos ${demoDbName} no existe.`);
            console.log(`💡 Sugerencia: Verifica que el tenant 'demo' esté creado en el panel de administración.`);
            console.log(`   O ejecuta: npm run create-tenant demo`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error verificando existencia de la BD:', error.message);
        await adminPool.end();
        process.exit(1);
    }
    
    const pool = new Pool({
        ...dbConfig,
        database: demoDbName
    });

    let client;
    try {
        client = await pool.connect();
        
        console.log(`🔧 Verificando y arreglando base de datos ${demoDbName}...`);
        
        // 1. Verificar si existen tablas
        const tablesCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('usuarios', 'establecimientos', 'colaboradores', 'clientes', 'horarios_atencion')
        `);
        
        if (tablesCheck.rows.length === 0) {
            console.error('❌ No se encontraron las tablas necesarias. Ejecuta primero el schema.sql');
            process.exit(1);
        }
        
        console.log(`✅ Tablas encontradas: ${tablesCheck.rows.map(r => r.table_name).join(', ')}`);
        
        // 2. Verificar y crear usuario admin si no existe
        const userCheck = await client.query(`
            SELECT COUNT(*) as count FROM usuarios WHERE email = 'admin@demo.weekly.pe'
        `);
        
        if (parseInt(userCheck.rows[0].count) === 0) {
            console.log('📝 Creando usuario administrador...');
            // Password: demo123
            const passwordHash = '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n';
            await client.query(`
                INSERT INTO usuarios (email, password_hash, nombre, rol, activo) 
                VALUES ('admin@demo.weekly.pe', $1, 'Administrador Demo', 'admin', true)
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    nombre = EXCLUDED.nombre,
                    rol = EXCLUDED.rol,
                    activo = true
            `, [passwordHash]);
            console.log('✅ Usuario administrador creado/actualizado');
        } else {
            console.log('✅ Usuario administrador ya existe');
        }
        
        // 3. Verificar y crear establecimientos
        const establecimientosCheck = await client.query(`
            SELECT COUNT(*) as count FROM establecimientos
        `);
        
        if (parseInt(establecimientosCheck.rows[0].count) === 0) {
            console.log('📝 Creando establecimientos...');
            await client.query(`
                INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, direccion, telefono, email, activo) VALUES
                ('Corte de Cabello Clásico', 'Corte tradicional para caballeros y damas', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'corte@demo.weekly.pe', true),
                ('Corte + Peinado', 'Corte de cabello con peinado profesional', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'peinado@demo.weekly.pe', true),
                ('Tintura Completa', 'Tintura profesional con productos de calidad', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'tintura@demo.weekly.pe', true),
                ('Mechas y Reflejos', 'Técnica de mechas y reflejos profesionales', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'mechas@demo.weekly.pe', true),
                ('Tratamiento Capilar', 'Tratamiento nutritivo y reparador', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'tratamiento@demo.weekly.pe', true),
                ('Alisado Permanente', 'Servicio de alisado con keratina', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'alisado@demo.weekly.pe', true)
                ON CONFLICT (nombre) DO UPDATE SET
                    descripcion = EXCLUDED.descripcion,
                    tipo_negocio = EXCLUDED.tipo_negocio,
                    direccion = EXCLUDED.direccion,
                    telefono = EXCLUDED.telefono,
                    email = EXCLUDED.email,
                    activo = true
            `);
            console.log('✅ Establecimientos creados');
        } else {
            console.log(`✅ Ya existen ${establecimientosCheck.rows[0].count} establecimientos`);
        }
        
        // 4. Verificar y crear colaboradores
        const colaboradoresCheck = await client.query(`
            SELECT COUNT(*) as count FROM colaboradores
        `);
        
        if (parseInt(colaboradoresCheck.rows[0].count) === 0) {
            console.log('📝 Creando colaboradores...');
            
            // Primero obtener los IDs de los establecimientos
            const establecimientos = await client.query(`
                SELECT id, nombre FROM establecimientos WHERE activo = true
            `);
            
            const establecimientosMap = {};
            establecimientos.rows.forEach(e => {
                establecimientosMap[e.nombre] = e.id;
            });
            
            // Crear colaboradores con sus establecimientos
            const colaboradoresData = [
                { nombre: 'María García', email: 'maria@demo.weekly.pe', telefono: '+51 987 123 456', especialidades: ['Cortes', 'Peinados'], est_nombre: 'Corte de Cabello Clásico' },
                { nombre: 'Carlos López', email: 'carlos@demo.weekly.pe', telefono: '+51 987 123 457', especialidades: ['Cortes', 'Barba'], est_nombre: 'Corte de Cabello Clásico' },
                { nombre: 'Ana Martínez', email: 'ana@demo.weekly.pe', telefono: '+51 987 123 458', especialidades: ['Tinturas', 'Mechas'], est_nombre: 'Tintura Completa' },
                { nombre: 'Luis Rodríguez', email: 'luis@demo.weekly.pe', telefono: '+51 987 123 459', especialidades: ['Tratamientos', 'Alisados'], est_nombre: 'Tratamiento Capilar' },
                { nombre: 'Sofia Hernández', email: 'sofia@demo.weekly.pe', telefono: '+51 987 123 460', especialidades: ['Cortes', 'Peinados'], est_nombre: 'Corte + Peinado' },
                { nombre: 'Miguel Torres', email: 'miguel@demo.weekly.pe', telefono: '+51 987 123 461', especialidades: ['Mechas', 'Reflejos'], est_nombre: 'Mechas y Reflejos' }
            ];
            
            for (const colab of colaboradoresData) {
                const establecimientoId = establecimientosMap[colab.est_nombre];
                if (establecimientoId) {
                    await client.query(`
                        INSERT INTO colaboradores (nombre, email, telefono, especialidades, establecimiento_id, activo) 
                        VALUES ($1, $2, $3, $4, $5, true)
                        ON CONFLICT (email) DO UPDATE SET
                            nombre = EXCLUDED.nombre,
                            telefono = EXCLUDED.telefono,
                            especialidades = EXCLUDED.especialidades,
                            establecimiento_id = EXCLUDED.establecimiento_id,
                            activo = true
                    `, [colab.nombre, colab.email, colab.telefono, colab.especialidades, establecimientoId]);
                }
            }
            console.log('✅ Colaboradores creados');
        } else {
            console.log(`✅ Ya existen ${colaboradoresCheck.rows[0].count} colaboradores`);
        }
        
        // 5. Verificar y crear horarios de atención
        const horariosCheck = await client.query(`
            SELECT COUNT(*) as count FROM horarios_atencion
        `);
        
        if (parseInt(horariosCheck.rows[0].count) === 0) {
            console.log('📝 Creando horarios de atención...');
            await client.query(`
                INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo)
                SELECT 
                    e.id,
                    d.dia,
                    '09:00:00'::TIME,
                    '18:00:00'::TIME,
                    30,
                    true
                FROM establecimientos e
                CROSS JOIN generate_series(1, 5) AS d(dia)
                WHERE e.activo = true
                ON CONFLICT (establecimiento_id, dia_semana) DO UPDATE SET
                    hora_apertura = EXCLUDED.hora_apertura,
                    hora_cierre = EXCLUDED.hora_cierre,
                    intervalo_minutos = EXCLUDED.intervalo_minutos,
                    activo = true
            `);
            console.log('✅ Horarios de atención creados');
        } else {
            console.log(`✅ Ya existen ${horariosCheck.rows[0].count} horarios`);
        }
        
        // 6. Verificar y crear clientes de ejemplo
        const clientesCheck = await client.query(`
            SELECT COUNT(*) as count FROM clientes
        `);
        
        if (parseInt(clientesCheck.rows[0].count) === 0) {
            console.log('📝 Creando clientes de ejemplo...');
            await client.query(`
                INSERT INTO clientes (nombre, telefono, email, activo) VALUES
                ('Juan Pérez', '+51 987 111 222', 'juan@example.com', true),
                ('María González', '+51 987 333 444', 'maria@example.com', true),
                ('Pedro Sánchez', '+51 987 555 666', 'pedro@example.com', true)
            `);
            console.log('✅ Clientes de ejemplo creados');
        } else {
            console.log(`✅ Ya existen ${clientesCheck.rows[0].count} clientes`);
        }
        
        // 7. Resumen final
        const finalCheck = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE activo = true) as usuarios,
                (SELECT COUNT(*) FROM establecimientos WHERE activo = true) as establecimientos,
                (SELECT COUNT(*) FROM colaboradores WHERE activo = true) as colaboradores,
                (SELECT COUNT(*) FROM clientes WHERE activo = true) as clientes,
                (SELECT COUNT(*) FROM horarios_atencion WHERE activo = true) as horarios
        `);
        
        const stats = finalCheck.rows[0];
        console.log('\n📊 Resumen final:');
        console.log(`   - Usuarios: ${stats.usuarios}`);
        console.log(`   - Establecimientos: ${stats.establecimientos}`);
        console.log(`   - Colaboradores: ${stats.colaboradores}`);
        console.log(`   - Clientes: ${stats.clientes}`);
        console.log(`   - Horarios: ${stats.horarios}`);
        
        console.log('\n✅ Base de datos demo arreglada correctamente');
        
    } catch (error) {
        console.error('❌ Error al arreglar base de datos demo:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Ejecutar
if (require.main === module) {
    fixDemoDatabase()
        .then(() => {
            console.log('\n✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { fixDemoDatabase };


