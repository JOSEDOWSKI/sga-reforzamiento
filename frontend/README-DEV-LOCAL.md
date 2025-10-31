# 🚀 Desarrollo Local - WEEKLY Frontend

Guía rápida para configurar y ejecutar el frontend de WEEKLY en tu máquina local.

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **npm** (viene con Node.js)
- **Backend de WEEKLY** corriendo (por defecto en `http://localhost:4000`)

## 🎯 Inicio Rápido

### Opción 1: Usar el script automático (Recomendado)

```bash
cd frontend
./dev-local.sh
```

El script se encarga de:
- ✅ Verificar que Node.js y npm estén instalados
- ✅ Crear el archivo `.env` con configuración de desarrollo
- ✅ Instalar dependencias automáticamente
- ✅ Iniciar el servidor de desarrollo

### Opción 2: Configuración manual

```bash
# 1. Ir al directorio del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (si no existe)
cat > .env << EOF
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
VITE_ENV=development
EOF

# 4. Iniciar servidor de desarrollo
npm run dev
```

## 🌐 Acceso

Una vez iniciado, el frontend estará disponible en:

- **URL local:** http://localhost:5173
- **URL red local:** http://[tu-ip]:5173

## ⚙️ Configuración

### Variables de Entorno

Puedes editar el archivo `.env` para cambiar la configuración:

```env
# URL del backend API
VITE_API_URL=http://localhost:4000/api

# URL del WebSocket backend
VITE_WS_URL=ws://localhost:4000

# Entorno
VITE_ENV=development
```

### Cambiar el puerto del backend

Si tu backend está corriendo en otro puerto (ej: 3000, 5000), edita `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

### Probar con backend en producción

Para probar contra el backend en producción:

```env
VITE_API_URL=https://api.weekly.pe/api
VITE_WS_URL=wss://api.weekly.pe
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo (hot-reload automático)
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Linter
npm run lint
```

## 🐛 Solución de Problemas

### Error: "Node.js no está instalado"

Instala Node.js desde https://nodejs.org/ (versión 18 o superior)

### Error: "Port 5173 already in use"

Otro proceso está usando el puerto. Opciones:
1. Cerrar el otro proceso
2. Cambiar el puerto en `vite.config.ts`

### Error: "Cannot connect to backend"

Verifica que:
1. El backend esté corriendo en el puerto configurado
2. La URL en `.env` sea correcta
3. No haya firewall bloqueando la conexión

### Las dependencias no se instalan

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas Importantes

- El servidor de desarrollo tiene **hot-reload**: los cambios se reflejan automáticamente
- Los archivos `.env` están en `.gitignore`, no se suben al repositorio
- Para cambios en la configuración de Vite, edita `vite.config.ts`
- El puerto por defecto es `5173`, pero puedes cambiarlo en `vite.config.ts`

## 🆘 Ayuda Adicional

Si tienes problemas:

1. Verifica los logs del servidor en la terminal
2. Revisa la consola del navegador (F12)
3. Verifica que el backend esté respondiendo: `curl http://localhost:4000/health`

---

**¡Listo para desarrollar! 🎉**

