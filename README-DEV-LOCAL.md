# 🚀 Desarrollo Local - WEEKLY

Guía completa para configurar y ejecutar WEEKLY (Frontend + Backend) en tu máquina local para desarrollo y pruebas.

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **npm** (viene con Node.js)
- **PostgreSQL** 12 o superior (solo para backend)
- **Git** (para clonar el repositorio)

## 🎯 Inicio Rápido

### Opción 1: Script Todo-en-Uno (Recomendado para primera vez)

Inicia Frontend y Backend juntos:

```bash
./dev-local-all.sh
```

Este script iniciará ambos servidores en segundo plano y te mostrará las URLs de acceso.

### Opción 2: Scripts Individuales

**Solo Frontend:**
```bash
cd frontend
./dev-local.sh
```

**Solo Backend:**
```bash
cd backend
./dev-local.sh
```

## 📚 Guías Detalladas

- **Frontend:** Ver [frontend/README-DEV-LOCAL.md](./frontend/README-DEV-LOCAL.md)
- **Backend:** Ver [backend/README-DEV-LOCAL.md](./backend/README-DEV-LOCAL.md)

## 🌐 URLs de Acceso

Una vez iniciados los servidores:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interfaz de usuario |
| **Backend API** | http://localhost:4000/api | API REST |
| **Health Check** | http://localhost:4000/health | Estado del backend |
| **WebSocket** | ws://localhost:4000 | Conexiones en tiempo real |

## 🗄️ Configuración de Base de Datos

### 1. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Verificar instalación
sudo systemctl status postgresql
```

### 2. Crear Base de Datos

```bash
# Entrar como usuario postgres
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE sga_reforzamiento;

# Salir
\q
```

### 3. Poblar con Datos Iniciales

```bash
cd backend
npm run seed
```

## ⚙️ Configuración

### Frontend

El frontend crea automáticamente un archivo `.env` con:

```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
VITE_ENV=development
```

### Backend

El backend crea automáticamente un archivo `.env` con:

```env
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
```

**⚠️ IMPORTANTE:** Ajusta las credenciales de PostgreSQL según tu configuración local.

## 🔧 Comandos Útiles

### Instalar dependencias

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### Limpiar e instalar desde cero

```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Ver logs en tiempo real

Si usaste `dev-local-all.sh`:

```bash
# Backend
tail -f /tmp/weekly-backend.log

# Frontend
tail -f /tmp/weekly-frontend.log
```

### Detener servidores

- Si ejecutaste scripts individuales: Presiona `Ctrl+C` en cada terminal
- Si usaste `dev-local-all.sh`: Presiona `Ctrl+C` en la terminal principal

## 🐛 Solución de Problemas Comunes

### "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verifica que la base de datos exista:
   ```bash
   psql -U postgres -l | grep sga_reforzamiento
   ```

3. Verifica credenciales en `backend/.env`

### "Port already in use"

```bash
# Ver qué proceso usa el puerto 4000
lsof -i :4000

# Matar el proceso
kill -9 $(lsof -ti:4000)

# O cambiar el puerto en .env
```

### "Module not found"

```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

### Frontend no se conecta al backend

1. Verifica que el backend esté corriendo: `curl http://localhost:4000/health`
2. Verifica `VITE_API_URL` en `frontend/.env`
3. Verifica `ALLOWED_ORIGINS` en `backend/.env`

## 📝 Estructura del Proyecto

```
sga-reforzamiento/
├── frontend/          # Aplicación React + Vite
│   ├── src/          # Código fuente
│   ├── dev-local.sh  # Script de desarrollo
│   └── README-DEV-LOCAL.md
├── backend/          # API Node.js + Express
│   ├── src/          # Código fuente
│   ├── db/           # Scripts de base de datos
│   ├── dev-local.sh  # Script de desarrollo
│   └── README-DEV-LOCAL.md
└── dev-local-all.sh  # Script para iniciar ambos
```

## 🎓 Próximos Pasos

1. ✅ Configurar entorno local
2. ✅ Ejecutar servidores
3. 📝 Hacer cambios y verlos en tiempo real (hot-reload)
4. 🧪 Probar funcionalidades
5. 🚀 Cuando estés listo, subir cambios al repositorio

## 🆘 Ayuda

- Revisa los README específicos en `frontend/` y `backend/`
- Verifica los logs de error en la consola
- Asegúrate de que todas las dependencias estén instaladas

---

**¡Feliz desarrollo! 🎉**

