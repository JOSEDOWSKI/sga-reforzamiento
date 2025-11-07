# 🎨 Rediseño de Interfaz - Calendario Público (`weekly.pe/agendar`)

## 📋 Información del Proyecto

**Rama:** `feature/redesign-public-calendar`  
**Archivo Principal:** `frontend/src/pages/PublicCalendarPage.tsx`  
**Estilos:** `frontend/src/pages/PublicCalendarPage.css`  
**URL:** `{tenant}.weekly.pe/agendar` o `weekly.pe/agendar`

---

## 🎯 Objetivo

Rediseñar la interfaz de usuario del calendario público para mejorar:
- ✅ Experiencia de usuario (UX)
- ✅ Diseño visual moderno y atractivo
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ Accesibilidad
- ✅ Performance y carga rápida

---

## 📁 Archivos a Modificar

### Archivos Principales
- `frontend/src/pages/PublicCalendarPage.tsx` - Componente principal
- `frontend/src/pages/PublicCalendarPage.css` - Estilos actuales

### Archivos Relacionados (Revisar)
- `frontend/src/components/` - Componentes reutilizables
- `frontend/src/styles/` - Estilos globales
- `frontend/src/config/api.ts` - Configuración de API

---

## 🔍 Funcionalidades Actuales

El calendario público actual incluye:

1. **Selector de Servicio/Establecimiento**
   - Dropdown para seleccionar servicio
   - Filtrado de disponibilidad

2. **Selector de Staff/Colaborador**
   - Dropdown para seleccionar profesional
   - Filtrado opcional

3. **Vista de Calendario**
   - FullCalendar con vista mensual
   - Slots de disponibilidad
   - Horarios ocupados vs disponibles

4. **Modal de Reserva**
   - Formulario para crear reserva
   - Campos: nombre, teléfono, email, DNI, descripción, precio
   - Validación de campos
   - Confirmación de reserva

5. **Integración con API**
   - `GET /api/public/calendario` - Obtener disponibilidad
   - `POST /api/public/reservas` - Crear reserva

---

## 🎨 Directrices de Diseño

### Principios de Diseño

1. **Simplicidad**
   - Interfaz limpia y minimalista
   - Flujo de usuario intuitivo
   - Menos pasos para agendar

2. **Modernidad**
   - Diseño actualizado y profesional
   - Colores y tipografía moderna
   - Animaciones sutiles

3. **Claridad**
   - Información fácil de entender
   - Feedback visual claro
   - Estados visibles (loading, success, error)

4. **Responsive**
   - Mobile-first approach
   - Adaptable a todos los tamaños de pantalla
   - Touch-friendly en móviles

### Paleta de Colores

**Colores Principales:**
- Primary: `#667eea` (Púrpura)
- Secondary: `#764ba2` (Púrpura oscuro)
- Success: `#10b981` (Verde)
- Error: `#ef4444` (Rojo)
- Warning: `#f59e0b` (Amarillo)
- Background: `#ffffff` / `#f9fafb` (Blanco/Gris claro)
- Text: `#1f2937` (Gris oscuro)

**Colores del Tenant:**
- Los colores pueden personalizarse según el tenant
- Usar variables CSS para fácil personalización

### Tipografía

- **Títulos:** Sans-serif moderna (Inter, Poppins, o similar)
- **Cuerpo:** Legible y clara
- **Tamaños:** Escalable (rem/em)

### Componentes a Mejorar

1. **Header/Navbar**
   - Logo del tenant (si existe)
   - Nombre del negocio
   - Botón de volver (opcional)

2. **Selector de Servicio**
   - Diseño más atractivo (cards en lugar de dropdown)
   - Iconos por tipo de servicio
   - Descripción visible

3. **Selector de Staff**
   - Cards con foto/avatar
   - Información del profesional
   - Especialidades visibles

4. **Calendario**
   - Vista más clara y moderna
   - Mejor diferenciación entre disponible/ocupado
   - Hover states mejorados
   - Indicadores visuales claros

5. **Modal de Reserva**
   - Diseño más limpio
   - Mejor organización de campos
   - Validación visual mejorada
   - Animaciones de transición

6. **Estados de Carga**
   - Skeleton loaders
   - Spinners modernos
   - Mensajes informativos

7. **Confirmación de Reserva**
   - Pantalla de éxito atractiva
   - Información de la reserva
   - Opciones de acción (nueva reserva, ver calendario)

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Consideraciones Móviles

