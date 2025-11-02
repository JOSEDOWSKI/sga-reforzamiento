#!/bin/bash

# Script para verificar el estado de las bases de datos

echo "🔍 Verificando conexión a PostgreSQL..."
echo ""

# Variables de conexión
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Función para verificar una base de datos
check_database() {
    local db_name=$1
    echo "📊 Verificando base de datos: $db_name"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db_name -c "\dt" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Base de datos '$db_name' accesible"
        echo ""
        
        # Contar tablas
        table_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db_name -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        echo "   📋 Número de tablas: $table_count"
        
        # Verificar tabla tenants (si existe)
        if [ "$db_name" = "weekly_global" ]; then
            tenant_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db_name -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | xargs)
            echo "   👥 Número de tenants: $tenant_count"
        fi
        
        echo ""
    else
        echo "❌ Error accediendo a la base de datos '$db_name'"
        echo ""
    fi
}

# Verificar bases de datos
echo "=== Verificando weekly_global ==="
check_database "weekly_global"

echo "=== Verificando weekly_demo ==="
check_database "weekly_demo"

echo "=== Verificando weekly_panel ==="
check_database "weekly_panel"

echo "=== Verificando weekly_peluqueria ==="
check_database "weekly_peluqueria"

echo "=== Verificando weekly_academia ==="
check_database "weekly_academia"

echo ""
echo "✅ Verificación completada"
echo ""
echo "💡 Si alguna base de datos no existe o tiene errores, ejecuta:"
echo "   npm run init-db"
echo ""

