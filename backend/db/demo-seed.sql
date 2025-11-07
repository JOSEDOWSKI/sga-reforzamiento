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

-- Establecimientos de ejemplo
INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, direccion, telefono, email, activo) VALUES
('Salón de Belleza Glamour', 'El mejor salón de belleza con servicios completos', 'peluqueria', 'Av. Principal 123, Miraflores', '+51 987 654 321', 'glamour@demo.weekly.pe', true),
('Barbería Classic', 'Barbería clásica para caballeros', 'peluqueria', 'Jr. Lima 456, Miraflores', '+51 987 654 322', 'classic@demo.weekly.pe', true),
('Spa & Beauty Center', 'Centro integral de belleza y relajación', 'spa', 'Av. Arequipa 789, Miraflores', '+51 987 654 323', 'spa@demo.weekly.pe', true),
('Style Studio', 'Estudio de peluquería y estilismo', 'peluqueria', 'Calle Los Pinos 234, San Isidro', '+51 987 654 324', 'style@demo.weekly.pe', true),
('Nails & Beauty', 'Especialistas en uñas y belleza', 'salon_belleza', 'Jr. Huancavelica 567, San Isidro', '+51 987 654 325', 'nails@demo.weekly.pe', true)
ON CONFLICT (nombre) DO NOTHING;

-- Colaboradores (Staff) con tarifas y especialidades
INSERT INTO colaboradores (nombre, email, telefono, especialidades, tarifa_por_hora, establecimiento_id, activo) 
SELECT 
    nombre,
    email,
    telefono,
    especialidades,
    tarifa,
    (SELECT id FROM establecimientos WHERE establecimientos.nombre = est_nombre LIMIT 1),
    true
FROM (VALUES
    ('María García', 'maria@demo.weekly.pe', '+51 987 123 456', ARRAY['Cortes', 'Peinados', 'Tintes']::TEXT[], 50.00, 'Salón de Belleza Glamour'),
    ('Carlos López', 'carlos@demo.weekly.pe', '+51 987 123 457', ARRAY['Barbería', 'Afeitado', 'Diseño de Barba']::TEXT[], 45.00, 'Barbería Classic'),
    ('Ana Martínez', 'ana@demo.weekly.pe', '+51 987 123 458', ARRAY['Masajes', 'Tratamientos Faciales', 'Spa']::TEXT[], 60.00, 'Spa & Beauty Center'),
    ('Luis Rodríguez', 'luis@demo.weekly.pe', '+51 987 123 459', ARRAY['Colorimetría', 'Mechas', 'Balayage']::TEXT[], 55.00, 'Style Studio'),
    ('Sofia Hernández', 'sofia@demo.weekly.pe', '+51 987 123 460', ARRAY['Manicure', 'Pedicure', 'Nail Art']::TEXT[], 40.00, 'Nails & Beauty'),
    ('Miguel Torres', 'miguel@demo.weekly.pe', '+51 987 123 461', ARRAY['Extensiones', 'Peinados de Novia', 'Alisados']::TEXT[], 65.00, 'Salón de Belleza Glamour')
) AS staff_data(nombre, email, telefono, especialidades, tarifa, est_nombre)
WHERE (SELECT id FROM establecimientos WHERE establecimientos.nombre = est_nombre LIMIT 1) IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Horarios de atención flexibles
INSERT INTO horarios_atencion (establecimiento_id, dia_semana, hora_apertura, hora_cierre, intervalo_minutos, activo)
SELECT 
    e.id,
    d.dia,
    CASE 
        WHEN d.dia IN (1,2,3,4,5) THEN '09:00:00'::TIME -- Lun-Vie: 9am
        WHEN d.dia = 6 THEN '10:00:00'::TIME           -- Sáb: 10am
        ELSE '11:00:00'::TIME                          -- Dom: 11am
    END as hora_apertura,
    CASE 
        WHEN d.dia IN (1,2,3,4,5) THEN '20:00:00'::TIME -- Lun-Vie: 8pm
        WHEN d.dia = 6 THEN '18:00:00'::TIME           -- Sáb: 6pm
        ELSE '16:00:00'::TIME                          -- Dom: 4pm
    END as hora_cierre,
    CASE 
        WHEN e.tipo_negocio = 'spa' THEN 60            -- Spa: slots de 1 hora
        ELSE 30                                         -- Otros: slots de 30 min
    END as intervalo_minutos,
    true
FROM establecimientos e
CROSS JOIN generate_series(0, 6) AS d(dia)  -- 0=Domingo a 6=Sábado
WHERE e.activo = true
ON CONFLICT (establecimiento_id, dia_semana) DO NOTHING;

-- Clientes de ejemplo
INSERT INTO clientes (nombre, telefono, dni, email, activo) VALUES
('Juan Pérez', '+51 987 111 222', '45678912', 'juan@example.com', true),
('María González', '+51 987 333 444', '23456789', 'maria@example.com', true),
('Pedro Sánchez', '+51 987 555 666', '34567890', 'pedro@example.com', true),
('Ana Silva', '+51 987 777 888', '56789012', 'ana@example.com', true),
('Carlos Torres', '+51 987 999 000', '67890123', 'carlos@example.com', true)
ON CONFLICT DO NOTHING;

-- Algunas reservas de ejemplo para esta semana
INSERT INTO reservas (
    fecha_hora_inicio,
    fecha_hora_fin,
    colaborador_id,
    establecimiento_id,
    cliente_id,
    servicio_descripcion,
    precio,
    estado,
    creado_por
)
SELECT 
    NOW() + (n || ' days')::INTERVAL + '10:00:00'::TIME as fecha_inicio,
    NOW() + (n || ' days')::INTERVAL + '11:00:00'::TIME as fecha_fin,
    c.id as colaborador_id,
    c.establecimiento_id,
    cl.id as cliente_id,
    'Servicio de prueba ' || n as descripcion,
    50.00 * (n + 1) as precio,
    'confirmada' as estado,
    (SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1) as creado_por
FROM generate_series(0, 6) as n
CROSS JOIN (SELECT id, establecimiento_id FROM colaboradores LIMIT 1) as c
CROSS JOIN (SELECT id FROM clientes LIMIT 1) as cl
ON CONFLICT DO NOTHING;

