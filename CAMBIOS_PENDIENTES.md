# 📋 Lista de Cambios Pendientes - Weekly Marketplace

## 🎯 Objetivo
Transformar Weekly en un marketplace estilo Rappi con rutas basadas en ubicación y categoría, manteniendo tenants para el panel admin.

---

## 🔗 CAMBIOS EN URLs Y RUTAS

### Estado Actual
- ❌ `tenant.weekly.pe/booking` → Calendario del tenant
- ❌ Marketplace sin filtros de ciudad/categoría

### Estado Deseado
- ✅ `weekly.pe` → Marketplace principal
- ✅ `weekly.pe/lima` → Marketplace filtrado por Lima
- ✅ `weekly.pe/lima/peluqueria` → Marketplace filtrado por Lima + Peluquería
- ✅ `weekly.pe/lima/peluqueria/123-salon-bella-vista` → Detalle del negocio
- ✅ `weekly.pe/lima/peluqueria/123-salon-bella-vista/booking` → Calendario público

### Tareas
- [x] **1.1** Agregar routing dinámico en `App.tsx` para rutas `/:ciudad` y `/:ciudad/:categoria` ✅
- [x] **1.2** Integrado en `MarketplacePage.tsx` con props y `useParams` ✅
- [x] **1.3** Filtrado por ciudad + categoría implementado en `MarketplacePage.tsx` ✅
- [ ] **1.4** Modificar `ServiceDetailPage.tsx` para usar nueva estructura de URL
- [ ] **1.5** Modificar `PublicCalendarPage.tsx` para usar nueva estructura de URL
- [x] **1.6** Actualizar navegación desde `MarketplacePage` a nuevas rutas ✅

---

## 🗺️ GEOLOCALIZACIÓN Y DETECCIÓN DE CIUDAD

### Estado Actual
- ❌ No hay detección automática de ciudad
- ❌ No hay filtros por ubicación geográfica

### Estado Deseado
- ✅ Detección automática de ciudad al entrar a `weekly.pe`
- ✅ Redirección automática a `weekly.pe/ciudad-detectada`
- ✅ Búsqueda "cerca de mí" usando coordenadas
- ✅ Filtros por radio de distancia

### Tareas
- [x] **2.1** Implementar detección de ciudad usando `navigator.geolocation` ✅
- [x] **2.2** Integrar reverse geocoding (coordenadas → ciudad) con Google Maps API ✅
- [x] **2.3** Fallback a IP geolocation si el usuario no permite ubicación ✅
- [x] **2.4** Agregar selector manual de ciudad en el header (dropdown) ✅
- [ ] **2.5** Implementar búsqueda por radio (ej: "a 5km de mí") - Pendiente
- [x] **2.6** Guardar ciudad preferida en localStorage ✅

---

## 🏷️ FILTROS Y CATEGORÍAS

### Estado Actual
- ⚠️ Marketplace muestra todos los tenants sin filtros
- ⚠️ No hay categorización clara

### Estado Deseado
- ✅ Filtros por categoría (Peluquería, Clínica, Academia, etc.)
- ✅ Filtros por ciudad
- ✅ Filtros combinados (ciudad + categoría)
- ✅ Búsqueda por nombre de negocio
- ✅ Ordenamiento (más cercano, mejor rating, más popular)

### Tareas
- [x] **3.1** Categoría inferida desde `tenant_name` en backend ✅
- [x] **3.2** Filtro de categoría implementado en `MarketplacePage.tsx` (dropdown) ✅
- [x] **3.3** Filtro de ciudad implementado en `MarketplacePage.tsx` (dropdown) ✅
- [x] **3.4** Implementar búsqueda en tiempo real en `MarketplacePage` ✅
- [x] **3.5** Agregar ordenamiento (cercanía, rating, popularidad) ✅ - Pendiente
- [x] **3.6** Backend: Endpoint `/api/public/tenants?city=lima&category=peluqueria` ✅

---

## 🚀 CAMBIOS EN TECNOLOGÍA

### Fase 1: Analítica y Monitoreo (Prioridad Alta)

