-- Tabla de configuración del tenant
CREATE TABLE tenant_config (
    id SERIAL PRIMARY KEY,
    tenant_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'es-ES',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios del sistema (administradores, vendedores, etc.)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'vendedor', -- admin, vendedor, profesor
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cursos
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    duracion_minutos INTEGER DEFAULT 60,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nombre)
);

-- Tabla de Profesores
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    especialidades TEXT[],
    tarifa_por_hora DECIMAL(10,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Alumnos
CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(50),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Temas (dependen de un curso)
CREATE TABLE temas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    curso_id INT NOT NULL,
    orden INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- Tabla de Reservas
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    profesor_id INT NOT NULL,
    curso_id INT NOT NULL,
    tema_id INT NOT NULL,
    nombre_alumno VARCHAR(255) NOT NULL,
    email_alumno VARCHAR(255),
    telefono_alumno VARCHAR(20),
    notas TEXT,
    precio DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'confirmada', -- confirmada, cancelada, completada, no_asistio
    creado_por INT, -- ID del usuario que crea la reserva
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (tema_id) REFERENCES temas(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Índices para mejorar performance
CREATE INDEX idx_reservas_fecha ON reservas(fecha_hora_inicio);
CREATE INDEX idx_reservas_profesor ON reservas(profesor_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_temas_curso ON temas(curso_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol); 