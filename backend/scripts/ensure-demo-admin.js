/**
 * Script para asegurar que existe un usuario admin en la BD de demo
 * Ejecutar: npm run ensure-demo-admin
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const DB_NAME_PREFIX = process.env.DB_NAME_PREFIX || 'agendate_';
const demoDbName = `${DB_NAME_PREFIX}demo`;

async function ensureDemoAdmin() {
    const pool = new Pool({
        ...dbConfig,
        database: demoDbName
    });

    let client;
    try {
        client = await pool.connect();
        
        console.log(`🔍 Verificando usuario admin en ${demoDbName}...`);
        
        // Verificar si existe el usuario admin
        const userCheck = await client.query(`
            SELECT id, email, nombre, rol, activo 
            FROM usuarios 
            WHERE email = 'admin@demo.weekly.pe' AND rol = 'admin'
        `);
        
        if (userCheck.rows.length > 0) {
            const user = userCheck.rows[0];
            console.log('✅ Usuario admin ya existe:');
            console.log(`   Email: ${user.email}`);
            console.log(`   Nombre: ${user.nombre}`);
            console.log(`   Rol: ${user.rol}`);
            console.log(`   Activo: ${user.activo}`);
            
            // Si no está activo, activarlo
            if (!user.activo) {
                await client.query(`
                    UPDATE usuarios 
                    SET activo = true 
                    WHERE id = $1
                `, [user.id]);
                console.log('✅ Usuario admin activado');
            }
        } else {
            console.log('📝 Creando usuario administrador...');
            
            // Generar hash de password: demo123
            const passwordHash = await bcrypt.hash('demo123', 10);
            
            await client.query(`
                INSERT INTO usuarios (email, password_hash, nombre, rol, activo) 
                VALUES ($1, $2, $3, 'admin', true)
            `, ['admin@demo.weekly.pe', passwordHash, 'Administrador Demo']);
            
            console.log('✅ Usuario administrador creado exitosamente');
            console.log('   Email: admin@demo.weekly.pe');
            console.log('   Password: demo123');
        }
        
        // Mostrar todos los usuarios admin
        const allAdmins = await client.query(`
            SELECT id, email, nombre, rol, activo, created_at
            FROM usuarios 
            WHERE rol = 'admin'
            ORDER BY created_at DESC
        `);
        
        console.log(`\n📊 Usuarios administradores en ${demoDbName}:`);
        allAdmins.rows.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.nombre}) - ${admin.activo ? 'Activo' : 'Inactivo'}`);
        });
        
        await client.release();
        await pool.end();
        
        console.log('\n✅ Proceso completado');
    } catch (error) {
        if (client) await client.release();
        await pool.end();
        
        if (error.code === '3D000') {
            console.error(`❌ Error: La base de datos ${demoDbName} no existe`);
            console.error('💡 Ejecuta primero: npm run create-demo-tenant');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

ensureDemoAdmin();


