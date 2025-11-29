# 🚨 URGENTE: Rebuild Completo en Producción

## ⚠️ Problema Actual

El bundle compilado en producción (`index-D0ZWvXCA.js`) **todavía contiene código antiguo** que:
- Intenta cargar "tenants" (ya no existe)
- Tiene referencias a Microsoft Clarity con ID placeholder
- Tiene código obsoleto del ecommerce anterior

**El código fuente está limpio**, pero el bundle en producción es antiguo.

## ✅ Solución: Rebuild COMPLETO sin caché

### Paso 1: En CapRover Dashboard

1. **Ve a tu app del frontend**
2. **App Configs > Build Settings**
3. **Haz clic en "Clear Build Cache"** (MUY IMPORTANTE)
4. **Confirma la acción**

### Paso 2: Force Rebuild SIN CACHÉ

1. **Ve a "Deploy" o "One-Click Apps/Dockerfile"**
2. **Haz clic en "Force Rebuild"**
3. **Marca la opción "No Cache" o "Clear Cache"** (si está disponible)
4. **Confirma el rebuild**

### Paso 3: Esperar el Build

- El build puede tardar **5-10 minutos**
- **NO interrumpas el proceso**
- Revisa los logs en tiempo real
- Verifica que termine con éxito

### Paso 4: Verificar el Build

En los logs del build, busca:
```
✓ built in X.XXs
✓ 2110 modules transformed
```

Si ves errores, **NO** continúes. Revisa los errores primero.

### Paso 5: Limpiar Caché del Navegador

**Después del rebuild completado:**

1. **Abre el navegador en modo incógnito** (recomendado)
2. O limpia la caché completamente:
   - Chrome/Edge: `Ctrl+Shift+Delete` > Marca "Cached images and files" > Limpiar
   - Firefox: `Ctrl+Shift+Delete` > Marca "Caché" > Limpiar
3. **O fuerza recarga**: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)

### Paso 6: Verificar en Producción

Prueba estas URLs:
- https://demo.weekly.pe/lima
- https://weekly.pe/lima
- https://weekly.pe/arequipa

**Verifica en la consola del navegador:**
- ✅ NO debe aparecer error de Clarity
- ✅ NO debe aparecer error de "tenants"
- ✅ NO debe aparecer error de site.webmanifest
- ✅ Debe aparecer: "🎮 Modo Demo: Usando datos demo para aliados" (en demo.weekly.pe)

## 🔍 Si Aún Aparecen Errores

### Error: "tenants.map is not a function"
**Causa**: El bundle todavía es antiguo
**Solución**: 
1. Verifica que el build terminó correctamente
2. Verifica que Clear Build Cache se ejecutó
3. Espera 2-3 minutos después del build (puede haber caché de CDN)
4. Limpia caché del navegador completamente

### Error: "Clarity 400"
**Causa**: El bundle todavía tiene el script de Clarity
**Solución**: Mismo proceso de rebuild

### Error: "site.webmanifest syntax error"
**Causa**: El navegador está parseando el manifest incorrectamente
**Solución**: 
1. Verifica que el rebuild incluyó el nuevo nginx.conf
2. Verifica que el manifest se sirve con Content-Type correcto
3. Limpia caché del navegador

## 📋 Checklist Pre-Rebuild

Antes de hacer el rebuild, verifica:

- [ ] El código fuente no tiene referencias a "tenants" (✅ Verificado)
- [ ] El index.html no tiene Clarity activo (✅ Verificado)
- [ ] El site.webmanifest existe y es válido (✅ Verificado)
- [ ] El nginx.conf tiene la configuración del manifest (✅ Verificado)

## 🚀 Comando Rápido (Si tienes acceso SSH)

```bash
# Limpiar todo en el servidor
docker system prune -a -f
docker builder prune -a -f

# Luego en CapRover Dashboard: Force Rebuild
```

## ⏱️ Tiempo Estimado

- Clear Build Cache: 1-2 minutos
- Force Rebuild: 5-10 minutos
- Total: **6-12 minutos**

## ✅ Después del Rebuild Exitoso

Deberías ver:
- ✅ No hay errores en la consola
- ✅ La demo carga correctamente con datos demo
- ✅ Los estilos son los nuevos (no los antiguos)
- ✅ No hay referencias a "tenants" en el código

---

**Última actualización**: $(date)
**Versión**: 1.0.0

