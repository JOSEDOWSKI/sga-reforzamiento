# 🔧 Comandos para Actualizar Base de Datos en Producción

## 📋 Información del Servidor
- **IP:** 173.212.216.136
- **Usuario:** root
- **Password:** 151022qaz
- **Base de Datos:** weekly_global
- **Tabla:** tenants

## 🎯 Objetivo
Agregar las columnas `latitud` y `longitud` a la tabla `tenants` para soportar el selector de ubicación con Google Maps.

---

## ✅ OPCIÓN 1: Comando Directo (Recomendado)

**Copia y pega este comando completo:**

```bash
ssh root@173.212.216.136 "docker exec -i srv-captain--weekly-postgres.1.\$(docker ps | grep weekly-postgres | awk '{print \$1}' | head -1 | cut -c1-12) psql -U postgres -d weekly_global << 'SQL'
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);
COMMENT ON COLUMN tenants.latitud IS 'Coordenada de latitud obtenida de Google Maps';
COMMENT ON COLUMN tenants.longitud IS 'Coordenada de longitud obtenida de Google Maps';
SQL"
```

**O más simple usando el nombre del servicio:**

```bash
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c \"ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8); ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);\""
```

---

## ✅ OPCIÓN 2: Paso a Paso (Más Seguro)

```bash
# 1. Conectar al servidor
ssh root@173.212.216.136

# 2. Encontrar el contenedor de PostgreSQL
docker ps | grep weekly-postgres

# 3. Conectar al contenedor PostgreSQL usando el nombre del servicio
# Opción A: Usar el nombre completo del contenedor
docker exec -it $(docker ps | grep weekly-postgres | awk '{print $1}' | head -1) psql -U postgres -d weekly_global

# Opción B: Usar filtro por nombre
docker exec -it $(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global

# 4. Dentro de psql, ejecutar:
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);

# 5. Verificar que se agregaron las columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name IN ('latitud', 'longitud');

# 6. Salir
\q
```

---

## ✅ OPCIÓN 3: Comando Simplificado (Una Línea) - RECOMENDADO

```bash
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c \"ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8); ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);\""
```

**Este es el comando más simple y recomendado.**

---

## 🔍 Verificación

Después de ejecutar la migración, verifica que las columnas fueron agregadas:

```bash
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c \"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants' AND column_name IN ('latitud', 'longitud');\""
```

**O desde dentro del servidor:**

```bash
ssh root@173.212.216.136
docker exec -i $(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants' AND column_name IN ('latitud', 'longitud');"
```

**Resultado esperado:**
```
 column_name | data_type 
-------------+-----------
 latitud     | numeric   
 longitud    | numeric   
```

---

## ✅ Verificación del Formulario

El formulario de creación de tenant incluye todos los campos requeridos:

**Campos Requeridos (NOT NULL):**
- ✅ tenant_name
- ✅ display_name
- ✅ cliente_nombre
- ✅ cliente_email

**Campos Opcionales:**
- ✅ cliente_telefono
- ✅ cliente_direccion (con selector de ubicación)
- ✅ latitud (se obtiene automáticamente)
- ✅ longitud (se obtiene automáticamente)
- ✅ plan (default: 'basico')
- ✅ logo_url
- ✅ primary_color (default: '#007bff')
- ✅ secondary_color (default: '#6c757d')
- ✅ timezone (default: 'UTC')
- ✅ locale (default: 'es-ES')

**El formulario está completo y satisface los requisitos de la base de datos.**

---

## ⚠️ Notas Importantes

1. **IF NOT EXISTS**: Los comandos usan `ADD COLUMN IF NOT EXISTS` para evitar errores si las columnas ya existen
2. **Sin datos perdidos**: Esta migración solo agrega columnas, no modifica datos existentes
3. **Valores NULL**: Las columnas nuevas serán NULL para tenants existentes, lo cual es correcto
4. **Compatibilidad**: El código ya está preparado para funcionar con o sin estas columnas

---

## 🚀 Después de la Migración

Una vez agregadas las columnas:
- ✅ Los nuevos tenants podrán guardar coordenadas desde el selector de ubicación
- ✅ Los tenants existentes mantendrán sus datos (con latitud/longitud NULL)
- ✅ El mapa interactivo funcionará con las coordenadas de los nuevos tenants
