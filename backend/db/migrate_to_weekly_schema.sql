-- =============================================
-- MIGRACIÓN A WEEKLY - Sistema de Agendamiento Universal
-- =============================================

-- Paso 1: Crear nuevas tablas
CREATE TABLE IF NOT EXISTS establecimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_negocio VARCHAR(100) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nombre)
);

CREATE TABLE IF NOT EXISTS colaboradores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    especialidades TEXT[],
    tarifa_por_hora DECIMAL(10,2),
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(50),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS horarios_atencion (
    id SERIAL PRIMARY KEY,
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    intervalo_minutos INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(establecimiento_id, dia_semana)
);

-- Paso 2: Migrar datos existentes (si existen)
-- Migrar cursos a establecimientos
INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, activo, created_at, updated_at)
SELECT 
    nombre,
    descripcion,
    'clases_reforzamiento' as tipo_negocio,
    activo,
    created_at,
    updated_at
FROM cursos
WHERE NOT EXISTS (SELECT 1 FROM establecimientos WHERE establecimientos.nombre = cursos.nombre);

-- Migrar profesores a colaboradores
INSERT INTO colaboradores (nombre, email, telefono, especialidades, tarifa_por_hora, activo, created_at, updated_at)
SELECT 
    nombre,
    email,
    telefono,
    especialidades,
    tarifa_por_hora,
    activo,
    created_at,
    updated_at
FROM profesores
WHERE NOT EXISTS (SELECT 1 FROM colaboradores WHERE colaboradores.email = profesores.email);

-- Migrar alumnos a clientes
INSERT INTO clientes (nombre, telefono, dni, email, activo, created_at, updated_at)
SELECT 
    nombre,
    telefono,
    dni,
    email,
    activo,
    created_at,
    updated_at
FROM alumnos
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE clientes.nombre = alumnos.nombre);

-- Paso 3: Crear índices para las nuevas tablas
CREATE INDEX IF NOT EXISTS idx_colaboradores_establecimiento ON colaboradores(establecimiento_id);
CREATE INDEX IF NOT EXISTS idx_horarios_establecimiento ON horarios_atencion(establecimiento_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_semana ON horarios_atencion(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_activo ON horarios_atencion(activo);

-- Paso 4: Actualizar tabla de reservas (si existe)
-- Nota: Esto requerirá recrear la tabla de reservas con la nueva estructura
-- Por ahora, solo agregamos los nuevos índices

-- Paso 5: Crear datos de ejemplo para horarios
-- Solo si no existen datos
INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo)
SELECT 
    e.id,
    d.dia,
    CASE 
        WHEN d.dia BETWEEN 1 AND 5 THEN '09:00'
        WHEN d.dia = 6 THEN '10:00'
        ELSE '08:00'
    END as hora_apertura,
    CASE 
        WHEN d.dia BETWEEN 1 AND 5 THEN '18:00'
        WHEN d.dia = 6 THEN '16:00'
        ELSE '17:00'
    END as hora_cierre,
    CASE 
        WHEN e.tipo_negocio = 'cancha_futbol' THEN 60
        ELSE 30
    END as intervalo_minutos,
    true
FROM establecimientos e
CROSS JOIN (SELECT 1 as dia UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 0) d
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_atencion h 
    WHERE h.establecimiento_id = e.id AND h.dia_semana = d.dia
);

-- Comentario: Las tablas antiguas (cursos, profesores, alumnos, temas) se pueden eliminar después
-- de verificar que la migración fue exitosa
