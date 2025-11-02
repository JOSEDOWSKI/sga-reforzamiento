-- =============================================
-- Script para crear/verificar Super Admin
-- Base de datos: weekly_global
-- =============================================

-- Conectar a weekly_global (ejecutar: \c weekly_global primero si estás en otra BD)

-- Verificar si la tabla usuarios_global existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios_global'
    ) THEN
        RAISE EXCEPTION 'La tabla usuarios_global no existe. Ejecuta primero schema-global.sql';
    END IF;
END $$;

-- Verificar usuarios existentes
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    ultimo_acceso,
    created_at
FROM usuarios_global
ORDER BY created_at DESC;

-- Crear o actualizar usuario super admin
-- Email: admin@weekly.com
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO usuarios_global (email, password_hash, nombre, rol, activo) 
VALUES (
    'admin@weekly.com',
    '$2b$12$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW',  -- hash de "admin123"
    'Super Administrador',
    'super_admin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2b$12$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW',
    nombre = 'Super Administrador',
    rol = 'super_admin',
    activo = true,
    updated_at = CURRENT_TIMESTAMP;

-- Verificar que se creó correctamente
SELECT 
    '✅ Usuario creado/actualizado' as status,
    email,
    nombre,
    rol,
    activo
FROM usuarios_global
WHERE email = 'admin@weekly.com';

-- Mostrar todos los usuarios globales
SELECT 
    '📋 Usuarios globales existentes:' as info;
    
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    CASE 
        WHEN ultimo_acceso IS NULL THEN 'Nunca'
        ELSE to_char(ultimo_acceso, 'DD/MM/YYYY HH24:MI:SS')
    END as ultimo_acceso
FROM usuarios_global
ORDER BY created_at DESC;

