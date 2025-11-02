-- =============================================
-- WEEKLY - Datos iniciales para NUEVOS TENANTS
-- Este archivo se ejecuta automáticamente cuando se crea un nuevo tenant
-- =============================================

-- NOTA: Este seed es genérico. Si el tenant es "demo", se usará demo-seed.sql en su lugar

-- Crear un servicio/establecimiento inicial de ejemplo
INSERT INTO establecimientos (nombre, descripcion, tipo_negocio, direccion, telefono, email, activo) VALUES
('Servicio Principal', 'Servicio inicial del negocio', 'peluqueria', '', '', '', true)
ON CONFLICT (nombre) DO NOTHING;

-- Crear un colaborador inicial de ejemplo
INSERT INTO colaboradores (nombre, email, telefono, especialidades, establecimiento_id, activo)
SELECT 
    'Colaborador Principal',
    'colaborador@example.com',
    '',
    ARRAY[]::TEXT[],
    (SELECT id FROM establecimientos WHERE nombre = 'Servicio Principal' LIMIT 1),
    true
WHERE EXISTS (SELECT 1 FROM establecimientos WHERE nombre = 'Servicio Principal')
ON CONFLICT (email) DO NOTHING;

-- Crear horarios de atención por defecto (Lunes a Viernes, 9am - 6pm)
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
