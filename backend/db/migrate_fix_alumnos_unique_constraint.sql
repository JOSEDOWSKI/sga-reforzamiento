-- Migración para corregir la restricción única de la tabla alumnos
-- El problema es que UNIQUE(dni, email) no permite múltiples registros con NULL

-- Primero, eliminar la restricción existente
ALTER TABLE alumnos DROP CONSTRAINT IF EXISTS alumnos_dni_email_key;

-- Crear una nueva restricción única que solo se aplique cuando ambos campos no sean NULL
-- Esto permite múltiples registros con dni=NULL y email=NULL
CREATE UNIQUE INDEX uniq_alumnos_dni_email_not_null 
ON alumnos (dni, email) 
WHERE dni IS NOT NULL AND email IS NOT NULL;

-- También crear índices únicos individuales para dni y email cuando no sean NULL
CREATE UNIQUE INDEX uniq_alumnos_dni_not_null 
ON alumnos (dni) 
WHERE dni IS NOT NULL;

CREATE UNIQUE INDEX uniq_alumnos_email_not_null 
ON alumnos (email) 
WHERE email IS NOT NULL;
