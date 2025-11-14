-- =============================================
-- Migración: Agregar campo de configuración personalizada a tenants
-- Permite que cada tenant personalice nombres de entidades y características
-- =============================================

-- Agregar columna config (JSONB) para almacenar configuración personalizada
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'config'
    ) THEN
        ALTER TABLE tenants ADD COLUMN config JSONB DEFAULT '{}'::jsonb;
        CREATE INDEX IF NOT EXISTS idx_tenants_config ON tenants USING GIN (config);
        COMMENT ON COLUMN tenants.config IS 'Configuración personalizada del tenant: nombres de entidades, características habilitadas, etc.';
    END IF;
END $$;


