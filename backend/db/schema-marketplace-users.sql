-- =============================================
-- PERFILES DE USUARIOS DEL MARKETPLACE
-- Tabla para almacenar perfiles de clientes que reservan desde el marketplace
-- Base de datos: weekly_global
-- =============================================

CREATE TABLE IF NOT EXISTS clientes_marketplace (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255), -- Opcional: para autenticación futura
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(50),
    direccion TEXT,
    ciudad VARCHAR(255),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    preferencias JSONB DEFAULT '{}'::jsonb, -- Preferencias del usuario (categorías favoritas, etc.)
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_marketplace_email ON clientes_marketplace(email);
CREATE INDEX IF NOT EXISTS idx_clientes_marketplace_telefono ON clientes_marketplace(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_marketplace_activo ON clientes_marketplace(activo);

