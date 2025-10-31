# 🚀 Desarrollo Local - WEEKLY Backend

Guía rápida para configurar y ejecutar el backend de WEEKLY en tu máquina local.

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **npm** (viene con Node.js)
- **PostgreSQL** 12 o superior
- **Base de datos** `sga_reforzamiento` creada

## 🎯 Inicio Rápido

### Opción 1: Usar el script automático (Recomendado)

```bash
cd backend
./dev-local.sh
```

El script se encarga de:
- ✅ Verificar que Node.js y npm estén instalados
- ✅ Verificar PostgreSQL (opcional)
- ✅ Crear el archivo `.env` con configuración de desarrollo
- ✅ Instalar dependencias automáticamente
- ✅ Iniciar el servidor en modo desarrollo (con nodemon)

### Opción 2: Configuración manual

```bash
# 1. Ir al directorio del backend
cd backend

# 2. Crear archivo .env
cat > .env << EOF
NODE_ENV=development
PORT=4000
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sga_reforzamiento
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
EOF

# 3. Instalar dependencias
npm install

# 4. Crear base de datos (si no existe)
psql -U postgres -c "CREATE DATABASE sga_reforzamiento;"

# 5. Iniciar servidor de desarrollo
npm run dev
```

## 🗄️ Configuración de Base de Datos

### Crear la base de datos

```bash
# Opción 1: Desde la línea de comandos
psql -U postgres -c "CREATE DATABASE sga_reforzamiento;"

# Opción 2: Entrar a psql y crear
psql -U postgres
CREATE DATABASE sga_reforzamiento;
\q
```

### Poblar con datos iniciales

```bash
npm run seed
```

## 🌐 Acceso

Una vez iniciado, el backend estará disponible en:

- **API:** http://localhost:4000/api
- **Health Check:** http://localhost:4000/health
- **WebSocket:** ws://localhost:4000

## ⚙️ Configuración

### Variables de Entorno (.env)

El archivo `.env` contiene todas las configuraciones:

```env
# Entorno
NODE_ENV=development

# Puerto del servidor
PORT=4000

# Base de datos PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sga_reforzamiento
DB_PASSWORD=postgres

# JWT Secret (IMPORTANTE: cambia esto en producción)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS - Orígenes permitidos
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Frontend URL para WebSocket
FRONTEND_URL=http://localhost:5173
```

### Cambiar credenciales de PostgreSQL

Edita el archivo `.env`:

```env
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo (con nodemon - recarga automática)
npm run dev

# Producción
npm start

# Poblar base de datos con datos iniciales
npm run seed

# Crear un nuevo tenant
npm run create-tenant

# Verificar configuración de entorno
npm run check-env
```

## 🐛 Solución de Problemas

### Error: "Node.js no está instalado"

Instala Node.js desde https://nodejs.org/ (versión 18 o superior)

### Error: "Cannot connect to database"

Verifica que:
1. PostgreSQL esté corriendo: `sudo systemctl status postgresql`
2. La base de datos exista: `psql -U postgres -l`
3. Las credenciales en `.env` sean correctas

### Error: "Port 4000 already in use"

Otro proceso está usando el puerto. Opciones:
1. Cerrar el otro proceso: `lsof -ti:4000 | xargs kill -9`
2. Cambiar el puerto en `.env`: `PORT=4001`

### Error: "Module not found"

```bash
# Limpiar e instalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### El servidor no recarga con cambios

Asegúrate de usar `npm run dev` (con nodemon) en lugar de `npm start`

## 📝 Endpoints Principales

- `GET /health` - Health check del servidor
- `POST /api/global-auth/login` - Login de usuarios
- `GET /api/tenants/config/:tenant` - Configuración del tenant
- WebSocket en `ws://localhost:4000` - Eventos en tiempo real

## 🔐 Seguridad

⚠️ **IMPORTANTE para Producción:**
- Cambia `JWT_SECRET` por un valor seguro y aleatorio
- Usa variables de entorno del sistema en lugar de `.env`
- Revisa `ALLOWED_ORIGINS` para no permitir orígenes no autorizados

## 🆘 Ayuda Adicional

Si tienes problemas:

1. Verifica los logs del servidor en la terminal
2. Revisa que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
3. Verifica la conexión a la BD: `psql -U postgres -d sga_reforzamiento -c "SELECT 1;"`
4. Revisa el archivo `.env` y verifica las credenciales

---

**¡Listo para desarrollar! 🎉**

