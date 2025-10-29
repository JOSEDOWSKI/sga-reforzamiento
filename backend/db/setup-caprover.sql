-- =============================================
-- WEEKLY - Configuración de Base de Datos para CapRover
-- Dominio: getdevtools.com
-- =============================================

-- Crear usuario de base de datos
CREATE USER weekly_user WITH PASSWORD 'weekly_password_2024';

-- Crear base de datos global
CREATE DATABASE weekly_global OWNER weekly_user;

-- Crear base de datos para tenant demo
CREATE DATABASE weekly_demo OWNER weekly_user;

-- Conceder permisos
GRANT ALL PRIVILEGES ON DATABASE weekly_global TO weekly_user;
GRANT ALL PRIVILEGES ON DATABASE weekly_demo TO weekly_user;

-- Conectar a la base de datos global
\c weekly_global;

-- Ejecutar esquema global
\i /app/db/schema-global.sql;

-- Insertar datos iniciales
INSERT INTO usuarios_global (email, password_hash, nombre, rol) 
VALUES ('admin@getdevtools.com', '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n', 'Super Administrador', 'super_admin');

-- Insertar tenant demo
INSERT INTO tenants (tenant_name, display_name, cliente_nombre, cliente_email, cliente_telefono, cliente_direccion, plan, estado) 
VALUES ('demo', 'Demo Tenant', 'Cliente Demo', 'demo@getdevtools.com', '+51 987 654 321', 'Lima, Perú', 'basico', 'activo');

-- Conectar a la base de datos del tenant demo
\c weekly_demo;

-- Ejecutar esquema del tenant
\i /app/db/schema.sql;

-- Insertar datos de prueba para el tenant demo
INSERT INTO usuarios (email, password_hash, nombre, rol) 
VALUES ('admin@demo.getdevtools.com', '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n', 'Administrador Demo', 'admin');

INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, direccion, telefono, email) 
VALUES ('Peluquería Demo', 'Salón de belleza de demostración', 'peluqueria', 'Lima, Perú', '+51 987 654 321', 'info@demo.getdevtools.com');

INSERT INTO colaboradores (nombre, email, telefono, especialidad, establecimiento_id) 
VALUES ('María García', 'maria@demo.getdevtools.com', '+51 987 123 456', 'Cortes y peinados', 1);

INSERT INTO clientes (nombre, email, telefono, dni) 
VALUES ('Juan Pérez', 'juan@email.com', '+51 987 789 012', '12345678');

-- Configurar horarios de atención
INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES
(1, 'lunes', '09:00', '18:00', true),
(1, 'martes', '09:00', '18:00', true),
(1, 'miercoles', '09:00', '18:00', true),
(1, 'jueves', '09:00', '18:00', true),
(1, 'viernes', '09:00', '18:00', true),
(1, 'sabado', '09:00', '14:00', true),
(1, 'domingo', '00:00', '00:00', false);

-- Crear índices para mejorar performance
CREATE INDEX idx_reservas_fecha ON reservas(fecha_hora_inicio);
CREATE INDEX idx_reservas_colaborador ON reservas(colaborador_id);
CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX idx_reservas_establecimiento ON reservas(establecimiento_id);

-- Configurar timezone
SET timezone = 'America/Lima';

-- Mostrar información de configuración
SELECT 'Base de datos configurada exitosamente' as status;
SELECT 'Usuario: weekly_user' as usuario;
SELECT 'Base de datos global: weekly_global' as bd_global;
SELECT 'Base de datos demo: weekly_demo' as bd_demo;
