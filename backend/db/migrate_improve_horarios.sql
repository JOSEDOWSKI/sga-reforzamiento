-- =============================================
-- Migración: Mejorar tabla horarios_atencion
-- Agrega soporte para múltiples rangos y campo is_closed
-- =============================================

-- 1. Agregar campo is_closed explícito
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'horarios_atencion' AND column_name = 'is_closed'
    ) THEN
        ALTER TABLE horarios_atencion ADD COLUMN is_closed BOOLEAN DEFAULT false;
        
        -- Migrar datos: si activo = false, entonces is_closed = true
        UPDATE horarios_atencion SET is_closed = NOT activo WHERE is_closed IS NULL;
        
        COMMENT ON COLUMN horarios_atencion.is_closed IS 'Indica si el negocio está cerrado este día (true = cerrado, false = abierto)';
    END IF;
END $$;

-- 2. Agregar campos para break/almuerzo (soporte para 2 rangos por día)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'horarios_atencion' AND column_name = 'break_start'
    ) THEN
        ALTER TABLE horarios_atencion 
        ADD COLUMN break_start TIME,
        ADD COLUMN break_end TIME;
        
        COMMENT ON COLUMN horarios_atencion.break_start IS 'Hora de inicio del break (ej: 13:00 para almuerzo)';
        COMMENT ON COLUMN horarios_atencion.break_end IS 'Hora de fin del break (ej: 15:00 para almuerzo)';
    END IF;
END $$;

-- 3. Crear tabla para múltiples rangos por día (para futuro)
CREATE TABLE IF NOT EXISTS horarios_atencion_rangos (
    id SERIAL PRIMARY KEY,
    horario_atencion_id INTEGER NOT NULL REFERENCES horarios_atencion(id) ON DELETE CASCADE,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    orden INTEGER DEFAULT 1, -- Para ordenar múltiples rangos (1 = primer rango, 2 = segundo rango, etc.)
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(horario_atencion_id, orden)
);

CREATE INDEX IF NOT EXISTS idx_horarios_rangos_horario ON horarios_atencion_rangos(horario_atencion_id);
CREATE INDEX IF NOT EXISTS idx_horarios_rangos_activo ON horarios_atencion_rangos(activo);

COMMENT ON TABLE horarios_atencion_rangos IS 'Rangos de horarios múltiples por día (ej: 9:00-13:00 y 16:00-20:00)';
COMMENT ON COLUMN horarios_atencion_rangos.orden IS 'Orden del rango (1 = primer rango del día, 2 = segundo rango, etc.)';


