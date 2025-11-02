# 🚀 Guía de Deployment en CapRover

## 📋 Arquitectura de Base de Datos Multi-Tenant

### 🎯 Modelo de Separación de Datos

Tu sistema usa **BASE DE DATOS SEPARADA POR CLIENTE B2B (TENANT)**.

```
PostgreSQL Instance
├── weekly_global          (Panel de administración global)
├── agendate_demo          (Cliente: demo.weekly.pe)
├── agendate_peluqueria    (Cliente: peluqueria.weekly.pe)
├── agendate_academia      (Cliente: academia.weekly.pe)
├── agendate_cancha        (Cliente: cancha.weekly.pe)
└── agendate_NUEVOCLIENTE  (Se crea automáticamente cuando se registra)
```

### ✅ Ventajas de esta Arquitectura

1. **Aislamiento total**: Cada cliente tiene su propia base de datos
2. **Seguridad mejorada**: No hay riesgo de fuga de datos entre clientes
3. **Escalabilidad**: Puedes mover bases de datos a diferentes servidores
4. **Backups independientes**: Puedes hacer backup de un cliente sin afectar otros
5. **Cumplimiento**: Ideal para GDPR y regulaciones de privacidad

### 🔧 Configuración Automática

El sistema **crea automáticamente** las bases de datos cuando:
- Un nuevo tenant se registra en el panel global
- Un tenant existente se conecta por primera vez
- Se ejecuta el script de migración para un tenant nuevo

---

## 📦 Preparación para CapRover

### 1. Requisitos Previos

- ✅ CapRover instalado y funcionando
- ✅ PostgreSQL disponible (puede ser un contenedor en CapRover)
- ✅ Dominio configurado con wildcard DNS: `*.weekly.pe` → IP de CapRover

### 2. Estructura de Apps en CapRover

```
CapRover Apps:
├── weekly-postgres (One-Click App - PostgreSQL pre-configurado) ✅ YA DESPLEGADO
├── weekly-backend  (App Normal - Deploy desde Dockerfile)
└── weekly-frontend (App Normal - Deploy desde Dockerfile)
```

### ⚠️ Diferencia entre One-Click Apps y Apps Normales

**One-Click Apps** (como PostgreSQL):
- Son aplicaciones pre-configuradas
- **NO muestran Dockerfiles** porque ya vienen con su configuración lista
- Solo seleccionas, configuras variables de entorno y listo
- Ejemplos: PostgreSQL, MySQL, Redis, etc.

**Apps Normales** (para tu Backend y Frontend):
- Necesitas proveer el **Dockerfile** o **captain-definition**
- Se despliegan desde tu código fuente
- Tú controlas la configuración completa
- Usan el método **"Deploy from Dockerfile"** en CapRover

---

## 🗄️ Configuración de PostgreSQL

### ✅ PostgreSQL ya desplegado

Tu PostgreSQL ya está desplegado y disponible:

- **Nombre del servicio**: `srv-captain--weekly-postgres`
- **Puerto**: `5432`
- **Usuario**: `postgres`
- **Contraseña**: `151022qaz`
- **Base de datos inicial**: `postgres`

### 🔗 Conexión desde otras apps

**Postgres is deployed and available as `srv-captain--weekly-postgres:5432` to other apps.**

For example with Node.js:

```javascript
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'srv-captain--weekly-postgres',
  database: 'postgres',
  password: '151022qaz',
  port: 5432
});
```

**⚠️ IMPORTANTE**: 
- En CapRover, los servicios se comunican usando el nombre del servicio como hostname (`srv-captain--weekly-postgres`), no necesitas IP.
- El nombre del servicio es el mismo que el nombre de la app en CapRover con el prefijo `srv-captain--`
- El puerto `5432` es el puerto interno de PostgreSQL dentro de la red de CapRover

### Opción 2: PostgreSQL Externo

Si usas un PostgreSQL externo (RDS, DigitalOcean, etc.):

```bash
DB_HOST=tu-servidor-postgres.externo.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_SEGURO
```

---

