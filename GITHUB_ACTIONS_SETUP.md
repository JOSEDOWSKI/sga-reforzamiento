# 🔧 Configuración de GitHub Actions para Deploy Automático

## 📋 Requisitos Previos

1. ✅ Repositorio en GitHub
2. ✅ Acceso a CapRover Dashboard
3. ✅ Webhook URL de CapRover

## 🔑 Configurar Secrets en GitHub

### Paso 1: Obtener Webhook URL de CapRover

1. Ve a tu CapRover Dashboard (ej: `https://panel.getdevtools.com`)
2. Selecciona tu app (`weekly-app`)
3. Ve a la pestaña **"Deployment"**
4. En la sección **"GitHub, Bitbucket, GitLab Webhook"**:
   - Ingresa la URL de tu repositorio GitHub
   - Click en **"Save"**
5. Copia la **URL del webhook** que aparece (ejemplo):
   ```
   https://captain.panel.getdevtools.com/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&token=TOKEN_AQUI
   ```

### Paso 2: Agregar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **"New repository secret"**
4. Agrega estos secrets:

#### Secret 1: `CAPROVER_WEBHOOK_URL` (REQUERIDO)
```
Name: CAPROVER_WEBHOOK_URL
Value: https://captain.panel.getdevtools.com/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&token=TU_TOKEN_AQUI
```
*(Pega la URL completa del webhook que copiaste de CapRover)*

#### Secret 2: `CAPROVER_SERVER_URL` (Opcional - para health check)
```
Name: CAPROVER_SERVER_URL
Value: panel.getdevtools.com
```
*(Solo el dominio, sin https://)*

#### Secret 3: `CAPROVER_APP_NAME` (Opcional)
```
Name: CAPROVER_APP_NAME
Value: weekly-app
```
*(Si no lo configuras, usará 'weekly-app' por defecto)*

## ✅ Verificar Configuración

Una vez configurados los secrets, puedes verificar que todo funciona:

1. **Hacer un cambio pequeño** en el código
2. **Hacer commit y push**:
   ```bash
   git add .
   git commit -m "test: Verificar deploy automático"
   git push origin main
   ```
3. **Verificar en GitHub Actions**:
   - Ve a tu repositorio → pestaña **"Actions"**
   - Deberías ver el workflow ejecutándose
   - Click en el workflow para ver los logs

4. **Verificar en CapRover**:
   - Ve a CapRover Dashboard → tu app
   - Deberías ver que se inició un nuevo build automáticamente

## 🚀 Flujo de Deploy

Cuando haces `git push origin main`:

```
┌─────────────────────────────────────┐
│  1. Push a GitHub                   │
│     git push origin main            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. GitHub Actions se activa        │
│     - Detecta cambios en main      │
│     - Inicia workflow deploy.yml    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Build del tarball               │
│     - Crea weekly-unified.tar.gz    │
│     - Incluye backend + frontend    │
│     - Incluye Dockerfile y configs  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Trigger Webhook de CapRover     │
│     - Envía tarball al webhook      │
│     - CapRover inicia build         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. CapRover construye y despliega   │
│     - Reconstruye imagen Docker     │
│     - Actualiza contenedor          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. App actualizada                  │
│     - Sin downtime                  │
│     - Nueva versión en producción    │
└─────────────────────────────────────┘
```

## 🔍 Monitorear Deploys

### Ver Logs en GitHub Actions

1. Ve a tu repositorio
2. Click en la pestaña **"Actions"**
3. Click en el workflow más reciente
4. Revisa los logs de cada step

### Ver Logs en CapRover

1. Ve a CapRover Dashboard
2. Selecciona tu app (`weekly-app`)
3. Click en **"App Logs"**
4. Verás los logs del build y del contenedor

### Ver Build Status en CapRover

1. Ve a CapRover Dashboard
2. Selecciona tu app
3. En la pestaña **"Deployment"** verás el historial de builds
4. Cada build muestra:
   - Estado (Building, Success, Failed)
   - Tiempo de inicio
   - Logs del build

## 🐛 Troubleshooting

### Error: "CAPROVER_WEBHOOK_URL not found"

**Solución**: Verifica que el secret esté configurado correctamente en GitHub:
- Settings → Secrets and variables → Actions
- Debe llamarse exactamente `CAPROVER_WEBHOOK_URL`
- Debe contener la URL completa del webhook

### Error: "Auth token corrupted" o "401 Unauthorized"

**Solución**: El token del webhook es inválido o expiró:
1. Ve a CapRover → tu app → Deployment
2. Regenera el webhook (guarda de nuevo)
3. Copia la nueva URL
4. Actualiza el secret en GitHub

### Error: "App not found"

**Solución**: La app no existe en CapRover:
1. Crea la app en CapRover primero
2. O verifica que el nombre de la app sea correcto

### El webhook se ejecuta pero no inicia build

**Solución**: 
1. Verifica que la URL del repositorio en CapRover sea correcta
2. Verifica que el webhook esté habilitado en CapRover
3. Revisa los logs en CapRover para ver si hay errores

### El build falla en CapRover

**Solución**:
1. Revisa los logs del build en CapRover
2. Verifica que el Dockerfile esté correcto
3. Verifica que todas las variables de entorno estén configuradas
4. Revisa que el tarball incluya todos los archivos necesarios

## 📝 Notas Importantes

- ⚠️ **El webhook URL contiene un token** - No lo compartas públicamente
- ⚠️ **Las variables de entorno** deben estar configuradas en CapRover **ANTES** del primer deploy
- ⚠️ **Las variables `VITE_*`** se inyectan durante el build, así que deben estar en CapRover
- ✅ **El deploy es automático** cada vez que haces push a `main`
- ✅ **Puedes ejecutar manualmente** desde GitHub Actions → "Run workflow"
- ✅ **El webhook es más simple** que usar la API directamente

## 🔄 Alternativa: Usar Webhook Directo de GitHub

También puedes configurar el webhook directamente en GitHub para que CapRover reciba notificaciones:

1. Ve a tu repositorio GitHub → **Settings** → **Webhooks**
2. Click en **"Add webhook"**
3. **Payload URL**: Pega la URL del webhook de CapRover
4. **Content type**: `application/json`
5. **Events**: Selecciona "Just the push event"
6. Click en **"Add webhook"**

Con esto, CapRover recibirá notificaciones directamente sin pasar por GitHub Actions, pero el método actual (con GitHub Actions) te da más control y logs.

## 🔄 Rollback

Si necesitas volver a una versión anterior:

1. **Opción 1: Revert commit en GitHub**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Opción 2: Deploy manual desde CapRover**
   - Ve a CapRover → weekly-app → Deployment
   - Sube un tarball de una versión anterior

3. **Opción 3: Usar tags de Git**
   ```bash
   git checkout <commit-hash>
   git push origin main --force
   ```
