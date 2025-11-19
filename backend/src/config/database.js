const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración desde variables de entorno (producción) o valores por defecto (desarrollo)
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sga_reforzamiento',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const pool = new Pool(dbConfig);

// Función para inicializar la BD. Se llamará una vez al inicio.
const initializeDatabase = async () => {
    let client;
    try {
        console.log(`🔌 Intentando conectar a la base de datos...`);
        console.log(`   Host: ${dbConfig.host}`);
        console.log(`   Port: ${dbConfig.port}`);
        console.log(`   Database: ${dbConfig.database}`);
        console.log(`   User: ${dbConfig.user}`);
        
        // 1. Probar la conexión con timeout de 10 segundos
        const connectPromise = pool.connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        );
        
        client = await Promise.race([connectPromise, timeoutPromise]);
        console.log(`✅ Conectado a la base de datos PostgreSQL: ${dbConfig.database}`);

        // 2. Comprobar si la tabla 'establecimientos' ya existe (nueva estructura)
        // Fallback a 'tenants' para BD global o 'usuarios' para tenant
        const checkTableQuery = `
            SELECT to_regclass('public.establecimientos') as establecimientos,
                   to_regclass('public.tenants') as tenants,
                   to_regclass('public.usuarios') as usuarios;
        `;
        const res = await client.query(checkTableQuery);
        
        const hasEstablecimientos = res.rows[0].establecimientos !== null;
        const hasTenants = res.rows[0].tenants !== null;
        const hasUsuarios = res.rows[0].usuarios !== null;
        
        // 3. Determinar qué esquema aplicar según el tipo de BD
        if (!hasEstablecimientos && !hasTenants && !hasUsuarios) {
            console.log('Base de datos no inicializada. Inicializando esquema...');
            
            // Si es BD global (weekly_global), usar schema-global.sql
            if (dbConfig.database.includes('global') || dbConfig.database === 'weekly_global') {
                const schemaPath = path.resolve(__dirname, '../../db/schema-global.sql');
                if (fs.existsSync(schemaPath)) {
                    const schema = fs.readFileSync(schemaPath, 'utf8');
                    await client.query(schema);
                    console.log('✅ Esquema global creado exitosamente.');
                } else {
                    console.warn('⚠️  schema-global.sql no encontrado, usando schema.sql');
                    const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
                    const schema = fs.readFileSync(schemaPath, 'utf8');
                    await client.query(schema);
                    console.log('✅ Esquema creado exitosamente.');
                }
            } else {
                // BD de tenant, usar schema.sql
                const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
                const schema = fs.readFileSync(schemaPath, 'utf8');
                await client.query(schema);
                console.log('✅ Esquema de tenant creado exitosamente.');
            }
        } else {
            console.log('✅ Las tablas ya existen. Base de datos inicializada.');
        }
    } catch (err) {
        console.error('❌ Error al inicializar la base de datos:');
        console.error('   Mensaje:', err.message);
        console.error('   Código:', err.code);
        
        if (err.code === 'ECONNREFUSED') {
            console.error('⚠️  No se pudo conectar a PostgreSQL. Verifica que:');
            console.error('   1. PostgreSQL esté corriendo');
            console.error('   2. DB_HOST y DB_PORT sean correctos');
            console.error('   3. El servicio esté accesible desde el contenedor');
            console.error(`   Host intentado: ${dbConfig.host}:${dbConfig.port}`);
        } else if (err.code === '28P01') {
            console.error('⚠️  Error de autenticación. Verifica DB_USER y DB_PASSWORD');
        } else if (err.code === '3D000' || err.message.includes('does not exist')) {
            console.error(`⚠️  La base de datos "${dbConfig.database}" no existe`);
            console.error(`   Créala con: CREATE DATABASE ${dbConfig.database};`);
        }
        
        // Re-lanzar el error para que el llamador pueda manejarlo
        throw err;
    } finally {
        if (client) {
            client.release(); // Liberamos el cliente si fue conectado
        }
    }
};

// Inicializar base de datos con manejo de errores
// No bloquear el inicio del servidor si falla la inicialización
initializeDatabase().catch((error) => {
    console.error('❌ Error inicializando base de datos:', error);
    console.error('Stack:', error.stack);
    console.error('⚠️  El servidor continuará iniciando, pero algunas funcionalidades pueden no estar disponibles.');
    // NO detener el proceso - el servidor puede iniciar y los endpoints manejarán errores de BD
    // En producción, es mejor que el servidor esté disponible aunque la BD tenga problemas
});

// Exportamos el pool directamente. Es la forma más robusta.
// Los controladores lo usarán para hacer consultas.
module.exports = pool; 