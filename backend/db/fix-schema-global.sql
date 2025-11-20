-- =============================================
-- SCRIPT PARA CORREGIR/RECREAR ESQUEMA GLOBAL
-- Ejecutar en: weekly_global
-- =============================================

-- Eliminar tablas existentes (si existen) en orden correcto para evitar errores de foreign keys
DROP TABLE IF EXISTS logs_sistema CASCADE;
DROP TABLE IF EXISTS tickets_soporte CASCADE;
DROP TABLE IF EXISTS facturacion CASCADE;
DROP TABLE IF EXISTS email_tenant_mapping CASCADE;
DROP TABLE IF EXISTS tenant_settings CASCADE;
DROP TABLE IF EXISTS usuarios_global CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- =============================================
-- RECREAR TABLAS CON ESQUEMA CORRECTO
-- =============================================

-- Tabla de tenants/clientes
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_name VARCHAR(100) NOT NULL UNIQUE, -- subdominio: cliente.weekly -> "cliente"
    display_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'es-ES',
    
    -- Información del cliente
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(20),
    cliente_direccion TEXT,
    latitud DECIMAL(10, 8), -- Coordenada de latitud para Google Maps
    longitud DECIMAL(11, 8), -- Coordenada de longitud para Google Maps
    
    -- Estado del tenant
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, cancelado
    plan VARCHAR(50) DEFAULT 'basico', -- basico, premium, enterprise
    
    -- Marketplace y ubicación
    show_in_marketplace BOOLEAN DEFAULT false, -- Indica si aparece en el marketplace de la app móvil
    city VARCHAR(255), -- Ciudad del negocio (para búsqueda geográfica)
    
    -- Configuración personalizada (JSONB)
    config JSONB DEFAULT '{}'::jsonb, -- Configuración personalizada: nombres de entidades, características, etc.
    
    -- Fechas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- Índices para búsquedas en config
CREATE INDEX IF NOT EXISTS idx_tenants_config ON tenants USING GIN (config);
CREATE INDEX IF NOT EXISTS idx_tenants_marketplace ON tenants(show_in_marketplace);
CREATE INDEX IF NOT EXISTS idx_tenants_city ON tenants(city);
CREATE INDEX IF NOT EXISTS idx_tenants_estado ON tenants(estado);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

-- Tabla de tenant_settings (configuración y personalización por negocio)
CREATE TABLE tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_config ON tenant_settings USING GIN (config);

-- Tabla de usuarios globales (super admin)
CREATE TABLE usuarios_global (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'super_admin', -- super_admin, soporte
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_global_email ON usuarios_global(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_global_rol ON usuarios_global(rol);

-- Tabla de mapeo email → tenant (para login universal)
CREATE TABLE email_tenant_mapping (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    tenant_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_name) REFERENCES tenants(tenant_name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_tenant_mapping_email ON email_tenant_mapping(email);
CREATE INDEX IF NOT EXISTS idx_email_tenant_mapping_tenant ON email_tenant_mapping(tenant_name);

-- Tabla de facturación (futuro)
CREATE TABLE facturacion (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagado, vencido
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_facturacion_tenant ON facturacion(tenant_id);
CREATE INDEX IF NOT EXISTS idx_facturacion_estado ON facturacion(estado);

-- Tabla de tickets de soporte
CREATE TABLE tickets_soporte (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'abierto', -- abierto, en_progreso, cerrado
    prioridad VARCHAR(20) DEFAULT 'media', -- baja, media, alta, critica
    creado_por INT NOT NULL,
    asignado_a INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios_global(id),
    FOREIGN KEY (asignado_a) REFERENCES usuarios_global(id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets_soporte(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets_soporte(estado);

-- Tabla de logs del sistema (mejorada para fase beta)
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    tenant_id INT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB, -- Datos adicionales en formato JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios_global(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant ON logs_sistema(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_accion ON logs_sistema(accion);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON logs_sistema(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant_accion ON logs_sistema(tenant_id, accion);

-- Insertar usuario super admin por defecto (si no existe)
INSERT INTO usuarios_global (email, password_hash, nombre, rol) 
VALUES ('admin@weekly.com', '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n', 'Super Administrador', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema global recreado correctamente';
    RAISE NOTICE '📊 Tablas creadas: tenants, usuarios_global, email_tenant_mapping, tenant_settings, facturacion, tickets_soporte, logs_sistema';
END $$;

