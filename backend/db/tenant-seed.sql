-- Datos iniciales para cada tenant
-- Este archivo se ejecuta automáticamente cuando se crea un nuevo tenant

-- Configuración inicial del tenant
INSERT INTO tenant_config (tenant_name, display_name, primary_color, secondary_color, timezone, locale) 
VALUES ('demo', 'Academia Demo', '#007bff', '#6c757d', 'America/Mexico_City', 'es-MX');

-- Usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (email, password_hash, nombre, rol) 
VALUES ('admin@demo.com', '$2b$12$.fZSoDmGCiPbSky2rP5yIOBv0cTdSzMlL8DpGL9JhFCPOyBAnSrpW', 'Administrador', 'admin');

-- Cursos de ejemplo
INSERT INTO cursos (nombre, descripcion, precio, duracion_minutos) VALUES
('Matemáticas Básicas', 'Curso de matemáticas para nivel básico', 250.00, 60),
('Álgebra', 'Curso de álgebra intermedia', 300.00, 90),
('Cálculo', 'Curso de cálculo diferencial e integral', 400.00, 120),
('Física', 'Curso de física general', 350.00, 90),
('Química', 'Curso de química básica', 300.00, 90);

-- Profesores de ejemplo
INSERT INTO profesores (nombre, email, telefono, especialidades, tarifa_por_hora) VALUES
('Dr. Juan Pérez', 'juan.perez@demo.com', '+52-555-0001', ARRAY['Matemáticas', 'Física'], 200.00),
('Mtra. María García', 'maria.garcia@demo.com', '+52-555-0002', ARRAY['Química', 'Biología'], 180.00),
('Ing. Carlos López', 'carlos.lopez@demo.com', '+52-555-0003', ARRAY['Matemáticas', 'Ingeniería'], 220.00);

-- Temas de ejemplo para Matemáticas Básicas
INSERT INTO temas (nombre, descripcion, curso_id, orden) VALUES
('Aritmética', 'Operaciones básicas con números', 1, 1),
('Fracciones', 'Operaciones con fracciones', 1, 2),
('Decimales', 'Números decimales y porcentajes', 1, 3),
('Geometría Básica', 'Figuras geométricas y perímetros', 1, 4);

-- Temas de ejemplo para Álgebra
INSERT INTO temas (nombre, descripcion, curso_id, orden) VALUES
('Ecuaciones Lineales', 'Resolución de ecuaciones de primer grado', 2, 1),
('Sistemas de Ecuaciones', 'Métodos de resolución de sistemas', 2, 2),
('Factorización', 'Técnicas de factorización', 2, 3),
('Funciones', 'Introducción a las funciones', 2, 4);

-- Temas de ejemplo para Cálculo
INSERT INTO temas (nombre, descripcion, curso_id, orden) VALUES
('Límites', 'Concepto y cálculo de límites', 3, 1),
('Derivadas', 'Reglas de derivación', 3, 2),
('Integrales', 'Cálculo integral', 3, 3),
('Aplicaciones', 'Aplicaciones del cálculo', 3, 4);
