# 📊 Bases de Datos Oficiales - WEEKLY

## 🎯 Resumen

El sistema WEEKLY utiliza **dos tipos de bases de datos**:

1. **Base de Datos Global** (`weekly_global`) - Panel de administración
2. **Bases de Datos por Tenant** (`weekly_{tenant_name}`) - Datos de cada cliente

---

## 1️⃣ Base de Datos Global: `weekly_global`

### 📁 Archivo Oficial del Esquema
**`backend/db/schema-global.sql`**

### 📋 Contenido
Esta base de datos contiene toda la información del panel de administración:

- **`tenants`** - Información de todos los clientes/tenants
- **`usuarios_global`** - Usuarios del panel de administración (super admins)
- **`email_tenant_mapping`** - Mapeo de emails a tenants (para login universal)
- **`facturacion`** - Información de facturación (futuro)
- **`tickets_soporte`** - Tickets de soporte (futuro)
- **`logs_sistema`** - Logs de actividad de todos los tenants (fase beta)

### 🔧 Comandos Útiles

```bash
# Conectar a la BD global
ssh root@173.212.216.136 "docker exec -it \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global"

# Ver todas las tablas
\dt

# Ver estructura de una tabla
\d tenants
\d logs_sistema
```

### 📝 Migraciones Aplicadas

1. **`migrate_add_lat_lng.sql`** - Agrega columnas `latitud` y `longitud` a `tenants`
2. **`migrate_add_logs_metadata.sql`** - Agrega columna `metadata` (JSONB) a `logs_sistema`

---

## 2️⃣ Bases de Datos por Tenant: `weekly_{tenant_name}`

### 📁 Archivo Oficial del Esquema
**`backend/db/schema.sql`**

### 📋 Contenido
Cada tenant tiene su propia base de datos con:

- **`usuarios`** - Usuarios del tenant (admins, vendedores, colaboradores)
- **`establecimientos`** - Servicios/productos del negocio
- **`colaboradores`** - Staff/profesionales que prestan servicios
- **`clientes`** - Clientes que hacen reservas
- **`reservas`** - Citas/reservas agendadas
- **`horarios_atencion`** - Horarios de trabajo de colaboradores
- **`categorias`** - Categorías para organizar servicios

### 🔧 Comandos Útiles

```bash
# Listar todas las bases de datos de tenants
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -c '\l' | grep weekly_"

# Conectar a un tenant específico (ej: weekly_demo)
ssh root@173.212.216.136 "docker exec -it \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_demo"
```

---

## 📦 Archivos SQL por Categoría

### ✅ Esquemas Oficiales (Usar estos)
- **`backend/db/schema-global.sql`** - Esquema de la BD global (actualizado con logs y lat/lng)
- **`backend/db/schema.sql`** - Esquema de las BDs de tenants

### 🔄 Migraciones (Aplicar en orden si la BD ya existe)
- **`backend/db/migrate_add_lat_lng.sql`** - Agrega latitud/longitud a tenants
- **`backend/db/migrate_add_logs_metadata.sql`** - Agrega metadata a logs_sistema

### 🌱 Seeds (Datos iniciales)
- **`backend/db/demo-seed.sql`** - Datos iniciales para el tenant 'demo'
- **`backend/db/tenant-seed.sql`** - Datos iniciales genéricos para nuevos tenants

### ⚠️ Migraciones Antiguas (No usar, solo referencia)
- `migrate_add_alumnos.sql` - Sistema antiguo
- `migrate_to_weekly_schema.sql` - Migración del sistema antiguo
- `migrate_fix_alumnos_*.sql` - Correcciones del sistema antiguo

---

## 🚀 Inicialización Completa (Nueva Instalación)

### 1. Crear Base de Datos Global

```bash
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres << 'SQL'
CREATE DATABASE weekly_global;
\c weekly_global
SQL"

# Aplicar esquema
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global" < backend/db/schema-global.sql
```

### 2. Crear Base de Datos de Tenant

```bash
# El sistema crea automáticamente las BDs de tenants cuando se crea un tenant desde el panel
# Pero si necesitas crear una manualmente:

ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres << 'SQL'
CREATE DATABASE weekly_demo;
\c weekly_demo
SQL"

# Aplicar esquema
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_demo" < backend/db/schema.sql

# Aplicar seed (opcional)
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_demo" < backend/db/demo-seed.sql
```

---

## 🔍 Verificar Estado Actual

```bash
# Ver todas las bases de datos
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -c '\l'"

# Ver tablas de weekly_global
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c '\dt'"

# Ver estructura de logs_sistema
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c '\d logs_sistema'"

# Ver si tiene columna metadata
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c \"SELECT column_name FROM information_schema.columns WHERE table_name = 'logs_sistema' AND column_name = 'metadata';\""
```

---

## 📌 Resumen Rápido

| Base de Datos | Archivo SQL | Propósito |
|--------------|-------------|-----------|
| `weekly_global` | `schema-global.sql` | Panel de administración, tenants, logs |
| `weekly_{tenant}` | `schema.sql` | Datos del tenant (reservas, servicios, etc.) |

**✅ Archivos oficiales a usar:**
- `backend/db/schema-global.sql` (actualizado con logs y lat/lng)
- `backend/db/schema.sql`

**🔄 Migraciones a aplicar si la BD ya existe:**
- `backend/db/migrate_add_lat_lng.sql`
- `backend/db/migrate_add_logs_metadata.sql`

