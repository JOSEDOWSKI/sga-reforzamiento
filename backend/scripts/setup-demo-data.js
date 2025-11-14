/**
 * Script para configurar datos de demo:
 * - Horarios de lunes a viernes de 9am a 4pm
 * - Servicio principal "Probar la Demo"
 * Ejecutar: npm run setup-demo-data
 */

const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const DB_NAME_PREFIX = process.env.DB_NAME_PREFIX || 'agendate_';
const demoDbName = `${DB_NAME_PREFIX}demo`;

async function setupDemoData() {
    const pool = new Pool({
        ...dbConfig,
        database: demoDbName
    });

    let client;
    try {
        client = await pool.connect();
        
        console.log(`🔧 Configurando datos de demo en ${demoDbName}...\n`);

        // 1. Verificar/Crear establecimiento principal
        console.log('📋 Verificando establecimiento principal...');
        const establecimientoCheck = await client.query(`
            SELECT id, nombre FROM establecimientos WHERE activo = true LIMIT 1
        `);

        let establecimientoId;
        if (establecimientoCheck.rows.length > 0) {
            establecimientoId = establecimientoCheck.rows[0].id;
            console.log(`✅ Establecimiento encontrado: ${establecimientoCheck.rows[0].nombre} (ID: ${establecimientoId})`);
        } else {
            console.log('📝 Creando establecimiento principal...');
            const establecimientoResult = await client.query(`
                INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, activo)
                VALUES ('Establecimiento Demo', 'Establecimiento principal para probar la demo', 'demo', true)
                RETURNING id
            `);
            establecimientoId = establecimientoResult.rows[0].id;
            console.log(`✅ Establecimiento creado (ID: ${establecimientoId})`);
        }

        // 2. Configurar horarios de lunes a viernes (9am - 4pm)
        console.log('\n📅 Configurando horarios de atención...');
        const diasSemana = [
            { dia: 1, nombre: 'Lunes' },
            { dia: 2, nombre: 'Martes' },
            { dia: 3, nombre: 'Miércoles' },
            { dia: 4, nombre: 'Jueves' },
            { dia: 5, nombre: 'Viernes' }
        ];

        for (const dia of diasSemana) {
            // Verificar si ya existe
            const horarioCheck = await client.query(`
                SELECT id FROM horarios_atencion 
                WHERE establecimiento_id = $1 AND dia_semana = $2
            `, [establecimientoId, dia.dia]);

            if (horarioCheck.rows.length > 0) {
                // Actualizar horario existente
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
                // Crear nuevo horario
                await client.query(`
                    INSERT INTO horarios_atencion 
                    (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo, is_closed)
                    VALUES ($1, $2, '09:00:00', '16:00:00', 30, true, false)
                `, [establecimientoId, dia.dia]);
                console.log(`   ✅ ${dia.nombre}: 9:00 AM - 4:00 PM (creado)`);
            }
        }

        // Cerrar sábado y domingo si existen
        console.log('\n📅 Cerrando sábado y domingo...');
        await client.query(`
            UPDATE horarios_atencion
            SET is_closed = true,
                activo = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE establecimiento_id = $1 AND dia_semana IN (0, 6)
        `, [establecimientoId]);
        console.log('   ✅ Sábado y domingo cerrados');

        // 3. Verificar/Crear servicio principal "Probar la Demo"
        console.log('\n🎯 Configurando servicio principal...');
        
        // Verificar si la tabla services existe
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
                // Actualizar servicio existente
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
                // Crear nuevo servicio
                await client.query(`
                    INSERT INTO services (name, description, duration_minutes, price, active)
                    VALUES ('Probar la Demo', 'Servicio principal para probar la funcionalidad de la demo', 30, 0, true)
                `);
                console.log('   ✅ Servicio "Probar la Demo" creado');
            }
        } else {
            console.log('   ⚠️  Tabla services no existe (ejecuta primero: npm run migrate-mvp-all)');
        }

        // 4. Verificar/Crear colaborador principal
        console.log('\n👤 Verificando colaborador principal...');
        const colaboradorCheck = await client.query(`
            SELECT id, nombre FROM colaboradores 
            WHERE establecimiento_id = $1 AND activo = true 
            LIMIT 1
        `, [establecimientoId]);

        let colaboradorId;
        if (colaboradorCheck.rows.length > 0) {
            colaboradorId = colaboradorCheck.rows[0].id;
            console.log(`   ✅ Colaborador encontrado: ${colaboradorCheck.rows[0].nombre} (ID: ${colaboradorId})`);
        } else {
            console.log('   📝 Creando colaborador principal...');
            const colaboradorResult = await client.query(`
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
        
        // Asegurar que hay al menos un colaborador activo
        const totalColaboradores = await client.query(`
            SELECT COUNT(*) as count FROM colaboradores 
            WHERE establecimiento_id = $1 AND activo = true
        `, [establecimientoId]);
        
        if (parseInt(totalColaboradores.rows[0].count) === 0) {
            console.log('   ⚠️  No hay colaboradores activos, creando uno de emergencia...');
            await client.query(`
                INSERT INTO colaboradores (nombre, email, telefono, establecimiento_id, activo, especialidades)
                VALUES ('Colaborador Demo', 'colaborador@demo.weekly.pe', '+51 999 999 999', $1, true, ARRAY['Servicios Generales'])
                ON CONFLICT (email) DO UPDATE SET activo = true
            `, [establecimientoId]);
            console.log('   ✅ Colaborador de emergencia creado');
        }

        // Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE CONFIGURACIÓN');
        console.log('='.repeat(60));
        
        const horariosCount = await client.query(`
            SELECT COUNT(*) as count FROM horarios_atencion 
            WHERE establecimiento_id = $1 AND activo = true AND is_closed = false
        `, [establecimientoId]);
        console.log(`✅ Horarios activos: ${horariosCount.rows[0].count} días`);

        const serviciosCount = await client.query(`
            SELECT COUNT(*) as count FROM services WHERE active = true
        `);
        console.log(`✅ Servicios activos: ${serviciosCount.rows[0].count}`);

        const colaboradoresCount = await client.query(`
            SELECT COUNT(*) as count FROM colaboradores 
            WHERE establecimiento_id = $1 AND activo = true
        `, [establecimientoId]);
        console.log(`✅ Colaboradores activos: ${colaboradoresCount.rows[0].count}`);

        console.log('\n✅ Configuración de demo completada');
        
        await client.release();
        await pool.end();
    } catch (error) {
        if (client) await client.release();
        await pool.end();
        
        if (error.code === '3D000') {
            console.error(`❌ Error: La base de datos ${demoDbName} no existe`);
            console.error('💡 Ejecuta primero: npm run create-demo-tenant');
        } else {
            console.error('❌ Error:', error.message);
            console.error(error.stack);
        }
        process.exit(1);
    }
}

setupDemoData();


