# 🛒 Descripción del Ecommerce de Weekly

## 📋 Resumen Ejecutivo

Weekly es una plataforma **marketplace estilo Rappi** para reservas de servicios profesionales. El ecommerce permite a los usuarios buscar, filtrar y reservar citas con negocios locales (aliados) como peluquerías, spas, consultorios, academias, etc., a través de un sistema de geolocalización y rutas dinámicas basadas en ubicación y categoría.

---

## 🎯 Concepto Principal

Weekly es un marketplace público donde los usuarios buscan y reservan servicios con negocios locales (aliados).

**Modelo de Negocio:**
- **Marketplace Público (Ecommerce)**: `weekly.pe` - Plataforma pública donde los usuarios buscan y reservan servicios con aliados
- **Landing Informativa**: `merchants.weekly.pe` - Página informativa para que nuevos negocios se registren

El ecommerce es la plataforma principal del marketplace, diseñado para que los clientes finales encuentren y reserven servicios de manera intuitiva con los aliados (negocios) registrados en la plataforma.

---

## 🌐 Estructura de URLs (Modelo Rappi)

El ecommerce utiliza rutas dinámicas basadas en ubicación geográfica y categoría, similar a Rappi:

### Rutas Principales

```
weekly.pe                                    → Marketplace principal (detecta ciudad automáticamente)
weekly.pe/lima                               → Marketplace filtrado por Lima
weekly.pe/lima/peluqueria                     → Marketplace filtrado por Lima + Peluquería
weekly.pe/lima/peluqueria/123-salon-bella-vista                    → Detalle del negocio
weekly.pe/lima/peluqueria/123-salon-bella-vista/booking             → Calendario de reservas del negocio
```

### Características de las URLs

- **SEO-Friendly**: URLs descriptivas y amigables para buscadores
- **Navegación Intuitiva**: Estructura jerárquica clara (ciudad → categoría → negocio → reserva)
- **Compartibles**: URLs fáciles de compartir en redes sociales
- **Bookmarkeable**: Los usuarios pueden guardar enlaces directos a negocios específicos

---

## 🔍 Funcionalidades del Ecommerce

### 1. Búsqueda y Filtrado

#### Búsqueda por Texto
- Campo de búsqueda en el header
- Búsqueda en tiempo real mientras el usuario escribe
- Busca en nombres de negocios, descripciones y categorías

#### Filtros Disponibles
- **Por Ciudad**: Filtro geográfico principal
- **Por Categoría**: Peluquería, Spa, Consultorio, Academia, etc.
- **Por Distancia**: "Más cercano", ordena por proximidad al usuario
- **Por Rating**: "Mejor rating", ordena por calificación
- **Por Nombre**: Orden alfabético (A-Z)

#### Ordenamiento
- Por defecto (relevancia)
- Nombre (A-Z)
- Mejor rating
- Más cercano (geolocalización)

### 2. Geolocalización

#### Detección Automática
- Al entrar a `weekly.pe`, detecta automáticamente la ciudad del usuario
- Usa `navigator.geolocation` del navegador
- Integra reverse geocoding con Google Maps API
- Fallback a geolocalización por IP si el usuario no permite ubicación

#### Funcionalidades de Ubicación
- **Selector Manual de Ciudad**: Dropdown en el header para cambiar ciudad
- **Cálculo de Distancia**: Muestra distancia en km desde la ubicación del usuario
- **Búsqueda "Cerca de Mí"**: Filtra negocios por radio de distancia
- **Persistencia**: Guarda ciudad preferida en localStorage

### 3. Página Principal (MarketplacePage)

#### Secciones Principales

**Hero Banner**
- Título: "Reserva con los mejores profesionales"
- Subtítulo: "Peluquerías, spas, consultorios, academias y más. Agenda tu cita en minutos."
- Botón CTA: "Explorar servicios"

**Lo Más Buscado**
- Grid de categorías populares
- Iconos representativos por categoría
- Click navega a `/:ciudad/:categoria`

**Profesionales Destacados**
- Lista de negocios destacados
- Cards con imagen, nombre, rating, distancia
- Botón "Ver todos" para ver lista completa

**Listado de Servicios**
- Grid responsive de negocios
- Cada card muestra:
  - Imagen del negocio
  - Nombre
  - Categoría
  - Rating (estrellas)
  - Número de reseñas
  - Distancia desde el usuario
  - Precio (si está disponible)
- Click en card navega a página de detalle

**Sección "Únete a Weekly"**
- 3 cards de registro:
  - Registra tu negocio
  - Registra tu comercio
  - Únete como profesional
- Cada card tiene botón CTA que lleva a `merchants.weekly.pe`