## 🔧 Configuración del Backend

### ⚠️ IMPORTANTE: One-Click Apps vs Apps Normales

**One-Click Apps**: Son aplicaciones pre-configuradas (como PostgreSQL) que NO muestran Dockerfiles porque vienen con su configuración ya lista. Solo seleccionas e instalas.

**Para tu Backend y Frontend**: Necesitas crear **Apps Normales** (NO one-click apps) que usan Dockerfiles o `captain-definition`.

### 1. Crear App Backend en CapRover

**⚠️ IMPORTANTE**: Las **One-Click Apps** NO muestran Dockerfiles porque son pre-configuradas. Para tu Backend y Frontend, necesitas crear **Apps Normales**.

#### Opción A: Método 2 - Tarball (Recomendado - Más Rápido)

**✅ RECOMENDADO**: Ya tienes los archivos `backend-deploy.tar.gz` y `frontend-deploy.tar.gz` creados.

Pasos:

1. Ve a **CapRover Dashboard** → **Apps**
2. Haz clic en **"One-Click Apps / Dockerfile"**
3. Selecciona la pestaña **"Método 2: Tarball"**
4. **Para Backend**:
   - Nombre de la app: `weekly-backend`
   - Haz clic o arrastra el archivo: `backend-deploy.tar.gz`
   - Espera a que termine el build
5. **Para Frontend**:
   - Nombre de la app: `weekly-frontend`
   - Haz clic o arrastra el archivo: `frontend-deploy.tar.gz`
   - Espera a que termine el build

**⚠️ IMPORTANTE**: El archivo tar.gz DEBE contener `captain-definition` en la raíz (ya verificado ✅)

#### Opción B: Método 3 - Desplegar desde Git (Para CI/CD)

Si prefieres automatización con Git:

1. Ve a **CapRover Dashboard** → **Apps**
2. Selecciona **"Método 3: Desplegar desde Github/Bitbucket/Gitlab"**
3. Ingresa la información de tu repositorio
4. Copia la URL del webhook y configúrala en GitHub
5. Cada commit iniciará un nuevo build automáticamente

**Nota**: Asegúrate de que el repositorio tenga `captain-definition` en la raíz del directorio `backend/` o `frontend/`

### 2. Dockerfile y captain-definition

Ya tienes ambos archivos en `backend/`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["node", "src/index.js"]
```

### 3. Variables de Entorno del Backend

En CapRover Dashboard → weekly-backend → App Config → Environment Variables:

```bash
# Base de Datos
DB_HOST=srv-captain--weekly-postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=151022qaz
DB_NAME_PREFIX=agendate_

# Entorno
NODE_ENV=production
USE_DEV_MODE=false

# Puerto
PORT=4000

# CORS
ALLOWED_ORIGINS=https://*.weekly.pe,https://weekly.pe,https://panel.weekly.pe,https://weekly-frontend.panel.getdevtools.com,https://*.panel.getdevtools.com

# JWT
JWT_SECRET=TU_JWT_SECRET_SUPER_SEGURO_AQUI
JWT_EXPIRES_IN=7d

# Dominio Base
BASE_URL=https://weekly.pe

# Tenants Permitidos (opcional, para seguridad adicional)
ALLOWED_TENANTS=demo,peluqueria,academia,cancha,veterinaria,odontologia,gimnasio

# Cloudflare (para automatización de DNS)
CLOUDFLARE_API_TOKEN=tu_token_aqui
CLOUDFLARE_ZONE_ID=tu_zone_id_aqui
CLOUDFLARE_DOMAIN=weekly.pe
CLOUDFLARE_TARGET=weekly-frontend.panel.getdevtools.com

