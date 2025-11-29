-- =============================================
-- WEEKLY - Modelo RAPPI (BD Compartida por País)
-- Base de datos: weekly_peru (o weekly_colombia, etc.)
-- Todos los aliados comparten la misma BD, filtrados por aliado_id
-- =============================================

-- Tabla de Aliados (reemplaza tenants)
CREATE TABLE aliados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    ciudad VARCHAR(255),
    pais VARCHAR(50) NOT NULL DEFAULT 'peru', -- peru, colombia, mexico, etc.
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    timezone VARCHAR(50) DEFAULT 'America/Lima',
    locale VARCHAR(10) DEFAULT 'es-PE',
    categoria VARCHAR(100), -- peluqueria, cancha, clinica, etc.
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, cancelado
    plan VARCHAR(50) DEFAULT 'basico', -- basico, premium, enterprise
    show_in_marketplace BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- Índices para aliados
CREATE INDEX idx_aliados_email ON aliados(email);
CREATE INDEX idx_aliados_pais ON aliados(pais);
CREATE INDEX idx_aliados_ciudad ON aliados(ciudad);
CREATE INDEX idx_aliados_categoria ON aliados(categoria);
CREATE INDEX idx_aliados_estado ON aliados(estado);
CREATE INDEX idx_aliados_marketplace ON aliados(show_in_marketplace);
CREATE INDEX idx_aliados_config ON aliados USING GIN (config);

-- Tabla de usuarios del sistema (administradores, vendedores, etc.)
-- IMPORTANTE: Cada usuario pertenece a un aliado
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'vendedor', -- admin, vendedor, colaborador
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_aliado ON usuarios(aliado_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Tabla de Establecimientos
CREATE TABLE establecimientos (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_negocio VARCHAR(100) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aliado_id, nombre)
);

-- Índices para establecimientos
CREATE INDEX idx_establecimientos_aliado ON establecimientos(aliado_id);
CREATE INDEX idx_establecimientos_nombre ON establecimientos(nombre);

-- Tabla de Colaboradores
CREATE TABLE colaboradores (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    especialidades TEXT[],
    tarifa_por_hora DECIMAL(10,2),
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aliado_id, email)
);

-- Índices para colaboradores
CREATE INDEX idx_colaboradores_aliado ON colaboradores(aliado_id);
CREATE INDEX idx_colaboradores_email ON colaboradores(email);
CREATE INDEX idx_colaboradores_establecimiento ON colaboradores(establecimiento_id);

-- Tabla de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para clientes
CREATE INDEX idx_clientes_aliado ON clientes(aliado_id);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_email ON clientes(email);

-- Tabla de Categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    establecimiento_id INTEGER REFERENCES establecimientos(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para categorías
CREATE INDEX idx_categorias_aliado ON categorias(aliado_id);
CREATE INDEX idx_categorias_establecimiento ON categorias(establecimiento_id);

-- Tabla de Services
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2),
    category_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para services
CREATE INDEX idx_services_aliado ON services(aliado_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(active);

-- Tabla de Resources
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para resources
CREATE INDEX idx_resources_aliado ON resources(aliado_id);
CREATE INDEX idx_resources_active ON resources(active);

-- Tabla de horarios de atención
CREATE TABLE horarios_atencion (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    establecimiento_id INTEGER NOT NULL REFERENCES establecimientos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    intervalo_minutos INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT true,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aliado_id, establecimiento_id, dia_semana)
);

-- Índices para horarios
CREATE INDEX idx_horarios_aliado ON horarios_atencion(aliado_id);
CREATE INDEX idx_horarios_establecimiento ON horarios_atencion(establecimiento_id);
CREATE INDEX idx_horarios_dia_semana ON horarios_atencion(dia_semana);

-- Tabla para múltiples rangos de horarios por día
CREATE TABLE horarios_atencion_rangos (
    id SERIAL PRIMARY KEY,
    horario_atencion_id INTEGER NOT NULL REFERENCES horarios_atencion(id) ON DELETE CASCADE,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    orden INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(horario_atencion_id, orden)
);

