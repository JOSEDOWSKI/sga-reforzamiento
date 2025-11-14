-- =============================================
-- WEEKLY - Datos iniciales para el TENANT DEMO
-- Este archivo se ejecuta automáticamente cuando se crea/initializa el tenant demo
-- =============================================

-- Usuario administrador por defecto para demo (password: demo123)
INSERT INTO usuarios (email, password_hash, nombre, rol, activo) 
VALUES (
    'admin@demo.weekly.pe', 
    '$2b$10$rQZ8K9mN2vE1wX3yZ4A5uO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8n', 
    'Administrador Demo', 
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Servicios (Establecimientos) de ejemplo para demo
INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, direccion, telefono, email, activo) VALUES
('Corte de Cabello Clásico', 'Corte tradicional para caballeros y damas', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'corte@demo.weekly.pe', true),
('Corte + Peinado', 'Corte de cabello con peinado profesional', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'peinado@demo.weekly.pe', true),
('Tintura Completa', 'Tintura profesional con productos de calidad', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'tintura@demo.weekly.pe', true),
('Mechas y Reflejos', 'Técnica de mechas y reflejos profesionales', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'mechas@demo.weekly.pe', true),
('Tratamiento Capilar', 'Tratamiento nutritivo y reparador', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'tratamiento@demo.weekly.pe', true),
('Alisado Permanente', 'Servicio de alisado con keratina', 'peluqueria', 'Demo Street 123', '+51 987 654 321', 'alisado@demo.weekly.pe', true)
ON CONFLICT (nombre) DO NOTHING;

-- Colaboradores (Staff) de ejemplo para demo
-- Asignar staff a cada establecimiento
INSERT INTO colaboradores (nombre, email, telefono, especialidades, establecimiento_id, activo) 
SELECT 
    nombre,
    email,
    telefono,
    especialidades,
    (SELECT id FROM establecimientos WHERE establecimientos.nombre = est_nombre LIMIT 1),
    true
FROM (VALUES
    ('María García', 'maria@demo.weekly.pe', '+51 987 123 456', ARRAY['Cortes', 'Peinados']::TEXT[], 'Corte de Cabello Clásico'),
    ('Carlos López', 'carlos@demo.weekly.pe', '+51 987 123 457', ARRAY['Cortes', 'Barba']::TEXT[], 'Corte de Cabello Clásico'),
    ('Ana Martínez', 'ana@demo.weekly.pe', '+51 987 123 458', ARRAY['Tinturas', 'Mechas']::TEXT[], 'Tintura Completa'),
    ('Luis Rodríguez', 'luis@demo.weekly.pe', '+51 987 123 459', ARRAY['Tratamientos', 'Alisados']::TEXT[], 'Tratamiento Capilar'),
    ('Sofia Hernández', 'sofia@demo.weekly.pe', '+51 987 123 460', ARRAY['Cortes', 'Peinados']::TEXT[], 'Corte + Peinado'),
    ('Miguel Torres', 'miguel@demo.weekly.pe', '+51 987 123 461', ARRAY['Mechas', 'Reflejos']::TEXT[], 'Mechas y Reflejos')
) AS staff_data(nombre, email, telefono, especialidades, est_nombre)
WHERE (SELECT id FROM establecimientos WHERE establecimientos.nombre = est_nombre LIMIT 1) IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Horarios de atención por defecto (Lunes a Viernes, 9am - 6pm)
INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo)
SELECT 
    e.id,
    d.dia,
    '09:00:00'::TIME,
    '18:00:00'::TIME,
    30,
    true
FROM establecimientos e
CROSS JOIN generate_series(1, 5) AS d(dia) -- Lunes (1) a Viernes (5)
WHERE e.activo = true
ON CONFLICT (establecimiento_id, dia_semana) DO NOTHING;

-- Clientes de ejemplo para demo (opcional, para mostrar reservas)
-- Nota: La tabla clientes no tiene UNIQUE constraint, así que usamos INSERT IGNORE equivalente
INSERT INTO clientes (nombre, telefono, email, activo) 
SELECT nombre, telefono, email, activo
FROM (VALUES
    ('Juan Pérez', '+51 987 111 222', 'juan@example.com', true),
    ('María González', '+51 987 333 444', 'maria@example.com', true),
    ('Pedro Sánchez', '+51 987 555 666', 'pedro@example.com', true)
) AS clientes_data(nombre, telefono, email, activo)
WHERE NOT EXISTS (
    SELECT 1 FROM clientes 
    WHERE clientes.telefono = clientes_data.telefono 
    OR (clientes_data.email IS NOT NULL AND clientes.email = clientes_data.email)
);