# CapRover (para automatización de dominios - OPCIONAL)
# Ver OBTENER_TOKEN_CAPROVER.md para obtener el token
CAPROVER_API_TOKEN=tu_token_aqui
CAPROVER_SERVER_URL=https://panel.getdevtools.com
CAPROVER_FRONTEND_APP=weekly-frontend
```

### 4. Configurar DNS en Cloudflare

**⚠️ IMPORTANTE**: Antes de configurar el dominio en CapRover, debes agregar el registro DNS en Cloudflare.

#### Pasos en Cloudflare:

1. Ve a **Cloudflare Dashboard**
2. Selecciona tu dominio: `weekly.pe`
3. Ve a la pestaña **"DNS"**
4. Haz clic en **"Add record"**
5. Configura el registro:

```
Tipo: A (o AAAA para IPv6)
Nombre: api
Contenido/IPv4: [IP de tu servidor CapRover]
Proxy: ⚪ Solo DNS (DNS only) - DESACTIVADO
TTL: Auto
```

**🔍 Obtener la IP de tu servidor:**
- En CapRover Dashboard → ver tu IP pública
- O ejecuta en tu servidor: `curl ifconfig.me`

**⚠️ CONFIGURACIÓN CRÍTICA DEL PROXY:**
- **Desactiva Cloudflare Proxy** (usa "DNS only" / nube gris ⚪)
- **NO uses el proxy naranja 🟠** para `api.weekly.pe`
- CapRover maneja el SSL directamente (Let's Encrypt)
- El proxy de Cloudflare puede causar problemas con:
  - WebSockets (necesario para tiempo real)
  - Headers personalizados
  - SSL de CapRover

#### Registros DNS necesarios:

Para un deployment completo, necesitas estos registros:

| Tipo | Nombre | Contenido | Proxy | Descripción |
|------|--------|-----------|-------|-------------|
| A | `api` | IP del servidor | ⚪ Solo DNS | API Backend |
| A | `*` | IP del servidor | ⚪ Solo DNS | Wildcard para tenants |
| A | `panel` | IP del servidor | ⚪ Solo DNS | Panel global (opcional) |

### 5. Configurar Dominio del Backend en CapRover

Después de agregar el DNS en Cloudflare (espera 1-2 minutos para propagación):

En CapRover → weekly-backend → HTTP Settings:
- Domain: `api.weekly.pe` (o tu dominio de API)
- Force HTTPS: ✅ Activado
- Enable Built-in Load Balancer: ✅ (opcional, recomendado)

**Configuración detallada de HTTP Settings:**

1. **"No exponer como app web externamente"**:
   - ❌ **DESACTIVAR** (debe estar desactivado)
   - Tu app DEBE ser accesible externamente

2. **"Redirect all domains to"**:
   - Dejar vacío (o poner `api.weekly.pe` si quieres que todos redirijan allí)
   - Si dejas vacío, ambos dominios funcionarán:
     - `weekly-backend.panel.getdevtools.com` (por defecto)
     - `api.weekly.pe` (tu dominio personalizado)

3. **"Puerto HTTP del Contenedor"**:
   - No cambiar (dejar como está)
   - CapRover detecta automáticamente desde `EXPOSE 4000` en Dockerfile
   - O desde la variable de entorno `PORT=4000`

4. **"Forzar HTTPS redirigiendo todo el tráfico HTTP a HTTPS"**:
   - ✅ **ACTIVAR** (MUY IMPORTANTE)
   - Esto fuerza SSL/HTTPS automáticamente

5. **"Soporte para Websocket"**:
   - ✅ **ACTIVAR** (CRÍTICO para tu app)
   - Tu sistema usa WebSockets para actualizaciones en tiempo real
   - Sin esto, las notificaciones en tiempo real no funcionarán

**⚠️ IMPORTANTE - Mapeo de Puertos:**
- **NO necesitas configurar Port Mapping manualmente**
- CapRover detecta automáticamente el puerto desde:
  - `EXPOSE 4000` en el Dockerfile
  - O la variable de entorno `PORT=4000`
- CapRover usa su reverse proxy interno y enruta automáticamente
- Todas las apps se acceden por HTTP/HTTPS (puertos 80/443) externamente
- El puerto interno del contenedor (4000) se maneja automáticamente

**Port Mapping solo es necesario si:**
- Necesitas acceso directo al puerto del contenedor desde fuera de CapRover
- Para tu caso (web app normal): NO es necesario ✅

### 6. Solución de Problemas Comunes

#### Problema: Error "If you are the developer, check your application's logs"

**Posibles causas y soluciones:**

1. **Dominio no configurado en CapRover:**
   - Ve a weekly-backend → HTTP Settings
   - Verifica que `api.weekly.pe` esté en la lista de dominios
   - Si no está, agrégalo en "Domain" o "Custom Domain"

2. **Backend no está corriendo:**
   - Ve a weekly-backend → App Details
   - Status debe ser "Running" (verde)
   - Si está "Stopped", haz clic en "Restart"

3. **Variables de entorno faltantes:**
   - Ve a weekly-backend → App Config → Environment Variables
   - Verifica que todas las variables estén configuradas:
     - `DB_HOST`, `DB_PASSWORD`, `PORT`, `NODE_ENV`, etc.

4. **Error de conexión a base de datos:**
   - Verifica los logs: weekly-backend → App Logs
   - Busca errores de conexión a PostgreSQL
   - Verifica que `DB_HOST` sea `srv-captain--weekly-postgres`
   - Verifica que PostgreSQL esté corriendo

5. **DNS no propagado:**
   - Espera 1-2 minutos después de agregar el DNS en Cloudflare
   - Prueba: `ping api.weekly.pe` desde tu terminal
   - Debe resolver a la IP de tu servidor

6. **Probar dominio por defecto:**
   - Prueba: `https://weekly-backend.panel.getdevtools.com/health`
   - Si funciona aquí pero no en `api.weekly.pe` → problema de DNS/dominio
   - Si no funciona en ninguno → problema del backend

