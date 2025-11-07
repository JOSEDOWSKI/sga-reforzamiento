# 🔧 Comando para Agregar Metadata a Logs en Producción

## 📋 Información
- **IP:** 173.212.216.136
- **Usuario:** root
- **Password:** 151022qaz
- **Base de Datos:** weekly_global
- **Tabla:** logs_sistema

## 🎯 Objetivo
Agregar la columna `metadata` (JSONB) a la tabla `logs_sistema` y crear los índices necesarios para el sistema de logging de fase beta.

---

## ✅ OPCIÓN 1: Comando Directo (Recomendado)

**Copia y pega este comando completo:**

```bash
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global << 'SQL'
-- Agregar columna metadata si no existe
DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logs_sistema' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE logs_sistema ADD COLUMN metadata JSONB;
    END IF;
END \$\$;

-- Agregar índices si no existen
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant ON logs_sistema(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_accion ON logs_sistema(accion);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON logs_sistema(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant_accion ON logs_sistema(tenant_id, accion);
SQL"
```

---

## ✅ OPCIÓN 2: Usando el archivo SQL (Más Limpio)

**1. Subir el archivo a producción:**
```bash
scp backend/db/migrate_add_logs_metadata.sql root@173.212.216.136:/tmp/
```

**2. Ejecutar la migración:**
```bash
ssh root@173.212.216.136 "docker exec -i \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global" < /tmp/migrate_add_logs_metadata.sql
```

---

## ✅ OPCIÓN 3: Paso a Paso (Más Seguro)

```bash
# 1. Conectar al servidor
ssh root@173.212.216.136

# 2. Encontrar el contenedor de PostgreSQL
docker ps | grep weekly-postgres

# 3. Conectar al contenedor PostgreSQL
docker exec -it $(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global

# 4. Ejecutar SQL (copia y pega):
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logs_sistema' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE logs_sistema ADD COLUMN metadata JSONB;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant ON logs_sistema(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_accion ON logs_sistema(accion);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON logs_sistema(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tenant_accion ON logs_sistema(tenant_id, accion);

# 5. Verificar que se agregó la columna:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'logs_sistema' AND column_name = 'metadata';

# 6. Verificar índices:
\di logs_sistema*

# 7. Salir:
\q
```

---

## ✅ Verificación

**Verificar que la columna metadata existe:**
```bash
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c \"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'logs_sistema' AND column_name = 'metadata';\""
```

**Verificar que los índices se crearon:**
```bash
ssh root@173.212.216.136 "docker exec \$(docker ps -q --filter 'name=weekly-postgres') psql -U postgres -d weekly_global -c \"SELECT indexname FROM pg_indexes WHERE tablename = 'logs_sistema';\""
```

---

## 📝 Notas

- La migración es **idempotente** (se puede ejecutar múltiples veces sin problemas)
- Usa `IF NOT EXISTS` para evitar errores si ya existe
- Los índices mejoran el rendimiento de las consultas de logs
- La columna `metadata` permite almacenar datos adicionales en formato JSON

