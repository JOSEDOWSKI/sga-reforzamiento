#!/bin/bash

# =============================================
# Script para crear Super Admin en weekly_global
# Ejecutar desde SSH en el servidor CapRover
# =============================================

set -e

POSTGRES_CONTAINER="srv-captain--weekly-postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="151022qaz"
DB_NAME="weekly_global"

echo "🔍 Conectando a PostgreSQL..."
echo "   Contenedor: $POSTGRES_CONTAINER"
echo "   Usuario: $POSTGRES_USER"
echo "   Base de datos: $DB_NAME"
echo ""

# Verificar que el contenedor existe
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    echo "❌ Error: No se encontró el contenedor $POSTGRES_CONTAINER"
    echo "   Contenedores disponibles:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

echo "✅ Contenedor encontrado"
echo ""

# Verificar si weekly_global existe
echo "📋 Verificando si la base de datos 'weekly_global' existe..."
DB_EXISTS=$(docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ -z "$DB_EXISTS" ]; then
    echo "⚠️  La base de datos '$DB_NAME' no existe. Creándola..."
    docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Base de datos '$DB_NAME' creada"
else
    echo "✅ La base de datos '$DB_NAME' ya existe"
fi

echo ""

# Verificar si la tabla usuarios_global existe
echo "📋 Verificando si la tabla 'usuarios_global' existe..."
TABLE_EXISTS=$(docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $DB_NAME -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='usuarios_global'")

if [ -z "$TABLE_EXISTS" ]; then
    echo "⚠️  La tabla 'usuarios_global' no existe. Creándola..."
    
    docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS usuarios_global (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'super_admin',
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
    
    echo "✅ Tabla 'usuarios_global' creada"
else
    echo "✅ La tabla 'usuarios_global' ya existe"
fi

echo ""

# Verificar usuarios existentes
echo "📋 Usuarios globales existentes:"
docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $DB_NAME -c "SELECT id, email, nombre, rol, activo FROM usuarios_global ORDER BY created_at DESC;"

echo ""

# Crear o actualizar super admin
echo "🔧 Creando/actualizando Super Admin..."
docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $DB_NAME <<EOF
INSERT INTO usuarios_global (email, password_hash, nombre, rol, activo) 
VALUES (
    'admin@weekly.com',
    '\$2b\$12\$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW',
    'Super Administrador',
    'super_admin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '\$2b\$12\$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW',
    nombre = 'Super Administrador',
    rol = 'super_admin',
    activo = true,
    updated_at = CURRENT_TIMESTAMP;
EOF

echo "✅ Super Admin creado/actualizado"
echo ""

# Verificar que se creó correctamente
echo "✅ Verificación final:"
docker exec $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $DB_NAME -c "SELECT email, nombre, rol, activo FROM usuarios_global WHERE email = 'admin@weekly.com';"

echo ""
echo "🎉 ¡Completado!"
echo ""
echo "📝 Credenciales de acceso:"
echo "   URL: https://panel.weekly.pe"
echo "   Email: admin@weekly.com"
echo "   Contraseña: admin123"
echo ""

