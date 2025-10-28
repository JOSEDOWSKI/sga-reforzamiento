# Dockerfile para WEEKLY Frontend
FROM node:18-alpine as builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY frontend/ ./

# Construir aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
