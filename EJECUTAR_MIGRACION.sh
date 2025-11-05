#!/bin/bash
# Script para ejecutar migración de latitud/longitud en producción
# IP: 173.212.216.136
# Usuario: root
# Password: 151022qaz

echo "🔧 Conectando a servidor y ejecutando migración..."
echo ""

ssh root@173.212.216.136 << 'ENDSSH'
# Encontrar el contenedor de PostgreSQL usando el nombre del servicio
CONTAINER_ID=$(docker ps -q --filter 'name=weekly-postgres')

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ No se encontró el contenedor de PostgreSQL"
    echo "Buscando manualmente..."
    CONTAINER_ID=$(docker ps | grep weekly-postgres | grep -v grep | awk '{print $1}' | head -1)
    if [ -z "$CONTAINER_ID" ]; then
        echo "❌ No se encontró el contenedor"
        exit 1
    fi
fi

echo "✅ Contenedor encontrado: $CONTAINER_ID"
echo ""

# Ejecutar migración
docker exec -i $CONTAINER_ID psql -U postgres -d weekly_global << 'SQL'
-- Agregar columnas si no existen
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);

-- Agregar comentarios
COMMENT ON COLUMN tenants.latitud IS 'Coordenada de latitud obtenida de Google Maps';
COMMENT ON COLUMN tenants.longitud IS 'Coordenada de longitud obtenida de Google Maps';

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name IN ('latitud', 'longitud');
SQL

echo ""
echo "✅ Migración completada"
ENDSSH

