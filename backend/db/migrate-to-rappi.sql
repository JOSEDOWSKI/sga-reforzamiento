-- =============================================
-- SCRIPT DE MIGRACIÓN: Multi-Tenant → Modelo Rappi
-- =============================================
-- Este script migra datos de múltiples BDs de tenants a una BD compartida
-- IMPORTANTE: Ejecutar en orden y hacer backup antes
-- =============================================

-- Paso 1: Crear la nueva BD compartida (ejecutar manualmente)
-- CREATE DATABASE weekly_peru;

-- Paso 2: Ejecutar schema-rappi.sql en la nueva BD

-- Paso 3: Migrar datos de tenants a aliados
-- Este script asume que tienes acceso a la BD global y a las BDs de tenants

DO $$
DECLARE
    tenant_record RECORD;
    nuevo_aliado_id INTEGER;
    usuario_record RECORD;
    establecimiento_record RECORD;
    colaborador_record RECORD;
    cliente_record RECORD;
    reserva_record RECORD;
BEGIN
    -- Migrar tenants a aliados
    FOR tenant_record IN 
        SELECT * FROM tenants WHERE estado = 'activo'
    LOOP
        -- Insertar aliado
        INSERT INTO aliados (
            nombre, email, telefono, direccion, latitud, longitud, ciudad,
            pais, logo_url, primary_color, secondary_color, timezone, locale,
            categoria, estado, plan, show_in_marketplace, config,
            created_at, updated_at, ultimo_acceso
        ) VALUES (
            tenant_record.cliente_nombre,
            tenant_record.cliente_email,
            tenant_record.cliente_telefono,
            tenant_record.cliente_direccion,
            tenant_record.latitud,
            tenant_record.longitud,
            tenant_record.city,
            'peru', -- Ajustar según país
            tenant_record.logo_url,
            tenant_record.primary_color,
            tenant_record.secondary_color,
            tenant_record.timezone,
            tenant_record.locale,
            NULL, -- categoria se puede extraer de config si existe
            tenant_record.estado,
            tenant_record.plan,
            tenant_record.show_in_marketplace,
            tenant_record.config,
            tenant_record.created_at,
            tenant_record.updated_at,
            tenant_record.ultimo_acceso
        ) RETURNING id INTO nuevo_aliado_id;
        
        RAISE NOTICE 'Migrado tenant % (ID: %) a aliado ID: %', 
            tenant_record.tenant_name, tenant_record.id, nuevo_aliado_id;
        
        -- NOTA: Para migrar datos de cada tenant, necesitarías:
        -- 1. Conectar a la BD del tenant (weekly_1, weekly_2, etc.)
        -- 2. Migrar usuarios, establecimientos, colaboradores, clientes, reservas
        -- 3. Asignar aliado_id a cada registro
        
        -- Esto se hace mejor con un script Node.js que puede conectar a múltiples BDs
    END LOOP;
END $$;

-- =============================================
-- NOTA IMPORTANTE:
-- =============================================
-- La migración completa requiere un script Node.js que:
-- 1. Conecte a weekly_global para obtener lista de tenants
-- 2. Para cada tenant, conecte a su BD (weekly_1, weekly_2, etc.)
-- 3. Migre todos los datos asignando aliado_id
-- 4. Valide integridad de datos
-- 
-- Ver: backend/scripts/migrate-to-rappi.js

