#!/bin/bash

echo "🔧 Corrigiendo /etc/hosts..."
echo ""

# Crear backup
sudo cp /etc/hosts /etc/hosts.backup
echo "✅ Backup creado: /etc/hosts.backup"

# Eliminar líneas con weekly.* que apuntan a 127.0.0.1
sudo sed -i '/127\.0\.0\.1.*weekly/d' /etc/hosts

echo "✅ Entradas incorrectas eliminadas"
echo ""
echo "📋 /etc/hosts ahora debería tener solo las entradas básicas"
echo ""
echo "✨ Reinicia tu navegador y prueba weekly.pe"
echo ""
echo "Si necesitas restaurar el backup:"
echo "  sudo cp /etc/hosts.backup /etc/hosts"

