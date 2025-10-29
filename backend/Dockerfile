# Dockerfile para WEEKLY Backend
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY backend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY backend/ ./

# Crear directorio para logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000
ENV USE_DEV_MODE=false

# Comando de inicio
CMD ["node", "src/index.js"]
