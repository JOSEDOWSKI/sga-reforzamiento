-- Script para crear usuarios de prueba con diferentes roles
-- Ejecutar en la base de datos del tenant (ej: weekly_demo, weekly_peluqueria, etc.)
-- Contraseña para todos: test123

-- Importar bcrypt para generar hash (ejecutar desde Node.js o usar el hash pre-generado)
-- Hash de "test123": $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2

-- Usuario ADMINISTRADOR
INSERT INTO usuarios (email, password_hash, nombre, rol, activo)
VALUES (
    'admin@demo.weekly.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2',
    'Administrador Demo',
    'admin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2',
    rol = 'admin',
    activo = true;

-- Usuario VENDEDOR (vista limitada - solo calendario)
INSERT INTO usuarios (email, password_hash, nombre, rol, activo)
VALUES (
    'vendedor@demo.weekly.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2',
    'Vendedor Demo',
    'vendedor',
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2',
    rol = 'vendedor',
    activo = true;

-- Usuario COLABORADOR (vista limitada - solo calendario)
INSERT INTO usuarios (email, password_hash, nombre, rol, activo)
VALUES (
    'colaborador@demo.weekly.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2',
    'Colaborador Demo',
    'colaborador',
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyZUr8xL6sA2',
    rol = 'colaborador',
    activo = true;

-- Verificar usuarios creados
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    created_at
FROM usuarios
ORDER BY rol, email;

