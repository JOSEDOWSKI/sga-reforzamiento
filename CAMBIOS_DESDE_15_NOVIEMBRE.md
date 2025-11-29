# Resumen de Cambios en el Diagrama de BD - Desde 15 de Noviembre

**Período:** 15 de Noviembre 2024 - 27 de Noviembre 2024  
**Última actualización:** 27 de Noviembre 2024

## 📅 Fechas de Cambios Principales

### Noviembre 2024

- **19 de Noviembre:** Adaptación del frontend a nueva estructura de base de datos
- **20 de Noviembre:** 
  - Sistema de perfil de usuario para marketplace
  - Sprint 1 - Marketplace con geolocalización y filtros estilo Rappi
- **21 de Noviembre:** 
  - Transformación a plataforma de reservas de servicios
  - Mejoras en routing y navegación del marketplace
  - Correcciones de TypeScript y WebSocket
- **27 de Noviembre:** 
  - Recreación completa de MarketplacePage desde cero
  - Mejoras en diseño moderno del ecommerce

### Cambios en Diagrama de BD (diagrama-bd-rappi.dbml)

**Nota:** Los cambios en el diagrama de BD se realizaron durante las conversaciones del 19-27 de noviembre, pero el archivo no tiene commits específicos en git. Los cambios reflejan la evolución del modelo de datos hacia el modelo Rappi.

