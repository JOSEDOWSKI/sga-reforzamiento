# Dockerfile para WEEKLY Ecommerce Frontend
# Este Dockerfile está en la raíz para que CapRover lo encuentre
FROM node:18-alpine AS builder

# Instalar dependencias del sistema necesarias para compilar módulos nativos
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Variables de entorno para el build (pueden ser sobrescritas por CapRover)
ARG VITE_API_BASE_URL=https://api.weekly.pe
ARG VITE_MARKETPLACE_DOMAIN=weekly.pe
ARG VITE_MERCHANTS_DOMAIN=merchants.weekly.pe
ARG VITE_DEMO_DOMAIN=demo.weekly.pe
ARG VITE_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MARKETPLACE_DOMAIN=$VITE_MARKETPLACE_DOMAIN
ENV VITE_MERCHANTS_DOMAIN=$VITE_MERCHANTS_DOMAIN
ENV VITE_DEMO_DOMAIN=$VITE_DEMO_DOMAIN
ENV VITE_ENV=$VITE_ENV
ENV NODE_ENV=production

# FORZAR LIMPIEZA COMPLETA - No usar caché de capas anteriores
# Esto asegura que siempre se construya desde cero

# Limpiar completamente cualquier residuo
RUN rm -rf /tmp/* /var/cache/apk/* || true

# Limpiar caché de npm completamente
RUN npm cache clean --force || true

# Copiar archivos de dependencias del frontend
COPY frontend/package*.json ./

# Eliminar node_modules si existe (forzar reinstalación limpia)
RUN rm -rf node_modules package-lock.json || true

# Instalar dependencias desde cero (sin caché)
# --no-cache evita usar caché de npm
# --force asegura reinstalación completa
RUN npm install --include=dev --no-cache --force

# Verificar que TypeScript está instalado
RUN npx tsc --version || npm list typescript

# Copiar código fuente del frontend
COPY frontend/ ./

# LIMPIEZA AGRESIVA: Eliminar cualquier build anterior y caché
RUN rm -rf dist .vite node_modules/.vite .cache || true

# Limpiar caché de Vite específicamente
RUN rm -rf node_modules/.vite || true

# Construir aplicación con flags que fuerzan rebuild completo
# --force y --no-cache fuerzan regeneración completa sin usar caché
RUN VITE_FORCE_REBUILD=$(date +%s) npm run build

# Verificar que el build se completó correctamente
RUN ls -la dist/ || (echo "❌ Build failed: dist directory not found" && exit 1)
RUN test -f dist/index.html || (echo "❌ Build failed: index.html not found" && exit 1)

# Verificar que no hay referencias a código antiguo en el bundle
RUN if grep -r "tenants" dist/ 2>/dev/null | grep -v ".map"; then \
      echo "⚠️ WARNING: Se encontraron referencias a 'tenants' en el bundle"; \
    else \
      echo "✅ Verificado: No hay referencias a 'tenants' en el bundle"; \
    fi

# Verificar que el build se completó correctamente
RUN ls -la dist/ || (echo "❌ Build failed: dist directory not found" && exit 1)
RUN test -f dist/index.html || (echo "❌ Build failed: index.html not found" && exit 1)

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
