#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const tenant = process.argv[2];
  const file = process.argv[3];
  if (!tenant || !file) {
    console.error('Uso: node scripts/run-migration.js <tenant> <ruta_sql>');
    process.exit(1);
  }

  const dbName = process.env.DB_NAME_PREFIX ? `${process.env.DB_NAME_PREFIX}${tenant}` : tenant;
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: dbName,
  });

  const client = await pool.connect();
  try {
    const migrationPath = path.resolve(file);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`Migración aplicada correctamente en ${dbName}: ${path.basename(file)}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al aplicar migración:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();


