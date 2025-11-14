# 🚀 Guía de Deployment - Weekly Unificado

## 📦 Arquitectura Unificada

Weekly ahora usa una **arquitectura unificada** donde backend y frontend están en un solo contenedor Docker:

```
┌─────────────────────────────────────┐
│     Contenedor Docker Unificado      │
│  ┌─────────────┐  ┌──────────────┐  │
│  │   Nginx     │  │   Node.js    │  │
│  │  (Puerto 80)│  │ (Puerto 4000)│  │
│  │             │  │              │  │
│  │  Frontend   │  │   Backend    │  │
│  │  (React)    │  │  (Express)   │  │
│  └─────────────┘  └──────────────┘  │
│         │                │           │
│         └────────┬───────┘           │
│                  │                   │
│         Supervisor (Gestor)           │
└─────────────────────────────────────┘
```

## 🔄 Deploy Automático con GitHub Actions

### Configuración Inicial

1. **Secrets en GitHub** (Settings → Secrets and variables → Actions):

   ```
   CAPROVER_API_TOKEN=tu_token_caprover
   CAPROVER_SERVER_URL=https://panel.getdevtools.com
   CAPROVER_APP_NAME=weekly-app
   ```

2. **Obtener Token de CapRover**:
   - Ve a CapRover Dashboard
   - Settings → CapRover Token
   - Copia el token

### Flujo de Deploy

Cuando haces `git push origin main`:

1. ✅ GitHub Actions detecta el push
2. ✅ Construye el tarball unificado
3. ✅ Hace deploy a CapRover automáticamente
4. ✅ CapRover reconstruye la imagen Docker
5. ✅ La app se actualiza sin downtime

### Configuración en CapRover

#### 1. Crear App en CapRover

1. Ve a CapRover Dashboard
2. Click en "One-Click Apps/Databases" → "New App"
3. Nombre: `weekly-app` (o el que configuraste en secrets)
4. Click "Create New App"

#### 2. Configurar Variables de Entorno

En CapRover → weekly-app → App Configs → Environment Variables:

```bash
# Base de Datos
DB_HOST=srv-captain--weekly-postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=weekly_global
DB_NAME_PREFIX=weekly_

# Entorno
NODE_ENV=production
PORT=4000
USE_DEV_MODE=false

# Frontend (se inyectan en build)
VITE_API_URL=https://api.weekly.pe
VITE_WS_URL=wss://api.weekly.pe
VITE_ENV=production
VITE_DEFAULT_TENANT=demo

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=https://*.weekly.pe,https://weekly.pe
ALLOWED_TENANTS=demo,admin,cliente

# Dominio
MAIN_DOMAIN=weekly.pe
FRONTEND_URL=https://weekly.pe
```

**⚠️ IMPORTANTE**: Las variables `VITE_*` deben estar configuradas **ANTES** del primer deploy, ya que se inyectan durante el build del frontend.

#### 3. Configurar Dominios

En CapRover → weekly-app → HTTP Settings:

**Dominios principales:**
- `weekly.pe` (dominio raíz)
- `api.weekly.pe` (API - opcional, si quieres separar)

**Custom Domains (para tenants):**
- `demo.weekly.pe`
- `panel.weekly.pe`
- Agregar otros según necesites

**Configuración HTTP:**
- ✅ Force HTTPS: Activado
- ✅ Enable Built-in Load Balancer: Activado
- ✅ WebSocket Support: Activado (CRÍTICO)

**Puerto del contenedor:**
- HTTP Port: `80` (Nginx)
- No configurar Port Mapping manualmente

#### 4. Configurar DNS en Cloudflare

Agrega estos registros A (con proxy DESACTIVADO ⚪):

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | `*` | IP del servidor | ⚪ Solo DNS |
| A | `@` | IP del servidor | ⚪ Solo DNS |
| A | `api` | IP del servidor | ⚪ Solo DNS |

## 🔧 Deploy Manual (Alternativa)

Si prefieres hacer deploy manual:

```bash
# 1. Crear tarball
tar -czf weekly-unified.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env*' \
  backend/ frontend/ Dockerfile nginx.conf supervisord.conf captain-definition

# 2. Subir a CapRover vía web
# Ve a CapRover → weekly-app → Deployment → Upload tar file
```

## 📊 Monitoreo

### Logs

```bash
# Ver logs en CapRover
CapRover → weekly-app → App Logs

# O vía CLI
caprover logs -a weekly-app
```

### Health Check

El contenedor expone un endpoint de health check:
- `http://weekly.pe/health`
- `http://api.weekly.pe/health`

## 🐛 Troubleshooting

### El deploy falla

1. Verifica los secrets en GitHub
2. Verifica que el token de CapRover sea válido
3. Revisa los logs en GitHub Actions

### La app no inicia

1. Verifica las variables de entorno en CapRover
2. Revisa los logs: `CapRover → weekly-app → App Logs`
3. Verifica que PostgreSQL esté corriendo

### Frontend no carga

1. Verifica que `VITE_API_URL` esté configurado correctamente
2. Revisa la consola del navegador
3. Verifica que Nginx esté corriendo (logs)

### Backend no responde

1. Verifica que el puerto 4000 esté accesible internamente
2. Revisa los logs del backend
3. Verifica la conexión a PostgreSQL

## 🔄 Migración desde Deploy Separado

Si tenías backend y frontend separados:

1. **No borres las apps antiguas** (por si necesitas rollback)
2. **Crea la nueva app unificada** (`weekly-app`)
3. **Copia las variables de entorno** de ambas apps a la nueva
4. **Configura los dominios** en la nueva app
5. **Haz el primer deploy** y verifica que funcione
6. **Una vez verificado**, puedes eliminar las apps antiguas

## ✅ Checklist de Deploy

- [ ] Secrets configurados en GitHub
- [ ] App creada en CapRover
- [ ] Variables de entorno configuradas
- [ ] DNS configurado en Cloudflare
- [ ] Dominios configurados en CapRover
- [ ] WebSocket support activado
- [ ] HTTPS forzado
- [ ] Primer deploy exitoso
- [ ] Health check funcionando
- [ ] Frontend carga correctamente
- [ ] Backend responde correctamente

