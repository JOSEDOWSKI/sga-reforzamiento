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
    notes TEXT, -- Notas adicionales sobre el cliente
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías (para organizar servicios/establecimientos)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#007bff', -- Color hexadecimal para UI
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
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
    break_start TIME, -- Hora de inicio del break (ej: 13:00 para almuerzo) - permite múltiples rangos
    break_end TIME, -- Hora de fin del break (ej: 15:00 para almuerzo)
    intervalo_minutos INTEGER DEFAULT 30, -- Intervalo entre citas (30 min, 1 hora, etc.)
    activo BOOLEAN DEFAULT true,
    is_closed BOOLEAN DEFAULT false, -- Indica si el negocio está cerrado este día
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(establecimiento_id, dia_semana)
);

-- Tabla para múltiples rangos de horarios por día (para casos complejos)
CREATE TABLE horarios_atencion_rangos (
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

-- Tabla de Services (servicios que ofrece el negocio)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2),
    category_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Resources (recursos físicos: canchas, sillones, consultorios, aulas)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Reservas (actualizada con service_id y resource_id)
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    colaborador_id INT NOT NULL,
    establecimiento_id INT NOT NULL,
    cliente_id INT NOT NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL, -- Servicio específico
    resource_id INTEGER REFERENCES resources(id) ON DELETE SET NULL, -- Recurso físico
    servicio_descripcion TEXT, -- Descripción del servicio (en lugar de tema específico) - DEPRECATED: usar service_id
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

-- Tabla de Special Days (excepciones de horario: feriados, días cerrados)
CREATE TABLE special_days (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    is_closed BOOLEAN DEFAULT false,
    open_time TIME,
    close_time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Notifications (para manejar envíos de correos, WhatsApp, SMS)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    reservation_id INTEGER REFERENCES reservas(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- email, sms, whatsapp, push
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    payload JSONB, -- Contenido enviado
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Business Hours (horarios generales del negocio a nivel tenant)
CREATE TABLE business_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 1=lunes, etc.
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week)
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
CREATE INDEX idx_categorias_activo ON categorias(activo);
CREATE INDEX idx_categorias_establecimiento ON categorias(establecimiento_id);
CREATE INDEX idx_horarios_rangos_horario ON horarios_atencion_rangos(horario_atencion_id);
CREATE INDEX idx_horarios_rangos_activo ON horarios_atencion_rangos(activo);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_resources_active ON resources(active);
CREATE INDEX idx_reservas_service ON reservas(service_id);
CREATE INDEX idx_reservas_resource ON reservas(resource_id);
CREATE INDEX idx_special_days_date ON special_days(date);
CREATE INDEX idx_special_days_closed ON special_days(is_closed);
CREATE INDEX idx_notifications_client ON notifications(client_id);
CREATE INDEX idx_notifications_reservation ON notifications(reservation_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_business_hours_day ON business_hours(day_of_week); 