#### Google Analytics GA4
- [x] **4.1** Verificar que GA4 esté configurado en `index.html` ✅
- [x] **4.2** Agregar eventos de tracking: ✅
  - [x] `view_marketplace` (ver marketplace) ✅
  - [x] `view_item` (ver detalle de negocio) ✅
  - [x] `click_booking` (click en agendar) ✅
  - [x] `complete_booking` (reserva completada) ✅
  - [x] `search` (búsqueda) ✅
  - [x] `filter_by_city` (filtrar por ciudad) ✅
  - [x] `filter_by_category` (filtrar por categoría) ✅
  - [x] `change_view_mode` (cambiar vista grid/list) ✅
  - [x] `geolocation_detected` (ciudad detectada) ✅

#### Microsoft Clarity (Alternativa Gratuita a Hotjar)
- [ ] **4.3** Crear cuenta en Microsoft Clarity
- [ ] **4.4** Agregar script de Clarity en `index.html`
- [ ] **4.5** Configurar heatmaps para marketplace

### Fase 2: SEO y Performance (Prioridad Media)

#### Next.js para Marketplace
- [ ] **5.1** Crear nuevo proyecto Next.js 14 en `frontend-marketplace/`
- [ ] **5.2** Migrar `MarketplacePage` a Next.js con SSR
- [ ] **5.3** Migrar `ServiceDetailPage` a Next.js con SSR
- [ ] **5.4** Implementar `getServerSideProps` para datos dinámicos
- [ ] **5.5** Configurar meta tags dinámicos por negocio (Open Graph, Twitter Cards)
- [ ] **5.6** Generar sitemap.xml dinámico con todas las rutas
- [ ] **5.7** Configurar robots.txt
- [ ] **5.8** Mantener React SPA para panel admin (no migrar)

#### CDN (Cloudflare)
- [ ] **5.9** Configurar Cloudflare CDN para assets estáticos
- [ ] **5.10** Configurar cache rules para imágenes y CSS
- [ ] **5.11** Habilitar HTTP/2 y Brotli compression

### Fase 3: PWA (Prioridad Media)

#### Progressive Web App
- [ ] **6.1** Crear `manifest.json` con información de la app
- [ ] **6.2** Agregar iconos en múltiples tamaños (192x192, 512x512)
- [ ] **6.3** Implementar Service Worker para cache offline
- [ ] **6.4** Configurar notificaciones push (opcional, para recordatorios)
- [ ] **6.5** Testing en iOS y Android

### Fase 4: Mejoras Adicionales (Prioridad Baja)

#### Google Maps Mejorado
- [ ] **7.1** Mejorar integración con Google Maps API
- [ ] **7.2** Agregar marcadores en mapa para negocios cercanos
- [ ] **7.3** Implementar "cómo llegar" desde ubicación del usuario

#### Performance
- [ ] **7.4** Implementar lazy loading de imágenes
- [ ] **7.5** Code splitting para rutas del marketplace
- [ ] **7.6** Optimizar bundle size (analizar con webpack-bundle-analyzer)

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Tabla `tenants` (Ya tiene campos necesarios)
- ✅ `city` (VARCHAR) - Ciudad del negocio
- ✅ `latitud` / `longitud` (DECIMAL) - Coordenadas
- ✅ `show_in_marketplace` (BOOLEAN) - Si aparece en marketplace

### Tareas Adicionales
- [ ] **8.1** Verificar que todos los tenants tengan `city` poblado
- [ ] **8.2** Agregar índice en `city` para búsquedas rápidas (ya existe)
- [ ] **8.3** Crear endpoint `/api/public/tenants?city=lima&category=peluqueria&lat=X&lng=Y&radius=5`a
- [ ] **8.4** Implementar cálculo de distancia (Haversine) para "cerca de mí"

---

## 🎨 CAMBIOS EN UI/UX

### MarketplacePage
- [x] **9.1** Agregar selector de ciudad en header (dropdown) ✅
- [x] **9.2** Agregar filtros de categoría (dropdown) ✅
- [ ] **9.3** Mostrar "cerca de ti" si hay geolocalización - Pendiente
- [ ] **9.4** Agregar botón "Cambiar ubicación" si la detección falla - Pendiente
- [ ] **9.5** Mostrar distancia en cada tarjeta de negocio - Pendiente (requiere cálculo de distancia)
- [x] **9.6** Agregar ordenamiento (dropdown: "Más cercano", "Mejor rating", etc.) ✅

### ServiceDetailPage
- [ ] **9.7** Mostrar mapa con ubicación del negocio
- [ ] **9.8** Agregar botón "Cómo llegar" (Google Maps)
- [ ] **9.9** Mostrar distancia desde ubicación del usuario
- [ ] **9.10** Agregar breadcrumbs: `Lima > Peluquería > Salón Bella Vista`

