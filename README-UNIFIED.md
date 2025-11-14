# Weekly - Proyecto Unificado (Backend + Frontend)

Este proyecto unifica el backend y frontend de Weekly en un solo contenedor Docker con Nginx como servidor web.

## 🏗️ Estructura del Proyecto

```
.
├── backend/          # Código del backend (Node.js/Express)
├── frontend/         # Código del frontend (React/Vite)
├── Dockerfile        # Dockerfile unificado multi-stage
├── docker-compose.yml # Configuración para desarrollo local
├── nginx.conf        # Configuración de Nginx
├── supervisord.conf  # Configuración de Supervisor
├── .env.example      # Variables de entorno de ejemplo
└── package.json      # Scripts unificados
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus valores
```

### 2. Desarrollo Local con Docker Compose

```bash
# Iniciar todo (PostgreSQL + App)
npm run dev

# O con rebuild
npm run dev:build

# Ver logs
npm run dev:logs

# Detener
npm run dev:down
```

### 3. Build de Producción

```bash
# Build de la imagen
npm run build

# O con docker-compose
docker-compose -f docker-compose.prod.yml up --build
```

## 📦 Variables de Entorno

Todas las variables están en `.env.example`. Las principales son:

### Backend
- `DB_*` - Configuración de PostgreSQL
- `JWT_SECRET` - Secreto para tokens JWT
- `PORT` - Puerto del backend (4000)
- `NODE_ENV` - Entorno (development/production)

### Frontend (VITE_*)
- `VITE_API_URL` - URL de la API
- `VITE_WS_URL` - URL de WebSocket
- `VITE_DEFAULT_TENANT` - Tenant por defecto

## 🐳 Docker

### Build Manual

```bash
docker build -t weekly:latest .
```

### Run Manual

```bash
docker run -d \
  --name weekly \
  -p 80:80 \
  -p 4000:4000 \
  --env-file .env \
  weekly:latest
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia desarrollo con docker-compose
- `npm run build` - Build de la imagen Docker
- `npm run start` - Inicia en producción
- `npm run stop` - Detiene los contenedores
- `npm run clean` - Limpia volúmenes y contenedores

## 📝 Notas

- El frontend se construye en la etapa de build
- Nginx sirve el frontend estático en el puerto 80
- El backend corre en el puerto 4000 (interno)
- Supervisor gestiona ambos procesos
- Las variables `VITE_*` se inyectan en el build del frontend

## 🔄 Migración desde Proyectos Separados

Si vienes de tener backend y frontend separados:

1. **No borres nada** - Los directorios `backend/` y `frontend/` se mantienen
2. **Copia variables** - Usa `.env.example` como base y copia tus variables existentes
3. **Build y prueba** - Usa `npm run dev:build` para probar localmente
4. **Deploy** - El Dockerfile unificado está listo para producción

## 🚢 Deploy en Producción

Para CapRover o cualquier plataforma:

1. Build de la imagen: `docker build -t weekly:latest .`
2. Push a registry (opcional)
3. Deploy con las variables de entorno configuradas

El contenedor expone:
- Puerto 80: Frontend (Nginx)
- Puerto 4000: Backend (interno, solo accesible desde Nginx)

