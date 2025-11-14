# 📱 Visión: Aplicación Móvil Multi-Tenant (Tipo Rappi)

## 🎯 Concepto

Aplicación móvil donde los usuarios pueden:
- **Ver múltiples tenants/negocios** en un solo lugar (como Rappi muestra restaurantes)
- **Explorar y reservar** en diferentes negocios desde la misma app
- **Gestionar todas sus reservas** en un solo lugar, independientemente del negocio

---

## 🏪 Modelo de Negocio

### Analogía con Rappi
- **Rappi:** Muestra múltiples restaurantes → Usuario elige → Pide comida
- **WEEKLY App:** Muestra múltiples negocios → Usuario elige → Reserva cita/servicio

### Ejemplos de Tenants en la App
- 🏋️ Gimnasios
- 💇 Peluquerías
- 🦷 Clínicas dentales
- 🎓 Academias
- ⚽ Canchas de fútbol
- 🏥 Veterinarias
- 💆 Spas
- Y más...

---

## 🏗️ Arquitectura Propuesta

### 1. Backend Actual (Ya Listo ✅)

El backend actual ya soporta:
- ✅ Multi-tenant con BDs separadas
- ✅ API pública para cada tenant (`/api/public/*`)
- ✅ Configuración personalizada por tenant
- ✅ Timezone y horarios por tenant

### 2. Nuevas APIs Necesarias

#### A) API de Discovery (Búsqueda de Tenants)

**Endpoint:** `GET /api/public/tenants`

**Funcionalidad:**
- Listar todos los tenants activos
- Filtrar por categoría/tipo de negocio
- Filtrar por ubicación (geolocalización)
- Ordenar por distancia, rating, etc.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenant_name": "peluqueria-bella-vista",
      "display_name": "Peluquería Bella Vista",
      "categoria": "peluqueria",
      "direccion": "Av. Principal 123, Lima",
      "latitud": -12.0464,
      "longitud": -77.0428,
      "telefono": "+51 987 654 321",
      "rating": 4.5,
      "imagen_url": "https://...",
      "horarios": {
        "lunes": "9:00-18:00",
        "martes": "9:00-18:00"
      },
      "servicios_disponibles": 5
    }
  ],
  "metadata": {
    "total": 50,
    "filtros_aplicados": {...}
  }
}
```

#### B) API de Reservas Multi-Tenant

**Endpoint:** `POST /api/public/reservas`

**Funcionalidad:**
- Crear reserva en cualquier tenant
- Validar disponibilidad
- Enviar confirmación

**Request:**
```json
{
  "tenant_name": "peluqueria-bella-vista",
  "colaborador_id": 1,
  "establecimiento_id": 1,
  "fecha_hora_inicio": "2025-11-15T10:00:00Z",
  "fecha_hora_fin": "2025-11-15T11:00:00Z",
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "+51 987 654 321",
    "email": "juan@example.com"
  },
  "servicio_descripcion": "Corte de cabello"
}
```

#### C) API de Reservas del Usuario

**Endpoint:** `GET /api/user/reservas`

**Funcionalidad:**
- Obtener todas las reservas del usuario (de todos los tenants)
- Filtrar por estado, fecha, tenant
- Historial completo

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenant_name": "peluqueria-bella-vista",
      "tenant_display_name": "Peluquería Bella Vista",
      "fecha_hora_inicio": "2025-11-15T10:00:00Z",
      "fecha_hora_fin": "2025-11-15T11:00:00Z",
      "estado": "confirmada",
      "servicio": "Corte de cabello",
      "colaborador": "María González",
      "direccion": "Av. Principal 123, Lima"
    }
  ]
}
```

#### D) API de Autenticación de Usuario

**Endpoint:** `POST /api/auth/mobile/register`
**Endpoint:** `POST /api/auth/mobile/login`

**Funcionalidad:**
- Registro/login de usuarios de la app móvil
- No está vinculado a un tenant específico
- Puede reservar en múltiples tenants

---

## 📊 Modelo de Datos

### Nueva Tabla: `usuarios_movil` (BD Global)

