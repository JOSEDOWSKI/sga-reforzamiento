#!/usr/bin/env node

/**
 * Script de Inicialización de Base de Datos para Producción
 * 
 * Este script:
 * 1. Crea la base de datos global (weekly_global) si no existe
 * 2. Inicializa el esquema global
 * 3. Crea e inicializa tenants básicos si es necesario
 * 
 * Uso:
 *   node backend/scripts/init-production-db.js
 * 
 * Variables de entorno requeridas:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (opcional)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de base de datos
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
};

const globalDbName = process.env.DB_NAME || 'weekly_global';
const dbNamePrefix = process.env.DB_NAME_PREFIX || 'weekly_';

// Colores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Crea una base de datos si no existe
 */
async function createDatabaseIfNotExists(dbName) {
    const adminPool = new Pool({
        ...dbConfig,
        database: 'postgres'
    });

    let client;
    try {
        client = await adminPool.connect();
        
        // Verificar si existe
        const checkResult = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (checkResult.rows.length === 0) {
            log(`📦 Creando base de datos: ${dbName}`, 'yellow');
            await client.query(`CREATE DATABASE "${dbName}"`);
            log(`✅ Base de datos ${dbName} creada exitosamente`, 'green');
            return true;
        } else {
            log(`✅ Base de datos ${dbName} ya existe`, 'green');
            return false;
        }
    } catch (error) {
        log(`❌ Error al crear base de datos ${dbName}: ${error.message}`, 'red');
        throw error;
    } finally {
        if (client) client.release();
        await adminPool.end();
    }
}

/**
 * Inicializa el esquema en una base de datos
 */
async function initializeSchema(dbName, schemaFile) {
    const pool = new Pool({
        ...dbConfig,
        database: dbName
    });

    let client;
    try {
        client = await pool.connect();
        
        // Verificar si ya está inicializada
        const checkResult = await client.query(`
            SELECT to_regclass('public.tenants') as tenants,
                   to_regclass('public.establecimientos') as establecimientos,
                   to_regclass('public.usuarios') as usuarios;
        `);

        const hasTables = checkResult.rows[0].tenants !== null || 
                         checkResult.rows[0].establecimientos !== null ||
                         checkResult.rows[0].usuarios !== null;

        if (hasTables) {
            log(`✅ Esquema ya inicializado en ${dbName}`, 'green');
            return;
        }

        log(`📝 Inicializando esquema en ${dbName}...`, 'yellow');
        
        const schemaPath = path.resolve(__dirname, `../db/${schemaFile}`);
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Archivo de esquema no encontrado: ${schemaPath}`);
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schema);
        
        // Si es el tenant demo, ejecutar seed específico de demo
        if (schemaFile === 'schema.sql' && dbName.includes('demo')) {
            const demoSeedPath = path.resolve(__dirname, '../db/demo-seed.sql');
            if (fs.existsSync(demoSeedPath)) {
                log(`📦 Ejecutando seed específico para demo...`, 'yellow');
                const demoSeedData = fs.readFileSync(demoSeedPath, 'utf8');
                await client.query(demoSeedData);
                log(`✅ Seed de demo ejecutado correctamente`, 'green');
            }
        }
        
        log(`✅ Esquema inicializado exitosamente en ${dbName}`, 'green');
    } catch (error) {
        log(`❌ Error al inicializar esquema en ${dbName}: ${error.message}`, 'red');
        throw error;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

/**
 * Crea un tenant y su base de datos
 */
async function createTenant(tenantName, displayName, clienteEmail = null) {
    const tenantDbName = `${dbNamePrefix}${tenantName}`;
    
    try {
        // 1. Crear BD del tenant
        await createDatabaseIfNotExists(tenantDbName);
        
        // 2. Inicializar esquema del tenant
        await initializeSchema(tenantDbName, 'schema.sql');
        
        // 3. Agregar tenant a la BD global
        const globalPool = new Pool({
            ...dbConfig,
            database: globalDbName
        });

        let client;
        try {
            client = await globalPool.connect();
            
            // Verificar si el tenant ya existe
            const checkResult = await client.query(
                `SELECT id FROM tenants WHERE tenant_name = $1`,
                [tenantName]
            );

            if (checkResult.rows.length === 0) {
                await client.query(`
                    INSERT INTO tenants (tenant_name, display_name, cliente_nombre, cliente_email, estado, plan)
                    VALUES ($1, $2, $3, $4, 'activo', 'basico')
                `, [tenantName, displayName, displayName, clienteEmail || `admin@${tenantName}.weekly.pe`]);
                
                log(`✅ Tenant ${tenantName} agregado a la BD global`, 'green');
            } else {
                log(`✅ Tenant ${tenantName} ya existe en la BD global`, 'green');
            }
        } finally {
            if (client) client.release();
            await globalPool.end();
        }

    } catch (error) {
        log(`❌ Error al crear tenant ${tenantName}: ${error.message}`, 'red');
        throw error;
    }
}

/**
 * Función principal
 */
async function main() {
    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║   Inicialización de Base de Datos - Producción        ║', 'cyan');
    log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    try {
        // Mostrar configuración
        log('📋 Configuración:', 'blue');
        log(`   Host: ${dbConfig.host}:${dbConfig.port}`, 'blue');
        log(`   Usuario: ${dbConfig.user}`, 'blue');
        log(`   BD Global: ${globalDbName}`, 'blue');
        log(`   Prefijo Tenants: ${dbNamePrefix}`, 'blue');
        log('');

        // 1. Crear e inicializar BD global
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        log('Paso 1: Base de Datos Global', 'cyan');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        
        const wasCreated = await createDatabaseIfNotExists(globalDbName);
        await initializeSchema(globalDbName, 'schema-global.sql');

        // 2. Crear tenants básicos si la BD fue creada o si no existen
        log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        log('Paso 2: Tenants Básicos', 'cyan');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

        // Verificar qué tenants deben crearse
        const tenantsToCreate = process.env.INIT_TENANTS 
            ? process.env.INIT_TENANTS.split(',').map(t => t.trim())
            : ['demo', 'panel'];

        for (const tenantName of tenantsToCreate) {
            const displayName = tenantName.charAt(0).toUpperCase() + tenantName.slice(1);
            await createTenant(tenantName, displayName);
        }

        log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
        log('✅ Inicialización completada exitosamente', 'green');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'green');

        log('📊 Resumen:', 'blue');
        log(`   ✅ BD Global: ${globalDbName}`, 'green');
        for (const tenantName of tenantsToCreate) {
            log(`   ✅ Tenant: ${tenantName} (${dbNamePrefix}${tenantName})`, 'green');
        }
        log('');

    } catch (error) {
        log('\n❌ Error fatal durante la inicialización:', 'red');
        log(`   ${error.message}`, 'red');
        log(`   Stack: ${error.stack}`, 'red');
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        log(`\n❌ Error no manejado: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { createDatabaseIfNotExists, initializeSchema, createTenant };

