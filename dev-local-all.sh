#!/bin/bash

# Script para iniciar Frontend y Backend juntos en desarrollo local
# Útil para probar la aplicación completa

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WEEKLY - Iniciar Frontend y Backend Localmente       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Obtener directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo -e "${GREEN}[1/2]${NC} Iniciando Backend..."
cd "$SCRIPT_DIR/backend"
./dev-local.sh > /tmp/weekly-backend.log 2>&1 &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar Frontend
echo -e "${GREEN}[2/2]${NC} Iniciando Frontend..."
cd "$SCRIPT_DIR/frontend"
./dev-local.sh > /tmp/weekly-frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Servidores iniciados${NC}"
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔌 Backend:${NC} http://localhost:4000/api"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo -e "   Backend:  tail -f /tmp/weekly-backend.log"
echo -e "   Frontend: tail -f /tmp/weekly-frontend.log"
echo ""
echo -e "${YELLOW}⚠️  Presiona Ctrl+C para detener ambos servidores${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Esperar
wait

