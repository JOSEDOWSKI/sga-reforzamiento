-- =============================================
-- MIGRACIÓN: Agregar campos latitud/longitud a la tabla tenants
-- =============================================

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
    END IF;
    
    -- Agregar longitud si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'longitud'
    ) THEN
        ALTER TABLE tenants ADD COLUMN longitud DECIMAL(11, 8);
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON COLUMN tenants.latitud IS 'Coordenada de latitud obtenida de Google Maps Geocoding API';
COMMENT ON COLUMN tenants.longitud IS 'Coordenada de longitud obtenida de Google Maps Geocoding API';

