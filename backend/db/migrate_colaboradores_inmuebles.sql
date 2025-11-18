-- =============================================
-- MIGRACIÓN: Colaboradores e Inmuebles
-- Fecha: 2025-11-18
-- Descripción: 
--   - Modificar tabla colaboradores: agregar apellido, dni, horario, precio
--   - Crear tabla inmuebles con horario y precio
--   - Crear tablas de relación con servicios (opcional)
--   - Crear tablas de horarios para colaboradores e inmuebles
-- =============================================

-- 1. Modificar tabla colaboradores
-- Agregar campos: apellido, dni, precio, horario_id
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS apellido VARCHAR(255),
ADD COLUMN IF NOT EXISTS dni VARCHAR(50),
ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS horario_id INTEGER;

-- Separar nombre completo en nombre y apellido si existe
-- (Esto se hará en el código, aquí solo agregamos la columna)

-- 2. Crear tabla de horarios para colaboradores
CREATE TABLE IF NOT EXISTS horarios_colaboradores (
    id SERIAL PRIMARY KEY,
    colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 1=lunes, etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(colaborador_id, dia_semana)
);

-- 3. Crear tabla de inmuebles
CREATE TABLE IF NOT EXISTS inmuebles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla de horarios para inmuebles
CREATE TABLE IF NOT EXISTS horarios_inmuebles (
    id SERIAL PRIMARY KEY,
    inmueble_id INTEGER NOT NULL REFERENCES inmuebles(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 1=lunes, etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inmueble_id, dia_semana)
);

-- 5. Crear tabla de relación colaboradores_servicios (muchos a muchos, opcional)
CREATE TABLE IF NOT EXISTS colaboradores_servicios (
    id SERIAL PRIMARY KEY,
    colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    precio_especial DECIMAL(10,2), -- Precio específico para este colaborador + servicio
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(colaborador_id, service_id)
);

-- 6. Crear tabla de relación inmuebles_servicios (muchos a muchos, opcional)
CREATE TABLE IF NOT EXISTS inmuebles_servicios (
    id SERIAL PRIMARY KEY,
    inmueble_id INTEGER NOT NULL REFERENCES inmuebles(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    precio_especial DECIMAL(10,2), -- Precio específico para este inmueble + servicio
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inmueble_id, service_id)
);

-- 7. Agregar foreign key de horario_id en colaboradores
ALTER TABLE colaboradores 
ADD CONSTRAINT fk_colaborador_horario 
FOREIGN KEY (horario_id) REFERENCES horarios_colaboradores(id) ON DELETE SET NULL;

-- 8. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_apellido ON colaboradores(apellido);
CREATE INDEX IF NOT EXISTS idx_colaboradores_dni ON colaboradores(dni);
CREATE INDEX IF NOT EXISTS idx_colaboradores_precio ON colaboradores(precio);
CREATE INDEX IF NOT EXISTS idx_horarios_colaboradores_colaborador ON horarios_colaboradores(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_horarios_colaboradores_dia ON horarios_colaboradores(dia_semana);
CREATE INDEX IF NOT EXISTS idx_inmuebles_establecimiento ON inmuebles(establecimiento_id);
CREATE INDEX IF NOT EXISTS idx_inmuebles_activo ON inmuebles(activo);
CREATE INDEX IF NOT EXISTS idx_horarios_inmuebles_inmueble ON horarios_inmuebles(inmueble_id);
CREATE INDEX IF NOT EXISTS idx_horarios_inmuebles_dia ON horarios_inmuebles(dia_semana);
CREATE INDEX IF NOT EXISTS idx_colaboradores_servicios_colaborador ON colaboradores_servicios(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_servicios_service ON colaboradores_servicios(service_id);
CREATE INDEX IF NOT EXISTS idx_inmuebles_servicios_inmueble ON inmuebles_servicios(inmueble_id);
CREATE INDEX IF NOT EXISTS idx_inmuebles_servicios_service ON inmuebles_servicios(service_id);

-- 9. Actualizar reservas para soportar inmuebles
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS inmueble_id INTEGER REFERENCES inmuebles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_inmueble ON reservas(inmueble_id);

