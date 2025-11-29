# 🔧 Solución Completa: Rebuild y Limpieza en Producción

## 🚨 Problema
La demo en producción no muestra nada o muestra contenido vacío después de un deploy.

## ✅ Solución Completa

### Paso 1: Limpiar Caché Local (Opcional pero Recomendado)

```bash
# Limpiar node_modules y dist
cd frontend
rm -rf node_modules dist .vite
cd ..

# Limpiar caché de npm
npm cache clean --force
```

### Paso 2: Verificar Archivos Críticos

Asegúrate de que estos archivos existan y estén correctos:

- ✅ `Dockerfile` (en la raíz)
- ✅ `captain-definition` (en la raíz)
- ✅ `frontend/nginx.conf`
- ✅ `frontend/src/services/demoData.ts` (base de datos demo)
- ✅ `frontend/src/services/api.ts` (con lógica de modo demo)

### Paso 3: Rebuild en CapRover

#### Opción A: Rebuild Manual (Recomendado)

1. **Abre CapRover Dashboard**
   - Ve a tu app del frontend (ej: `weekly-frontend`)

2. **Limpia Caché de Build**
   - Ve a "App Configs" > "Build Settings"
   - Haz clic en "Clear Build Cache"
   - Confirma la acción

3. **Fuerza Rebuild**
   - Ve a "Deploy" o "One-Click Apps/Dockerfile"
   - Haz clic en "Force Rebuild" o "Deploy"
   - Marca la opción "No Cache" si está disponible

4. **Espera el Build**
   - El build puede tardar 3-7 minutos
   - Revisa los logs en tiempo real
   - Verifica que no haya errores

#### Opción B: Rebuild desde Terminal (Si tienes acceso SSH)

```bash
# Conectarse al servidor CapRover
ssh usuario@servidor-caprover

# Limpiar imágenes Docker antiguas
docker system prune -a -f

# Limpiar caché de build
docker builder prune -a -f

# En CapRover Dashboard, hacer Force Rebuild
```

### Paso 4: Verificar el Deploy

1. **Revisa los Logs del Build**
   - En CapRover, ve a "App Logs"
   - Busca errores de compilación
   - Verifica que el build terminó correctamente

2. **Verifica que el Contenedor Está Corriendo**
   - En CapRover, verifica que el estado sea "Running"
   - Si está en "Stopped" o "Crashed", revisa los logs

3. **Prueba las URLs**
   - https://demo.weekly.pe/lima
   - https://weekly.pe/lima
   - https://merchants.weekly.pe

4. **Limpia Caché del Navegador**
   - Presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
   - O abre en modo incógnito

### Paso 5: Si Aún No Funciona

#### Verificar Variables de Entorno en CapRover

En CapRover Dashboard > App Configs > App Env Vars, verifica:

```
VITE_API_BASE_URL=https://api.weekly.pe
VITE_MARKETPLACE_DOMAIN=weekly.pe
VITE_MERCHANTS_DOMAIN=merchants.weekly.pe
VITE_DEMO_DOMAIN=demo.weekly.pe
VITE_ENV=production
```

#### Verificar que el Build Incluye los Archivos

En los logs del build, busca:

```
✓ built in X.XXs
✓ 2110 modules transformed
```

Si ves errores de TypeScript o módulos no encontrados, el problema está en el código.

#### Recrear el Dockerfile (Último Recurso)

Si nada funciona, puedes recrear el Dockerfile:

1. Elimina el Dockerfile actual
2. Copia el Dockerfile de este repositorio
3. Haz commit y push
4. Fuerza rebuild en CapRover

## 🔍 Diagnóstico de Problemas Comunes

### Problema: "dist directory not found"
**Solución**: El build falló. Revisa los logs para ver el error específico.

### Problema: "Cannot find module"
**Solución**: Verifica que `frontend/src/services/demoData.ts` existe y está correctamente importado.

### Problema: Página en blanco
**Solución**: 
1. Verifica que `dist/index.html` existe en el contenedor
2. Revisa la consola del navegador para errores JavaScript
3. Verifica que Nginx está sirviendo los archivos correctamente

### Problema: "404 Not Found" en rutas
**Solución**: Verifica que `frontend/nginx.conf` tiene la configuración correcta para SPA.

## 📋 Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [ ] `npm run build` funciona localmente
- [ ] `frontend/dist/index.html` se genera correctamente
- [ ] No hay errores de TypeScript (`npm run build` sin errores)
- [ ] `demoData.ts` está incluido en el commit
- [ ] `Dockerfile` está en la raíz del proyecto
- [ ] `captain-definition` apunta a `./Dockerfile`
- [ ] Variables de entorno están configuradas en CapRover

## 🚀 Comando Rápido de Rebuild

Si tienes acceso SSH al servidor:

```bash
# Limpiar todo y rebuild
docker system prune -a -f && \
docker builder prune -a -f && \
# Luego en CapRover Dashboard: Force Rebuild
```

## 📝 Notas Importantes

1. **Siempre haz Force Rebuild** después de cambios importantes
2. **Limpia caché del navegador** después de cada deploy
3. **Revisa los logs** si algo no funciona
4. **Verifica que el build terminó correctamente** antes de probar

## 🔄 Proceso Completo Resumido

```bash
# 1. Limpiar local (opcional)
cd frontend && rm -rf node_modules dist .vite && cd ..

# 2. Verificar build local
cd frontend && npm run build && cd ..

# 3. Commit y push
git add -A
git commit -m "fix: rebuild production"
git push origin main

# 4. En CapRover Dashboard:
#    - Clear Build Cache
#    - Force Rebuild (No Cache)
#    - Esperar 3-7 minutos
#    - Verificar logs
#    - Probar URLs
```

---

**Última actualización**: $(date)
**Versión**: 1.0.0

