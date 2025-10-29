-- =============================================
-- WEEKLY - Sistema de Agendamiento Universal
-- Esquema de Base de Datos por TENANT
-- Dominio: cliente.weekly
-- =============================================

-- Tabla de usuarios del sistema (administradores, vendedores, etc.)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'vendedor', -- admin, vendedor, colaborador
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Establecimientos (reemplaza cursos)
CREATE TABLE establecimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_negocio VARCHAR(100) NOT NULL, -- peluqueria, clases_reforzamiento, cancha_futbol, veterinaria, odontologia, etc.
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nombre)
);

-- Tabla de Colaboradores (reemplaza profesores)
CREATE TABLE colaboradores (
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

-- Tabla de Clientes (reemplaza alumnos)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(50),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de horarios de atención (flexible por día de la semana)
CREATE TABLE horarios_atencion (
    id SERIAL PRIMARY KEY,
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 1=lunes, etc.
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    intervalo_minutos INTEGER DEFAULT 30, -- Intervalo entre citas (30 min, 1 hora, etc.)
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(establecimiento_id, dia_semana)
);

-- Tabla de Reservas (actualizada)
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    colaborador_id INT NOT NULL,
    establecimiento_id INT NOT NULL,
    cliente_id INT NOT NULL,
    servicio_descripcion TEXT, -- Descripción del servicio (en lugar de tema específico)
    notas TEXT,
    precio DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'confirmada', -- confirmada, cancelada, completada, no_asistio
    creado_por INT, -- ID del usuario que crea la reserva
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),
    FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Índices para mejorar performance
CREATE INDEX idx_reservas_fecha ON reservas(fecha_hora_inicio);
CREATE INDEX idx_reservas_colaborador ON reservas(colaborador_id);
CREATE INDEX idx_reservas_establecimiento ON reservas(establecimiento_id);
CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_colaboradores_establecimiento ON colaboradores(establecimiento_id);
CREATE INDEX idx_horarios_establecimiento ON horarios_atencion(establecimiento_id);
CREATE INDEX idx_horarios_dia_semana ON horarios_atencion(dia_semana);
CREATE INDEX idx_horarios_activo ON horarios_atencion(activo);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol); 