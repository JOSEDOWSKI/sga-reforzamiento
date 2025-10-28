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
    cat > backend/.env << EOF
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
EOF

    # Crear .env de producción para frontend
    cat > frontend/.env << EOF
# Configuración de producción WEEKLY Frontend
VITE_API_URL=https://api.weekly.pe
VITE_APP_NAME=WEEKLY
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_DEFAULT_TENANT=demo
VITE_ENABLE_TOUR=true
VITE_ENABLE_SPLASH=true
EOF

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

# Función para verificar dependencias
verify_dependencies() {
    log "📦 Verificando dependencias..."
    
    # Verificar backend
    if [[ ! -d "backend/node_modules" ]]; then
        warning "⚠️  Instalando dependencias del backend..."
        cd backend && npm install --production && cd ..
    fi
    
    # Verificar frontend
    if [[ ! -d "frontend/node_modules" ]]; then
        warning "⚠️  Instalando dependencias del frontend..."
        cd frontend && npm install && cd ..
    fi
    
    success "✅ Dependencias verificadas"
}

# Función para crear archivo de despliegue
create_deployment_guide() {
    log "📋 Creando guía de despliegue..."
    
    cat > DEPLOYMENT_GUIDE.md << EOF
# 🚀 Guía de Despliegue WEEKLY

## 📋 Pre-requisitos
- Servidor con CapRover instalado
- Dominio weekly.pe configurado en Cloudflare
- Base de datos PostgreSQL

## 🌐 Configuración DNS (Cloudflare)
\`\`\`
Type: A, Name: @, Content: 173.212.216.136
Type: A, Name: www, Content: 173.212.216.136
Type: A, Name: panel, Content: 173.212.216.136
Type: A, Name: demo, Content: 173.212.216.136
Type: A, Name: peluqueria, Content: 173.212.216.136
Type: A, Name: academia, Content: 173.212.216.136
Type: A, Name: *, Content: 173.212.216.136 (Wildcard)
\`\`\`

## 🗄️ Configuración de Base de Datos
1. Crear base de datos global: \`weekly_global\`
2. Ejecutar: \`backend/db/schema-global.sql\`
3. Crear tenant demo: \`backend/db/tenant-seed.sql\`

## 🚀 Despliegue en CapRover
1. Subir proyecto al servidor
2. Configurar aplicaciones:
   - Backend: Puerto 4000
   - Frontend: Puerto 80/443
3. Configurar variables de entorno
4. Desplegar aplicaciones

## 🔐 Credenciales por Defecto
- Super Admin: admin@weekly.pe / WeeklyAdmin2024!
- Demo Admin: admin@demo.weekly / password
- Demo Supervisor: supervisor@demo.weekly / password

## 📱 URLs de Acceso
- Landing: https://weekly.pe
- Panel Admin: https://panel.weekly.pe
- Demo: https://demo.weekly.pe
- Clientes: https://[tenant].weekly.pe

## 🛠️ Comandos Útiles
\`\`\`bash
# Verificar estado
curl https://api.weekly.pe/health

# Crear nuevo tenant
node backend/scripts/create-tenant.js [nombre]

# Limpiar tenants
node backend/scripts/cleanup-production-tenants.js
\`\`\`

## 📞 Soporte
- Email: admin@weekly.pe
- Documentación: Ver archivos en /docs
EOF

    success "✅ Guía de despliegue creada"
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
    
    verify_dependencies
    create_deployment_guide
    
    echo ""
    success "🎉 ¡WEEKLY está listo para producción!"
    echo ""
    log "📋 Próximos pasos:"
    log "1. Configurar DNS en Cloudflare"
    log "2. Subir proyecto al servidor"
    log "3. Configurar base de datos PostgreSQL"
    log "4. Desplegar en CapRover"
    log "5. Verificar funcionamiento"
    echo ""
    log "📖 Ver DEPLOYMENT_GUIDE.md para instrucciones detalladas"
}

# Ejecutar función principal
main "$@"
