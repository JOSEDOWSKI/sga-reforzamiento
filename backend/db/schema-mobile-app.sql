-- =============================================
-- WEEKLY - Esquema para Aplicación Móvil
-- Base de datos: weekly_global
-- =============================================

-- Tabla de usuarios de la app móvil
CREATE TABLE IF NOT EXISTS usuarios_movil (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_url VARCHAR(500),
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_movil_email ON usuarios_movil(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_movil_telefono ON usuarios_movil(telefono);
CREATE INDEX IF NOT EXISTS idx_usuarios_movil_activo ON usuarios_movil(activo);

-- Tabla de reservas desde app móvil (tracking multi-tenant)
CREATE TABLE IF NOT EXISTS reservas_movil (
    id SERIAL PRIMARY KEY,
    usuario_movil_id INTEGER NOT NULL REFERENCES usuarios_movil(id) ON DELETE CASCADE,
    tenant_name VARCHAR(100) NOT NULL,
    reserva_tenant_id INTEGER NOT NULL, -- ID de la reserva en la BD del tenant
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmada',
    servicio_descripcion TEXT,
    colaborador_nombre VARCHAR(255),
    establecimiento_nombre VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_name, reserva_tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_reservas_movil_usuario ON reservas_movil(usuario_movil_id);
CREATE INDEX IF NOT EXISTS idx_reservas_movil_tenant ON reservas_movil(tenant_name);
CREATE INDEX IF NOT EXISTS idx_reservas_movil_fecha ON reservas_movil(fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_reservas_movil_estado ON reservas_movil(estado);

-- Tabla de categorías de tenants (para búsqueda y filtrado)
CREATE TABLE IF NOT EXISTS tenant_categorias (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL, -- peluqueria, gimnasio, veterinaria, odontologia, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, categoria)
);

CREATE INDEX IF NOT EXISTS idx_tenant_categorias_categoria ON tenant_categorias(categoria);
CREATE INDEX IF NOT EXISTS idx_tenant_categorias_tenant ON tenant_categorias(tenant_id);

-- Tabla de calificaciones/reviews (futuro)
CREATE TABLE IF NOT EXISTS tenant_reviews (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_movil_id INTEGER NOT NULL REFERENCES usuarios_movil(id) ON DELETE CASCADE,
    reserva_movil_id INTEGER REFERENCES reservas_movil(id) ON DELETE SET NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, usuario_movil_id, reserva_movil_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_reviews_tenant ON tenant_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_reviews_usuario ON tenant_reviews(usuario_movil_id);
CREATE INDEX IF NOT EXISTS idx_tenant_reviews_calificacion ON tenant_reviews(calificacion);

-- Tabla de favoritos (futuro)
CREATE TABLE IF NOT EXISTS tenant_favoritos (
    id SERIAL PRIMARY KEY,
    usuario_movil_id INTEGER NOT NULL REFERENCES usuarios_movil(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_movil_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_favoritos_usuario ON tenant_favoritos(usuario_movil_id);
CREATE INDEX IF NOT EXISTS idx_tenant_favoritos_tenant ON tenant_favoritos(tenant_id);

COMMENT ON TABLE usuarios_movil IS 'Usuarios de la aplicación móvil (no vinculados a un tenant específico)';
COMMENT ON TABLE reservas_movil IS 'Tracking de reservas creadas desde la app móvil en múltiples tenants';
COMMENT ON TABLE tenant_categorias IS 'Categorías de tenants para búsqueda y filtrado en la app móvil';
COMMENT ON TABLE tenant_reviews IS 'Calificaciones y reviews de usuarios móviles sobre tenants';
COMMENT ON TABLE tenant_favoritos IS 'Tenants marcados como favoritos por usuarios móviles';