## 📋 Tabla de Contenidos
1. [Tablas Eliminadas](#tablas-eliminadas)
2. [Tablas Nuevas](#tablas-nuevas)
3. [Tablas Modificadas](#tablas-modificadas)
4. [Cambios en Campos](#cambios-en-campos)
5. [Cambios en Índices](#cambios-en-índices)
6. [Cambios en Relaciones](#cambios-en-relaciones)

---

## 🗑️ Tablas Eliminadas

### 1. `usuarios`
**Razón:** Se fusionó con `colaboradores` - Los colaboradores ahora pueden hacer login directamente.

**Campos que se movieron a `colaboradores`:**
- `password_hash`
- `rol`
- `activo`
- `ultimo_acceso`

### 2. `resources`
**Razón:** No se usaba en el sistema.

**Impacto:** Se eliminó `resource_id` de la tabla `reservas`.

### 3. `usuarios_marketplace`
**Razón:** Se reemplazó por `usuarios_globales` y `perfiles_cliente_aliado`.

### 4. `reservas_marketplace`
**Razón:** Se usa directamente `reservas` con `perfiles_cliente_aliado`.

---

## ✨ Tablas Nuevas

### 1. `usuarios_globales`
**Propósito:** Almacena información global de todos los clientes de la plataforma.

**Campos:**
- `id` (PK)
- `email` (único global)
- `password_hash` (opcional)
- `telefono`
- `created_at`, `updated_at`

**Índices:**
- `(email) [unique]`
- `(telefono)`

### 2. `perfiles_cliente_aliado`
**Propósito:** Almacena perfiles específicos de un cliente en cada aliado (reemplaza `clientes`).

**Campos:**
- `id` (PK)
- `aliado_id` (FK a `aliados`)
- `usuario_global_id` (FK a `usuarios_globales`)
- `notes`
- `activo`
- `created_at`, `updated_at`

**Índices:**
- `(aliado_id)`
- `(usuario_global_id)`
- `(aliado_id, usuario_global_id) [unique]`

---

## 🔄 Tablas Modificadas

### 1. `aliados`

#### Campos Eliminados:
- ❌ `latitud` - Movido a `establecimientos`
- ❌ `longitud` - Movido a `establecimientos`
- ❌ `primary_color` - No se usa
- ❌ `secondary_color` - No se usa
- ❌ `locale` - No se usa
- ❌ `plan` - No se usa
- ❌ `config` - No se usa
- ❌ `tipo_negocio` - Eliminado (se usa `categoria`)

#### Campos Agregados:
- ✅ `descripcion` - Descripción del negocio

#### Índices Eliminados:
- ❌ `(tipo_negocio)`
- ❌ `config [type: gin]`

---

### 2. `colaboradores`

#### Campos Agregados:
- ✅ `password_hash` - Contraseña encriptada (bcrypt)
- ✅ `rol` - admin, vendedor, colaborador
- ✅ `activo` - Ya existía, ahora más relevante
- ✅ `ultimo_acceso` - Última vez que hizo login

#### Campos Eliminados:
- ❌ `especialidades` - Array de especialidades

#### Índices Agregados:
- ✅ `(aliado_id, email) [unique]` - CRÍTICO: Unicidad de Email dentro del Aliado

---

### 3. `establecimientos`

#### Campos Eliminados:
- ❌ `descripcion`
- ❌ `tipo_negocio`

#### Campos Agregados:
- ✅ `latitud numeric(10, 8)` - Coordenada Latitud del Establecimiento
- ✅ `longitud numeric(11, 8)` - Coordenada Longitud del Establecimiento

**Razón:** Las coordenadas ahora están a nivel de establecimiento (más preciso que a nivel de aliado).

---

### 4. `categorias`

#### Campos Eliminados:
- ❌ `color` - Color hexadecimal para UI
- ❌ `establecimiento_id` - No es necesario, todos los establecimientos de un aliado ofrecen los mismos servicios

**Razón:** Las categorías ahora son por aliado, no por establecimiento.

#### Índices Eliminados:
- ❌ `(establecimiento_id)`

---

### 5. `horarios_atencion`

#### Cambio Crítico:
- ❌ `establecimiento_id` → ✅ `colaborador_id`

**Razón:** Los horarios ahora son **por colaborador**, no por establecimiento. Las reservas jalan el horario del colaborador.

#### Índices Modificados:
- ❌ `(establecimiento_id, dia_semana) [unique]`
- ✅ `(colaborador_id, dia_semana) [unique]`
- ✅ `(colaborador_id)` - Índice crítico para obtener horarios del colaborador

---

### 6. `reservas`

#### Campos Eliminados:
- ❌ `resource_id` - Referencia a tabla `resources` eliminada
- ❌ `creado_por` - Referencia a tabla `usuarios` eliminada
- ❌ `servicio_descripcion` - Campo DEPRECATED

#### Campos Agregados:
- ✅ `recurrence_rule text` - Regla de recurrencia en formato iCalendar (RRULE). NULL si es reserva única.
- ✅ `recurrence_id int` - ID del evento Maestro. NULL si es el Maestro o reserva única.

#### Campos Modificados:
- `cliente_id` → `perfil_cliente_id` (FK a `perfiles_cliente_aliado`)

#### Índices Agregados:
- ✅ `(recurrence_id)` - Para buscar rápidamente las excepciones de una serie recurrente

#### Índices Modificados:
- `(cliente_id)` → `(perfil_cliente_id)`

---

### 7. `notifications`

#### Campos Modificados:
- `client_id` → `perfil_cliente_id` (FK a `perfiles_cliente_aliado`)

#### Índices Modificados:
- `(client_id)` → `(perfil_cliente_id)`

---

## 📊 Cambios en Campos

### Resumen por Tipo de Cambio

| Tabla | Campos Eliminados | Campos Agregados | Campos Modificados |
|-------|------------------|------------------|-------------------|
| `aliados` | 8 | 1 | 0 |
| `colaboradores` | 1 | 4 | 0 |
| `establecimientos` | 2 | 2 | 0 |
| `categorias` | 2 | 0 | 0 |
| `horarios_atencion` | 1 | 1 | 0 |
| `reservas` | 3 | 2 | 1 |
| `notifications` | 0 | 0 | 1 |

**Total:**
- ❌ **17 campos eliminados**
- ✅ **10 campos agregados**
- 🔄 **2 campos modificados**

---

## 🔗 Cambios en Relaciones

### Relaciones Eliminadas:
- `reservas.resource_id` → `resources.id`
- `reservas.creado_por` → `usuarios.id`
- `horarios_atencion.establecimiento_id` → `establecimientos.id`
- `categorias.establecimiento_id` → `establecimientos.id`
- `reservas.cliente_id` → `clientes.id`
- `notifications.client_id` → `clientes.id`

### Relaciones Nuevas:
- `perfiles_cliente_aliado.aliado_id` → `aliados.id`
- `perfiles_cliente_aliado.usuario_global_id` → `usuarios_globales.id`
- `horarios_atencion.colaborador_id` → `colaboradores.id`
- `reservas.perfil_cliente_id` → `perfiles_cliente_aliado.id`
- `notifications.perfil_cliente_id` → `perfiles_cliente_aliado.id`
- `reservas.recurrence_id` → `reservas.id` (self-reference)

---

## 🎯 Cambios Conceptuales Importantes

### 1. **Modelo de Usuarios/Colaboradores**
**Antes:** Dos tablas separadas (`usuarios` y `colaboradores`)
**Ahora:** Una sola tabla (`colaboradores`) con capacidad de login

### 2. **Modelo de Clientes**
**Antes:** `clientes` por aliado (duplicación de datos)
**Ahora:** `usuarios_globales` + `perfiles_cliente_aliado` (cliente único, perfiles por aliado)

### 3. **Horarios**
**Antes:** Horarios por establecimiento
**Ahora:** Horarios por colaborador (más flexible)

### 4. **Coordenadas**
**Antes:** Coordenadas en `aliados`
**Ahora:** Coordenadas en `establecimientos` (más preciso)

### 5. **Recurrencia**
**Antes:** No soportaba recurrencia
**Ahora:** Soporte completo de recurrencia con `recurrence_rule` y `recurrence_id`

---

## 📝 Notas de Migración

### Prioridad Alta:
1. **Migrar `clientes` a `usuarios_globales` + `perfiles_cliente_aliado`**
   - Crear usuarios globales únicos
   - Crear perfiles por aliado
   - Actualizar referencias en `reservas` y `notifications`

2. **Migrar `usuarios` a `colaboradores`**
   - Agregar campos de login a colaboradores existentes
   - Actualizar referencias

3. **Migrar `horarios_atencion`**
   - Cambiar `establecimiento_id` por `colaborador_id`
   - Asignar horarios a colaboradores

### Prioridad Media:
4. **Eliminar tablas obsoletas**
   - `resources`
   - `usuarios_marketplace`
   - `reservas_marketplace`

5. **Limpiar campos obsoletos**
   - Eliminar campos eliminados de `aliados`
   - Eliminar campos eliminados de otras tablas

### Prioridad Baja:
6. **Agregar campos nuevos**
   - `recurrence_rule` y `recurrence_id` en `reservas`
   - `latitud` y `longitud` en `establecimientos`

---

## 🔍 Verificación Post-Migración

### Checklist:
- [ ] Todos los `cliente_id` actualizados a `perfil_cliente_id`
- [ ] Todos los `client_id` actualizados a `perfil_cliente_id`
- [ ] Todos los `establecimiento_id` en `horarios_atencion` actualizados a `colaborador_id`
- [ ] Índice único `(aliado_id, email)` creado en `colaboradores`
- [ ] Índice `(recurrence_id)` creado en `reservas`
- [ ] Tablas obsoletas eliminadas
- [ ] Campos obsoletos eliminados
- [ ] Coordenadas migradas de `aliados` a `establecimientos`

---

## 📚 Documentación Relacionada

- `CAMBIOS_BD_RAPPI.md` - Cambios iniciales del modelo Rappi
- `CAMBIOS_USUARIOS_GLOBALES.md` - Detalles del nuevo modelo de clientes
- `RECURRENCIA_RESERVAS.md` - Sistema de recurrencia
- `EXPLICACION_BUSINESS_HOURS_SPECIAL_DAYS.md` - Horarios y días especiales

---

## 📅 Timeline Detallado de Cambios

### 19 de Noviembre 2024
- **13:02-13:04:** Mejoras en manejo de errores y logs de conexión a BD
- **12:38-12:54:** Adaptación de estilos web a diseño de app móvil Flutter
- **12:43:** Reestructuración de routing - merchants.weekly.pe para landing y weekly.pe para marketplace
- **12:50:** Integración de calendario público con marketplace y filtros por servicios
- **10:27:** Eliminación de frontend de inmuebles y reversión de GestionStaff
- **10:56:** Adaptación del frontend a nueva estructura de base de datos

### 20 de Noviembre 2024
- **09:06:** Forzar ecommerce en weekly.pe
- **10:39:** Fix: merchants.weekly.pe debe mostrar LandingPage siempre
- **13:50:** Sprint 1 - Marketplace con geolocalización y filtros estilo Rappi
- **13:52:** Sistema de perfil de usuario para marketplace
- **22:30-22:38:** Completar migración de estilos estrictos y funcionalidades del marketplace

### 21 de Noviembre 2024
- **12:11-12:21:** Correcciones de CSS y CORS para marketplace
- **12:23:** Agregar sidebar visible por defecto estilo Rappi
- **12:28:** Agregar secciones estilo Rappi al marketplace
- **12:45-12:48:** Mejoras en navegación y estado vacío del marketplace
- **13:04-13:17:** Prevenir detección de tenant en marketplace domain
- **13:30:** Fix routing para prevenir detección de tenant
- **14:00:** Crear nuevo flujo de reserva del marketplace
- **14:05-14:15:** Correcciones de TypeScript y WebSocket
- **14:23:** Prevenir completamente intentos de conexión WebSocket en weekly.pe
- **15:01:** Transformación a plataforma de reservas de servicios (selectors, routing, UI)
- **15:06-16:33:** Múltiples fixes de UI, sidebar, y version bumps

### 27 de Noviembre 2024
- **12:08:** Mejorar página de marketplace con diseño moderno
- **12:22:** Eliminar variable index no utilizada
- **13:49:** Recrear MarketplacePage desde cero

---

## 📊 Estadísticas de Cambios

### Commits Relacionados con BD/Marketplace (desde 15 Nov)
- **Total de commits:** ~80 commits desde 15 de noviembre
- **Commits relacionados con BD:** 3 commits principales
- **Commits relacionados con Marketplace:** ~25 commits
- **Commits de fixes y mejoras:** ~50 commits

### Archivos Modificados (Estimado)
- **Backend:** ~15 archivos
- **Frontend:** ~20 archivos
- **Documentación:** ~10 archivos MD
- **Configuración:** ~5 archivos

---

**Fecha de Resumen:** 15 de Noviembre 2024  
**Última Actualización:** 27 de Noviembre 2024  
**Período Cubierto:** 12 días de desarrollo activo

