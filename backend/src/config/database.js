const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno. Busca un archivo .env en la raíz del backend.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

// Función para inicializar la BD. Se llamará una vez al inicio.
const initializeDatabase = async () => {
    let client;
    try {
        // 1. Probar la conexión
        client = await pool.connect();
        console.log('Conectado a la base de datos PostgreSQL.');

        // 2. Comprobar si la tabla 'cursos' ya existe
        const checkTableQuery = "SELECT to_regclass('public.cursos');";
        const res = await client.query(checkTableQuery);
        
        // 3. Si no existe, crear las tablas desde el schema
        if (res.rows[0].to_regclass === null) {
            console.log('Base de datos no inicializada. Creando tablas...');
            const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await client.query(schema);
            console.log('Tablas creadas exitosamente.');
        } else {
            console.log('Las tablas ya existen.');
        }
    } catch (err) {
        console.error('Error al inicializar la base de datos:', err.message);
        // Si la base de datos 'sga_reforzamiento' no existe, pg lanza un error específico.
        if (err.message.includes('database "sga_reforzamiento" does not exist')) {
            console.log('\n---');
            console.log('POR FAVOR, CREA LA BASE DE DATOS "sga_reforzamiento" EN POSTGRESQL.');
            console.log('Puedes usar el comando:');
            console.log('psql -U postgres -c "CREATE DATABASE sga_reforzamiento;"');
            console.log('---');
        }
        // No cerramos el pool aquí. Dejamos que los siguientes intentos puedan funcionar.
    } finally {
        if (client) {
            client.release(); // Liberamos el cliente si fue conectado
        }
    }
};

pool.ready = initializeDatabase();

// Exportamos el pool directamente. Es la forma más robusta.
// Los controladores lo usarán para hacer consultas.
module.exports = pool; 