-- =============================================
-- Migración: Esquema MVP según Requerimientos
-- Agrega tablas y campos faltantes para cumplir con MVP
-- =============================================

-- =============================================
-- BD GLOBAL (weekly_global)
-- =============================================

-- 1. Agregar campos faltantes a tenants
DO $$ 
BEGIN
    -- show_in_marketplace
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'show_in_marketplace'
    ) THEN
        ALTER TABLE tenants ADD COLUMN show_in_marketplace BOOLEAN DEFAULT false;
        COMMENT ON COLUMN tenants.show_in_marketplace IS 'Indica si el tenant aparece en el marketplace de la app móvil';
    END IF;

    -- city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'city'
    ) THEN
        ALTER TABLE tenants ADD COLUMN city VARCHAR(255);
        COMMENT ON COLUMN tenants.city IS 'Ciudad del negocio (para búsqueda geográfica)';
    END IF;
END $$;

-- 2. Crear tabla tenant_settings (opcional, pero recomendada según requerimiento)
CREATE TABLE IF NOT EXISTS tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_config ON tenant_settings USING GIN (config);

COMMENT ON TABLE tenant_settings IS 'Configuración y personalización por negocio (labels, modules, booking_mode)';

-- Migrar config existente de tenants a tenant_settings (si existe)
DO $$
DECLARE
    tenant_record RECORD;
BEGIN
    FOR tenant_record IN 
        SELECT id, config FROM tenants WHERE config IS NOT NULL AND config != '{}'::jsonb
    LOOP
        INSERT INTO tenant_settings (tenant_id, config)
        VALUES (tenant_record.id, tenant_record.config)
        ON CONFLICT (tenant_id) DO UPDATE SET config = tenant_record.config;
    END LOOP;
END $$;

-- =============================================
-- BD TENANT (aplicar en cada BD de tenant)
-- =============================================

-- 3. Agregar notes a clientes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'notes'
    ) THEN
        ALTER TABLE clientes ADD COLUMN notes TEXT;
        COMMENT ON COLUMN clientes.notes IS 'Notas adicionales sobre el cliente';
    END IF;
END $$;

-- 4. Crear tabla services (servicios que ofrece el negocio)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2),
    category_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

COMMENT ON TABLE services IS 'Servicios que ofrece el negocio (Corte de cabello, Consulta dental, Clase de matemáticas)';

-- 5. Crear tabla resources (recursos físicos: canchas, sillones, consultorios, aulas)
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(active);

COMMENT ON TABLE resources IS 'Recursos físicos que se reservan (canchas, sillones, consultorios, aulas)';

-- 6. Agregar service_id y resource_id a reservas
DO $$ 
BEGIN
    -- service_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservas' AND column_name = 'service_id'
    ) THEN
        ALTER TABLE reservas ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_reservas_service ON reservas(service_id);
    END IF;

    -- resource_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservas' AND column_name = 'resource_id'
    ) THEN
        ALTER TABLE reservas ADD COLUMN resource_id INTEGER REFERENCES resources(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_reservas_resource ON reservas(resource_id);
    END IF;
END $$;

-- 7. Crear tabla special_days (excepciones de horario: feriados, días cerrados)
CREATE TABLE IF NOT EXISTS special_days (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    is_closed BOOLEAN DEFAULT false,
    open_time TIME,
    close_time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_special_days_date ON special_days(date);
CREATE INDEX IF NOT EXISTS idx_special_days_closed ON special_days(is_closed);

COMMENT ON TABLE special_days IS 'Excepciones de horario: feriados, días cerrados, horarios especiales';

-- 8. Crear tabla notifications (para manejar envíos de correos, WhatsApp, SMS)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    reservation_id INTEGER REFERENCES reservas(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- email, sms, whatsapp, push
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    payload JSONB, -- Contenido enviado
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_client ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_reservation ON notifications(reservation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

COMMENT ON TABLE notifications IS 'Notificaciones enviadas (correos, WhatsApp, SMS, push)';

-- 9. Agregar business_hours a nivel tenant (opcional, para horarios generales del negocio)
-- Nota: Ya tenemos horarios_atencion por establecimiento, esto es adicional
CREATE TABLE IF NOT EXISTS business_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 1=lunes, etc.
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_business_hours_day ON business_hours(day_of_week);

COMMENT ON TABLE business_hours IS 'Horarios generales de atención del negocio (a nivel tenant, no por establecimiento)';

-- 10. Actualizar categorias para que pueda usarse como service_categories
-- Ya existe, solo agregar comentario
COMMENT ON TABLE categorias IS 'Categorías para agrupar servicios (Estética, Odontología, Clases, etc.) - También funciona como service_categories';


