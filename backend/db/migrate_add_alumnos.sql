-- Migración: Agregar tabla alumnos
-- Ejecutar en cada base de datos de tenant

CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(50),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restricción de unicidad opcional combinada (permite NULLs)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname = 'uniq_alumnos_dni_email'
    ) THEN
        CREATE UNIQUE INDEX uniq_alumnos_dni_email 
        ON alumnos (COALESCE(dni, ''), COALESCE(email, ''));
    END IF;
END $$;


