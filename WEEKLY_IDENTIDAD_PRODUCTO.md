# WEEKLY - Características Esenciales para la Identidad del Producto

## 1. IDENTIDAD VISUAL Y BRANDING

### Logo del Negocio
- **Campo**: Logo personalizado
- **Formatos soportados**: JPG, PNG, SVG
- **Tamaño máximo**: 2MB
- **Uso**: Se muestra en header, navbar, páginas públicas y emails
- **Almacenamiento**: `logo_url` en tabla `tenants`

### Colores Personalizados
- **Color Principal**: 5 opciones disponibles
  - Violeta (default)
  - Azul
  - Verde
  - Naranja
  - Rosa
- **Color Secundario**: Configurable (campo `secondary_color` en BD)
- **Aplicación**: Botones, enlaces, acentos, elementos interactivos
- **Persistencia**: `color-theme` en localStorage + `primary_color` en BD

## 2. INFORMACIÓN DEL NEGOCIO

### Nombre del Negocio
- **Campo**: `display_name`
- **Requerido**: Sí
- **Uso**: 
  - Header de la aplicación
  - Título de páginas públicas
  - Emails y notificaciones
  - Identificación del tenant

### Información de Contacto
- **Teléfono**: `cliente_telefono`
- **Email**: `cliente_email` (requerido)
- **Dirección**: `cliente_direccion`
- **Ciudad**: `city`
- **Uso**: 
  - Páginas públicas de reserva
  - Perfil del negocio
  - Información de contacto visible

### Descripción del Negocio
- **Campo**: Descripción personalizada
- **Uso**: 
  - Landing pages
  - Marketplace (si está habilitado)
  - Perfil público del negocio

## 3. PERSONALIZACIÓN DE NOMBRES DE ENTIDADES

### Entidades Configurables
Cada tenant puede personalizar los nombres que se muestran en toda la aplicación:

- **Colaboradores**:
  - Singular: `colaborador` (ej: "Empleado", "Profesor", "Instructor")
  - Plural: `colaboradores` (ej: "Empleados", "Profesores", "Instructores")

- **Establecimientos / Servicios**:
  - Singular: `establecimiento` (ej: "Servicio", "Curso", "Tratamiento")
  - Plural: `establecimientos` (ej: "Servicios", "Cursos", "Tratamientos")

- **Clientes**:
  - Singular: `cliente` (ej: "Cliente", "Alumno", "Paciente")
  - Plural: `clientes` (ej: "Clientes", "Alumnos", "Pacientes")

- **Reservas**:
  - Singular: `reserva` (ej: "Reserva", "Cita", "Turno")
  - Plural: `reservas` (ej: "Reservas", "Citas", "Turnos")

- **Recursos**:
  - Singular: `recurso` (ej: "Recurso", "Cancha", "Sillón")
  - Plural: `recursos` (ej: "Recursos", "Canchas", "Sillones")

### Aplicación de Labels
- Se aplican en:
  - Navbar y menús
  - Títulos de páginas
  - Formularios
  - Tablas y listas
  - Estadísticas
  - Mensajes y notificaciones
  - Dashboard

## 4. FUNCIONALIDADES CONFIGURABLES

### Establecimientos / Servicios
- **Toggle**: Habilitar/Deshabilitar
- **Efecto**: 
  - Oculta/muestra sección en Navbar
  - Bloquea acceso a ruta `/servicios`
  - Oculta funcionalidad de gestión de servicios
- **Uso**: Para negocios que no necesitan múltiples establecimientos

### Categorías
- **Toggle**: Habilitar/Deshabilitar
- **Efecto**:
  - Oculta/muestra sección en Navbar
  - Bloquea acceso a ruta `/categorias`
  - Oculta funcionalidad de organización por categorías
- **Uso**: Para negocios simples sin necesidad de categorización

### Recursos Físicos
- **Toggle**: Habilitar/Deshabilitar
- **Efecto**: 
  - Habilita gestión de recursos físicos (canchas, sillones, salas, etc.)
  - Permite reservas por recurso además de por servicio
- **Uso**: Para negocios que necesitan reservar espacios físicos

## 5. CONFIGURACIÓN REGIONAL

### Zona Horaria
- **Campo**: `timezone`
- **Opciones disponibles**:
  - America/Lima (GMT-5)
  - America/Bogota (GMT-5)
  - America/Mexico_City (GMT-6)
  - America/Santiago (GMT-3)
  - America/Buenos_Aires (GMT-3)
  - America/New_York (GMT-5)
  - America/Los_Angeles (GMT-8)
  - Europe/Madrid (GMT+1)
  - UTC (GMT+0)
- **Uso**: 
  - Horarios de disponibilidad
  - Fechas y horas en calendarios
  - Notificaciones programadas

### Idioma / Localización
- **Campo**: `locale`
- **Opciones disponibles**:
  - es-ES (Español España)
  - es-MX (Español México)
  - es-AR (Español Argentina)
  - es-CO (Español Colombia)
  - es-PE (Español Perú)
  - es-CL (Español Chile)
  - en-US (English US)
  - pt-BR (Português Brasil)
