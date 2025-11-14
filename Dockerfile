# Dockerfile unificado para WEEKLY - Backend + Frontend
# Multi-stage build para optimizar tamaño de imagen

# ============================================
# ETAPA 1: Build del Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar archivos de dependencias del frontend
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/ ./

# Variables de entorno para el build (pueden ser sobrescritas con ARG)
ARG VITE_API_URL=https://api.weekly.pe
ARG VITE_WS_URL=wss://api.weekly.pe
ARG VITE_ENV=production
ARG VITE_DEFAULT_TENANT=demo
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_ENV=$VITE_ENV
ENV VITE_DEFAULT_TENANT=$VITE_DEFAULT_TENANT
ENV VITE_EMAILJS_SERVICE_ID=$VITE_EMAILJS_SERVICE_ID
ENV VITE_EMAILJS_TEMPLATE_ID=$VITE_EMAILJS_TEMPLATE_ID
ENV VITE_EMAILJS_PUBLIC_KEY=$VITE_EMAILJS_PUBLIC_KEY

# Construir aplicación frontend
RUN npm run build

# ============================================
# ETAPA 2: Build del Backend
# ============================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Instalar dependencias del sistema para backend
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Copiar archivos de dependencias del backend
COPY backend/package*.json ./

# Instalar dependencias del backend
RUN npm ci --only=production

# Copiar código fuente del backend
COPY backend/ ./

# ============================================
# ETAPA 3: Imagen Final con Nginx + Node.js
# ============================================
FROM node:18-alpine

# Instalar Nginx y dependencias del sistema
RUN apk add --no-cache \
    nginx \
    postgresql-client \
    curl \
    bash \
    supervisor

# Crear directorios necesarios
WORKDIR /app
RUN mkdir -p /app/backend /app/frontend/dist /var/log/supervisor /var/run/nginx

# Copiar backend desde etapa de build
COPY --from=backend-builder /app/backend /app/backend

# Copiar frontend construido desde etapa de build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar configuración de Supervisor para gestionar procesos
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Crear directorio para logs
RUN mkdir -p /app/backend/logs

# Exponer puertos
EXPOSE 80 4000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000
ENV USE_DEV_MODE=false

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Iniciar Supervisor que gestionará Nginx y Node.js
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

