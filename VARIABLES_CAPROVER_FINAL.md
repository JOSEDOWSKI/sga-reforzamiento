# ⚙️ Variables de Entorno Completas para CapRover - Weekly App

## 📋 Copia y Pega Estas Variables

Ve a: **CapRover → weekly-app → App Configs → Environment Variables**

Luego copia y pega todas estas variables:

```bash
# ============================================
# BASE DE DATOS
# ============================================
DB_HOST=srv-captain--weekly-postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=151022qaz
DB_NAME=weekly_global
DB_NAME_PREFIX=weekly_

# ============================================
# ENTORNO Y PUERTO
# ============================================
NODE_ENV=production
PORT=4000
USE_DEV_MODE=false

# ============================================
# FRONTEND - Variables VITE (Se inyectan en build)
# ============================================
VITE_API_URL=https://api.weekly.pe
VITE_WS_URL=wss://api.weekly.pe
VITE_ENV=production
VITE_DEFAULT_TENANT=demo

# ============================================
# AUTENTICACIÓN JWT
# ============================================
JWT_SECRET=0290d4511d5b5d270f81d8d397fe0cc19f01251e20c9673a08f93f2960901b7f
JWT_EXPIRES_IN=7d

# ============================================
# CORS y Seguridad
# ============================================
ALLOWED_ORIGINS=https://*.weekly.pe,https://weekly.pe,https://panel.weekly.pe,https://api.weekly.pe
ALLOWED_TENANTS=demo,peluqueria,academia,cancha,veterinaria,odontologia,gimnasio,prueba1,prueba3

# ============================================
# DOMINIOS Y URLs
# ============================================
MAIN_DOMAIN=weekly.pe
BASE_URL=https://weekly.pe
FRONTEND_URL=https://weekly.pe

# ============================================
# CLOUDFLARE (Para DNS automático)
# ============================================
CLOUDFLARE_API_TOKEN=t63f-VXzybiALDaS7XYv0hbsKdsk48iVBmwE5dCP
CLOUDFLARE_ZONE_ID=9293ce5d27653eee1cfd63f7aae588a8
CLOUDFLARE_DOMAIN=weekly.pe

# ============================================
# CAPROVER (Para automatización)
# ============================================
CAPROVER_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Im5hbWVzcGFjZSI6ImNhcHRhaW4iLCJ0b2tlblZlcnNpb24iOiJpNG1LMFR2ZVV2amk4VXVjUkdVQjJwYlFNdVFiUXljRUhVQkduQVp3ME4xOUpnTXhKdjNBbVZXYWxQNFdXNjRLIn0sImlhdCI6MTc2MTk3ODE3MywiZXhwIjoxNzYzNzA2MTczfQ.w5KzKu57hPbCH_SlsoB29jc6ewBlx9bBAa3pMnXpO30
CAPROVER_SERVER_URL=https://captain.panel.getdevtools.com
CAPROVER_FRONTEND_APP=weekly-app
```

## 🔄 Cambios Necesarios

### ⚠️ IMPORTANTE: Cambiar estas variables

1. **DB_NAME_PREFIX**:
   ```
   DB_NAME_PREFIX=weekly_  ✅ (cambiar de agendate_)
   ```

2. **CAPROVER_FRONTEND_APP**:
   ```
   CAPROVER_FRONTEND_APP=weekly-app  ✅ (cambiar de weekly-frontend)
   ```

3. **Agregar si no existen**:
   ```
   DB_NAME=weekly_global
   MAIN_DOMAIN=weekly.pe
   FRONTEND_URL=https://weekly.pe
   VITE_DEFAULT_TENANT=demo
   ```

## 📝 Cómo Configurar en CapRover

1. Ve a **CapRover Dashboard**
2. Selecciona tu app: **weekly-app**
3. Click en **"App Configs"** (menú lateral)
4. Click en **"Environment Variables"**
5. Para cada variable:
   - Si existe: **Edítala** (click en el lápiz)
   - Si no existe: **Agrégala** (click en "Add New Variable")
6. Después de agregar/editar todas:
   - Click en **"Save & Update"** (botón abajo)
   - CapRover reconstruirá la app automáticamente

## ✅ Verificación

Después de guardar:

1. **CapRover iniciará un rebuild** automáticamente
2. **Espera 3-5 minutos** para que termine
3. **Verifica que funcione**:
   - Frontend: `https://weekly.pe`
   - Backend: `https://api.weekly.pe/health`
   - Debería responder: `healthy`

## 🔒 Seguridad

**⚠️ IMPORTANTE**: Estas variables contienen información sensible:
- **JWT_SECRET**: Cambia por uno nuevo y seguro en producción
- **DB_PASSWORD**: Mantén seguro
- **CLOUDFLARE_API_TOKEN**: No compartas
- **CAPROVER_API_TOKEN**: No compartas

## 📊 Variables por Categoría

### Backend (Runtime)
- `DB_*` - Base de datos
- `JWT_*` - Autenticación
- `NODE_ENV`, `PORT`, `USE_DEV_MODE` - Configuración
- `ALLOWED_*` - Seguridad
- `*_DOMAIN`, `*_URL` - URLs

### Frontend (Build-time)
- `VITE_*` - Se inyectan durante el build
- Solo disponibles en el código del frontend

### Servicios Externos
- `CLOUDFLARE_*` - Para DNS automático
- `CAPROVER_*` - Para automatización

## 🆘 Si Algo No Funciona

1. **Verifica que todas las variables estén guardadas**
2. **Revisa los logs**: CapRover → weekly-app → App Logs
3. **Verifica el build**: CapRover → weekly-app → Deployment
4. **Revisa errores específicos** en los logs

## 📋 Checklist Final

- [ ] Todas las variables copiadas
- [ ] `DB_NAME_PREFIX` cambiado a `weekly_`
- [ ] `CAPROVER_FRONTEND_APP` cambiado a `weekly-app`
- [ ] Variables faltantes agregadas
- [ ] Click en "Save & Update"
- [ ] Build completado exitosamente
- [ ] App funciona correctamente

