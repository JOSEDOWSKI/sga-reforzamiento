/**
 * Script completo para inicializar la demo:
 * 1. Verifica/crea la BD demo
 * 2. Aplica schema si falta
 * 3. Crea datos mínimos necesarios
 * 4. Configura horarios y servicios
 * Ejecutar: npm run init-demo-complete
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

const DB_NAME_PREFIX = process.env.DB_NAME_PREFIX || 'agendate_';
const demoDbName = `${DB_NAME_PREFIX}demo`;

async function initDemoComplete() {
    // 1. Verificar que la BD existe
    const adminPool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });

    let adminClient;
    try {
        adminClient = await adminPool.connect();
        const dbCheck = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [demoDbName]
        );

        if (dbCheck.rows.length === 0) {
            console.error(`❌ La base de datos ${demoDbName} no existe.`);
            console.error(`💡 Ejecuta primero: npm run create-tenant demo`);
            process.exit(1);
        }
        adminClient.release();
        await adminPool.end();
    } catch (error) {
        if (adminClient) adminClient.release();
        await adminPool.end();
        console.error('❌ Error verificando BD:', error.message);
        process.exit(1);
    }

    // 2. Conectar a la BD demo
    const pool = new Pool({
        ...dbConfig,
        database: demoDbName
    });

    let client;
    try {
        client = await pool.connect();
        console.log(`🚀 Inicializando demo completa en ${demoDbName}...\n`);

        // 3. Verificar/Crear establecimiento principal
        console.log('📋 Verificando establecimiento principal...');
        let establecimientoResult = await client.query(`
            SELECT id, nombre FROM establecimientos WHERE activo = true LIMIT 1
        `);

        let establecimientoId;
        if (establecimientoResult.rows.length > 0) {
            establecimientoId = establecimientoResult.rows[0].id;
            console.log(`   ✅ Establecimiento encontrado: ${establecimientoResult.rows[0].nombre} (ID: ${establecimientoId})`);
        } else {
            console.log('   📝 Creando establecimiento principal...');
            establecimientoResult = await client.query(`
                INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, activo)
                VALUES ('Establecimiento Demo', 'Establecimiento principal para probar la demo', 'demo', true)
                RETURNING id
            `);
            establecimientoId = establecimientoResult.rows[0].id;
            console.log(`   ✅ Establecimiento creado (ID: ${establecimientoId})`);
        }

        // 4. Verificar/Crear colaborador principal
        console.log('\n👤 Verificando colaborador principal...');
        let colaboradorResult = await client.query(`
            SELECT id, nombre FROM colaboradores 
            WHERE establecimiento_id = $1 AND activo = true 
            LIMIT 1
        `, [establecimientoId]);

        let colaboradorId;
        if (colaboradorResult.rows.length > 0) {
            colaboradorId = colaboradorResult.rows[0].id;
            console.log(`   ✅ Colaborador encontrado: ${colaboradorResult.rows[0].nombre} (ID: ${colaboradorId})`);
        } else {
            console.log('   📝 Creando colaborador principal...');
            colaboradorResult = await client.query(`
                INSERT INTO colaboradores (nombre, email, telefono, establecimiento_id, activo, especialidades)
                VALUES ('Colaborador Demo', 'colaborador@demo.weekly.pe', '+51 999 999 999', $1, true, ARRAY['Servicios Generales'])
                ON CONFLICT (email) DO UPDATE SET
                    nombre = EXCLUDED.nombre,
                    telefono = EXCLUDED.telefono,
                    establecimiento_id = EXCLUDED.establecimiento_id,
                    activo = true,
                    especialidades = EXCLUDED.especialidades
                RETURNING id
            `, [establecimientoId]);
            colaboradorId = colaboradorResult.rows[0].id;
            console.log(`   ✅ Colaborador "Colaborador Demo" creado (ID: ${colaboradorId})`);
        }

        // 5. Configurar horarios (L-V, 9am-4pm)
        console.log('\n📅 Configurando horarios de atención...');
        const diasSemana = [
            { dia: 1, nombre: 'Lunes' },
            { dia: 2, nombre: 'Martes' },
            { dia: 3, nombre: 'Miércoles' },
            { dia: 4, nombre: 'Jueves' },
            { dia: 5, nombre: 'Viernes' }
        ];

        for (const dia of diasSemana) {
            const horarioCheck = await client.query(`
                SELECT id FROM horarios_atencion 
                WHERE establecimiento_id = $1 AND dia_semana = $2
            `, [establecimientoId, dia.dia]);

            if (horarioCheck.rows.length > 0) {
                await client.query(`
                    UPDATE horarios_atencion
                    SET hora_apertura = '09:00:00',
                        hora_cierre = '16:00:00',
                        intervalo_minutos = 30,
                        activo = true,
                        is_closed = false,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                `, [horarioCheck.rows[0].id]);
                console.log(`   ✅ ${dia.nombre}: 9:00 AM - 4:00 PM (actualizado)`);
            } else {
                await client.query(`
                    INSERT INTO horarios_atencion 
                    (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo, is_closed)
                    VALUES ($1, $2, '09:00:00', '16:00:00', 30, true, false)
                `, [establecimientoId, dia.dia]);
                console.log(`   ✅ ${dia.nombre}: 9:00 AM - 4:00 PM (creado)`);
            }
        }

        // Cerrar sábado y domingo
        await client.query(`
            UPDATE horarios_atencion
            SET is_closed = true,
                activo = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE establecimiento_id = $1 AND dia_semana IN (0, 6)
        `, [establecimientoId]);
        console.log('   ✅ Sábado y domingo cerrados');

        // 6. Verificar/Crear servicio principal
        console.log('\n🎯 Configurando servicio principal...');
        const servicesTableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'services'
            )
        `);

        if (servicesTableCheck.rows[0].exists) {
            const servicioCheck = await client.query(`
                SELECT id FROM services WHERE name = 'Probar la Demo' LIMIT 1
            `);

            if (servicioCheck.rows.length > 0) {
                await client.query(`
                    UPDATE services
                    SET description = 'Servicio principal para probar la funcionalidad de la demo',
                        duration_minutes = 30,
                        price = 0,
                        active = true,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                `, [servicioCheck.rows[0].id]);
                console.log('   ✅ Servicio "Probar la Demo" actualizado');
            } else {
                await client.query(`
                    INSERT INTO services (name, description, duration_minutes, price, active)
                    VALUES ('Probar la Demo', 'Servicio principal para probar la funcionalidad de la demo', 30, 0, true)
                `);
                console.log('   ✅ Servicio "Probar la Demo" creado');
            }
        } else {
            console.log('   ⚠️  Tabla services no existe (opcional)');
        }

        // 7. Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE CONFIGURACIÓN');
        console.log('='.repeat(60));

        const horariosCount = await client.query(`
            SELECT COUNT(*) as count FROM horarios_atencion 
            WHERE establecimiento_id = $1 AND activo = true AND is_closed = false
        `, [establecimientoId]);
        console.log(`✅ Horarios activos: ${horariosCount.rows[0].count} días`);

        const colaboradoresCount = await client.query(`
            SELECT COUNT(*) as count FROM colaboradores 
            WHERE establecimiento_id = $1 AND activo = true
        `, [establecimientoId]);
        console.log(`✅ Colaboradores activos: ${colaboradoresCount.rows[0].count}`);

        const serviciosCount = await client.query(`
            SELECT COUNT(*) as count FROM services WHERE active = true
        `);
        if (servicesTableCheck.rows[0].exists) {
            console.log(`✅ Servicios activos: ${serviciosCount.rows[0].count}`);
        }

        console.log('\n✅ Demo inicializada correctamente');
        console.log('\n🎯 La demo está lista para usar:');
        console.log(`   - Establecimiento: ID ${establecimientoId}`);
        console.log(`   - Colaborador: ID ${colaboradorId}`);
        console.log(`   - Horarios: Lunes a Viernes, 9:00 AM - 4:00 PM`);

        await client.release();
        await pool.end();
    } catch (error) {
        if (client) await client.release();
        await pool.end();

        if (error.code === '3D000') {
            console.error(`❌ Error: La base de datos ${demoDbName} no existe`);
            console.error('💡 Ejecuta primero: npm run create-tenant demo');
        } else {
            console.error('❌ Error:', error.message);
            console.error(error.stack);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    initDemoComplete()
        .then(() => {
            console.log('\n✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { initDemoComplete };

