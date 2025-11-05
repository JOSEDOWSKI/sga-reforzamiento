#!/bin/bash
# Script para ejecutar migración de latitud/longitud en producción

echo "🔧 Conectando a PostgreSQL en el servidor..."
echo ""

# Opción 1: Ejecutar desde el contenedor de PostgreSQL
echo "📋 COMANDO 1: Ejecutar desde el contenedor de PostgreSQL"
echo "=================================================="
echo "ssh root@173.212.216.136"
echo "docker exec -i srv-captain--weekly-postgres.1.\$(docker ps | grep weekly-postgres | awk '{print \$1}') psql -U postgres -d weekly_global < migrate_add_lat_lng_production.sql"
echo ""

# Opción 2: Ejecutar directamente con psql
echo "📋 COMANDO 2: Ejecutar SQL directamente"
echo "=================================================="
echo "ssh root@173.212.216.136"
echo "docker exec -i srv-captain--weekly-postgres.1.\$(docker ps | grep weekly-postgres | awk '{print \$1}') psql -U postgres -d weekly_global << 'SQL'"
echo "-- Agregar columnas"
echo "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8);"
echo "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);"
echo "SQL"
echo ""

# Opción 3: Ejecutar comando por comando
echo "📋 COMANDO 3: Ejecutar paso a paso"
echo "=================================================="
echo "ssh root@173.212.216.136"
echo "# Conectar al contenedor PostgreSQL"
echo "docker exec -it srv-captain--weekly-postgres.1.\$(docker ps | grep weekly-postgres | awk '{print \$1}') psql -U postgres -d weekly_global"
echo ""
echo "# Luego ejecutar:"
echo "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8);"
echo "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);"
echo "\\q"
echo ""

echo "✅ Después de ejecutar, verificar con:"
echo "SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants' AND column_name IN ('latitud', 'longitud');"
