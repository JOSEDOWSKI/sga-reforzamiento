# ⚠️ ACCIONES MANUALES PENDIENTES

> **Nota:** Este documento lista todas las tareas que requieren intervención manual o configuración externa.

---

## 🔧 CONFIGURACIÓN EXTERNA

### Microsoft Clarity
- [ ] **4.3** Crear cuenta en Microsoft Clarity
  - Ir a: https://clarity.microsoft.com/
  - Crear proyecto para `weekly.pe`
  - Obtener Project ID
  - Reemplazar `YOUR_CLARITY_PROJECT_ID` en `frontend/index.html` (línea ~177)

### Base de Datos
- [ ] **8.1** Ejecutar script SQL para poblar ciudades
  ```bash
  # En el servidor (SSH)
  docker exec -i $(docker ps | grep srv-captain--weekly-postgres | head -1 | awk '{print $1}') psql -U postgres -d weekly_global < backend/db/populate-cities.sql
  ```
  - Verificar que todos los tenants tengan `city` poblado
  - Actualizar manualmente los que no se puedan inferir automáticamente

---

## 🧪 TESTING MANUAL

### Testing de Funcionalidades
- [ ] **11.1** Testing de detección de ciudad en diferentes navegadores
  - Chrome, Firefox, Safari, Edge
  - Verificar permisos de geolocalización
  - Verificar fallback a IP geolocation

- [ ] **11.2** Testing de filtros combinados (ciudad + categoría)
  - Probar todas las combinaciones posibles
  - Verificar que los resultados sean correctos

- [ ] **11.3** Testing de rutas dinámicas (SEO)
  - Verificar que las URLs sean indexables
  - Probar con herramientas de SEO (Google Search Console)

- [ ] **11.4** Testing de PWA en iOS y Android
  - Instalar como PWA
  - Verificar funcionamiento offline
  - Probar notificaciones push

- [ ] **11.5** Testing de performance (Lighthouse score > 90)
  - Ejecutar Lighthouse en Chrome DevTools
  - Optimizar según recomendaciones

---

## 🚀 CONFIGURACIÓN DE INFRAESTRUCTURA

### CDN (Cloudflare)
- [ ] **5.9** Configurar Cloudflare CDN para assets estáticos
  - Crear cuenta en Cloudflare
  - Configurar DNS
  - Habilitar CDN para `weekly.pe`

- [ ] **5.10** Configurar cache rules para imágenes y CSS
  - Configurar reglas de cache en Cloudflare
  - Headers de cache apropiados

- [ ] **5.11** Habilitar HTTP/2 y Brotli compression
  - Configurar en Cloudflare o servidor

### Next.js (Opcional - Sprint 2)
- [ ] **5.1-5.8** Migración a Next.js
  - Requiere decisión estratégica
  - Puede esperar a Sprint 2

### PWA (Sprint 3)
- [ ] **6.1-6.5** Implementación de PWA
  - Crear `manifest.json`
  - Generar iconos
  - Implementar Service Worker
  - Testing en dispositivos

---

## 📊 MONITOREO Y ANALYTICS

### Microsoft Clarity (Después de crear cuenta)
- [ ] **4.5** Configurar heatmaps para marketplace
  - Configurar sesiones de grabación
  - Configurar heatmaps para páginas clave

---

## 🗄️ BASE DE DATOS - VERIFICACIÓN

### Verificación Post-Ejecución
- [ ] Verificar que el script `populate-cities.sql` se ejecutó correctamente
  ```sql
  SELECT city, COUNT(*) as total 
  FROM tenants 
  WHERE estado = 'activo' 
  GROUP BY city 
  ORDER BY total DESC;
  ```

- [ ] Verificar que no hay tenants sin ciudad
  ```sql
  SELECT id, tenant_name, display_name, cliente_direccion
  FROM tenants
  WHERE estado = 'activo' AND (city IS NULL OR city = '');
  ```

---

## ✅ CHECKLIST DE VERIFICACIÓN POST-DEPLOY

Antes de considerar el Sprint 1 completo:

- [ ] Todos los endpoints públicos funcionan correctamente
- [ ] Geolocalización funciona en navegadores principales
- [ ] Filtros por ciudad y categoría funcionan
- [ ] Rutas dinámicas funcionan y son indexables
- [ ] Google Analytics está registrando eventos
- [ ] Microsoft Clarity está configurado (si se creó cuenta)
- [ ] Base de datos tiene ciudades pobladas
- [ ] Performance es aceptable (Lighthouse > 80)

---

## 📝 NOTAS

- **Prioridad Alta:** Ejecutar script SQL de ciudades
- **Prioridad Media:** Microsoft Clarity (opcional pero recomendado)
- **Prioridad Baja:** Testing completo (puede hacerse gradualmente)
- **Sprint 2:** Next.js, CDN, PWA (planificar para siguiente sprint)

---

**Última actualización:** Noviembre 2024

