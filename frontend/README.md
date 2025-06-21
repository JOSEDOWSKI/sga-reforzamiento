# SGA Reforzamiento - Frontend

¡Bienvenido al frontend del Sistema de Gestión de Agendamiento! Este documento te guiará para que puedas instalar, entender y empezar a desarrollar la interfaz de usuario de la aplicación.

## 1. ¿Qué es este proyecto?

Este proyecto es una aplicación de una sola página (SPA) construida con React que funciona como un "Calendly" interno para la reserva de clases de reforzamiento. La interfaz permite a los usuarios del área de ventas:
- Gestionar Cursos, Profesores y los Temas de cada curso.
- Reservar una clase para un alumno, seleccionando curso, tema y profesor.
- Visualizar todas las clases reservadas en un calendario.

## 2. Pila Tecnológica (Tech Stack)

- **Framework:** [React](https://react.dev/) con [Vite](https://vitejs.dev/) para un desarrollo rápido.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/).
- **Enrutamiento (Routing):** [React Router DOM](https://reactrouter.com/) para la navegación entre páginas.
- **Peticiones a la API:** [Axios](https://axios-http.com/) para comunicarse con el backend.
- **Calendario:** [React Big Calendar](http://jquense.github.io/react-big-calendar/) para mostrar las reservas.
- **Manejo de Fechas:** [date-fns](https://date-fns.org/) para la manipulación de objetos de fecha.

## 3. Requisitos Previos

Asegúrate de tener instalado en tu máquina:
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- `npm` (normalmente se instala con Node.js).

## 4. Instalación y Puesta en Marcha

Sigue estos pasos para tener el proyecto corriendo en tu máquina local.

**Paso 1: Clonar el repositorio (si no lo has hecho ya)**
```bash
# git clone ...
cd sga-reforzamiento/frontend
```

**Paso 2: Instalar dependencias**
Desde la carpeta `frontend`, ejecuta el siguiente comando para instalar todos los paquetes necesarios.
```bash
npm install
```

**Paso 3: ¡Importante! Poner en marcha el Backend**
Este proyecto de frontend necesita comunicarse con el backend para obtener y guardar datos. Asegúrate de que el servidor del backend esté corriendo. Generalmente, esto se hace desde la carpeta `backend` con el comando `npm start`. El frontend espera que el backend esté disponible en `http://localhost:3001`.

**Paso 4: Iniciar el servidor de desarrollo**
Una vez instaladas las dependencias y con el backend en marcha, ejecuta:
```bash
npm run dev
```
Esto iniciará el servidor de desarrollo de Vite. Deberías ver un mensaje en la consola indicando la URL local donde puedes ver la aplicación (normalmente `http://localhost:5173`). ¡Abre esa URL en tu navegador!

## 5. Estructura del Proyecto

Los archivos más importantes con los que trabajarás están dentro de la carpeta `frontend/src`:

- `src/main.tsx`: El punto de entrada de la aplicación.
- `src/App.tsx`: El componente raíz que configura el enrutador y la estructura principal de la página (Navbar + contenido).
- `src/components/`: Contiene componentes reutilizables.
  - `Navbar.tsx`: La barra de navegación superior.
- `src/pages/`: Contiene los componentes que actúan como páginas completas.
  - `DashboardPage.tsx`: La página principal con el formulario de reserva y el calendario. Es la más compleja.
  - `GestionCursos.tsx`: Página para crear y ver cursos.
  - `GestionProfesores.tsx`: Página para crear y ver profesores.
  - `GestionTemas.tsx`: Página para crear y ver los temas de un curso específico.
- `src/config/`: Archivos de configuración.
  - `api.ts`: Aquí se configura la instancia de `axios`. **Si la URL del backend cambia, este es el lugar para actualizarla.**
- `src/App.css`: Contiene los estilos globales. Se han usado clases sencillas para mantener la estructura.

## 6. Flujo de Trabajo y Tareas

Tu rol se centrará en mejorar y ampliar la interfaz de usuario. Algunas tareas iniciales podrían ser:

- **Mejorar la UI/UX:** Aplicar un diseño más pulido a los formularios, botones y al calendario.
- **Añadir Feedback al Usuario:** Implementar indicadores de carga más claros (spinners) mientras se obtienen los datos, en lugar de solo texto.
- **Gestión de Errores:** Mostrar mensajes de error más descriptivos y amigables.
- **Funcionalidad de Edición/Eliminación:** Las páginas de gestión solo permiten crear y ver. Un siguiente paso es añadir botones y la lógica para editar y eliminar cursos, profesores y temas.
- **Interactividad del Calendario:** Hacer que los eventos del calendario sean "clickeables" para mostrar un modal con los detalles completos de la reserva y, eventualmente, opciones para editarla o cancelarla.

¡Mucha suerte y bienvenido al proyecto!