```sql
CREATE TABLE usuarios_movil (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_url VARCHAR(500),
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Nueva Tabla: `reservas_movil` (BD Global)

```sql
CREATE TABLE reservas_movil (
    id SERIAL PRIMARY KEY,
    usuario_movil_id INTEGER REFERENCES usuarios_movil(id) ON DELETE CASCADE,
    tenant_name VARCHAR(100) NOT NULL,
    reserva_tenant_id INTEGER NOT NULL, -- ID de la reserva en la BD del tenant
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_name, reserva_tenant_id)
);
```

### Nueva Tabla: `tenant_categorias` (BD Global)

```sql
CREATE TABLE tenant_categorias (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL, -- peluqueria, gimnasio, veterinaria, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_categorias_categoria ON tenant_categorias(categoria);
```

---

## 🔄 Flujo de Usuario

### 1. Explorar Negocios
```
Usuario abre app
  ↓
Ve lista de negocios cercanos (con mapa)
  ↓
Filtra por categoría (peluquería, gimnasio, etc.)
  ↓
Selecciona un negocio
  ↓
Ve detalles: servicios, horarios, disponibilidad
```

### 2. Hacer Reserva
```
Usuario selecciona servicio/colaborador
  ↓
Selecciona fecha y hora disponible
  ↓
Completa datos (si no está logueado, se registra)
  ↓
Confirma reserva
  ↓
Recibe confirmación (push notification + email)
```

### 3. Gestionar Reservas
```
Usuario ve todas sus reservas
  ↓
Filtra por tenant, fecha, estado
  ↓
Puede cancelar/modificar (según políticas del tenant)
  ↓
Ve historial completo
```

---

## 🛠️ Implementación Técnica

### Backend (Node.js/Express)

**Nuevos Endpoints:**
- `GET /api/public/tenants` - Listar tenants con filtros
- `GET /api/public/tenant/:tenantName/details` - Detalles completos del tenant
- `POST /api/auth/mobile/register` - Registro de usuario móvil
- `POST /api/auth/mobile/login` - Login de usuario móvil
- `GET /api/user/reservas` - Reservas del usuario
- `POST /api/user/reservas` - Crear reserva (multi-tenant)
- `PUT /api/user/reservas/:id/cancel` - Cancelar reserva

**Nuevos Servicios:**
- `mobileAuthService.js` - Autenticación de usuarios móviles
- `tenantDiscoveryService.js` - Búsqueda y filtrado de tenants
- `multiTenantReservaService.js` - Gestión de reservas multi-tenant

### Frontend Móvil (React Native / Flutter)

**Pantallas Principales:**
1. **Home/Explorar**
   - Mapa con negocios cercanos
   - Lista de negocios
   - Filtros (categoría, distancia, rating)

2. **Detalle de Negocio**
   - Información del negocio
   - Servicios disponibles
   - Horarios
   - Calendario de disponibilidad

3. **Reserva**
   - Selección de servicio/colaborador
   - Selección de fecha/hora
   - Formulario de datos
   - Confirmación

4. **Mis Reservas**
   - Lista de reservas activas
   - Historial
   - Detalles de cada reserva

5. **Perfil**
   - Datos del usuario
   - Preferencias
   - Historial completo

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación:**
   - JWT tokens para usuarios móviles
   - Refresh tokens
   - OAuth2 para login social (Google, Facebook)

2. **Autorización:**
   - Usuarios móviles solo pueden ver/modificar sus propias reservas
   - Validación de tenant activo antes de permitir reservas

3. **Rate Limiting:**
   - Límites por usuario/IP
   - Prevenir spam de reservas

4. **Validación:**
   - Verificar disponibilidad antes de crear reserva
   - Validar datos del usuario
   - Sanitizar inputs

---

## 📱 Features Adicionales (Futuro)

1. **Notificaciones Push:**
   - Recordatorio de reserva
   - Confirmación de reserva
   - Cambios en reserva

2. **Calificaciones y Reviews:**
   - Usuarios pueden calificar negocios
   - Sistema de reviews

3. **Favoritos:**
   - Guardar negocios favoritos
   - Acceso rápido

4. **Historial y Estadísticas:**
   - Historial completo de reservas
   - Estadísticas personales

5. **Integración con Maps:**
   - Navegación al negocio
   - Distancia y tiempo estimado

6. **Pagos:**
   - Integración con pasarelas de pago
   - Pagos anticipados o en el lugar

---

## 🚀 Roadmap de Implementación

### Fase 1: Backend APIs (2-3 semanas)
- [ ] Crear tabla `usuarios_movil`
- [ ] Crear tabla `reservas_movil`
- [ ] Crear tabla `tenant_categorias`
- [ ] Implementar API de discovery
- [ ] Implementar autenticación móvil
- [ ] Implementar API de reservas multi-tenant

### Fase 2: App Móvil MVP (4-6 semanas)
- [ ] Setup React Native / Flutter
- [ ] Pantalla de exploración
- [ ] Pantalla de detalle de negocio
- [ ] Pantalla de reserva
- [ ] Pantalla de mis reservas
- [ ] Autenticación

### Fase 3: Features Avanzadas (2-3 semanas)
- [ ] Notificaciones push
- [ ] Geolocalización y mapas
- [ ] Filtros avanzados
- [ ] Calificaciones

### Fase 4: Optimización (1-2 semanas)
- [ ] Performance
- [ ] Caché
- [ ] Analytics
- [ ] Testing

---

## 📝 Notas Técnicas

### Sincronización de Reservas

Cuando se crea una reserva desde la app móvil:
1. Se crea en la BD del tenant (como reserva normal)
2. Se crea registro en `reservas_movil` (BD global) para tracking
3. Se envía notificación al tenant
4. Se envía confirmación al usuario móvil

### Búsqueda y Filtrado

Para búsqueda eficiente de tenants:
- Índices en `tenant_categorias`
- Índices en `tenants` (latitud, longitud)
- Caché de resultados frecuentes
- Paginación

### Escalabilidad

- CDN para imágenes de tenants
- Caché Redis para búsquedas frecuentes
- Load balancing para APIs
- Base de datos optimizada para consultas geográficas

---

**Última actualización:** 2025-11-10