- **Touch targets:** Mínimo 44x44px
- **Espaciado:** Adecuado para dedos
- **Navegación:** Fácil de usar con una mano
- **Formularios:** Inputs grandes y claros
- **Calendario:** Vista adaptada para móvil

---

## ⚡ Performance

### Optimizaciones Requeridas

1. **Lazy Loading**
   - Cargar componentes pesados bajo demanda
   - Imágenes optimizadas

2. **Code Splitting**
   - Separar código del calendario público
   - Reducir bundle size inicial

3. **Caching**
   - Cachear disponibilidad cuando sea posible
   - Evitar requests innecesarios

4. **Animaciones**
   - Usar CSS transforms (GPU accelerated)
   - Evitar animaciones pesadas

---

## ♿ Accesibilidad

### Requisitos

1. **ARIA Labels**
   - Etiquetas descriptivas
   - Estados anunciados

2. **Navegación por Teclado**
   - Tab order lógico
   - Focus visible

3. **Contraste**
   - Ratio mínimo 4.5:1 para texto
   - Colores accesibles

4. **Screen Readers**
   - Textos alternativos
   - Mensajes descriptivos

---

## 🧪 Testing

### Checklist de Testing

- [ ] Funciona en Chrome, Firefox, Safari, Edge
- [ ] Responsive en móvil (iPhone, Android)
- [ ] Responsive en tablet (iPad, Android)
- [ ] Responsive en desktop (1920px, 1366px, 1024px)
- [ ] Navegación por teclado funciona
- [ ] Screen reader compatible
- [ ] Performance aceptable (< 3s carga inicial)
- [ ] Formulario valida correctamente
- [ ] Reserva se crea exitosamente
- [ ] Mensajes de error son claros

---

## 📝 Notas Importantes

### ⚠️ No Modificar

- **Lógica de negocio:** Mantener la funcionalidad actual
- **API calls:** No cambiar endpoints ni estructura de datos
- **Validaciones:** Mantener validaciones existentes
- **Integración con backend:** No romper compatibilidad

### ✅ Sí Modificar

- **Estilos CSS:** Completamente rediseñable
- **Layout/estructura HTML:** Mejorar organización
- **Componentes visuales:** Rediseñar completamente
- **Animaciones:** Agregar transiciones suaves
- **UX/UI:** Mejorar flujo de usuario

---

## 🚀 Cómo Empezar

1. **Revisar código actual:**
   ```bash
   git checkout feature/redesign-public-calendar
   ```

2. **Instalar dependencias:**
   ```bash
   cd frontend
   npm install
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder a:**
   - `http://localhost:5173/agendar` (desarrollo)
   - O usar un tenant específico: `http://cliente.weekly.pe/agendar`

5. **Hacer cambios:**
   - Modificar `PublicCalendarPage.tsx` y `PublicCalendarPage.css`
   - Ver cambios en tiempo real con HMR

---

## 📚 Referencias de Diseño

### Inspiración

- **Calendly:** Interfaz limpia y moderna
- **Acuity Scheduling:** Flujo de reserva intuitivo
- **Square Appointments:** Diseño profesional
- **Material Design:** Principios de diseño moderno

### Componentes a Revisar

- `frontend/src/components/` - Componentes existentes
- `frontend/src/pages/LandingPage.tsx` - Estilo de la landing
- `frontend/src/styles/` - Estilos globales

---

## 💬 Comunicación

### Preguntas o Dudas

- Revisar documentación en `DOCUMENTACION_SISTEMA_TENANTS.md`
- Consultar código existente en otras páginas
- Preguntar al equipo si hay dudas

### Pull Request

Cuando termines el rediseño:
1. Hacer commit con mensaje descriptivo
2. Push a la rama `feature/redesign-public-calendar`
3. Crear Pull Request a `main`
4. Incluir screenshots del antes/después
5. Describir cambios realizados

---

## ✅ Checklist Final

Antes de considerar el rediseño completo:

- [ ] Diseño moderno y atractivo
- [ ] Responsive en todos los dispositivos
- [ ] Accesible (ARIA, keyboard navigation)
- [ ] Performance optimizado
- [ ] Funcionalidad intacta
- [ ] Sin errores en consola
- [ ] Testing completo
- [ ] Documentación actualizada (si aplica)

---

**¡Éxito con el rediseño! 🎨✨**

