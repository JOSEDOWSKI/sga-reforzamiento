# 🔍 VERIFICACIÓN DE DEPLOY Y BASE DE DATOS

## ❓ ¿El problema es de la base de datos?

**Respuesta corta:** Probablemente NO directamente, pero puede estar relacionado.

### Cómo funciona el deploy:

1. **Frontend (weekly.pe):**
   - Se compila con `npm run build` → genera archivos estáticos
   - Estos archivos NO dependen de la BD
   - Se sirven desde Nginx
   - **Si el frontend no se actualiza, es problema de:**
     - Caché del navegador
     - Deploy no completado
     - Build fallido

2. **Backend (api.weekly.pe):**
   - Se inicia con Node.js
   - Intenta conectar a la BD al iniciar
   - **Si la BD falla:**
     - El backend puede iniciar igual (no bloquea)
     - PERO las requests a `/api/public/tenants` fallarán
     - Esto haría que el marketplace no muestre servicios

## 🔍 CÓMO VERIFICAR

### 1. Verificar que el frontend se actualizó:

**Abre la consola del navegador (F12) y busca:**

```javascript
// Deberías ver estos logs al cargar weekly.pe:
🔍 App.tsx Routing Debug: { hostname: "weekly.pe", ... }
✅ PRIORIDAD 2: Detectado weekly.pe - Mostrando MarketplacePage
```

**Si NO ves estos logs, el frontend NO se actualizó (caché o deploy fallido)**

### 2. Verificar que el backend funciona:

**Abre:** `https://api.weekly.pe/health`

**Debería responder:** `{ "status": "ok" }`

**Si falla, el backend no está corriendo o hay problemas de BD**

### 3. Verificar que la API responde:

**Abre la consola del navegador y ejecuta:**

```javascript
fetch('https://api.weekly.pe/api/public/tenants')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Si falla con CORS o 500, hay problema de backend/BD**

## 🚨 PROBLEMAS COMUNES

### Problema 1: Frontend no se actualiza (caché)
**Solución:**
- Hard refresh: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
- Modo incógnito
- Limpiar caché del navegador completamente

### Problema 2: Backend no inicia (BD)
**Síntomas:**
- `https://api.weekly.pe/health` no responde
- Requests a `/api/public/tenants` fallan
- Logs de CapRover muestran errores de BD

**Solución:**
- Verificar variables de entorno en CapRover:
  - `DB_HOST`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_PORT`
- Verificar que PostgreSQL esté corriendo
- Verificar que la BD `weekly_global` existe

### Problema 3: Routing incorrecto (código)
**Síntomas:**
- Frontend carga pero redirige a `peluqueria.weekly.pe`
- Logs muestran detección incorrecta de subdominio

**Solución:**
- Verificar logs de consola: `🔍 App.tsx Routing Debug:`
- Verificar que `isMarketplaceMainDomain` sea `true` en `weekly.pe`

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Frontend carga en `weekly.pe`
- [ ] Consola muestra logs de routing correctos
- [ ] Backend responde en `https://api.weekly.pe/health`
- [ ] API responde en `https://api.weekly.pe/api/public/tenants`
- [ ] No hay errores de CORS en la consola
- [ ] Al hacer click en servicio, navega a ruta dinámica (no subdominio)

## 🔧 SI EL PROBLEMA ES DE BD

1. **Verifica logs de CapRover del backend**
2. **Verifica variables de entorno de BD**
3. **Verifica que PostgreSQL esté corriendo**
4. **Verifica que la BD `weekly_global` existe**

Si la BD falla, el backend puede iniciar pero las requests fallarán, haciendo que el marketplace no muestre servicios.

