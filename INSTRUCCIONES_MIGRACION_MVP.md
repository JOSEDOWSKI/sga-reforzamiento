# 📋 Instrucciones: Migración MVP

## ⚠️ IMPORTANTE

**Las migraciones NO se ejecutan automáticamente.** Debes ejecutarlas manualmente después de desplegar el backend.

---

## 🚀 Pasos para Migrar

### 1. Desplegar Backend

Sube el archivo `backend-weekly-20251110-164801.tar.gz` a CapRover:
- App: `weekly-backend`
- Método: Tarball Upload

Espera a que el contenedor se reinicie completamente.

---

### 2. Obtener ID del Contenedor

```bash
docker ps | grep weekly-backend
```

Ejemplo de salida:
```
f70986aeb649 img-captain-weekly-backend:36 "docker-entrypoint.s…" About a minute ago Up About a minute 4000/tcp srv-captain--weekly-backend.1.fb41x7kmhgegjz7329vwr8b9b
```

El ID del contenedor es: `f70986aeb649` (o el nombre completo: `srv-captain--weekly-backend.1.fb41x7kmhgegjz7329vwr8b9b`)

---

### 3. Migrar BD Global (weekly_global)

```bash
docker exec -it <container-id> npm run migrate-mvp-global
```

**Ejemplo:**
```bash
docker exec -it srv-captain--weekly-backend.1.fb41x7kmhgegjz7329vwr8b9b npm run migrate-mvp-global
```

**Qué hace:**
- Agrega `show_in_marketplace` y `city` a la tabla `tenants`
- Crea la tabla `tenant_settings`
- Migra `config` existente de `tenants` a `tenant_settings`

**Salida esperada:**
```
🌐 Ejecutando migración MVP en weekly_global...

✅ Migración MVP completada en weekly_global
```

---

### 4. Migrar Todas las BDs de Tenants

```bash
docker exec -it <container-id> npm run migrate-mvp-all
```

**Ejemplo:**
```bash
docker exec -it srv-captain--weekly-backend.1.fb41x7kmhgegjz7329vwr8b9b npm run migrate-mvp-all
```

**Qué hace:**
- Agrega `notes` a la tabla `clientes`
- Crea tabla `services`
- Crea tabla `resources`
- Agrega `service_id` y `resource_id` a `reservas`
- Crea tabla `special_days`
- Crea tabla `notifications`
- Crea tabla `business_hours`

**Salida esperada:**
```
🚀 Iniciando migración MVP en todas las BDs de tenants...

📋 Encontradas X bases de datos de tenants:
   - agendate_demo
   - agendate_peluqueria
   ...

🔧 Ejecutando migración MVP en agendate_demo...
✅ Migración MVP completada en agendate_demo

...

📊 RESUMEN DE MIGRACIÓN MVP
============================================================
✅ Exitosos: X
❌ Fallidos: 0

✅ Proceso completado
```

---

## ✅ Verificación

### Verificar BD Global

```bash
docker exec -it <container-id> psql -U postgres -d weekly_global -c "\d tenant_settings"
```

Deberías ver la tabla `tenant_settings`.

### Verificar BD Tenant (ejemplo: demo)

```bash
docker exec -it <container-id> psql -U postgres -d agendate_demo -c "\d services"
docker exec -it <container-id> psql -U postgres -d agendate_demo -c "\d resources"
```

Deberías ver las tablas `services` y `resources`.

---

## 🔄 Orden de Ejecución

1. ✅ Desplegar backend
2. ✅ Migrar BD global (`migrate-mvp-global`)
3. ✅ Migrar todas las BDs de tenants (`migrate-mvp-all`)

**⚠️ NO cambies el orden.** La BD global debe migrarse primero.

---

## ❌ Si Algo Sale Mal

### Error: "relation already exists"

Significa que la migración ya se ejecutó. Es seguro ejecutarla de nuevo (usa `IF NOT EXISTS`).

### Error: "database does not exist"

Verifica que el tenant esté creado en la BD global:
```bash
docker exec -it <container-id> npm run list-all-tenants
```

### Error: "permission denied"

Verifica que las variables de entorno `DB_USER`, `DB_PASSWORD`, etc. estén configuradas correctamente en CapRover.

---

## 📝 Notas

- Las migraciones son **idempotentes** (puedes ejecutarlas múltiples veces sin problemas)
- Las migraciones usan `IF NOT EXISTS` para evitar errores si ya existen
- Los datos existentes **NO se eliminan** (solo se agregan tablas/campos)

---

**Última actualización:** 2025-11-10


