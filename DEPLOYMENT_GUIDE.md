# 🚀 Guía de Despliegue WEEKLY

## 📋 Pre-requisitos
- Servidor con CapRover instalado
- Dominio weekly.pe configurado en Cloudflare
- Base de datos PostgreSQL

## 🌐 Configuración DNS (Cloudflare)
```
Type: A, Name: @, Content: 173.212.216.136
Type: A, Name: www, Content: 173.212.216.136
Type: A, Name: panel, Content: 173.212.216.136
Type: A, Name: demo, Content: 173.212.216.136
Type: A, Name: peluqueria, Content: 173.212.216.136
Type: A, Name: academia, Content: 173.212.216.136
Type: A, Name: *, Content: 173.212.216.136 (Wildcard)
```

## 🗄️ Configuración de Base de Datos
1. Crear base de datos global: `weekly_global`
2. Ejecutar: `backend/db/schema-global.sql`
3. Crear tenant demo: `backend/db/tenant-seed.sql`

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
```bash
# Verificar estado
curl https://api.weekly.pe/health

# Crear nuevo tenant
node backend/scripts/create-tenant.js [nombre]

# Limpiar tenants
node backend/scripts/cleanup-production-tenants.js
```

## 📞 Soporte
- Email: admin@weekly.pe
- Documentación: Ver archivos en /docs
