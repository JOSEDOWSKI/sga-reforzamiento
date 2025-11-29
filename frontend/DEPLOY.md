# 🚀 Deploy del Ecommerce Weekly en CapRover

## Configuración Automática

Este proyecto está configurado para desplegarse automáticamente en CapRover cuando se hace push a `main`.

## Archivos de Configuración

- **`Dockerfile`**: Construye la imagen Docker del ecommerce
- **`captain-definition`**: Configuración de CapRover con build args
- **`.dockerignore`**: Archivos excluidos del build
- **`nginx.conf`**: Configuración de Nginx para SPA

## Variables de Entorno en CapRover

Configura estas variables en CapRover (App Config > App Env Vars):

```
VITE_API_BASE_URL=https://api.weekly.pe
VITE_MARKETPLACE_DOMAIN=weekly.pe
VITE_MERCHANTS_DOMAIN=merchants.weekly.pe
VITE_ENV=production
```

## Deploy Manual

Si necesitas hacer deploy manual:

1. **Conectar repositorio en CapRover:**
   - Ve a CapRover Dashboard
   - Crea nueva app o edita existente
   - En "Deployment Method" selecciona "Git Repository"
   - Conecta tu repositorio
   - Branch: `main`
   - Dockerfile Location: `frontend/Dockerfile`
   - Captain Definition Location: `frontend/captain-definition`

2. **Configurar dominio:**
   - En "HTTP Settings" agrega:
     - `weekly.pe` (marketplace principal)
     - `merchants.weekly.pe` (landing informativa)

3. **Build Args (opcional):**
   - Si necesitas sobrescribir las variables de build, agrégalas en "Build Arguments"

## Deploy Automático con GitHub Actions (Opcional)

Si quieres configurar GitHub Actions para deploy automático:

```yaml
# .github/workflows/deploy.yml
name: Deploy to CapRover
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger CapRover Deploy
        run: |
          curl -X POST "${{ secrets.CAPROVER_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"trigger": true}'
```

## Verificación Post-Deploy

1. Verifica que el marketplace carga: `https://weekly.pe/lima`
2. Verifica que la landing carga: `https://merchants.weekly.pe`
3. Revisa los logs en CapRover para errores

## Troubleshooting

### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en CapRover

### Variables de entorno no funcionan
- Recuerda que las variables `VITE_*` deben estar disponibles en **tiempo de build**
- Si las cambias, necesitas hacer rebuild completo

### Nginx no sirve las rutas correctamente
- Verifica que `nginx.conf` tenga `try_files $uri $uri/ /index.html;`
- Esto es necesario para SPA (Single Page Application)