#### Problema: Advertencia de Cloudflare sobre IP expuesta

**⚠️ Esta advertencia es NORMAL y debe IGNORARSE:**

- Cloudflare quiere que actives el proxy para ocultar tu IP
- **PERO para CapRover debes mantener Proxy DESACTIVADO** (Solo DNS)
- Razones:
  - CapRover maneja SSL automáticamente con Let's Encrypt
  - El proxy de Cloudflare puede causar problemas con WebSockets
  - El proxy puede interferir con headers personalizados

**✅ Acción:** Mantener "Solo DNS" (nube gris ⚪) y ignorar la advertencia.

#### Configuración de Nginx Personalizada (Opcional)

CapRover maneja nginx automáticamente y generalmente NO necesitas configurarlo manualmente. Sin embargo, si necesitas configuración personalizada:

1. Ve a weekly-backend → App Config → Custom Nginx Config
2. Puedes agregar bloques personalizados de nginx si es necesario
3. **Generalmente NO es necesario** - CapRover maneja todo automáticamente

**Ejemplo de configuración personalizada (solo si es necesario):**

```nginx
location /api {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**⚠️ NO configures nginx personalizado a menos que tengas un problema específico que requiera esta configuración.**

---

## 🎨 Configuración del Frontend

### 1. Crear App Frontend en CapRover

**⚠️ Usar App Normal (NO One-Click App)**:

#### Opción A: Método 2 - Tarball (Recomendado)

**✅ RECOMENDADO**: Ya tienes el archivo `frontend-deploy.tar.gz` creado.

Pasos:

1. Ve a **CapRover Dashboard** → **Apps**
2. Haz clic en **"One-Click Apps / Dockerfile"**
3. Selecciona la pestaña **"Método 2: Tarball"**
4. Nombre de la app: `weekly-frontend`
5. Haz clic o arrastra el archivo: `frontend-deploy.tar.gz`
6. Espera a que termine el build

#### Opción B: Método 3 - Desplegar desde Git

Si prefieres automatización:

1. Ve a **CapRover Dashboard** → **Apps**
2. Selecciona **"Método 3: Desplegar desde Github/Bitbucket/Gitlab"**
3. Ingresa la información de tu repositorio
4. Configura el webhook en GitHub
5. Cada commit iniciará un nuevo build automáticamente

### 2. Dockerfile y captain-definition del Frontend

Ya tienes `frontend/Dockerfile` y `frontend/captain-definition`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. nginx.conf para Frontend

Crear `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 4. Variables de Entorno del Frontend

