-- Tabla de Cursos
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla de Profesores
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Tabla de Temas (dependen de un curso)
CREATE TABLE temas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    curso_id INT NOT NULL,
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
    creado_por VARCHAR(255), -- ID o nombre del vendedor que crea la reserva
    estado VARCHAR(20) DEFAULT 'confirmada', -- ENUM no es estándar en todos los SQL
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (tema_id) REFERENCES temas(id)
); 