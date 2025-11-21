-- =============================================
-- SCRIPT PARA POBLAR CIUDADES EN TENANTS
-- Ejecutar en: weekly_global
-- =============================================

-- Verificar tenants sin ciudad
SELECT 
    id,
    tenant_name,
    display_name,
    cliente_nombre,
    cliente_direccion,
    city,
    latitud,
    longitud
FROM tenants
WHERE estado = 'activo'
  AND (city IS NULL OR city = '')
ORDER BY tenant_name;

-- Actualizar ciudades basándose en dirección o coordenadas conocidas
-- Ejemplo para Arequipa (coordenadas conocidas)
UPDATE tenants
SET city = 'Arequipa'
WHERE estado = 'activo'
  AND (city IS NULL OR city = '')
  AND (
    -- Si tiene coordenadas de Arequipa
    (latitud BETWEEN -16.5 AND -16.3 AND longitud BETWEEN -71.6 AND -71.4)
    OR
    -- Si la dirección contiene "Arequipa"
    (cliente_direccion ILIKE '%arequipa%')
    OR
    -- Si el tenant_name sugiere Arequipa
    (tenant_name ILIKE '%arequipa%')
  );

-- Ejemplo para Lima
UPDATE tenants
SET city = 'Lima'
WHERE estado = 'activo'
  AND (city IS NULL OR city = '')
  AND (
    (latitud BETWEEN -12.2 AND -11.8 AND longitud BETWEEN -77.2 AND -76.8)
    OR
    (cliente_direccion ILIKE '%lima%')
    OR
    (tenant_name ILIKE '%lima%')
  );

-- Ejemplo para Cusco
UPDATE tenants
SET city = 'Cusco'
WHERE estado = 'activo'
  AND (city IS NULL OR city = '')
  AND (
    (latitud BETWEEN -13.6 AND -13.4 AND longitud BETWEEN -72.1 AND -71.9)
    OR
    (cliente_direccion ILIKE '%cusco%' OR cliente_direccion ILIKE '%cuzco%')
    OR
    (tenant_name ILIKE '%cusco%' OR tenant_name ILIKE '%cuzco%')
  );

-- Verificar resultado
SELECT 
    city,
    COUNT(*) as total_tenants
FROM tenants
WHERE estado = 'activo'
GROUP BY city
ORDER BY total_tenants DESC;

-- Mostrar tenants que aún no tienen ciudad (requieren actualización manual)
SELECT 
    id,
    tenant_name,
    display_name,
    cliente_direccion,
    latitud,
    longitud
FROM tenants
WHERE estado = 'activo'
  AND (city IS NULL OR city = '')
ORDER BY tenant_name;