---

## 📱 BACKEND - Nuevos Endpoints

### Endpoints Públicos
- [x] **10.1** `GET /api/public/tenants?city=lima` - Listar por ciudad ✅
- [x] **10.2** `GET /api/public/tenants?city=lima&category=peluqueria` - Listar por ciudad + categoría ✅
- [ ] **10.3** `GET /api/public/tenants?lat=-12.0464&lng=-77.0428&radius=5` - Listar por radio - Pendiente
- [x] **10.4** `GET /api/public/tenants/:id` - Detalle del tenant (para marketplace) ✅
- [ ] **10.5** `GET /api/public/cities` - Lista de ciudades disponibles - Pendiente
- [ ] **10.6** `GET /api/public/categories` - Lista de categorías disponibles - Pendiente

---

## 🧪 TESTING

- [ ] **11.1** Testing de detección de ciudad en diferentes navegadores
- [ ] **11.2** Testing de filtros combinados (ciudad + categoría)
- [ ] **11.3** Testing de rutas dinámicas (SEO)
- [ ] **11.4** Testing de PWA en iOS y Android
- [ ] **11.5** Testing de performance (Lighthouse score > 90)

---

## 📊 PRIORIZACIÓN

### Sprint 1 (2 semanas) - Fundación
1. Geolocalización y detección de ciudad
2. Filtros por ciudad y categoría
3. Rutas dinámicas básicas
4. Google Analytics GA4

### Sprint 2 (2 semanas) - SEO y Performance
1. Migración a Next.js para marketplace
2. Meta tags dinámicos
3. CDN configuration
4. Sitemap y robots.txt

### Sprint 3 (1 semana) - PWA y Mejoras
1. PWA implementation
2. Microsoft Clarity
3. Mejoras de UI/UX
4. Testing completo

---

## 📝 NOTAS

- **Tenants se mantienen** para panel admin (`tenant.weekly.pe`)
- **Marketplace usa rutas** estilo Rappi (`weekly.pe/ciudad/categoria/id`)
- **No eliminar arquitectura multi-tenant** (solo cambiar URLs públicas)
- **Backend sigue usando `X-Tenant` header** para identificar tenant en booking

---

## ✅ CHECKLIST RÁPIDO

- [x] Geolocalización implementada ✅
- [x] Filtros por ciudad funcionando ✅
- [x] Filtros por categoría funcionando ✅
- [x] Rutas dinámicas implementadas ✅
- [x] Google Analytics configurado ✅
- [ ] Next.js migrado (opcional pero recomendado) - Sprint 2
- [ ] CDN configurado - Sprint 2
- [ ] PWA funcionando - Sprint 3
- [ ] Testing completo - Pendiente

---

## 📈 PROGRESO ACTUAL

### ✅ Sprint 1 - Fundación (95% Completado)

**Completado:**
- ✅ Geolocalización y detección automática de ciudad (`useGeolocation.ts`)
- ✅ Filtros por ciudad y categoría (dropdowns funcionales)
- ✅ Rutas dinámicas `/:ciudad` y `/:ciudad/:categoria` implementadas
- ✅ Backend con filtros `?city=lima&category=peluqueria`
- ✅ Google Analytics GA4 con eventos de tracking completos
- ✅ Navegación actualizada a nuevas rutas
- ✅ `ServiceDetailPage` actualizado para usar nuevas rutas
- ✅ `PublicCalendarPage` actualizado para usar nuevas rutas
- ✅ Ordenamiento implementado (nombre, rating, distancia)
- ✅ Endpoint `/api/public/tenants/:id` creado
- ✅ Evento `complete_booking` integrado en calendario público

**Pendiente del Sprint 1 (Opcional/Mejoras):**
- [ ] **2.5** Búsqueda por radio (ej: "a 5km de mí") - Opcional, puede ser Sprint 2
- [ ] **9.3** Mostrar "cerca de ti" si hay geolocalización - Mejora UX
- [ ] **9.4** Agregar botón "Cambiar ubicación" si la detección falla - Mejora UX
- [ ] **9.5** Mostrar distancia en cada tarjeta de negocio - Requiere cálculo de distancia

**Próximos pasos (Sprint 2):**
1. Migrar marketplace a Next.js para mejor SEO
2. Agregar meta tags dinámicos
3. Configurar CDN
4. Implementar PWA