#### Sidebar
- No visible por defecto (estilo Rappi)
- Secciones:
  - Ingreso / Registro
  - Promociones
  - Categorías de servicios
  - Enlaces adicionales (Registra negocio, Repartidor, Publicidad)

### 4. Página de Detalle del Negocio (ServiceDetailPage)

#### Información Mostrada
- **Galería de Fotos**: Múltiples imágenes del negocio
- **Nombre y Categoría**: Título principal
- **Rating y Reseñas**: Calificación con número de reviews
- **Descripción**: Información detallada del negocio


#### Acciones Disponibles
- **Botón "Reservar Ahora"**: Navega a página de reserva
- **Compartir**: Compartir en redes sociales
- **Favoritos**: Agregar a favoritos (si está logueado)
- **Ver en Mapa**: Abrir mapa interactivo



### 5. Página de Detalle del servicio (ServiceDetailPage)

#### Información Mostrada
- **Galería de Fotos**: imágenes de los servicios ofrecidos
- **Nombre**: Título principal
- **Descripción**: Información detallada del servicio


#### Acciones Disponibles
- **Botón "seleccionar" servicio**

### 6. Página de Detalle del lugar (ServiceDetailPage)

#### Información Mostrada
- **Galería de Fotos**: imágenes de las ubicaciones dispnibles, si existe mas de una sede
- **Nombre**: Título principal
- **Descripción** direccion del lugar


#### Acciones Disponibles
- **Botón "seleccionar" lugar**

### 7. Página de Reserva (ServiceBookingPage)

#### Flujo de Reserva (Multi-step)

**Paso 1: Selección de Servicio/Profesional**
- Selección de colaborador/profesional
- Visualización de disponibilidad

**Paso 2: Selección de Fecha y Hora**
- Calendario interactivo
- Horarios disponibles del colaborador seleccionado
- Visualización de slots ocupados/ con selector de vista de mostrar solo slots disponibles

**Paso 3: Información del Cliente**
- Si no está logueado: formulario de login/registro
- Si está logueado: muestra información guardada
- Campos: nombre, email, teléfono

**Paso 4: Confirmación y Pago**
- Resumen de la reserva
- Detalles: servicio, profesional, fecha, hora, precio
- Integración con pasarela de pago 
- Confirmación final

---

## 🎨 Diseño y UX

