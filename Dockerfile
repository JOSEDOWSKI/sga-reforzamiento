# Dockerfile para WEEKLY Ecommerce Frontend
# Este Dockerfile está en la raíz para que CapRover lo encuentre
FROM node:18-alpine as builder

# Crear directorio de trabajo
WORKDIR /app

# Variables de entorno para el build (pueden ser sobrescritas por CapRover)
ARG VITE_API_BASE_URL=https://api.weekly.pe
ARG VITE_MARKETPLACE_DOMAIN=weekly.pe
ARG VITE_MERCHANTS_DOMAIN=merchants.weekly.pe
ARG VITE_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MARKETPLACE_DOMAIN=$VITE_MARKETPLACE_DOMAIN
ENV VITE_MERCHANTS_DOMAIN=$VITE_MERCHANTS_DOMAIN
ENV VITE_ENV=$VITE_ENV
ENV NODE_ENV=production

# Copiar archivos de dependencias del frontend
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar código fuente del frontend
COPY frontend/ ./

# Construir aplicación (las variables VITE_* estarán disponibles en tiempo de build)
RUN npm run build

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