**⚠️ IMPORTANTE**: Las variables `VITE_*` se usan durante el BUILD TIME (cuando se ejecuta `npm run build` en el Dockerfile).

El Dockerfile del frontend ahora está configurado para usar estas variables. Dos opciones:

#### Opción A: Configurar ANTES del build (Recomendado)

1. **Antes de subir el tar.gz**, en CapRover:
   - Crea la app `weekly-frontend` (aunque todavía no la despliegues)
   - Ve a **App Config → Environment Variables**
   - Agrega las variables (ver abajo)
   - **Luego** despliega el tar.gz

#### Opción B: Configurar DESPUÉS del build

1. Despliega el tar.gz normalmente
2. Ve a **App Config → Environment Variables**
3. Agrega las variables
4. Ve a **App Config → App Settings**
5. Haz clic en **"Save & Update"** para forzar un rebuild

**Variables a agregar:**

```bash
# API Backend
VITE_API_URL=https://api.weekly.pe
VITE_WS_URL=wss://api.weekly.pe

# Entorno
VITE_ENV=production
```

**Nota**: El código del frontend también tiene detección automática del hostname, por lo que puede funcionar sin estas variables, pero es mejor configurarlas explícitamente.

### 5. Configurar Dominios Wildcard del Frontend

**⚠️ IMPORTANTE**: El frontend necesita wildcard domain para soportar múltiples tenants (`demo.weekly.pe`, `peluqueria.weekly.pe`, etc.)

#### Primero: Configurar DNS en Cloudflare

Agrega estos registros A en Cloudflare:

| Tipo | Nombre | Contenido | Proxy | Descripción |
|------|--------|-----------|-------|-------------|
| A | `*` | IP del servidor | ⚪ Solo DNS | Wildcard para todos los tenants |
| A | `@` | IP del servidor | ⚪ Solo DNS | Dominio raíz (weekly.pe) |
| A | `panel` | IP del servidor | ⚪ Solo DNS | Panel global (opcional) |

**⚠️ IMPORTANTE**: Proxy Cloudflare debe estar **DESACTIVADO** (Solo DNS) para todos estos registros.

#### Segundo: Configurar Dominios en CapRover

**⚠️ IMPORTANTE**: CapRover NO acepta wildcards (`*.weekly.pe`) directamente en el campo "Domain". Debes agregar dominios específicos uno por uno.

En CapRover → weekly-frontend → HTTP Settings:

**Dominios a agregar:**

1. **Domain principal** (campo "Domain"):
   - `weekly.pe` (dominio raíz para landing page)

2. **Custom Domains** (usar botón "Custom Domain" para agregar más):
   - `demo.weekly.pe` (tenant demo)
   - `panel.weekly.pe` (panel global)
   - `peluqueria.weekly.pe` (tenant peluquería - opcional)
   - `academia.weekly.pe` (tenant academia - opcional)
   - Agregar otros tenants según necesites

**Nota sobre wildcards:**
- Aunque CapRover no acepta `*.weekly.pe` directamente, si tienes configurado el DNS wildcard en Cloudflare (`*` → IP servidor), CapRover automáticamente enrutará cualquier subdominio que llegue al servidor, incluso si no está explícitamente listado.
- Sin embargo, es recomendable agregar los dominios principales que sabes que usarás para asegurar SSL/HTTPS correcto.

**Configuración detallada:**

1. **"No exponer como app web externamente"**:
   - ❌ **DESACTIVAR** (debe estar desactivado)

2. **"Redirect all domains to"**:
   - Dejar vacío (o poner `weekly.pe` si quieres redirigir todo allí)
   - Si dejas vacío, todos los dominios funcionarán independientemente

3. **"Puerto HTTP del Contenedor"**:
   - No cambiar (dejar como está)
   - CapRover detecta automáticamente: `80` desde `EXPOSE 80` en Dockerfile

