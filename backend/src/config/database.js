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
        // 1. Probar la conexión
        client = await pool.connect();
        console.log(`Conectado a la base de datos PostgreSQL: ${dbConfig.database}`);

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
        console.error('❌ Error al inicializar la base de datos:', err.message);
        // Si la base de datos no existe
        if (err.message.includes('does not exist')) {
            console.log('\n---');
            console.log(`⚠️  LA BASE DE DATOS "${dbConfig.database}" NO EXISTE.`);
            console.log('Por favor, créala con el comando:');
            console.log(`psql -U ${dbConfig.user} -c "CREATE DATABASE ${dbConfig.database};"`);
            console.log('---');
        }
        // No cerramos el pool aquí. Dejamos que los siguientes intentos puedan funcionar.
    } finally {
        if (client) {
            client.release(); // Liberamos el cliente si fue conectado
        }
    }
};

// Inicializar base de datos con manejo de errores
initializeDatabase().catch((error) => {
    console.error('❌ Error inicializando base de datos:', error);
    console.error('Stack:', error.stack);
    // En producción, no detener el proceso, solo loguear el error
    // El servidor puede iniciar y los endpoints manejarán errores de BD
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Exportamos el pool directamente. Es la forma más robusta.
// Los controladores lo usarán para hacer consultas.
module.exports = pool; 