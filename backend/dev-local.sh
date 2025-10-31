#!/bin/bash

# Script de desarrollo local para WEEKLY Backend
# Permite probar y hacer modificaciones en el backend localmente

set -e  # Salir si hay errores

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WEEKLY Backend - Script de Desarrollo Local         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
echo -e "${YELLOW}[1/6]${NC} Verificando Node.js..."
if ! command_exists node; then
    echo -e "${RED}❌ Node.js no está instalado.${NC}"
    echo -e "${YELLOW}   Por favor instala Node.js 18 o superior:${NC}"
    echo -e "   https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versión $NODE_VERSION detectada.${NC}"
    echo -e "${YELLOW}   Se requiere Node.js 18 o superior.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Verificar npm
echo -e "${YELLOW}[2/6]${NC} Verificando npm..."
if ! command_exists npm; then
    echo -e "${RED}❌ npm no está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detectado${NC}"

# Verificar PostgreSQL (opcional pero recomendado)
echo -e "${YELLOW}[3/6]${NC} Verificando PostgreSQL..."
if command_exists psql; then
    echo -e "${GREEN}✅ PostgreSQL detectado${NC}"
    PG_VERSION=$(psql --version | cut -d' ' -f3)
    echo -e "${BLUE}   Versión: $PG_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL no detectado en PATH${NC}"
    echo -e "${BLUE}   Asegúrate de que PostgreSQL esté instalado y corriendo${NC}"
    echo -e "${BLUE}   El backend intentará conectarse a: localhost:5432${NC}"
fi

# Verificar/Crear archivo .env
echo -e "${YELLOW}[4/6]${NC} Configurando variables de entorno..."
if [ ! -f .env ]; then
    echo -e "${BLUE}   Creando archivo .env...${NC}"
    cat > .env << EOF
# Variables de entorno para desarrollo local

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

# JWT Secret (cambia esto en producción)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS - Orígenes permitidos
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Frontend URL para WebSocket
FRONTEND_URL=http://localhost:5173

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}   ⚠️  IMPORTANTE: Revisa y ajusta las credenciales de PostgreSQL${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
    echo -e "${BLUE}   Variables principales:${NC}"
    grep -E "^(PORT|NODE_ENV|DB_|JWT_SECRET|ALLOWED_ORIGINS)=" .env | sed 's/^/      /' || echo "      (ninguna configurada)"
fi

# Instalar dependencias
echo -e "${YELLOW}[5/6]${NC} Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Instalando dependencias (esto puede tomar unos minutos)...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
    echo -e "${BLUE}   Si necesitas actualizar, ejecuta: npm install${NC}"
fi

# Información importante
echo ""
echo -e "${YELLOW}[6/6]${NC} Información del entorno:"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 Directorio:${NC} $SCRIPT_DIR"
echo -e "${BLUE}🌐 Servidor API:${NC} http://localhost:4000"
echo -e "${BLUE}🔌 WebSocket:${NC} ws://localhost:4000"
echo -e "${BLUE}💾 Base de datos:${NC} PostgreSQL en localhost:5432"
echo ""
echo -e "${YELLOW}⚠️  REQUISITOS ANTES DE INICIAR:${NC}"
echo -e "   1. ✅ PostgreSQL debe estar corriendo"
echo -e "   2. ✅ Base de datos 'sga_reforzamiento' debe existir"
echo -e "   3. ✅ Credenciales en .env deben ser correctas"
echo ""
echo -e "${BLUE}💡 Crear base de datos (si no existe):${NC}"
echo -e "   psql -U postgres -c \"CREATE DATABASE sga_reforzamiento;\""
echo ""
echo -e "${BLUE}💡 Poblar base de datos con datos iniciales:${NC}"
echo -e "   npm run seed"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Preguntar si quiere usar modo desarrollo (nodemon) o producción
echo -e "${YELLOW}¿Qué modo quieres usar?${NC}"
echo -e "   ${GREEN}1)${NC} Desarrollo (con nodemon - recarga automática)"
echo -e "   ${GREEN}2)${NC} Producción (modo normal)"
echo ""
read -p "Elige una opción (1 o 2): " mode

if [ "$mode" = "1" ] || [ "$mode" = "" ]; then
    # Verificar si nodemon está instalado
    if ! npm list nodemon >/dev/null 2>&1; then
        echo -e "${YELLOW}   Instalando nodemon como dependencia de desarrollo...${NC}"
        npm install --save-dev nodemon
    fi
    echo -e "${GREEN}🚀 Iniciando servidor en modo DESARROLLO (nodemon)...${NC}"
    echo -e "${YELLOW}   Los cambios se recargarán automáticamente${NC}"
    echo -e "${YELLOW}   Presiona Ctrl+C para detener el servidor${NC}"
    echo ""
    npm run dev
else
    echo -e "${GREEN}🚀 Iniciando servidor en modo PRODUCCIÓN...${NC}"
    echo -e "${YELLOW}   Presiona Ctrl+C para detener el servidor${NC}"
    echo ""
    npm start
fi

