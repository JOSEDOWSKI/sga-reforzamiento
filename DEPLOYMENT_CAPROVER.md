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
├── weekly-postgres (Contenedor PostgreSQL)
├── weekly-backend  (Backend Node.js)
└── weekly-frontend (Frontend Vite/React)
```

---

## 🗄️ Configuración de PostgreSQL

### Opción 1: PostgreSQL como App de CapRover

1. **En CapRover Dashboard**, crear nueva app: `weekly-postgres`

2. **One-Click Apps** → Buscar "PostgreSQL" → Instalar

3. **Configurar variables de entorno** del contenedor PostgreSQL:
   ```bash
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=TU_PASSWORD_SEGURO
   POSTGRES_DB=postgres  # Base de datos inicial
   ```

4. **Obtener la IP interna** del contenedor PostgreSQL:
   - En CapRover Dashboard → Apps → weekly-postgres
   - Ver la IP interna (ej: `172.x.x.x`) o usar el nombre `srv-captain--weekly-postgres`

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

### 1. Crear App Backend en CapRover

```
Apps → One-Click Apps/Dockerfile
Nombre: weekly-backend
```

### 2. Dockerfile del Backend

Asegúrate de tener un `Dockerfile` en `backend/`:

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
DB_PASSWORD=TU_PASSWORD_SEGURO
DB_NAME_PREFIX=agendate_

# Entorno
NODE_ENV=production
USE_DEV_MODE=false

# Puerto
PORT=4000

# CORS
ALLOWED_ORIGINS=https://*.weekly.pe,https://weekly.pe,https://panel.weekly.pe

# JWT
JWT_SECRET=TU_JWT_SECRET_SUPER_SEGURO_AQUI
JWT_EXPIRES_IN=7d

# Dominio Base
BASE_URL=https://weekly.pe

# Tenants Permitidos (opcional, para seguridad adicional)
ALLOWED_TENANTS=demo,peluqueria,academia,cancha,veterinaria,odontologia,gimnasio
```

### 4. Configurar Dominio del Backend

En CapRover → weekly-backend → HTTP Settings:
- Domain: `api.weekly.pe` (o tu dominio de API)
- Force HTTPS: ✅ Activado

---

## 🎨 Configuración del Frontend

### 1. Crear App Frontend en CapRover

```
Apps → One-Click Apps/Dockerfile
Nombre: weekly-frontend
```

### 2. Dockerfile del Frontend (Producción)

Crear `frontend/Dockerfile`:

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

En CapRover → weekly-frontend → App Config → Environment Variables:

```bash
# API Backend
VITE_API_URL=https://api.weekly.pe
VITE_WS_URL=wss://api.weekly.pe

# Entorno
VITE_ENV=production
```

**⚠️ IMPORTANTE**: Las variables `VITE_*` se insertan en el build, no en runtime.

### 5. Configurar Dominios Wildcard del Frontend

En CapRover → weekly-frontend → HTTP Settings:
- Domain: `*.weekly.pe` (Wildcard)
- Custom Domain: También agregar `weekly.pe`, `panel.weekly.pe`
- Force HTTPS: ✅ Activado

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

### Problema: "Database does not exist"

**Solución**: El sistema crea automáticamente. Si falla, verificar:
1. PostgreSQL accesible desde backend
2. Usuario `postgres` tiene permisos de CREATE DATABASE
3. Variables de entorno `DB_*` correctas

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

## 📞 Pasos Finales

1. **Desplegar PostgreSQL** en CapRover
2. **Desplegar Backend** con variables de entorno correctas
3. **Desplegar Frontend** con wildcard domain
4. **Probar** con `demo.weekly.pe`
5. **Monitorear** la creación automática de bases de datos

¡Tu sistema está listo para producción! 🎉