- **Uso**: 
  - Formato de fechas
  - Formato de números
  - Mensajes del sistema (futuro)

## 6. MODO DE RESERVA

### Tipos de Reserva
- **Servicio**: Reserva por servicio/tratamiento (default)
- **Recurso**: Reserva por recurso físico (cancha, sala, etc.)
- **Servicio + Recurso**: Reserva combinada (servicio + recurso físico)
- **Campo**: `reservationMode` en config

## 7. PERSISTENCIA Y SINCRONIZACIÓN

### Almacenamiento
- **Producción**: Base de datos global (`tenants` table)
  - Campo `config` (JSONB) para configuración personalizada
  - Campos directos: `display_name`, `logo_url`, `cliente_telefono`, `cliente_email`, `cliente_direccion`, `city`, `timezone`, `locale`
- **Demo**: localStorage del navegador
  - `demo_tenant_config`: Configuración completa
  - `demo_tenant_logo`: Logo en base64
  - `color-theme`: Color seleccionado

### Sincronización Global
- **WebSocket**: Evento `tenant-config-updated` emitido a todos los usuarios del tenant
- **Polling**: Recarga automática cada 60 segundos (fallback)
- **Eventos**: Actualización en tiempo real cuando otro usuario guarda cambios

## 8. CARACTERÍSTICAS TÉCNICAS

### Multi-tenant
- Cada tenant tiene su propia identidad
- Configuración independiente por tenant
- Base de datos separada por tenant (para datos operativos)
- Base de datos global (para configuración de tenant)

### Escalabilidad
- Configuración almacenada en JSONB (PostgreSQL)
- Índices GIN para búsquedas rápidas
- Caché en frontend para mejor rendimiento

### Seguridad
- Configuración solo editable por administradores
- Validación y normalización de datos antes de guardar
- Eventos WebSocket solo para usuarios autenticados del tenant

## 9. CASOS DE USO POR TIPO DE NEGOCIO

### Peluquería / Salón de Belleza
- **Labels**: "Estilista" / "Estilistas", "Servicio" / "Servicios"
- **Features**: Servicios (ON), Categorías (ON), Recursos (OFF)
- **Color**: Rosa o Naranja

### Academia / Clases
- **Labels**: "Profesor" / "Profesores", "Curso" / "Cursos", "Alumno" / "Alumnos"
- **Features**: Servicios (ON), Categorías (ON), Recursos (OFF)
- **Color**: Azul o Verde

### Canchas Deportivas
- **Labels**: "Cancha" / "Canchas", "Reserva" / "Reservas"
- **Features**: Servicios (OFF), Categorías (OFF), Recursos (ON)
- **Color**: Verde

### Clínica / Consultorio
- **Labels**: "Doctor" / "Doctores", "Consulta" / "Consultas", "Paciente" / "Pacientes"
- **Features**: Servicios (ON), Categorías (ON), Recursos (OFF)
- **Color**: Azul

### Spa / Wellness
- **Labels**: "Terapeuta" / "Terapeutas", "Tratamiento" / "Tratamientos"
- **Features**: Servicios (ON), Categorías (ON), Recursos (ON - salas de masaje)
- **Color**: Rosa o Violeta

## 10. ELEMENTOS DE IDENTIDAD VISIBLE

### En la Aplicación
- Logo en header/navbar
- Nombre del negocio en header
- Colores personalizados en toda la UI
- Nombres personalizados en menús y títulos

### En Páginas Públicas
- Logo del negocio
- Nombre del negocio
- Información de contacto
- Descripción del negocio
- Colores del tema

### En Emails y Notificaciones
- Logo del negocio
- Nombre del negocio
- Información de contacto
- Colores del tema (si aplica)

## 11. CONFIGURACIÓN POR DEFECTO

### Valores Iniciales
- **Nombre**: "Demo Weekly" (en demo) o nombre del tenant
- **Logo**: Ninguno (placeholder)
- **Color**: Violeta
- **Timezone**: America/Lima
- **Locale**: es-ES
- **Features**: Servicios (ON), Categorías (ON), Recursos (OFF)
- **Labels**: Valores estándar (Colaborador, Establecimiento, Cliente, Reserva, Recurso)

## 12. LIMITACIONES Y CONSIDERACIONES

### Demo Mode
- Configuración se guarda en localStorage (no persistente entre dispositivos)
- No hay sincronización entre usuarios en demo
- Logo se almacena como base64 (limitado por tamaño)

### Producción
- Configuración es global para todo el tenant
- Cambios se propagan a todos los usuarios en tiempo real
- Logo se almacena en servidor/CDN (URL)

### Validaciones
- Nombre del negocio: Requerido, máximo 255 caracteres
- Logo: Máximo 2MB, formatos: JPG, PNG, SVG
- Email: Formato válido de email
- Labels: Texto plano, sin caracteres especiales peligrosos

---

**Última actualización**: Noviembre 2024
**Versión del documento**: 1.0