4. **"Forzar HTTPS redirigiendo todo el tráfico HTTP a HTTPS"**:
   - ✅ **ACTIVAR** (MUY IMPORTANTE)

5. **"Soporte para Websocket"**:
   - ✅ **ACTIVAR** (importante para comunicación con backend)

---

## 🗃️ Inicialización de Bases de Datos

### Método 1: Automático (Recomendado)

El sistema crea automáticamente las bases de datos cuando:
1. Un tenant nuevo se conecta por primera vez
2. Se ejecuta una petición que requiere la base de datos

### Método 2: Manual (Si prefieres controlar)

Conectarte al contenedor PostgreSQL y crear bases iniciales:

```bash
# En CapRover, ir a weekly-postgres → Terminal
psql -U postgres

# Crear bases de datos manualmente
CREATE DATABASE weekly_global;
CREATE DATABASE agendate_demo;
CREATE DATABASE agendate_peluqueria;
CREATE DATABASE agendate_academia;

# Salir
\q
```

### Método 3: Script de Migración

Usar el script de migración que ejecuta `schema.sql`:

```bash
# Desde el backend
cd backend
npm run migrate --tenant=demo
npm run migrate --tenant=peluqueria
```

---

## 🔐 Seguridad y Configuración Avanzada

### Variables de Entorno Críticas

```bash
# JWT Secret (GENERAR UNO NUEVO Y SEGURO)
JWT_SECRET=usar-openssl-rand-hex-32

# Password de PostgreSQL (FUERTE)
DB_PASSWORD=password-complejo-minimo-32-caracteres

# CORS (solo tus dominios)
ALLOWED_ORIGINS=https://weekly.pe,https://*.weekly.pe,https://panel.weekly.pe
```

### Backup de Bases de Datos

CapRover puede hacer backups automáticos si configuras:

```bash
# En weekly-postgres, configurar volúmenes persistentes
/captain/data/weekly-postgres/data → /var/lib/postgresql/data
```

Luego hacer backups con `pg_dump`:

```bash
docker exec srv-captain--weekly-postgres pg_dump -U postgres agendate_demo > backup_demo.sql
```

---

## 📊 Estructura de Datos por Tenant

Cada base de datos (`agendate_{tenant}`) contiene:

```sql
-- Tablas por tenant
usuarios              (Usuarios del tenant)
establecimientos      (Servicios/Establecimientos)
colaboradores         (Staff/Profesores)
clientes              (Clientes del negocio)
reservas              (Turnos/Citas)
horarios_atencion     (Horarios de trabajo)
```

**Base de datos global** (`weekly_global`) contiene:
```sql
tenants               (Lista de todos los clientes B2B)
usuarios_globales     (Super admins)
configuracion_global  (Configuración del sistema)
```

---

## 🚀 Checklist de Deployment

### Pre-Deployment

- [ ] Configurar DNS wildcard: `*.weekly.pe` → IP de CapRover
- [ ] PostgreSQL corriendo y accesible
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET generado y seguro
- [ ] DB_PASSWORD configurado y seguro

### Deployment

- [ ] Backend desplegado y accesible en `api.weekly.pe`
- [ ] Frontend desplegado y accesible en `weekly.pe`
- [ ] Wildcard DNS funcionando: `demo.weekly.pe` funciona
- [ ] HTTPS habilitado en todas las apps
- [ ] Base de datos global creada e inicializada

### Post-Deployment

- [ ] Probar acceso a `demo.weekly.pe`
- [ ] Verificar que se crea la base de datos automáticamente
- [ ] Probar creación de nuevo tenant desde panel global
- [ ] Verificar backups de PostgreSQL
- [ ] Configurar monitoreo y logs

---

## 🐛 Troubleshooting

### Problema: "Database does not exist" o Base de datos no inicializada

**Solución 1: Usar script de inicialización (Recomendado)**

Ejecuta el script de inicialización dentro del contenedor del backend:

