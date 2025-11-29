#!/bin/bash

# Script para limpiar y rebuild en producción
# Uso: ./rebuild-production.sh

set -e

echo "🔧 Iniciando proceso de limpieza y rebuild..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Paso 1: Verificar que estamos en el directorio correcto
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile no encontrado. ¿Estás en el directorio raíz del proyecto?"
    exit 1
fi

print_step "Directorio correcto detectado"

# Paso 2: Limpiar node_modules y dist (opcional)
read -p "¿Limpiar node_modules y dist locales? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_step "Limpiando node_modules y dist..."
    cd frontend
    rm -rf node_modules dist .vite 2>/dev/null || true
    cd ..
    print_step "Limpieza local completada"
fi

# Paso 3: Limpiar caché de npm
read -p "¿Limpiar caché de npm? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_step "Limpiando caché de npm..."
    npm cache clean --force 2>/dev/null || true
    print_step "Caché de npm limpiada"
fi

# Paso 4: Verificar archivos críticos
print_step "Verificando archivos críticos..."

files_to_check=(
    "Dockerfile"
    "captain-definition"
    "frontend/nginx.conf"
    "frontend/src/services/demoData.ts"
    "frontend/src/services/api.ts"
    "frontend/package.json"
)

missing_files=()

for file in "${files_to_check[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        print_error "Archivo faltante: $file"
    else
        print_step "Archivo encontrado: $file"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Faltan archivos críticos. Por favor, verifica el repositorio."
    exit 1
fi

# Paso 5: Verificar build local (opcional)
read -p "¿Verificar build local antes de push? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_step "Ejecutando build local..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules no encontrado. Instalando dependencias..."
        npm install
    fi
    
    if npm run build; then
        print_step "Build local exitoso"
        
        if [ -f "dist/index.html" ]; then
            print_step "dist/index.html generado correctamente"
        else
            print_error "dist/index.html no encontrado después del build"
            exit 1
        fi
    else
        print_error "Build local falló. Revisa los errores antes de continuar."
        exit 1
    fi
    
    cd ..
fi

# Paso 6: Verificar estado de git
print_step "Verificando estado de git..."

if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "Hay cambios sin commitear"
    git status --short
    
    read -p "¿Hacer commit y push? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Mensaje del commit: " commit_message
        if [ -z "$commit_message" ]; then
            commit_message="fix: rebuild production"
        fi
        
        git add -A
        git commit -m "$commit_message"
        print_step "Commit creado"
        
        if git push origin main; then
            print_step "Push completado"
        else
            print_error "Push falló"
            exit 1
        fi
    else
        print_warning "No se hizo commit. Los cambios locales no se pushearon."
    fi
else
    print_step "No hay cambios pendientes"
    
    read -p "¿Hacer push de todos modos? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        if git push origin main; then
            print_step "Push completado"
        else
            print_error "Push falló"
            exit 1
        fi
    fi
fi

# Paso 7: Instrucciones finales
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Proceso de limpieza completado${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximos pasos en CapRover Dashboard:"
echo ""
echo "   1. Abre CapRover Dashboard"
echo "   2. Ve a tu app del frontend"
echo "   3. Ve a 'App Configs' > 'Build Settings'"
echo "   4. Haz clic en 'Clear Build Cache'"
echo "   5. Ve a 'Deploy' o 'One-Click Apps/Dockerfile'"
echo "   6. Haz clic en 'Force Rebuild' (marca 'No Cache' si está disponible)"
echo "   7. Espera 3-7 minutos a que termine el build"
echo "   8. Revisa los logs para verificar que no hay errores"
echo "   9. Prueba las URLs:"
echo "      • https://demo.weekly.pe/lima"
echo "      • https://weekly.pe/lima"
echo "      • https://merchants.weekly.pe"
echo ""
echo "💡 Tip: Limpia la caché del navegador (Ctrl+Shift+R) después del deploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

