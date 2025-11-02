#!/bin/bash

# =============================================
# Script para acceder a PostgreSQL desde CapRover
# =============================================

echo "🔍 Accediendo a PostgreSQL en CapRover..."
echo ""
echo "📋 Información de conexión:"
echo "   Host: srv-captain--weekly-postgres"
echo "   Usuario: postgres"
echo "   Contraseña: 151022qaz"
echo "   Puerto: 5432"
echo ""

# Opción 1: Acceder usando docker exec (si estás en el servidor)
echo "🔧 Método 1: Desde el servidor (SSH)"
echo "   docker exec -it srv-captain--weekly-postgres psql -U postgres -d weekly_global"
echo ""

# Opción 2: Acceder desde CapRover Terminal
echo "🔧 Método 2: Desde CapRover Dashboard"
echo "   1. Ve a CapRover → weekly-postgres"
echo "   2. Click en 'One-Click App Terminal'"
echo "   3. Ejecuta: psql -U postgres -d weekly_global"
echo ""

# Opción 3: Ejecutar script SQL directamente
echo "🔧 Método 3: Ejecutar script SQL"
echo "   cat backend/scripts/setup-super-admin.sql | docker exec -i srv-captain--weekly-postgres psql -U postgres -d weekly_global"
echo ""

echo "📝 Para crear el super admin, ejecuta:"
echo "   PGPASSWORD=151022qaz psql -h srv-captain--weekly-postgres -U postgres -d weekly_global -f backend/scripts/setup-super-admin.sql"
echo ""

echo "✅ O ejecuta este SQL directamente:"
cat << 'EOF'
-- Crear/actualizar super admin
INSERT INTO usuarios_global (email, password_hash, nombre, rol, activo) 
VALUES (
    'admin@weekly.com',
    '$2b$12$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW',
    'Super Administrador',
    'super_admin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2b$12$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW',
    nombre = 'Super Administrador',
    rol = 'super_admin',
    activo = true;

-- Verificar
SELECT email, nombre, rol, activo FROM usuarios_global WHERE email = 'admin@weekly.com';
EOF

