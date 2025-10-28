#!/bin/bash

echo "🚀 Preparando WEEKLY para producción..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para eliminar archivos de desarrollo
cleanup_dev_files() {
    log "🧹 Eliminando archivos de desarrollo..."
    
    # Archivos de desarrollo del backend
    rm -f backend/backend.log
    rm -f backend/test-local.sh
    rm -f backend/weekly.env.example
    
    # Archivos de desarrollo del frontend
    rm -f frontend/proxy-server.cjs
    rm -f frontend/proxy-server.js
    rm -f frontend/test-local.sh
    rm -f frontend/README.md
    rm -f frontend/src/App-original.tsx
    rm -f frontend/vite.config.d.ts
    rm -f frontend/vite.config.js
    
    # Archivos de desarrollo del root
    rm -f test-local.sh
    rm -f setup-database.sh
    rm -f setup-postgres-local.sh
    rm -f docker-postgres.sh
    rm -f fix-postgres.sh
    rm -f verify-deployment.sh
    rm -f deploy.sh
    
    # Archivos de documentación de desarrollo
    rm -f WEEKLY_CHANGES_SUMMARY.md
    rm -f WEEKLY_TENANT_SYSTEM_CORRECTED.md
    rm -f DEPLOYMENT_SUMMARY.md
    rm -f DEPLOYMENT.md
    
    success "✅ Archivos de desarrollo eliminados"
}

# Función para crear archivos de producción
create_production_files() {
    log "📝 Creando archivos de producción..."
    
    # Crear .env de producción para backend
    cat > backend/.env << 'ENVEOF'
# Configuración de producción WEEKLY
NODE_ENV=production
PORT=4000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weekly_global
DB_USER=weekly_user
DB_PASSWORD=weekly_password_2024

# JWT
JWT_SECRET=weekly_jwt_secret_production_2024_secure_key

# CORS
FRONTEND_URL=https://weekly.pe
CORS_ORIGINS=https://weekly.pe,https://www.weekly.pe,https://panel.weekly.pe,https://*.weekly.pe

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Configuración de tenant
DEFAULT_TENANT=demo
ALLOWED_TENANTS=demo,peluqueria,academia,cliente,cancha,veterinaria,odontologia,gimnasio

# Credenciales de super admin
ADMIN_EMAIL=admin@weekly.pe
ADMIN_PASSWORD=WeeklyAdmin2024!

# Modo desarrollo (deshabilitado en producción)
USE_DEV_MODE=false
ENVEOF

    # Crear .env de producción para frontend
    cat > frontend/.env << 'ENVEOF'
# Configuración de producción WEEKLY Frontend
VITE_API_URL=https://api.weekly.pe
VITE_APP_NAME=WEEKLY
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_DEFAULT_TENANT=demo
VITE_ENABLE_TOUR=true
VITE_ENABLE_SPLASH=true
ENVEOF

    success "✅ Archivos de producción creados"
}

# Función para verificar archivos críticos
verify_critical_files() {
    log "🔍 Verificando archivos críticos..."
    
    local missing_files=()
    
    # Verificar archivos críticos del backend
    [[ ! -f "backend/package.json" ]] && missing_files+=("backend/package.json")
    [[ ! -f "backend/src/index.js" ]] && missing_files+=("backend/src/index.js")
    [[ ! -f "backend/Dockerfile" ]] && missing_files+=("backend/Dockerfile")
    [[ ! -f "backend/captain-definition" ]] && missing_files+=("backend/captain-definition")
    
    # Verificar archivos críticos del frontend
    [[ ! -f "frontend/package.json" ]] && missing_files+=("frontend/package.json")
    [[ ! -f "frontend/src/main.tsx" ]] && missing_files+=("frontend/src/main.tsx")
    [[ ! -f "frontend/Dockerfile" ]] && missing_files+=("frontend/Dockerfile")
    [[ ! -f "frontend/captain-definition" ]] && missing_files+=("frontend/captain-definition")
    [[ ! -f "frontend/nginx.conf" ]] && missing_files+=("frontend/nginx.conf")
    
    # Verificar archivos de configuración
    [[ ! -f "caprover-config.json" ]] && missing_files+=("caprover-config.json")
    [[ ! -f "captain-definition" ]] && missing_files+=("captain-definition")
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        error "❌ Archivos críticos faltantes:"
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
        return 1
    fi
    
    success "✅ Todos los archivos críticos están presentes"
    return 0
}

# Función principal
main() {
    log "🎯 Iniciando preparación para producción..."
    
    # Verificar que estamos en el directorio correcto
    if [[ ! -f "package.json" && ! -d "backend" && ! -d "frontend" ]]; then
        error "❌ No se encontró la estructura del proyecto WEEKLY"
        exit 1
    fi
    
    # Ejecutar pasos de preparación
    cleanup_dev_files
    create_production_files
    
    if ! verify_critical_files; then
        error "❌ Verificación de archivos críticos falló"
        exit 1
    fi
    
    echo ""
    success "🎉 ¡WEEKLY está listo para producción!"
    echo ""
    log "📋 Próximos pasos:"
    log "1. Configurar DNS en Cloudflare"
    log "2. Subir proyecto al servidor"
    log "3. Configurar base de datos PostgreSQL"
    log "4. Desplegar en CapRover"
    log "5. Verificar funcionamiento"
}

# Ejecutar función principal
main "$@"
