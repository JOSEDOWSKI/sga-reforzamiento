# SGA - Sistema de Gestión de Agendamiento de Clases

Este proyecto es una aplicación web completa para la gestión y reserva de clases de reforzamiento. Está dividido en dos componentes principales: un **backend** (servidor de API) y un **frontend** (interfaz de usuario).

## Arquitectura

- **Backend:** Una API RESTful construida con Node.js, Express y PostgreSQL. Se encarga de toda la lógica de negocio y la comunicación con la base de datos.
- **Frontend:** Una aplicación de una sola página (SPA) construida con React y Vite. Consume la API del backend para mostrar los datos y ofrecer interactividad al usuario.

---

## 🚀 Puesta en Marcha del Proyecto Completo

Para levantar el proyecto, necesitarás tener dos terminales abiertas, una para el backend y otra para el frontend. Sigue los pasos en orden.

### 1. Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- [**Node.js**](https://nodejs.org/) (versión 18 o superior).
- [**PostgreSQL**](https://www.postgresql.org/). El servidor de la base de datos debe estar en ejecución.

### 2. Configuración del Backend

En tu primera terminal, navega a la carpeta del backend y sigue estos pasos:

```bash
# 1. Ve a la carpeta del backend
cd backend

# 2. Instala las dependencias
npm install

# 3. Crea la base de datos en PostgreSQL
#    (Solo necesitas hacer esto la primera vez. Puede que te pida tu contraseña de postgres)
psql -U postgres -c "CREATE DATABASE sga_reforzamiento;"

# 4. Pobla la base de datos con datos de ejemplo (cursos, profesores, etc.)
npm run seed

# 5. Inicia el servidor del backend
npm start
```
¡Listo! El backend debería estar corriendo en `http://localhost:3001`.

### 3. Configuración del Frontend

Ahora, en tu segunda terminal, configura la interfaz de usuario:

```bash
# 1. Ve a la carpeta del frontend
cd frontend

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo del frontend
npm run dev
```
¡Ya está! La aplicación web debería estar disponible en `http://localhost:5173` (o el puerto que indique Vite en la consola).

---

## Scripts Disponibles

### Backend (`/backend`)
- `npm start`: Inicia el servidor con `nodemon`, que se reinicia automáticamente con los cambios.
- `npm run seed`: Borra los datos existentes y puebla la base de datos con datos de prueba.

### Frontend (`/frontend`)
- `npm run dev`: Inicia el servidor de desarrollo de Vite con Hot-Reload.
- `npm run build`: Compila la aplicación de React para producción.

Ahora, con este archivo en la raíz, cualquier desarrollador podrá clonar el repositorio y tener todo el entorno funcionando en minutos. 