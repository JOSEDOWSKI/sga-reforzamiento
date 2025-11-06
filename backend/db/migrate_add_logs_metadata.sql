-- Migración para agregar columna metadata a logs_sistema si no existe
-- Ejecutar en producción si la tabla ya existe sin esta columna

-- Agregar columna metadata si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logs_sistema' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE logs_sistema ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Agregar índices si no existen
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant ON logs_sistema(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_accion ON logs_sistema(accion);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON logs_sistema(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant_accion ON logs_sistema(tenant_id, accion);

