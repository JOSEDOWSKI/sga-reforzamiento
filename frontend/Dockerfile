# Dockerfile para WEEKLY Frontend
FROM node:18-alpine as builder

# Crear directorio de trabajo
WORKDIR /app

# Variables de entorno para el build (pueden ser sobrescritas)
ARG VITE_API_URL=https://api.weekly.pe
ARG VITE_WS_URL=wss://api.weekly.pe
ARG VITE_ENV=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_ENV=$VITE_ENV

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . ./

# Construir aplicación (las variables VITE_* estarán disponibles)
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