```bash
# Opción A: Desde CapRover (One-Click App Terminal)
# 1. Ve a CapRover → weekly-backend → App Logs
# 2. Haz clic en "One-Click App Terminal"
# 3. Ejecuta:
npm run init-db

# Opción B: Desde SSH al servidor
docker exec -it srv-captain--weekly-backend npm run init-db
```

El script hará:
- ✅ Crear `weekly_global` si no existe
- ✅ Inicializar esquema global
- ✅ Crear tenants básicos (demo, panel)
- ✅ Verificar e inicializar esquemas de tenants

**Solución 2: Manualmente**

Si el script falla, verificar manualmente:
1. PostgreSQL accesible desde backend: `DB_HOST=srv-captain--weekly-postgres`
2. Usuario tiene permisos de CREATE DATABASE
3. Variables de entorno `DB_*` correctas en CapRover
4. Ejecutar SQL manualmente desde psql

### Problema: "Connection refused" desde Backend a PostgreSQL

**Solución**: 
- Verificar que `DB_HOST` use el nombre del servicio: `srv-captain--weekly-postgres`
- O usar la IP interna del contenedor
- Verificar que el puerto 5432 esté expuesto internamente

### Problema: CORS errors en frontend

**Solución**:
- Verificar `ALLOWED_ORIGINS` incluye todos los dominios
- Asegurar que HTTPS esté habilitado
- Verificar que `VITE_API_URL` apunte al backend correcto

---

## 📝 Resumen

✅ **Cada cliente B2B tiene su propia base de datos PostgreSQL**
✅ **El sistema crea automáticamente las bases de datos cuando son necesarias**
✅ **Separación total de datos entre clientes**
✅ **Ideal para cumplimiento de privacidad y seguridad**

**Nomenclatura**:
- Base de datos: `agendate_{tenant}` (ej: `agendate_demo`)
- Cliente accede: `{tenant}.weekly.pe` (ej: `demo.weekly.pe`)

---

## 🐛 Troubleshooting Avanzado

### Problema: `weekly.pe` no responde aunque esté configurado

**Síntomas:**
- DNS funciona correctamente ✅
- Dominio está listado en CapRover HTTP Settings ✅
- Frontend funciona con dominio por defecto (`weekly-frontend.panel.getdevtools.com`) ✅
- Nginx del contenedor funciona correctamente ✅
- Pero `weekly.pe` no responde ❌

**Posibles causas y soluciones:**

#### 1. SSL aún no generado

CapRover genera SSL automáticamente con Let's Encrypt:
- Puede tardar **10-30 minutos** la primera vez
- Let's Encrypt puede tener rate limits
- Puede necesitar **hasta 1-2 horas** en casos extremos

**Solución:**
- Espera 30-60 minutos desde que agregaste el dominio
- Verifica logs de CapRover para progreso de SSL
- Verifica que Let's Encrypt Email esté configurado en CapRover Settings

#### 2. CapRover no ha procesado el cambio (MÁS COMÚN)

**Si todos los dominios están configurados pero ninguno funciona:**

**Solución paso a paso:**
1. Ve a CapRover Dashboard → weekly-frontend → HTTP Settings
2. **ELIMINA** todos los dominios de "Custom Domains" (uno por uno)
3. Haz clic en "Save & Update"
4. Espera 30 segundos
5. Agrega **solo** `weekly.pe`
6. Haz clic en "Save & Update"
7. Espera 5-10 minutos para generación de SSL
8. Prueba `weekly.pe`
9. Si funciona, agrega los demás dominios **uno por uno** esperando entre cada uno

**Si lo anterior no funciona:**
1. Ve a weekly-frontend → App Details
2. Haz clic en "Save & Update" (esto reinicia la app)
3. Espera 2-3 minutos
4. Vuelve a HTTP Settings
5. Agrega los dominios de nuevo
6. Espera 10-15 minutos

#### 3. Verificar logs de CapRover directamente

Si tienes acceso SSH al servidor:

