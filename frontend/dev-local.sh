#!/bin/bash

# Script de desarrollo local para WEEKLY Frontend
# Permite probar y hacer modificaciones en el frontend localmente

set -e  # Salir si hay errores

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WEEKLY Frontend - Script de Desarrollo Local        ║${NC}"
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
echo -e "${YELLOW}[1/5]${NC} Verificando Node.js..."
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
echo -e "${YELLOW}[2/5]${NC} Verificando npm..."
if ! command_exists npm; then
    echo -e "${RED}❌ npm no está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detectado${NC}"

# Verificar/Crear archivo .env
echo -e "${YELLOW}[3/5]${NC} Configurando variables de entorno..."
if [ ! -f .env ]; then
    echo -e "${BLUE}   Creando archivo .env...${NC}"
    cat > .env << EOF
# Variables de entorno para desarrollo local
# API Backend - por defecto apunta a localhost:4000
VITE_API_URL=http://localhost:4000/api

# WebSocket Backend - por defecto apunta a localhost:4000
VITE_WS_URL=ws://localhost:4000

# Entorno
VITE_ENV=development
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${BLUE}   Puedes editarlo para cambiar la URL del backend${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
    echo -e "${BLUE}   Variables actuales:${NC}"
    grep -E "VITE_" .env | sed 's/^/      /' || echo "      (ninguna configurada)"
fi

# Instalar dependencias
echo -e "${YELLOW}[4/5]${NC} Verificando dependencias..."
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
echo -e "${YELLOW}[5/5]${NC} Información del entorno:"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 Directorio:${NC} $SCRIPT_DIR"
echo -e "${BLUE}🌐 Servidor de desarrollo:${NC} http://localhost:5173"
echo -e "${BLUE}🔌 API Backend (por defecto):${NC} http://localhost:4000/api"
echo -e "${BLUE}📡 WebSocket (por defecto):${NC} ws://localhost:4000"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   1. Asegúrate de que el backend esté corriendo en el puerto 4000"
echo -e "   2. Si el backend está en otro puerto, edita el archivo .env"
echo -e "   3. El frontend se recargará automáticamente al hacer cambios"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Iniciar servidor de desarrollo
echo -e "${GREEN}🚀 Iniciando servidor de desarrollo...${NC}"
echo -e "${YELLOW}   Presiona Ctrl+C para detener el servidor${NC}"
echo ""

npm run dev