### Estilo Visual
- **Inspiración**: Rappi (diseño moderno, limpio, mobile-first)
- **Colores**: Paleta de Weekly (principalmente usar un verde claro y blanco`)
- **Tipografía**: Moderna y legible
- **Iconos**: Material Symbols

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Desktop**: Layout adaptativo con sidebar
- **Tablet**: Versión intermedia optimizada

### Componentes Principales
- **Header**: Búsqueda, selector de ciudad, login
- **Sidebar**: Navegación y categorías
- **Cards de Servicios**: Grid responsive
- **Filtros**: Dropdowns y selectores
- **Mapa FAB**: Botón flotante para ver mapa

---

## 🔧 Tecnologías y Arquitectura

### Frontend
- **Framework**: React + TypeScript
- **Routing**: React Router v6 con rutas dinámicas
- **Estado**: React Hooks (useState, useEffect)
- **Geolocalización**: Google Maps API
- **Analytics**: Google Analytics integrado
- **Estilos**: CSS Modules + Variables CSS

### Backend
- **API REST**: Endpoints públicos para marketplace
- **Base de Datos**: PostgreSQL (modelo Rappi)
- **Cálculo de Distancia**: Fórmula Haversine para distancia geográfica
- **Filtrado**: Queries optimizadas con índices geográficos

### Integraciones
- **Google Maps API**: Geocoding y reverse geocoding
- **Google Analytics**: Tracking de eventos (búsquedas, clicks, reservas)
- **Sistema de Favoritos**: LocalStorage + Backend sync

---

## 📊 Modelo de Datos (Rappi)

### Tablas Principales

**aliados**
- Información de cada negocio
- Campos: nombre, descripción, email, teléfono, dirección, ciudad, categoría
- `show_in_marketplace`: Controla visibilidad en el marketplace

**establecimientos**
- Sucursales de cada aliado
- Campos: nombre, dirección, latitud, longitud
- Un aliado puede tener múltiples establecimientos

**colaboradores**
- Profesionales que trabajan en los negocios
- Campos: nombre, email, teléfono, rol, tarifa
- Horarios de atención por colaborador

**services**
- Servicios ofrecidos por cada aliado
- Campos: nombre, descripción, duración, precio, categoría

**reservas**
- Citas reservadas por clientes
- Vinculadas a: aliado, establecimiento, colaborador, servicio, perfil_cliente

**usuarios_globales**
- Usuarios globales de la plataforma
- Un usuario puede tener perfiles en múltiples aliados

**perfiles_cliente_aliado**
- Perfil específico de un cliente en cada aliado
- Permite personalización por negocio

---

## 🚀 Flujo de Usuario Típico

### 1. Llegada al Marketplace
```
Usuario entra a weekly.pe
  ↓
Sistema detecta ciudad automáticamente
  ↓
Redirige a weekly.pe/ciudad-detectada
  ↓
Muestra marketplace con negocios de esa ciudad
```

### 2. Búsqueda y Filtrado
```
Usuario busca "peluquería" o selecciona categoría
  ↓
Filtra por ciudad y categoría
  ↓
Ve lista de negocios filtrados
  ↓
Puede ordenar por: distancia, rating, nombre
```

### 3. Selección de Negocio
```
Usuario hace click en un negocio
  ↓
Navega a página de detalle
  ↓
Ve información completa, fotos, servicios
  ↓
Hace click en "Reservar Ahora"
```

### 4. Proceso de Reserva
```
Usuario selecciona servicio y profesional
  ↓
Elige fecha y hora disponible
  ↓
Si no está logueado: se registra o hace login
  ↓
Confirma reserva y paga (si aplica)
  ↓
Recibe confirmación
```

---

## 📈 Analytics y Tracking

### Eventos Rastreados
- **Page Views**: Vistas de marketplace, detalle, reserva
- **Searches**: Búsquedas realizadas por los usuarios
- **Filters**: Uso de filtros (ciudad, categoría, orden)
- **Clicks**: Clicks en negocios, botones, enlaces
- **Bookings**: Inicio y completación de reservas
- **Conversions**: Reservas completadas exitosamente

### Métricas Clave
- Tasa de conversión (visitas → reservas)
- Tiempo promedio en sitio
- Negocios más visitados
- Categorías más buscadas
- Ciudades con más tráfico

---

## 🔐 Seguridad y Privacidad

### Datos del Usuario
- **Geolocalización**: Solo se usa con permiso explícito
- **Información Personal**: Protegida según GDPR/LOPD
- **Pagos**: Integración segura con pasarelas de pago

### Aislamiento de Datos
- Todos los aliados comparten la misma base de datos (modelo Rappi)
- Filtrado por `aliado_id` en todas las queries para aislamiento
- Marketplace muestra solo aliados con `show_in_marketplace = true`

---

## 🎯 Estructura del Sistema

| Componente | Dominio | Propósito |
|------------|---------|-----------|
| **Marketplace** | `weekly.pe` | Plataforma pública donde los clientes buscan y reservan servicios con aliados |
| **Landing Informativa** | `merchants.weekly.pe` | Página informativa para que nuevos negocios se registren como aliados |
| **Usuarios** | Clientes finales | Buscan servicios, hacen reservas con aliados |
| **Aliados** | Negocios registrados | Ofrecen servicios, gestionan reservas a través de su panel (fuera del ecommerce) |
| **Diseño** | Ecommerce estilo Rappi | Interfaz moderna, mobile-first, con geolocalización |

---

## 📝 Notas Técnicas

### Routing
- El routing prioriza `weekly.pe` como dominio principal del marketplace
- Las rutas dinámicas se resuelven con `useParams` de React Router
- El marketplace funciona completamente en `weekly.pe` sin redirecciones

### Performance
- Lazy loading de imágenes
- Paginación de resultados
- Caché de geolocalización
- Índices optimizados en BD para búsquedas geográficas

### Escalabilidad
- Modelo compartido tipo Rappi (una BD por país, todos los aliados comparten la misma BD)
- Filtrado eficiente por `aliado_id` para aislamiento de datos
- Soporte para múltiples países (Perú, Colombia, México, etc.)

---

## 🔮 Roadmap Futuro

### Funcionalidades Pendientes
- [ ] Integración completa de pasarela de pago
- [ ] Sistema de reseñas y calificaciones
- [ ] Chat en tiempo real con negocios
- [ ] Notificaciones push
- [ ] Programa de fidelización
- [ ] Cupones y promociones
- [ ] Búsqueda por voz
- [ ] Modo oscuro

### Mejoras Técnicas
- [ ] Optimización de imágenes (WebP, lazy loading)
- [ ] Service Workers para PWA
- [ ] Mejora de SEO (meta tags, structured data)
- [ ] Internacionalización (i18n)
- [ ] Tests automatizados

---

**Última actualización**: 27 de Noviembre 2024  
**Versión**: 1.0

