-- Migración para corregir las restricciones de la tabla alumnos
-- Eliminar la restricción única problemática y crear una nueva solo para nombre

-- Eliminar la restricción única existente
ALTER TABLE alumnos DROP CONSTRAINT IF EXISTS alumnos_dni_email_key;
ALTER TABLE alumnos DROP CONSTRAINT IF EXISTS uniq_alumnos_dni_email;

-- Crear restricción única solo para el nombre (que no puede repetirse)
ALTER TABLE alumnos ADD CONSTRAINT uniq_alumnos_nombre UNIQUE (nombre);

-- Crear índices únicos individuales para dni y email solo cuando no sean NULL
CREATE UNIQUE INDEX IF NOT EXISTS uniq_alumnos_dni_not_null 
ON alumnos (dni) 
WHERE dni IS NOT NULL AND dni != '';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_alumnos_email_not_null 
ON alumnos (email) 
WHERE email IS NOT NULL AND email != '';
