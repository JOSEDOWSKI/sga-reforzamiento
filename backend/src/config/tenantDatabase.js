const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cache de conexiones por tenant
const tenantPools = new Map();

// Configuración base de la base de datos
const baseConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
    max: 10, // máximo número de conexiones por pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

/**
 * Obtiene o crea una conexión de base de datos para un tenant específico
 * @param {string} tenant - Identificador del tenant
 * @returns {Pool} - Pool de conexiones para el tenant
 */
async function getTenantDatabase(tenant) {
    // Si ya existe una conexión para este tenant, devolverla
    if (tenantPools.has(tenant)) {
        return tenantPools.get(tenant);
    }
    
    // Crear nueva conexión para el tenant
    const dbName = `${process.env.DB_NAME_PREFIX || 'weekly_'}${tenant}`;
    
    const tenantConfig = {
        ...baseConfig,
        database: dbName
    };
    
    const pool = new Pool(tenantConfig);
    
    // Verificar que la base de datos existe y está inicializada
    await ensureTenantDatabase(tenant, pool);
    
    // Guardar en cache
    tenantPools.set(tenant, pool);
    
    // Solo log en desarrollo o para tenants nuevos
    if (process.env.NODE_ENV === 'development' || !tenantPools.has(tenant)) {
        console.log(`Database connection established for tenant: ${tenant} (${dbName})`);
    }
    return pool;
}

/**
 * Asegura que la base de datos del tenant existe y está inicializada
 * @param {string} tenant - Identificador del tenant
 * @param {Pool} pool - Pool de conexiones
 */
async function ensureTenantDatabase(tenant, pool) {
    let client;
    try {
        // Intentar conectar a la base de datos del tenant
        client = await pool.connect();
        
        // Verificar si las tablas existen (buscar establecimientos, usuarios o reservas)
        const checkTableQuery = `
            SELECT to_regclass('public.establecimientos') as establecimientos,
                   to_regclass('public.usuarios') as usuarios,
                   to_regclass('public.reservas') as reservas;
        `;
        const res = await client.query(checkTableQuery);
        
        const hasTables = res.rows[0].establecimientos !== null || 
                         res.rows[0].usuarios !== null || 
                         res.rows[0].reservas !== null;
        
        // Si no existen las tablas, crearlas
        if (!hasTables) {
            console.log(`Initializing database for tenant: ${tenant}`);
            await initializeTenantSchema(client, tenant);
            console.log(`Database initialized successfully for tenant: ${tenant}`);
        }
        
    } catch (error) {
        if (error.message.includes('does not exist')) {
            // La base de datos no existe, crearla
            await createTenantDatabase(tenant);
            // Reintentar la inicialización
            await ensureTenantDatabase(tenant, pool);
        } else {
            throw error;
        }
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Crea una nueva base de datos para un tenant
 * @param {string} tenant - Identificador del tenant
 */
async function createTenantDatabase(tenant) {
    const dbName = `${process.env.DB_NAME_PREFIX || 'weekly_'}${tenant}`;
    
    // Conectar a la base de datos postgres por defecto para crear la nueva DB
    const adminPool = new Pool({
        ...baseConfig,
        database: 'postgres'
    });
    
    let client;
    try {
        client = await adminPool.connect();
        
        // Verificar si la BD ya existe
        const checkResult = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );
        
        if (checkResult.rows.length > 0) {
            console.log(`✅ Database ${dbName} already exists`);
        } else {
            // Crear la base de datos
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Database created: ${dbName}`);
        }
        
    } catch (error) {
        if (!error.message.includes('already exists')) {
            console.error(`❌ Error creating database ${dbName}:`, error.message);
            throw error;
        }
    } finally {
        if (client) {
            client.release();
        }
        await adminPool.end();
    }
    
    // Inicializar el esquema inmediatamente después de crear la BD
    // Esto asegura que el tenant tenga su BD lista desde el inicio
    const tenantPool = new Pool({
        ...baseConfig,
        database: dbName
    });
    
    let tenantClient;
    try {
        tenantClient = await tenantPool.connect();
        
        // Verificar si ya tiene tablas inicializadas
        const checkTables = await tenantClient.query(`
            SELECT to_regclass('public.establecimientos') as establecimientos,
                   to_regclass('public.usuarios') as usuarios
        `);
        
        const hasTables = checkTables.rows[0].establecimientos !== null || 
                         checkTables.rows[0].usuarios !== null;
        
        if (!hasTables) {
            console.log(`📦 Initializing schema for tenant: ${tenant}`);
            await initializeTenantSchema(tenantClient, tenant);
            console.log(`✅ Schema and seed initialized for tenant: ${tenant}`);
        } else {
            console.log(`✅ Schema already initialized for tenant: ${tenant}`);
        }
    } catch (initError) {
        console.error(`⚠️  Error initializing schema for ${tenant}:`, initError.message);
        // No fallar completamente - se inicializará en el próximo acceso vía ensureTenantDatabase
        throw initError;
    } finally {
        if (tenantClient) {
            tenantClient.release();
        }
        await tenantPool.end();
    }
}

/**
 * Inicializa el esquema de la base de datos para un tenant
 * @param {Client} client - Cliente de base de datos conectado
 */
async function initializeTenantSchema(client, tenant = null) {
    const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar el esquema
    await client.query(schema);
    
    // Insertar datos iniciales específicos para demo si es el tenant demo
    if (tenant === 'demo') {
        const demoSeedPath = path.resolve(__dirname, '../../db/demo-seed.sql');
        if (fs.existsSync(demoSeedPath)) {
            console.log('📦 Ejecutando seed específico para demo...');
            const demoSeedData = fs.readFileSync(demoSeedPath, 'utf8');
            await client.query(demoSeedData);
            console.log('✅ Seed de demo ejecutado correctamente');
        }
    } else {
        // Para otros tenants, usar el seed genérico si existe
        const seedPath = path.resolve(__dirname, '../../db/tenant-seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedData = fs.readFileSync(seedPath, 'utf8');
            await client.query(seedData);
        }
    }
}

/**
 * Cierra todas las conexiones de bases de datos
 */
async function closeAllConnections() {
    const promises = Array.from(tenantPools.values()).map(pool => pool.end());
    await Promise.all(promises);
    tenantPools.clear();
    console.log('All tenant database connections closed');
}

/**
 * Lista todos los tenants activos (con conexiones abiertas)
 * @returns {string[]} - Array de identificadores de tenants
 */
function getActiveTenants() {
    return Array.from(tenantPools.keys());
}

/**
 * Elimina la conexión de un tenant específico
 * @param {string} tenant - Identificador del tenant
 */
async function removeTenantConnection(tenant) {
    if (tenantPools.has(tenant)) {
        const pool = tenantPools.get(tenant);
        await pool.end();
        tenantPools.delete(tenant);
        console.log(`Connection removed for tenant: ${tenant}`);
    }
}

module.exports = {
    getTenantDatabase,
    closeAllConnections,
    getActiveTenants,
    removeTenantConnection,
    ensureTenantDatabase,
    createTenantDatabase
};