-- Migración para agregar campos faltantes a la tabla reservas
-- Ejecutar este script después de crear las tablas iniciales

-- Agregar campo precio (decimal para precios monetarios)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS precio DECIMAL(10, 2) DEFAULT 0;

-- Agregar campo estado_pago (texto para el estado del pago)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(50) DEFAULT 'Falta pagar';

-- Agregar campos adicionales que usa el frontend
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT 60;

-- También agregar campo especialidad a profesores si no existe
ALTER TABLE profesores ADD COLUMN IF NOT EXISTS especialidad VARCHAR(255); 