-- Tabla de Reservas (CRÍTICO: siempre filtrar por aliado_id)
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id),
    establecimiento_id INTEGER NOT NULL REFERENCES establecimientos(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    resource_id INTEGER REFERENCES resources(id) ON DELETE SET NULL,
    servicio_descripcion TEXT,
    notas TEXT,
    precio DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'confirmada', -- confirmada, cancelada, completada, no_asistio
    creado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices CRÍTICOS para reservas (aliado_id es el más importante)
CREATE INDEX idx_reservas_aliado ON reservas(aliado_id);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_hora_inicio);
CREATE INDEX idx_reservas_colaborador ON reservas(colaborador_id);
CREATE INDEX idx_reservas_establecimiento ON reservas(establecimiento_id);
CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_service ON reservas(service_id);
CREATE INDEX idx_reservas_resource ON reservas(resource_id);
-- Índice compuesto para performance en búsquedas comunes
CREATE INDEX idx_reservas_aliado_fecha ON reservas(aliado_id, fecha_hora_inicio);

-- Tabla de Special Days
CREATE TABLE special_days (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    open_time TIME,
    close_time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aliado_id, date)
);

-- Índices para special_days
CREATE INDEX idx_special_days_aliado ON special_days(aliado_id);
CREATE INDEX idx_special_days_date ON special_days(date);

-- Tabla de Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    reservation_id INTEGER REFERENCES reservas(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- email, sms, whatsapp, push
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notifications
CREATE INDEX idx_notifications_aliado ON notifications(aliado_id);
CREATE INDEX idx_notifications_client ON notifications(client_id);
CREATE INDEX idx_notifications_reservation ON notifications(reservation_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Tabla de Business Hours
CREATE TABLE business_hours (
    id SERIAL PRIMARY KEY,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aliado_id, day_of_week)
);

-- Índices para business_hours
CREATE INDEX idx_business_hours_aliado ON business_hours(aliado_id);
CREATE INDEX idx_business_hours_day ON business_hours(day_of_week);

-- =============================================
-- TABLAS PARA APP MÓVIL (Usuarios que pueden reservar en múltiples aliados)
-- =============================================

-- Tabla de usuarios móviles (no están vinculados a un aliado específico)
CREATE TABLE usuarios_movil (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_url VARCHAR(500),
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios_movil
CREATE INDEX idx_usuarios_movil_email ON usuarios_movil(email);
CREATE INDEX idx_usuarios_movil_telefono ON usuarios_movil(telefono);

-- Tabla de tracking de reservas desde app móvil
CREATE TABLE reservas_movil (
    id SERIAL PRIMARY KEY,
    usuario_movil_id INTEGER NOT NULL REFERENCES usuarios_movil(id) ON DELETE CASCADE,
    aliado_id INTEGER NOT NULL REFERENCES aliados(id) ON DELETE CASCADE,
    reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aliado_id, reserva_id)
);

-- Índices para reservas_movil
CREATE INDEX idx_reservas_movil_usuario ON reservas_movil(usuario_movil_id);
CREATE INDEX idx_reservas_movil_aliado ON reservas_movil(aliado_id);
CREATE INDEX idx_reservas_movil_reserva ON reservas_movil(reserva_id);
CREATE INDEX idx_reservas_movil_usuario_aliado ON reservas_movil(usuario_movil_id, aliado_id);

-- =============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =============================================

COMMENT ON TABLE aliados IS 'Tabla principal de aliados/negocios. Reemplaza la tabla tenants del modelo multi-tenant';
COMMENT ON COLUMN reservas.aliado_id IS 'CRÍTICO: Todas las queries de reservas DEBEN filtrar por aliado_id para aislamiento de datos';
COMMENT ON COLUMN usuarios.aliado_id IS 'Cada usuario pertenece a un aliado específico';
COMMENT ON TABLE usuarios_movil IS 'Usuarios de la app móvil que pueden reservar en múltiples aliados';
COMMENT ON TABLE reservas_movil IS 'Tracking de reservas desde app móvil, vincula usuario_movil con reservas de diferentes aliados';