```bash
# Ver logs de CapRover nginx
docker logs captain-nginx --tail 200

# Buscar errores específicos
docker logs captain-nginx | grep -i "weekly.pe"

# Verificar configuración de nginx de CapRover
docker exec captain-nginx cat /etc/nginx/conf.d/default.conf

# Buscar si weekly.pe está en server_name
docker exec captain-nginx cat /etc/nginx/conf.d/default.conf | grep -i "weekly.pe"
```

#### 4. Verificar firewall del servidor

```bash
# Verificar estado del firewall
sudo ufw status

# Verificar reglas iptables
sudo iptables -L -n | grep -E '(80|443)'

# Los puertos 80 y 443 deben estar abiertos
```

#### 5. Solución alternativa - Redirect en Cloudflare

Mientras tanto, como solución temporal:

1. Ve a Cloudflare → Rules → Redirects
2. Crea un redirect:
   - **Source URL**: `weekly.pe/*`
   - **Destination URL**: `https://weekly-frontend.panel.getdevtools.com/$1`
   - **Status Code**: `301 Permanent Redirect`
3. Esto funciona inmediatamente y no requiere configuración de CapRover

#### 6. Usar subdominios como alternativa

Si el dominio raíz (`weekly.pe`) no funciona:

1. En Cloudflare, agrega CNAME:
   - Tipo: `CNAME`
   - Nombre: `www`
   - Contenido: `weekly-frontend.panel.getdevtools.com`
   - Proxy: Solo DNS
2. En CapRover, agrega `www.weekly.pe` como Custom Domain
3. Configura redirect en Cloudflare: `weekly.pe` → `https://www.weekly.pe`

**Nota**: CNAME funciona mejor en subdominios que en dominio raíz.

### Problema: "No request data found" en AI Crawl Control de Cloudflare

**Causa**: Tienes DNS en "DNS only" (no proxied).

**Solución**: 
- ✅ **ESTO ES CORRECTO** para CapRover
- Mantén DNS only (NO cambies a proxied)
- AI Crawl Control aún funciona, solo no verás métricas en Cloudflare
- Los crawlers pueden seguir accediendo normalmente

**Recomendación para AI Crawl Control**:
- Configura los crawlers como "Allow" (especialmente ChatGPT-User, Claude-User, GPTBot)
- Esto permite que aparezcas en búsquedas de IA
- Beneficia SEO y visibilidad

### Problema: Error "nginx: [emerg] events directive is not allowed here"

**Causa**: `nginx.conf` del frontend tiene bloques `events {}` y `http {}` que no están permitidos en `/etc/nginx/conf.d/default.conf`.

**Solución**: 
El `nginx.conf` debe contener solo el bloque `server {}`, sin `events {}` ni `http {}`.

**Ejemplo correcto:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Verificación de componentes funcionando

Si `weekly.pe` no funciona, verifica que estos componentes funcionen:

```bash
# 1. Verificar DNS
dig weekly.pe
# Debe resolver a la IP del servidor CapRover

# 2. Verificar dominio por defecto
curl -I https://weekly-frontend.panel.getdevtools.com
# Debe responder con HTTP 200

# 3. Verificar backend
curl -I https://api.weekly.pe/health
# O
curl -I https://weekly-backend.panel.getdevtools.com/health
# Debe responder con HTTP 200

# 4. Verificar conectividad
ping weekly.pe
# Debe responder (si el firewall lo permite)
```

**Si el dominio por defecto funciona pero el personalizado no:**
- El problema es específico de la configuración del dominio personalizado
- Necesitas verificar SSL, configuración de CapRover, o esperar más tiempo

**Si ninguno funciona:**
- El problema es del frontend/backend mismo
- Verifica logs de la app en CapRover
- Verifica variables de entorno
- Verifica que la app esté en estado "Running"

---

## 📞 Pasos Finales

1. **Desplegar PostgreSQL** en CapRover
2. **Desplegar Backend** con variables de entorno correctas
3. **Desplegar Frontend** con wildcard domain
4. **Probar** con `demo.weekly.pe`
5. **Monitorear** la creación automática de bases de datos
6. **Si `weekly.pe` no funciona**: Seguir troubleshooting avanzado arriba

¡Tu sistema está listo para producción! 🎉
