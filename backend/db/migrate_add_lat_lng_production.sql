-- =============================================
-- MIGRACIÓN: Agregar campos latitud/longitud a la tabla tenants
-- Para ejecutar en producción: weekly_global
-- =============================================

-- Conectar a la base de datos weekly_global
\c weekly_global;

-- Agregar columnas si no existen
DO $$ 
BEGIN
    -- Agregar latitud si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'latitud'
    ) THEN
        ALTER TABLE tenants ADD COLUMN latitud DECIMAL(10, 8);
        RAISE NOTICE 'Columna latitud agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna latitud ya existe';
    END IF;
    
    -- Agregar longitud si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'longitud'
    ) THEN
        ALTER TABLE tenants ADD COLUMN longitud DECIMAL(11, 8);
        RAISE NOTICE 'Columna longitud agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna longitud ya existe';
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON COLUMN tenants.latitud IS 'Coordenada de latitud obtenida de Google Maps Geocoding API o extraída desde link de Google Maps';
COMMENT ON COLUMN tenants.longitud IS 'Coordenada de longitud obtenida de Google Maps Geocoding API o extraída desde link de Google Maps';

-- Verificar que las columnas fueron agregadas
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name IN ('latitud', 'longitud');

