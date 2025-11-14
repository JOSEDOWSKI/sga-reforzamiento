#!/bin/bash
# Script para ejecutar comandos en el contenedor del backend de weekly
# Uso: ./exec-backend.sh <comando>
# Ejemplo: ./exec-backend.sh "npm run init-demo-complete"

CONTAINER=$(docker ps | grep weekly-backend | awk '{print $NF}' | head -1)

if [ -z "$CONTAINER" ]; then
    echo "❌ No se encontró el contenedor de weekly-backend"
    echo "💡 Verifica que el contenedor esté corriendo: docker ps | grep weekly-backend"
    exit 1
fi

echo "✅ Contenedor encontrado: $CONTAINER"
echo "🚀 Ejecutando: $@"
echo ""

docker exec -it "$CONTAINER" "$@"

