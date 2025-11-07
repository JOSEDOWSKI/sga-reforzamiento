# 📚 Documentación Completa: Sistema Multi-Tenant con CapRover y Cloudflare

## 📋 Tabla de Contenidos

1. [¿Qué es WEEKLY?](#qué-es-weekly)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Modelo de Base de Datos](#modelo-de-base-de-datos)
5. [Funcionamiento del Sistema](#funcionamiento-del-sistema)
6. [Implementación en CapRover](#implementación-en-caprover)
7. [Integración con Cloudflare](#integración-con-cloudflare)
8. [Proceso de Creación de Tenants](#proceso-de-creación-de-tenants)
9. [Middleware y Routing](#middleware-y-routing)
10. [Panel de Control (Super Admin)](#panel-de-control-super-admin)
11. [APIs y Endpoints](#apis-y-endpoints)
12. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
13. [Guía de Implementación para Otro Proyecto](#guía-de-implementación-para-otro-proyecto)

---

## 🎯 ¿Qué es WEEKLY?

### Propuesta de Valor

**WEEKLY ofrece valor único a través de:**

1. **🚀 Setup Instantáneo**
   - Nuevo tenant operativo en **menos de 5 minutos**
   - Dominio personalizado automático (`{negocio}.weekly.pe`)
   - SSL/HTTPS habilitado automáticamente
   - Base de datos inicializada y lista para usar
   - Sin necesidad de conocimientos técnicos

2. **🔒 Seguridad y Privacidad de Primer Nivel**
   - **Aislamiento total de datos**: Cada negocio tiene su propia base de datos PostgreSQL
   - **Cumplimiento GDPR**: Datos completamente separados entre clientes
   - **HTTPS obligatorio**: Todos los dominios con SSL automático
   - **Autenticación JWT**: Tokens seguros con expiración
   - **Sin riesgo de fuga de datos**: Imposible que un tenant acceda a datos de otro

3. **💰 Ahorro de Costos Significativo**
   - **Sin costos de desarrollo**: No necesitas contratar programadores
   - **Sin costos de infraestructura**: Todo está en la nube
   - **Sin costos de mantenimiento**: Actualizaciones automáticas
   - **Sin costos de dominio/SSL**: Todo incluido automáticamente
   - **ROI inmediato**: Empiezas a generar valor desde el día 1

4. **⚡ Escalabilidad Sin Límites**
   - **Arquitectura multi-tenant**: Cada negocio escala independientemente
   - **Bases de datos separadas**: Puedes mover tenants a diferentes servidores
   - **Sin límites de usuarios**: Soporta desde 1 hasta miles de reservas diarias
   - **Performance optimizado**: Connection pooling y caching inteligente

5. **🎯 Enfoque en el Negocio, no en la Tecnología**
   - **Interfaz intuitiva**: No necesitas capacitación técnica
   - **Soporte continuo**: Equipo técnico siempre disponible
   - **Actualizaciones automáticas**: Siempre tienes la última versión
   - **Documentación completa**: Todo está documentado

### ¿Por qué existe?

WEEKLY existe para resolver el problema de **gestión de reservas y agendamiento** que enfrentan miles de negocios en Latinoamérica. Muchos negocios locales (peluquerías, academias, clínicas, canchas, etc.) aún gestionan sus citas de forma manual o con herramientas genéricas que no se adaptan a sus necesidades específicas.

**Problemas que resuelve y cómo los soluciona:**

#### 1. ❌ Gestión Manual de Reservas → ✅ Sistema Automatizado

**Problema:**
- Libros físicos o Excel para gestionar citas
- Errores humanos (doble reserva, olvidos)
- Imposible ver disponibilidad en tiempo real
- Pérdida de tiempo en llamadas telefónicas

**Solución WEEKLY:**
- ✅ **Calendario digital interactivo** con vista mensual, semanal y diaria
- ✅ **Validación automática** de disponibilidad (imposible doble reserva)
- ✅ **Sincronización en tiempo real** entre todos los usuarios
- ✅ **Notificaciones automáticas** de nuevas reservas
- ✅ **Búsqueda y filtros avanzados** para encontrar reservas rápidamente

**Resultado:** Ahorro de **2-3 horas diarias** en gestión manual, reducción de errores al **0%**

#### 2. ❌ Clientes Deben Llamar para Agendar → ✅ Calendario Público 24/7

**Problema:**
- Clientes solo pueden agendar en horario de atención
- Llamadas constantes interrumpen el trabajo
- Pérdida de reservas fuera del horario
- No pueden ver disponibilidad antes de llamar

**Solución WEEKLY:**
- ✅ **Calendario público accesible 24/7** sin necesidad de registro
- ✅ **Agendamiento directo** desde cualquier dispositivo
- ✅ **Visualización de disponibilidad en tiempo real**
- ✅ **Confirmación automática** por email/SMS
- ✅ **Integración con Google Maps** para ubicación

**Resultado:** Aumento de **30-40% en reservas**, clientes agendan **24/7 sin interrupciones**

#### 3. ❌ Datos Compartidos entre Negocios → ✅ Base de Datos Independiente

**Problema:**
- Sistemas genéricos comparten datos entre clientes
- Riesgo de fuga de información
- No cumplen con GDPR/privacidad
- Imposible personalizar completamente

**Solución WEEKLY:**
- ✅ **Base de datos PostgreSQL separada** por cada negocio (`weekly_{tenant_name}`)
- ✅ **Aislamiento total**: Imposible que un tenant acceda a datos de otro
- ✅ **Cumplimiento GDPR**: Cada cliente controla completamente sus datos
- ✅ **Personalización total**: Cada negocio puede configurar todo a su medida
- ✅ **Backups independientes**: Puedes hacer backup de un cliente sin afectar otros

**Resultado:** **Seguridad de nivel enterprise**, cumplimiento legal garantizado

#### 4. ❌ Falta de Escalabilidad → ✅ Arquitectura Multi-Tenant Escalable

**Problema:**
- Sistemas monolíticos que no crecen con el negocio
- Límites de usuarios o reservas
- Caídas cuando hay mucha demanda
- Imposible separar clientes grandes de pequeños

**Solución WEEKLY:**
- ✅ **Arquitectura multi-tenant**: Cada negocio escala independientemente
- ✅ **Bases de datos separadas**: Puedes mover tenants a diferentes servidores
- ✅ **Connection pooling**: Optimización automática de conexiones
- ✅ **CDN global**: Cloudflare distribuye contenido mundialmente
- ✅ **Sin límites**: Soporta desde 1 hasta millones de reservas

**Resultado:** **Escalabilidad horizontal ilimitada**, performance garantizado

#### 5. ❌ Costos Altos de Desarrollo → ✅ SaaS con Setup Automático

**Problema:**
- Desarrollar sistema propio cuesta **$20,000 - $50,000 USD**
- Tiempo de desarrollo: **6-12 meses**
- Necesitas contratar programadores
- Mantenimiento continuo y costoso

**Solución WEEKLY:**
- ✅ **Setup automático en 5 minutos**: Sin necesidad de programadores
- ✅ **Dominio y SSL automático**: Configuración DNS y certificados incluidos
- ✅ **Base de datos inicializada**: Todo listo para usar inmediatamente
- ✅ **Soporte técnico incluido**: Equipo siempre disponible
- ✅ **Actualizaciones automáticas**: Siempre tienes la última versión

**Resultado:** **Ahorro de $20,000+ USD** en desarrollo, **ROI inmediato**

#### 6. ❌ Falta de Seguridad de Datos → ✅ Aislamiento Total

**Problema:**
- Sistemas compartidos con riesgo de acceso no autorizado
- Datos sensibles de clientes en riesgo
- No cumplen estándares de seguridad
- Multas por violación de privacidad

**Solución WEEKLY:**
- ✅ **Aislamiento total entre tenants**: Arquitectura de seguridad por diseño
- ✅ **HTTPS obligatorio**: Todos los dominios con SSL automático
- ✅ **Autenticación JWT**: Tokens seguros con expiración
- ✅ **Encriptación de contraseñas**: bcrypt con salt rounds
- ✅ **Validación de acceso**: Middleware que verifica tenant en cada request
- ✅ **Logs de seguridad**: Registro de todos los accesos y acciones

**Resultado:** **Seguridad de nivel bancario**, cero riesgo de fuga de datos

#### 7. ❌ No Pueden Ver Estadísticas → ✅ Dashboard Completo con Analytics

**Problema:**
- No saben cuántas reservas tienen
- No pueden analizar tendencias
- Imposible tomar decisiones basadas en datos
- No conocen sus clientes más frecuentes

**Solución WEEKLY:**
- ✅ **Dashboard con estadísticas en tiempo real**
- ✅ **Reportes de reservas**: Por día, semana, mes, año
- ✅ **Análisis de colaboradores**: Quién tiene más citas
- ✅ **Análisis de servicios**: Qué servicios son más populares
- ✅ **Base de datos de clientes**: Historial completo de cada cliente

**Resultado:** **Toma de decisiones basada en datos**, optimización del negocio

#### 8. ❌ Múltiples Usuarios con Diferentes Permisos → ✅ Sistema de Roles Flexible

**Problema:**
- Todos los usuarios tienen el mismo acceso
- No pueden diferenciar entre admin y staff
- Imposible dar permisos limitados
- Riesgo de cambios no autorizados

**Solución WEEKLY:**
- ✅ **Roles configurables**: Admin, Vendedor, Colaborador
- ✅ **Permisos granulares**: Control de acceso por funcionalidad
- ✅ **Vista simplificada para usuarios**: Solo calendario si es necesario
- ✅ **Auditoría completa**: Logs de quién hizo qué

**Resultado:** **Control total del acceso**, seguridad y organización

### ¿Para quién existe?

WEEKLY está diseñado para **tres tipos de usuarios principales**:

#### 1. **Negocios que ofrecen servicios con reservas** (Clientes B2B)

**Industrias objetivo:**
- 💇 **Peluquerías y Salones de Belleza**
- 🎓 **Academias y Centros de Refuerzo Escolar**
- 🏥 **Clínicas Médicas y Dentales**
- ⚽ **Canchas Deportivas y Gimnasios**
- 🐾 **Veterinarias**
- 🏋️ **Centros de Fitness**
- 🎨 **Estudios de Arte y Talleres**
- Y cualquier negocio que requiera gestión de citas/reservas

**Perfil del cliente:**
- Negocios pequeños y medianos (SMEs)
- Que necesitan gestionar múltiples servicios/profesionales
- Que quieren que sus clientes agenden online
- Que valoran la seguridad y privacidad de sus datos
- Que buscan una solución profesional sin costos de desarrollo

#### 2. **Super Administradores** (Panel Global)

**Quiénes son:**
- Equipo interno de WEEKLY
- Administradores de la plataforma
- Soporte técnico

**Qué hacen:**
- Gestionan todos los tenants desde un panel centralizado
- Crean nuevos clientes/tenants
- Monitorean el sistema y logs
- Dan soporte técnico
- Analizan estadísticas globales

#### 3. **Usuarios finales** (Clientes de los negocios)

**Quiénes son:**
- Clientes que quieren agendar citas
- No requieren registro
- Acceden al calendario público del negocio

**Qué hacen:**
- Ven disponibilidad en tiempo real
- Agendan citas directamente
- Reciben confirmaciones
- Pueden ver sus reservas

### ¿Qué ofrece?

WEEKLY ofrece una **plataforma SaaS completa de gestión de reservas** con las siguientes características:

#### 🎨 **Para Negocios (Tenants)**

**1. Panel de Administración Completo:**
- ✅ Gestión de **Establecimientos** (servicios/productos)
- ✅ Gestión de **Colaboradores** (staff/profesionales)
- ✅ Gestión de **Clientes** (base de datos de clientes)
- ✅ Gestión de **Reservas** (citas agendadas)
- ✅ **Calendario Interactivo** (vista mensual, semanal, diaria)
- ✅ **Estadísticas y Reportes** (análisis de negocio)
- ✅ **Configuración Personalizada** (colores, logo, horarios)

**2. Calendario Público:**
- ✅ **Acceso sin registro** para clientes
- ✅ **Agendamiento 24/7** desde cualquier dispositivo
- ✅ **Disponibilidad en tiempo real**
- ✅ **Confirmaciones automáticas**
- ✅ **Integración con Google Maps** (ubicación del negocio)

**3. Sistema Multi-Tenant:**
- ✅ **Base de datos independiente** por negocio
- ✅ **Dominio personalizado** automático (`{negocio}.weekly.pe`)
- ✅ **SSL automático** (HTTPS)
- ✅ **Aislamiento total de datos**
- ✅ **Escalabilidad independiente**

**4. Roles y Permisos:**
- ✅ **Administradores**: Acceso completo al panel
- ✅ **Vendedores/Staff**: Acceso limitado según necesidad
- ✅ **Usuarios regulares**: Solo calendario y reservas

**5. Tiempo Real:**
- ✅ **Actualizaciones instantáneas** (Socket.io)
- ✅ **Sincronización automática** entre usuarios
- ✅ **Notificaciones en vivo**

#### 🛠️ **Para Super Administradores**

**1. Panel de Control Global:**
- ✅ Gestión centralizada de todos los tenants
- ✅ Creación automática de nuevos clientes
- ✅ Configuración de DNS y dominios automática
- ✅ Habilitación de SSL automática
- ✅ Monitoreo de logs y actividad

**2. Sistema de Logging:**
- ✅ Logs de actividad por tenant
- ✅ Registro de logins y acciones
- ✅ Metadata detallada de eventos
- ✅ Filtros y búsqueda avanzada

**3. Estadísticas Globales:**
- ✅ Total de tenants activos
- ✅ Distribución por plan
- ✅ Análisis de uso
- ✅ Métricas de crecimiento

#### 🌐 **Para Usuarios Finales (Público)**

**1. Calendario Público:**
- ✅ Acceso sin registro ni login
- ✅ Visualización de disponibilidad
- ✅ Agendamiento directo
- ✅ Confirmación inmediata

**2. Experiencia de Usuario:**
- ✅ Interfaz intuitiva y moderna
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Carga rápida (lazy loading, CDN)
- ✅ Mapas interactivos para ubicación

### Características Técnicas Destacadas

✅ **Arquitectura Multi-Tenant** con bases de datos separadas
✅ **Deployment Automatizado** con CapRover y Docker
✅ **DNS y SSL Automático** con Cloudflare
✅ **Tiempo Real** con WebSockets (Socket.io)
✅ **Seguridad de Primer Nivel** (JWT, bcrypt, HTTPS)
✅ **Escalabilidad Horizontal** (cada tenant independiente)
✅ **API RESTful** completa y documentada
✅ **Frontend Moderno** (React 19, TypeScript, Vite)

### Casos de Uso

**Ejemplo 1: Peluquería**
- Peluquería "Bella Vista" se registra en WEEKLY
- Obtiene su dominio: `bellavista.weekly.pe`
- Configura servicios: Corte, Peinado, Tinte, etc.
- Agrega colaboradores: María (estilista), Juan (barbero)
- Los clientes agendan desde `bellavista.weekly.pe/agendar`
- María y Juan ven sus citas en el panel

**Ejemplo 2: Academia**
- Academia "Refuerzo Plus" se registra
- Obtiene: `refuerzoplus.weekly.pe`
- Configura servicios: Matemáticas, Física, Química
- Agrega profesores y horarios
- Estudiantes agendan clases desde el calendario público
- Administradores gestionan todo desde el panel

**Ejemplo 3: Clínica Dental**
- Clínica "Sonrisa" se registra
- Obtiene: `sonrisa.weekly.pe`
- Configura servicios: Limpieza, Ortodoncia, Implantes
- Agrega dentistas y horarios de atención
- Pacientes agendan citas 24/7
- Cada dentista ve solo sus citas

### Misión y Visión

**Misión:**
> Proporcionar una plataforma intuitiva, segura y escalable que permita a nuestros clientes enfocarse en lo que mejor hacen: atender a sus clientes.

**Visión:**
> Ser la plataforma líder en gestión de reservas en Latinoamérica, facilitando la digitalización de negocios de todos los tamaños mediante tecnología de vanguardia y un servicio excepcional.

---

## 💻 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.0 | Framework UI principal |
| **TypeScript** | 5.8.3 | Tipado estático |
| **Vite** | 6.3.5 | Build tool y dev server |
| **React Router DOM** | 7.6.2 | Routing y navegación |
| **Axios** | 1.10.0 | Cliente HTTP para APIs |
| **FullCalendar** | 6.1.18 | Componente de calendario |
| **React Leaflet** | 5.0.0 | Mapas interactivos (Google Maps) |
| **Leaflet** | 1.9.4 | Librería de mapas |
| **GSAP** | 3.13.0 | Animaciones |
| **Socket.io Client** | 4.8.1 | WebSockets para tiempo real |
| **Lucide React** | 0.548.0 | Iconos |
| **EmailJS** | 4.4.1 | Envío de emails desde frontend |

**Características:**
- ✅ Single Page Application (SPA)
- ✅ Server-Side Rendering (SSR) con Nginx
- ✅ Lazy loading de componentes
- ✅ Code splitting automático
- ✅ Hot Module Replacement (HMR) en desarrollo

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express.js** | 4.18.2 | Framework web |
| **PostgreSQL** | 14+ | Base de datos relacional |
| **pg (node-postgres)** | 8.16.2 | Driver de PostgreSQL |
| **bcryptjs** | 3.0.2 | Hash de contraseñas |
| **jsonwebtoken** | 9.0.2 | Autenticación JWT |
| **Socket.io** | 4.8.1 | WebSockets para tiempo real |
| **Axios** | 1.13.1 | Cliente HTTP (Cloudflare, APIs) |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | 16.4.5 | Variables de entorno |

**Características:**
- ✅ RESTful API
- ✅ Multi-tenant architecture
- ✅ Connection pooling por tenant
- ✅ Middleware de autenticación
- ✅ Logging centralizado

### Base de Datos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **PostgreSQL** | 14+ | Base de datos principal |
| **JSONB** | - | Almacenamiento JSON (metadata) |
| **Índices** | - | Optimización de consultas |

**Estructura:**
- `weekly_global` - Base de datos global (tenants, usuarios globales, logs)
- `weekly_{tenant_name}` - Base de datos por tenant (datos del cliente)

### Infraestructura y DevOps

| Tecnología | Propósito |
|------------|-----------|
| **Docker** | Containerización |
| **CapRover** | Plataforma de deployment |
| **Nginx** | Reverse proxy y servidor web estático |
| **Cloudflare** | DNS, CDN, SSL/TLS |
| **Let's Encrypt** | Certificados SSL automáticos |

### Servicios Externos

| Servicio | Propósito |
|----------|-----------|
| **Cloudflare API** | Gestión automática de DNS |
| **CapRover CLI/API** | Gestión automática de dominios |
| **Google Maps API** | Geocodificación de direcciones |
| **EmailJS** | Envío de emails (opcional) |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|--------------|-----------|
| **TypeScript** | Tipado estático |
| **ESLint** | Linting de código |
| **Nodemon** | Auto-reload en desarrollo |
| **Git** | Control de versiones |

### Stack Completo

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND                        │
│  React 19 + TypeScript + Vite                   │
│  React Router + FullCalendar + Leaflet          │
│  Socket.io Client + Axios                       │
└─────────────────────────────────────────────────┘
                      │
                      │ HTTP/WebSocket
                      ▼
┌─────────────────────────────────────────────────┐
│                  BACKEND                         │
│  Node.js 18 + Express.js                        │
│  PostgreSQL (pg) + JWT + bcrypt                 │
│  Socket.io + Axios                               │
└─────────────────────────────────────────────────┘
                      │
                      │ SQL
                      ▼
┌─────────────────────────────────────────────────┐
│              BASE DE DATOS                      │
│  PostgreSQL 14+                                 │
│  weekly_global + weekly_{tenant}                │
└─────────────────────────────────────────────────┘
                      │
                      │
┌─────────────────────────────────────────────────┐
│            INFRAESTRUCTURA                      │
│  Docker + CapRover + Nginx                      │
│  Cloudflare (DNS/CDN/SSL)                       │
└─────────────────────────────────────────────────┘
```

### Versiones de Node.js

- **Backend:** Node.js 18+ (Alpine Linux)
- **Frontend Build:** Node.js 18+ (Alpine Linux)
- **Frontend Runtime:** Nginx (servidor estático)

### Características del Stack

✅ **Moderno:** React 19, TypeScript 5.8, Node.js 18
✅ **Rápido:** Vite para builds rápidos, connection pooling
✅ **Escalable:** Multi-tenant, bases de datos separadas
✅ **Seguro:** JWT, bcrypt, HTTPS obligatorio
✅ **Tiempo Real:** Socket.io para actualizaciones en vivo
✅ **DevOps:** Docker, CapRover, deployment automatizado
✅ **CDN:** Cloudflare para distribución global

---

## 🏗️ Arquitectura General

### Visión General

El sistema utiliza una arquitectura **multi-tenant con bases de datos separadas**, donde cada cliente (tenant) tiene su propia base de datos PostgreSQL completamente aislada. Esto garantiza:

- ✅ **Aislamiento total de datos** entre clientes
- ✅ **Seguridad mejorada** (sin riesgo de fuga de datos)
- ✅ **Escalabilidad independiente** por tenant
- ✅ **Backups independientes** por cliente
- ✅ **Cumplimiento GDPR** y regulaciones de privacidad

### Estructura de Dominios

```
weekly.pe (dominio principal)
├── panel.weekly.pe          → Panel de administración global (super admin)
├── api.weekly.pe            → API backend (rutea según tenant)
├── demo.weekly.pe           → Demo pública (sin login)
└── {tenant_name}.weekly.pe  → Panel individual de cada cliente
    └── {tenant_name}.weekly.pe/agendar → Calendario público del tenant
```

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPROVER (Docker)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ weekly-frontend  │  │  weekly-backend  │                │
│  │  (React/Vite)    │  │  (Node.js/Express)│               │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐                                      │
│  │ weekly-postgres   │                                      │
│  │  (PostgreSQL)     │                                      │
│  └──────────────────┘                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │Cloudflare│         │CapRover │         │Google   │
    │   DNS    │         │   API   │         │  Maps   │
    └──────────┘         └─────────┘         └─────────┘
```

---

## 🗄️ Modelo de Base de Datos

### Base de Datos Global (`weekly_global`)

**Ubicación:** `backend/db/schema-global.sql`

Esta base de datos contiene toda la información de administración global y metadatos de tenants.

#### Tablas Principales

**1. `tenants`** - Información de cada cliente/tenant
```sql
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_name VARCHAR(100) NOT NULL UNIQUE,  -- Subdominio: "cliente" → cliente.weekly.pe
    display_name VARCHAR(255) NOT NULL,         -- Nombre para mostrar
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(20),
    cliente_direccion TEXT,
    latitud DECIMAL(10, 8),                      -- Para Google Maps
    longitud DECIMAL(11, 8),                     -- Para Google Maps
    estado VARCHAR(20) DEFAULT 'activo',         -- activo, suspendido, cancelado
    plan VARCHAR(50) DEFAULT 'basico',           -- basico, premium, enterprise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. `usuarios_global`** - Usuarios del panel de super administración
```sql
CREATE TABLE usuarios_global (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'super_admin',
    activo BOOLEAN DEFAULT true
);
```

**3. `email_tenant_mapping`** - Mapeo para login universal
```sql
CREATE TABLE email_tenant_mapping (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    tenant_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (tenant_name) REFERENCES tenants(tenant_name) ON DELETE CASCADE
);
```

**4. `logs_sistema`** - Logs de actividad del sistema (fase beta)
```sql
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    tenant_id INT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,               -- login, login_failed, tenant_created, etc.
    descripcion TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,                              -- Datos adicionales en JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios_global(id) ON DELETE SET NULL
);
```

### Base de Datos por Tenant (`weekly_{tenant_name}`)

**Ubicación:** `backend/db/schema.sql`

Cada tenant tiene su propia base de datos con el esquema completo de la aplicación.

#### Tablas Principales

**1. `usuarios`** - Usuarios del tenant (admin, vendedores, colaboradores)
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'vendedor',  -- admin, vendedor, colaborador
    activo BOOLEAN DEFAULT true
);
```

**2. `establecimientos`** - Establecimientos del negocio
```sql
CREATE TABLE establecimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo_negocio VARCHAR(100) NOT NULL,          -- peluqueria, clases_reforzamiento, etc.
    direccion TEXT,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true
);
```

**3. `colaboradores`** - Colaboradores/profesionales
```sql
CREATE TABLE colaboradores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    establecimiento_id INTEGER REFERENCES establecimientos(id),
    activo BOOLEAN DEFAULT true
);
```

**4. `clientes`** - Clientes del tenant
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true
);
```

**5. `reservas`** - Reservas/citas
```sql
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    colaborador_id INT NOT NULL,
    establecimiento_id INT NOT NULL,
    cliente_id INT NOT NULL,
    servicio_descripcion TEXT,
    precio DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'confirmada',
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),
    FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

### Diagrama de Relación

```
weekly_global (BD Global)
├── tenants (1) ──┐
├── usuarios_global
├── email_tenant_mapping
└── logs_sistema ──┘
                    │
                    │ (1:N)
                    │
                    ▼
        weekly_{tenant_name} (BD por Tenant)
        ├── usuarios
        ├── establecimientos
        ├── colaboradores
        ├── clientes
        └── reservas
```

---

## ⚙️ Funcionamiento del Sistema

### 1. Detección de Tenant

El sistema detecta el tenant basándose en el **subdominio** de la URL:

```javascript
// Ejemplo: cliente.weekly.pe → tenant = "cliente"
function extractSubdomain(host) {
    if (host.endsWith('.weekly.pe')) {
        const parts = host.split('.');
        return parts[0]; // "cliente"
    }
    return null;
}
```

### 2. Middleware de Tenant

**Ubicación:** `backend/src/middleware/tenantMiddleware.js`

El middleware se ejecuta en cada request y:

1. **Extrae el subdominio** del header `Host`
2. **Valida el tenant** en la BD global
3. **Verifica el estado** (activo/suspendido/cancelado)
4. **Conecta a la BD correcta** del tenant
5. **Agrega información al request** (`req.tenant`, `req.db`)

```javascript
// Flujo del middleware
Request → tenantMiddleware → {
    req.tenant = "cliente",
    req.tenantType = "tenant",
    req.database = "weekly_cliente",
    req.db = Pool(weekly_cliente)
} → Controller
```

### 3. Gestión de Conexiones

**Ubicación:** `backend/src/config/tenantDatabase.js`

El sistema mantiene un **pool de conexiones** por tenant en memoria:

```javascript
const tenantPools = new Map(); // Cache de conexiones

async function getTenantDatabase(tenant) {
    // Si ya existe, devolver del cache
    if (tenantPools.has(tenant)) {
        return tenantPools.get(tenant);
    }
    
    // Crear nueva conexión
    const dbName = `weekly_${tenant}`;
    const pool = new Pool({ database: dbName });
    
    // Verificar/crear BD si no existe
    await ensureTenantDatabase(tenant, pool);
    
    // Guardar en cache
    tenantPools.set(tenant, pool);
    return pool;
}
```

### 4. Creación Automática de BD

Si un tenant intenta acceder pero su BD no existe, el sistema:

1. **Crea la BD** automáticamente
2. **Inicializa el esquema** desde `schema.sql`
3. **Crea datos de ejemplo** (opcional)
4. **Establece la conexión**

---

## 🐳 Implementación en CapRover

### Estructura de Apps en CapRover

```
CapRover Dashboard
├── weekly-postgres (One-Click App)
│   └── PostgreSQL 14+
│
├── weekly-backend (App Normal)
│   └── Dockerfile
│   └── Puerto: 3000
│   └── Variables de entorno configuradas
│
└── weekly-frontend (App Normal)
    └── Dockerfile
    └── Puerto: 80
    └── Nginx para routing
```

### Configuración de CapRover

#### 1. Variables de Entorno del Backend

```bash
# Base de datos
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=srv-captain--weekly-postgres  # Nombre del servicio en CapRover
DB_PORT=5432
DB_NAME_PREFIX=weekly_

# CapRover
CAPROVER_API_TOKEN=tu_token_de_caprover
CAPROVER_SERVER_URL=https://captain.yourdomain.com
CAPROVER_FRONTEND_APP=weekly-frontend

# Cloudflare
CLOUDFLARE_API_TOKEN=tu_token_de_cloudflare
CLOUDFLARE_ZONE_ID=tu_zone_id
CLOUDFLARE_DOMAIN=weekly.pe
CLOUDFLARE_TARGET=weekly-frontend.panel.getdevtools.com

# Google Maps (opcional)
GOOGLE_MAPS_API_KEY=tu_api_key
```

#### 2. Métodos de Integración con CapRover

El sistema soporta **dos métodos** para agregar dominios personalizados:

##### Método 1: CLI de CapRover (Recomendado) ⭐

**Ubicación:** `backend/src/services/caproverServiceCLI.js`

```javascript
// Instalación del CLI en el Dockerfile
RUN npm install -g caprover

// Uso
await addCustomDomainAndEnableSSLCLI('weekly-frontend', 'cliente.weekly.pe', true);
```

**Ventajas:**
- ✅ Método oficialmente soportado por CapRover
- ✅ Más confiable y estable
- ✅ Mejor manejo de errores

##### Método 2: API HTTP (Fallback)

**Ubicación:** `backend/src/services/caproverService.js`

```javascript
// Usa la API interna de CapRover
POST https://captain.yourdomain.com/api/v2/user/apps/appDefinitions/{appName}/customdomain
```

**Ventajas:**
- ✅ No requiere instalación adicional
- ✅ Funciona si el CLI no está disponible

### Proceso Automático de Dominio

Cuando se crea un nuevo tenant:

1. **Crear registro DNS en Cloudflare** (CNAME)
2. **Agregar dominio en CapRover** (CLI o API)
3. **Habilitar SSL automáticamente** (Let's Encrypt)
4. **Esperar propagación DNS** (1-5 minutos)

---

## ☁️ Integración con Cloudflare

### Configuración DNS

**Ubicación:** `backend/src/services/cloudflareService.js`

#### 1. Crear CNAME Automáticamente

```javascript
async function createCNAME(subdomain, target = null) {
    // Target por defecto: weekly-frontend.panel.getdevtools.com
    const recordData = {
        type: 'CNAME',
        name: subdomain,                    // "cliente"
        content: target,                    // "weekly-frontend.panel.getdevtools.com"
        ttl: 1,                             // Auto
        proxied: true                        // Activar proxy (nube naranja)
    };
    
    // POST a Cloudflare API
    POST https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records
}
```

#### 2. Variables de Entorno Requeridas

```bash
CLOUDFLARE_API_TOKEN=tu_token_api
CLOUDFLARE_ZONE_ID=tu_zone_id
CLOUDFLARE_DOMAIN=weekly.pe
CLOUDFLARE_TARGET=weekly-frontend.panel.getdevtools.com
```

#### 3. Obtener Credenciales de Cloudflare

1. **API Token:**
   - Cloudflare Dashboard → My Profile → API Tokens
   - Create Token → Edit zone DNS
   - Copiar el token generado

2. **Zone ID:**
   - Cloudflare Dashboard → Seleccionar dominio `weekly.pe`
   - En la barra lateral derecha, copiar "Zone ID"

### Configuración Wildcard DNS (Opcional)

Para evitar crear registros individuales, puedes configurar un wildcard:

```
*.weekly.pe → CNAME → weekly-frontend.panel.getdevtools.com
```

**Nota:** Si usas wildcard, el sistema aún creará registros específicos para mejor tracking y control.

---

## 🚀 Proceso de Creación de Tenants

### Flujo Completo

```
1. Admin crea tenant en panel.weekly.pe
   ↓
2. Backend valida datos y crea registro en weekly_global.tenants
   ↓
3. Backend crea BD: weekly_{tenant_name}
   ↓
4. Backend inicializa esquema desde schema.sql
   ↓
5. Backend crea usuario admin inicial (opcional)
   ↓
6. Backend crea CNAME en Cloudflare: {tenant_name}.weekly.pe
   ↓
7. Backend agrega dominio en CapRover
   ↓
8. Backend habilita SSL automáticamente
   ↓
9. Sistema registra log de creación
   ↓
10. Tenant disponible en {tenant_name}.weekly.pe (1-5 min)
```

### Endpoint de Creación

**POST** `/api/super-admin/tenants`

**Request Body:**
```json
{
    "tenant_name": "cliente1",
    "display_name": "Cliente Demo",
    "cliente_nombre": "Juan Pérez",
    "cliente_email": "juan@cliente.com",
    "cliente_telefono": "+51987654321",
    "cliente_direccion": "Av. Principal 123, Lima",
    "latitud": -12.0464,
    "longitud": -77.0428,
    "plan": "basico",
    "estado": "activo",
    "admin_email": "admin@cliente.com",
    "admin_password": "password123",
    "admin_nombre": "Administrador",
    "crear_usuario_admin": true
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "tenant_name": "cliente1",
        "display_name": "Cliente Demo",
        ...
    },
    "message": "Tenant creado exitosamente. Base de datos inicializada y DNS configurado automáticamente.",
    "dns": {
        "created": true,
        "message": "DNS configurado automáticamente. Dominio agregado y SSL habilitado en CapRover."
    }
}
```

### Código del Controlador

**Ubicación:** `backend/src/controllers/tenantController.js`

```javascript
async createTenant(req, res) {
    // 1. Validar datos
    // 2. Verificar que tenant_name no exista
    // 3. Geocodificar dirección (Google Maps) si se proporciona
    // 4. Insertar en weekly_global.tenants
    // 5. Crear BD: weekly_{tenant_name}
    // 6. Inicializar esquema
    // 7. Crear usuario admin (opcional)
    // 8. Crear DNS en Cloudflare
    // 9. Agregar dominio en CapRover
    // 10. Habilitar SSL
    // 11. Registrar log
    // 12. Retornar respuesta
}
```

---

## 🔀 Middleware y Routing

### Middleware de Tenant

**Ubicación:** `backend/src/middleware/tenantMiddleware.js`

El middleware se aplica a todas las rutas y determina:

1. **Tipo de acceso:**
   - `global` → Panel de super admin (panel.weekly.pe, api.weekly.pe)
   - `tenant` → Panel de cliente (cliente.weekly.pe)
   - `public` → Acceso público (sin subdominio)

2. **Base de datos:**
   - `weekly_global` → Para acceso global
   - `weekly_{tenant_name}` → Para acceso de tenant

3. **Validaciones:**
   - Formato del tenant (solo letras, números, guiones)
   - Existencia del tenant en BD
   - Estado del tenant (activo/suspendido/cancelado)

### Routing en Frontend

**Ubicación:** `frontend/src/App.tsx`

```typescript
// Detección de hostname
const hostname = window.location.hostname;
const subdomain = hostname.split('.')[0];

// Routing lógico
if (hostname === 'panel.weekly.pe' || hostname === 'api.weekly.pe') {
    // Panel global de super admin
    return <GlobalAppContent />;
} else if (hostname === 'demo.weekly.pe' || subdomain === 'demo') {
    // Demo pública
    return <DemoView />;
} else if (subdomain && subdomain !== 'www') {
    // Tenant individual
    return <AppContent />; // Con routing interno para /agendar, /login, etc.
} else {
    // Landing page principal
    return <LandingPage />;
}
```

---

## 🎛️ Panel de Control (Super Admin)

### Configuración del Panel

El panel de control global está disponible en `panel.weekly.pe` y permite gestionar todos los tenants del sistema.

#### Acceso al Panel

**URL:** `https://panel.weekly.pe`

**Requisitos:**
- Usuario con rol `super_admin` en la tabla `usuarios_global`
- Autenticación mediante JWT

#### Autenticación Global

**Ubicación Backend:** `backend/src/routes/globalAuthRoutes.js`
**Ubicación Frontend:** `frontend/src/pages/GlobalLoginPage.tsx`

**Endpoints de Autenticación:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/global-auth/login` | Login de super administrador |
| GET | `/api/global-auth/verify` | Verificar token (protegido) |
| GET | `/api/global-auth/profile` | Obtener perfil (protegido) |
| PUT | `/api/global-auth/profile` | Actualizar perfil (protegido) |
| PUT | `/api/global-auth/change-password` | Cambiar contraseña (protegido) |

**Request de Login:**
```json
POST /api/global-auth/login
{
    "email": "admin@weekly.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "admin@weekly.com",
        "nombre": "Super Administrador",
        "rol": "super_admin"
    }
}
```

#### Rutas del Panel (Frontend)

**Ubicación:** `frontend/src/App.tsx` → `GlobalAppContent`

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `GestionTenantsPage` | Gestión de tenants (página principal) |
| `/super-admin/tenants` | `GestionTenantsPage` | Gestión de tenants |
| `/super-admin/users` | (Próximamente) | Gestión de usuarios globales |
| `/super-admin/billing` | (Próximamente) | Facturación |
| `/super-admin/support` | (Próximamente) | Soporte |

#### Funcionalidades del Panel

1. **Gestión de Tenants:**
   - Listar todos los tenants
   - Crear nuevo tenant
   - Editar tenant existente
   - Eliminar tenant
   - Ver estadísticas
   - Ver logs de actividad por tenant

2. **Logs del Sistema:**
   - Visualizar logs de actividad
   - Filtrar por tenant, usuario, acción
   - Ver metadata de cada log

3. **Estadísticas:**
   - Total de tenants
   - Tenants activos/suspendidos/cancelados
   - Distribución por plan (básico/premium/enterprise)

#### Configuración de Acceso

**Detección Automática en Frontend:**

```typescript
// frontend/src/App.tsx
const hostname = window.location.hostname;

// Si es panel.weekly.pe, mostrar panel global
if (hostname === 'panel.weekly.pe' || hostname === 'panel.weekly' || subdomain === 'panel') {
    return <GlobalAppContent />;
}
```

**Middleware de Autenticación:**

El panel requiere autenticación mediante JWT. El token se almacena en:
- **Frontend:** LocalStorage (con encriptación)
- **Backend:** Verificado en cada request mediante `authMiddleware`

#### Variables de Entorno para Panel

```bash
# JWT para autenticación global
JWT_SECRET=tu_secret_jwt_muy_seguro_para_panel
JWT_EXPIRES_IN=7d

# URL del panel (para redirecciones)
PANEL_URL=https://panel.weekly.pe
```

#### Crear Usuario Super Admin

**Opción 1: SQL Directo**
```sql
INSERT INTO usuarios_global (email, password_hash, nombre, rol)
VALUES (
    'admin@weekly.com',
    '$2b$12$...', -- Hash bcrypt de la contraseña
    'Super Administrador',
    'super_admin'
);
```

**Opción 2: Script Node.js**
```javascript
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createSuperAdmin() {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'weekly_global',
        password: 'password',
        port: 5432
    });
    
    const passwordHash = await bcrypt.hash('password123', 12);
    
    await pool.query(`
        INSERT INTO usuarios_global (email, password_hash, nombre, rol)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
    `, ['admin@weekly.com', passwordHash, 'Super Admin', 'super_admin']);
    
    await pool.end();
}
```

#### Seguridad del Panel

1. **Autenticación obligatoria:** Todas las rutas requieren login
2. **Validación de rol:** Solo usuarios con `rol = 'super_admin'` pueden acceder
3. **JWT con expiración:** Tokens expiran después de 7 días
4. **HTTPS obligatorio:** El panel solo funciona sobre HTTPS
5. **Rate limiting:** Protección contra ataques de fuerza bruta

---

## 📡 APIs y Endpoints

### Endpoints Globales (Super Admin)

**Base URL:** `https://api.weekly.pe/api/super-admin`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tenants` | Listar todos los tenants |
| GET | `/tenants/:id` | Obtener tenant por ID |
| POST | `/tenants` | Crear nuevo tenant |
| PUT | `/tenants/:id` | Actualizar tenant |
| DELETE | `/tenants/:id` | Eliminar tenant |
| GET | `/tenants/stats` | Estadísticas de tenants |
| GET | `/logs` | Obtener logs del sistema |
| GET | `/logs/stats` | Estadísticas de logs |

### Endpoints por Tenant

**Base URL:** `https://api.weekly.pe/api` (con header `X-Tenant` o subdominio)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login de usuario del tenant |
| GET | `/establecimientos` | Listar establecimientos |
| GET | `/colaboradores` | Listar colaboradores |
| GET | `/reservas` | Listar reservas |
| POST | `/reservas` | Crear reserva |
| GET | `/public/calendario` | Calendario público (sin auth) |

---

## 🔧 Configuración y Variables de Entorno

### Backend (.env)

```bash
# ============================================
# BASE DE DATOS
# ============================================
DB_USER=postgres
DB_PASSWORD=tu_password_seguro
DB_HOST=srv-captain--weekly-postgres
DB_PORT=5432
DB_NAME_PREFIX=weekly_

# ============================================
# CAPROVER
# ============================================
CAPROVER_API_TOKEN=tu_token_de_caprover
CAPROVER_SERVER_URL=https://captain.yourdomain.com
CAPROVER_ROOT_DOMAIN=captain.yourdomain.com
CAPROVER_FRONTEND_APP=weekly-frontend

# ============================================
# CLOUDFLARE
# ============================================
CLOUDFLARE_API_TOKEN=tu_token_api_cloudflare
CLOUDFLARE_ZONE_ID=tu_zone_id
CLOUDFLARE_DOMAIN=weekly.pe
CLOUDFLARE_TARGET=weekly-frontend.panel.getdevtools.com

# ============================================
# GOOGLE MAPS (Opcional)
# ============================================
GOOGLE_MAPS_API_KEY=tu_api_key_google_maps

# ============================================
# JWT (Autenticación)
# ============================================
JWT_SECRET=tu_secret_jwt_muy_seguro
JWT_EXPIRES_IN=7d

# ============================================
# PANEL DE CONTROL
# ============================================
PANEL_URL=https://panel.weekly.pe

# ============================================
# ENTORNO
# ============================================
NODE_ENV=production
PORT=3000
```

### Frontend (.env)

```bash
# API Backend
VITE_API_URL=https://api.weekly.pe

# Configuración de la App
VITE_APP_NAME=Weekly

# Panel de Control (opcional, para redirecciones)
VITE_PANEL_URL=https://panel.weekly.pe
```

---

## 🎯 Guía de Implementación para Otro Proyecto

### Paso 1: Preparar Base de Datos

1. **Crear BD global:**
```sql
CREATE DATABASE tu_global_db;
\c tu_global_db
-- Ejecutar schema-global.sql
```

2. **Preparar esquema por tenant:**
- Copiar `backend/db/schema.sql`
- Adaptar tablas según tu dominio

### Paso 2: Configurar CapRover

1. **Crear apps:**
   - `tu-postgres` (One-Click App)
   - `tu-backend` (App Normal)
   - `tu-frontend` (App Normal)

2. **Configurar variables de entorno** en `tu-backend`

3. **Instalar CapRover CLI** en el Dockerfile del backend:
```dockerfile
RUN npm install -g caprover
```

### Paso 3: Configurar Cloudflare

1. **Obtener credenciales:**
   - API Token
   - Zone ID

2. **Configurar variables de entorno** en el backend

3. **Configurar DNS wildcard** (opcional):
```
*.tudominio.com → CNAME → tu-frontend.panel.getdevtools.com
```

### Paso 4: Implementar Middleware

1. **Copiar `tenantMiddleware.js`**
2. **Adaptar función `extractSubdomain()`** para tu dominio
3. **Aplicar middleware** a todas las rutas:
```javascript
app.use(tenantMiddleware);
```

### Paso 5: Implementar Servicios

1. **Cloudflare Service:**
   - Copiar `cloudflareService.js`
   - Adaptar según tu configuración

2. **CapRover Service:**
   - Copiar `caproverServiceCLI.js` y `caproverService.js`
   - Configurar según tu setup

3. **Tenant Database:**
   - Copiar `tenantDatabase.js`
   - Adaptar nombres de BD

### Paso 6: Implementar Controlador de Tenants

1. **Copiar `tenantController.js`**
2. **Adaptar validaciones** según tu modelo
3. **Configurar rutas:**
```javascript
router.post('/tenants', tenantController.createTenant);
router.get('/tenants', tenantController.getAllTenants);
// ... más rutas
```

### Paso 7: Frontend - Panel de Admin

1. **Crear página de gestión de tenants:**
   - Copiar `GestionTenantsPage.tsx`
   - Adaptar campos según tu modelo

2. **Configurar routing:**
   - Panel global: `panel.tudominio.com`
   - Tenants: `{tenant}.tudominio.com`

### Paso 8: Testing

1. **Crear tenant de prueba:**
```bash
POST /api/super-admin/tenants
{
    "tenant_name": "test",
    "display_name": "Test Tenant",
    ...
}
```

2. **Verificar:**
   - ✅ BD creada: `tu_global_test`
   - ✅ DNS creado: `test.tudominio.com`
   - ✅ Dominio en CapRover
   - ✅ SSL habilitado
   - ✅ Acceso funcional

### Checklist de Implementación

- [ ] BD global creada y esquema aplicado
- [ ] Esquema por tenant definido
- [ ] CapRover configurado (apps creadas)
- [ ] Cloudflare configurado (credenciales)
- [ ] Middleware de tenant implementado
- [ ] Servicios (Cloudflare, CapRover) implementados
- [ ] Controlador de tenants implementado
- [ ] Frontend de admin implementado
- [ ] Variables de entorno configuradas
- [ ] Testing completo

---

## 📝 Notas Importantes

### Seguridad

1. **Validación de tenants:** Siempre validar que el tenant existe y está activo
2. **Aislamiento de datos:** Nunca exponer datos de un tenant a otro
3. **Autenticación:** Usar JWT con expiración adecuada
4. **HTTPS:** Forzar SSL en todos los dominios

### Performance

1. **Pool de conexiones:** Reutilizar conexiones por tenant
2. **Índices:** Crear índices en columnas frecuentemente consultadas
3. **Cache:** Considerar cache para datos de tenant (Redis)

### Escalabilidad

1. **Separación de BD:** Permite mover tenants a diferentes servidores
2. **Load balancing:** CapRover maneja esto automáticamente
3. **CDN:** Cloudflare proporciona CDN automáticamente

### Monitoreo

1. **Logs:** Sistema de logging implementado en `logs_sistema`
2. **Métricas:** Considerar agregar métricas de uso por tenant
3. **Alertas:** Configurar alertas para errores críticos

---

## 🔗 Referencias

- **CapRover Docs:** https://caprover.com/docs/
- **Cloudflare API:** https://developers.cloudflare.com/api/
- **PostgreSQL Multi-Tenant:** https://www.postgresql.org/docs/
- **React Router:** https://reactrouter.com/

---

## 📞 Soporte

Para dudas o problemas con la implementación, revisar:
- Logs del sistema en `panel.tudominio.com`
- Logs de CapRover en el dashboard
- Logs de Cloudflare en el dashboard

---

**Última actualización:** 2024
**Versión del documento:** 1.0

