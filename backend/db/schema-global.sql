-- =============================================
-- WEEKLY - Sistema de Agendamiento Universal
-- Esquema de Base de Datos GLOBAL (Super Admin)
-- Base de datos: weekly_global
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
    
    -- Estado del tenant
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, cancelado
    plan VARCHAR(50) DEFAULT 'basico', -- basico, premium, enterprise
    
    -- Fechas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

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

-- Tabla de logs del sistema
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    tenant_id INT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios_global(id)
);

-- Índices para mejorar performance
CREATE INDEX idx_tenants_estado ON tenants(estado);
CREATE INDEX idx_tenants_plan ON tenants(plan);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);
CREATE INDEX idx_usuarios_global_email ON usuarios_global(email);
CREATE INDEX idx_usuarios_global_rol ON usuarios_global(rol);
CREATE INDEX idx_facturacion_tenant ON facturacion(tenant_id);
CREATE INDEX idx_facturacion_estado ON facturacion(estado);
CREATE INDEX idx_tickets_tenant ON tickets_soporte(tenant_id);
CREATE INDEX idx_tickets_estado ON tickets_soporte(estado);
CREATE INDEX idx_logs_tenant ON logs_sistema(tenant_id);
CREATE INDEX idx_logs_fecha ON logs_sistema(created_at);

-- Insertar usuario super admin por defecto
INSERT INTO usuarios_global (email, password_hash, nombre, rol) 
VALUES ('admin@weekly.com', '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n', 'Super Administrador', 'super_admin');
