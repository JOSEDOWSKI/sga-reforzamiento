# 🎨 GUÍA DE ESTILOS WEEKLY - USO ESTRICTO

> **⚠️ ADVERTENCIA IMPORTANTE:** Esta guía contiene los estilos oficiales y estrictos de la aplicación Weekly. Todos los valores especificados deben implementarse EXACTAMENTE como se indican. No se permiten modificaciones, variaciones o interpretaciones libres de estos estilos.

---

## 📋 ÍNDICE

1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Espaciados y Medidas](#espaciados-y-medidas)
4. [Componentes Base](#componentes-base)
5. [Fases del Proceso de Reserva](#fases-del-proceso-de-reserva)
   - [Fase 1: Pantalla de Bienvenida](#fase-1-pantalla-de-bienvenida)
   - [Fase 2: Autenticación](#fase-2-autenticación)
   - [Fase 3: Listado de Propiedades](#fase-3-listado-de-propiedades)
   - [Fase 4: Detalle de Propiedad](#fase-4-detalle-de-propiedad)
   - [Fase 5: Selección de Fecha y Hora](#fase-5-selección-de-fecha-y-hora)
   - [Fase 6: Confirmación de Reserva](#fase-6-confirmación-de-reserva)
6. [Breakpoints Responsivos](#breakpoints-responsivos)
7. [Sombras y Efectos](#sombras-y-efectos)

---

## 🎨 PALETA DE COLORES

### Colores Principales

```css
/* Color Primario - USO ESTRICTO */
--primary: #16A34A; /* Verde Weekly - NO MODIFICAR */
--primary-rgb: 22, 163, 74;

/* Fondos - USO ESTRICTO */
--background-light: #F6F7F8; /* Fondo claro - NO MODIFICAR */
--background-dark: #101922;   /* Fondo oscuro - NO MODIFICAR */
--surface-light: #FFFFFF;     /* Superficie clara - NO MODIFICAR */
--surface-dark: #1B2734;      /* Superficie oscura - NO MODIFICAR */
```

### Colores del Sistema Material 3

Los siguientes colores se generan automáticamente desde el color primario usando `ColorScheme.fromSeed`:

- **Primary**: `#16A34A` (seed color)
- **On Primary**: Blanco automático
- **Primary Container**: Variante más clara del primario
- **Surface**: `#F6F7F8` (light) / `#101922` (dark)
- **On Surface**: `#0D141B` (light) / `#F0F4F8` (dark)
- **Surface Variant**: `surfaceContainerHighest` (Material 3)
- **Outline Variant**: Gris claro para bordes

### Opacidades Estándar

```css
/* Opacidades - USO ESTRICTO */
--opacity-05: 0.05;  /* Sombras sutiles */
--opacity-08: 0.08;  /* Fondos de características */
--opacity-15: 0.15;  /* Fondos de iconos */
--opacity-20: 0.20;  /* Overlays */
--opacity-30: 0.30;  /* Texto deshabilitado */
--opacity-40: 0.40;  /* Fondos de toggle */
--opacity-60: 0.60;  /* Gradientes */
--opacity-70: 0.70;  /* Texto secundario */
```

---

## 📝 TIPOGRAFÍA

### Familia de Fuente

```css
/* Fuente - USO ESTRICTO */
font-family: 'Inter', sans-serif;
/* Google Fonts: https://fonts.google.com/specimen/Inter */
```

### Tamaños de Fuente Responsivos

#### Desktop (≥1200px)
```css
--font-size-title: 40px;
--font-size-body: 18px;
--font-size-small: 14px;
```

#### Tablet (900px - 1199px)
```css
--font-size-title: 32px;
--font-size-body: 16px;
--font-size-small: 14px;
```

#### Móvil (<900px)
```css
--font-size-title: 28px;
--font-size-body: 14px;
--font-size-small: 12px;
```

### Pesos de Fuente

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Altura de Línea

```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

---

## 📏 ESPACIADOS Y MEDIDAS

### Padding Responsivo

#### Desktop (≥1200px)
```css
--padding-horizontal: 48px;
--padding-vertical: 24px;
```

#### Tablet (900px - 1199px)
```css
--padding-horizontal: 32px;
--padding-vertical: 20px;
```

#### Móvil (<900px)
```css
--padding-horizontal: 16px;
--padding-vertical: 16px;
```

### Espaciados Estándar

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
--spacing-4xl: 40px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-3xl: 32px;
--radius-full: 9999px; /* Círculos perfectos */
```

---

## 🧩 COMPONENTES BASE

### Botones Primarios (FilledButton)

```css
.filled-button {
  background-color: var(--primary);
  color: #FFFFFF;
  padding: 14px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: var(--font-size-body);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filled-button:hover {
  opacity: 0.9;
}

.filled-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Botones Secundarios (OutlinedButton)

```css
.outlined-button {
  background-color: transparent;
  color: var(--primary);
  padding: 14px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: var(--font-size-body);
  border: 2px solid var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.outlined-button:hover {
  background-color: var(--primary);
  color: #FFFFFF;
}
```

### Campos de Texto

```css
.text-field {
  width: 100%;
  height: 56px; /* Desktop: 56px, Móvil: 48px */
  padding: 15px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 16px;
  font-size: var(--font-size-body);
  background-color: var(--surface-light);
  transition: border-color 0.2s ease;
}

.text-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
}

.text-field::placeholder {
  color: rgba(0, 0, 0, 0.4);
}
```

### Tarjetas (Cards)

```css
.card {
  background-color: var(--surface-light);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.card-dark {
  background-color: var(--surface-dark);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
```

---

## 🔄 FASES DEL PROCESO DE RESERVA

### FASE 1: PANTALLA DE BIENVENIDA

#### Estructura
- **Layout Desktop**: Dos columnas (imagen 60% izquierda, contenido 40% derecha)
- **Layout Móvil**: Una columna vertical

#### Componentes

**Header (Skip Button)**
```css
.skip-button {
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 12px;
}
```

**Imagen Hero**
```css
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 32px;
  position: relative;
}

.hero-overlay {
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0) 25%
  );
  position: absolute;
  inset: 0;
  border-radius: 32px;
}
```

**Título Principal**
```css
.welcome-title {
  font-size: var(--font-size-title);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  text-align: center; /* Móvil */
  text-align: left;    /* Desktop */
}
```

**Descripción**
```css
.welcome-description {
  font-size: var(--font-size-body);
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.7); /* Light mode */
  color: rgba(255, 255, 255, 0.7); /* Dark mode */
  margin-top: 12px;
}
```

**Indicadores de Página (Dots)**
```css
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 4px;
  transition: all 0.25s ease;
}

.dot-active {
  background-color: var(--primary);
}

.dot-inactive {
  background-color: var(--outline-variant);
}
```

**Botones de Acción**
```css
.welcome-primary-button {
  width: 100%;
  height: 56px; /* Desktop: 56px, Móvil: 48px */
  background-color: var(--primary);
  color: #FFFFFF;
  border-radius: 16px;
  font-size: var(--font-size-body);
  font-weight: 700;
  border: none;
  margin-bottom: 12px;
}

.welcome-secondary-button {
  width: 100%;
  height: 56px;
  background-color: transparent;
  color: var(--primary);
  border-radius: 16px;
  font-size: var(--font-size-body);
  font-weight: 700;
  border: 2px solid var(--primary);
}
```

---

### FASE 2: AUTENTICACIÓN

#### Estructura
- Contenedor centrado con ancho máximo
- Toggle entre "Iniciar sesión" y "Crear cuenta"

#### Componentes

**Icono de Bienvenida**
```css
.auth-icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(22, 163, 74, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.auth-icon {
  width: 42px;
  height: 42px;
  color: var(--primary);
}
```

**Título**
```css
.auth-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 24px;
}
```

**Toggle de Autenticación**
```css
.auth-toggle-container {
  background-color: rgba(0, 0, 0, 0.04); /* surfaceContainerHighest con alpha 0.4 */
  border-radius: 16px;
  padding: 4px;
  display: flex;
  margin-bottom: 24px;
}

.auth-toggle-button {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.auth-toggle-button-active {
  background-color: var(--surface-light);
  color: var(--text-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.auth-toggle-button-inactive {
  background-color: transparent;
  color: var(--text-secondary);
}
```

**Campos de Formulario**
```css
.form-label {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  height: 56px;
  padding: 15px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 16px;
  font-size: var(--font-size-body);
  background-color: var(--surface-light);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
}
```

**Botón de Contraseña Olvidada**
```css
.forgot-password {
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: right;
  margin-top: 8px;
}
```

**Divisor "O continúa con"**
```css
.divider-container {
  display: flex;
  align-items: center;
  margin: 24px 0 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--outline-variant);
}

.divider-text {
  padding: 0 12px;
  font-size: 14px;
  color: var(--text-secondary);
}
```

**Botones Sociales**
```css
.social-button {
  width: 100%;
  height: 56px;
  border-radius: 16px;
  font-weight: 600;
  font-size: var(--font-size-body);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-button-google {
  background-color: var(--surface-light);
  color: var(--text-primary);
  border: 1px solid var(--outline-variant);
}

.social-button-apple {
  background-color: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
}

.social-button-icon {
  width: 24px;
  height: 24px;
}
```

**Botón Invitado**
```css
.guest-button {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
  margin-top: 16px;
}
```

---

### FASE 3: LISTADO DE PROPIEDADES

#### Estructura
- Barra de búsqueda sticky
- Filtros horizontales
- Toggle Grid/Lista
- Grid responsivo (1-6 columnas según breakpoint)

#### Componentes

**Barra de Búsqueda**
```css
.search-bar {
  width: 100%;
  height: 48px; /* Desktop: 56px */
  padding: 0 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 16px;
  font-size: var(--font-size-body);
  background-color: var(--surface-light);
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-icon {
  width: 24px; /* Desktop: 28px */
  height: 24px;
  color: var(--text-secondary);
}
```

**Filtros (Chips)**
```css
.filter-chip {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  background-color: var(--surface-light);
  border: 1px solid var(--outline-variant);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-chip:hover {
  border-color: var(--primary);
}
```

**Toggle Grid/Lista**
```css
.view-toggle-container {
  background-color: rgba(0, 0, 0, 0.04); /* surfaceContainerHighest alpha 0.4 */
  border-radius: 12px;
  padding: 4px;
  display: flex;
}

.view-toggle-button {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle-button-active {
  background-color: var(--surface-light);
  color: var(--text-primary);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.view-toggle-button-inactive {
  background-color: transparent;
  color: var(--text-secondary);
}
```

**Tarjeta de Propiedad (Grid)**
```css
.property-card {
  background-color: var(--surface-light);
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.property-image {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 16px;
  object-fit: cover;
  margin-bottom: 12px;
  position: relative;
}

.property-favorite-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.property-location {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.property-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.property-rating-star {
  width: 16px;
  height: 16px;
  color: #FFB800; /* Amber */
}

.property-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.property-book-button {
  width: 100%;
  padding: 8px;
  background-color: transparent;
  color: var(--primary);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
```

**Grid Responsivo**
```css
/* Desktop ≥1800px: 6 columnas */
/* Desktop ≥1400px: 5 columnas */
/* Desktop ≥1200px: 4 columnas */
/* Tablet ≥900px: 3 columnas */
/* Tablet ≥600px: 2 columnas */
/* Móvil <600px: 1 columna */

.property-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 12px; /* Desktop: 20px */
}

.property-grid-item {
  aspect-ratio: 0.68; /* Desktop: 0.75 */
}
```

---

### FASE 4: DETALLE DE PROPIEDAD

#### Estructura Desktop
- **Layout**: Dos columnas (imagen 60% izquierda, contenido 40% derecha)
- **Layout Móvil**: Una columna vertical con AppBar expandible

#### Componentes

**Imagen Principal**
```css
.property-detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 32px;
  position: relative;
}

.property-image-counter {
  position: absolute;
  bottom: 24px;
  right: 24px;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.54);
  border-radius: 24px;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
}
```

**Título de Propiedad**
```css
.property-detail-title {
  font-size: var(--font-size-title);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 12px;
}
```

**Información de Rating y Ubicación**
```css
.property-detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: var(--font-size-body);
  margin-bottom: 24px;
}

.property-detail-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.property-detail-star {
  width: 20px;
  height: 20px;
  color: #FFB800;
}

.property-detail-location {
  display: flex;
  align-items: center;
  gap: 6px;
}
```

**Características (Features)**
```css
.property-features {
  display: flex;
  gap: 16px;
  flex-wrap: wrap; /* Desktop */
  overflow-x: auto; /* Móvil */
  margin-bottom: 24px;
}

.property-feature-chip {
  width: 110px; /* Móvil: ancho fijo */
  padding: 12px 0;
  background-color: rgba(22, 163, 74, 0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.property-feature-icon {
  width: 24px;
  height: 24px;
  color: var(--primary);
}

.property-feature-label {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
}
```

**Tarjeta de Anfitrión**
```css
.host-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.host-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.host-info {
  flex: 1;
}

.host-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.host-badge {
  font-size: 14px;
  color: var(--text-secondary);
}

.host-contact-button {
  padding: 8px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 8px;
  background-color: transparent;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
}
```

**Descripción**
```css
.property-description {
  font-size: var(--font-size-body);
  line-height: 1.75;
  color: var(--text-primary);
  margin-top: 16px;
}
```

**Barra de Acción Inferior (Móvil) / Tarjeta (Desktop)**
```css
.property-action-bar {
  padding: 16px;
  background-color: var(--surface-light);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.property-price-info {
  flex: 1;
}

.property-price-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.property-price-period {
  font-size: 14px;
  color: var(--text-secondary);
}

.property-action-buttons {
  display: flex;
  gap: 8px;
}

.property-book-button-primary {
  padding: 12px 24px;
  background-color: var(--primary);
  color: #FFFFFF;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.property-book-button-secondary {
  padding: 12px 24px;
  background-color: transparent;
  color: var(--primary);
  border-radius: 12px;
  font-weight: 700;
  border: 2px solid var(--primary);
  cursor: pointer;
}
```

---

### FASE 5: SELECCIÓN DE FECHA Y HORA

#### Estructura
- Calendario mensual (7 columnas)
- Selector de horarios (chips)
- Barra de confirmación sticky

#### Componentes

**Header del Calendario**
```css
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.calendar-month {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.calendar-nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-nav-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
```

**Grid del Calendario**
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
}

.calendar-day {
  height: 48px;
  border-radius: 32px;
  border: 1px solid var(--outline-variant);
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover:not(.calendar-day-disabled) {
  background-color: rgba(22, 163, 74, 0.2);
}

.calendar-day-selected {
  background-color: var(--primary);
  color: #FFFFFF;
  border-color: var(--primary);
  font-weight: 700;
}

.calendar-day-disabled {
  color: rgba(0, 0, 0, 0.3);
  cursor: not-allowed;
  border-color: transparent;
}
```

**Selector de Horarios**
```css
.time-slots-container {
  padding: 16px;
}

.time-slots-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.time-slot-chip {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  background-color: var(--surface-light);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-slot-chip:hover {
  border-color: var(--primary);
}

.time-slot-chip-selected {
  background-color: var(--primary);
  color: #FFFFFF;
  border-color: var(--primary);
}

.time-slot-chip-disabled {
  color: rgba(0, 0, 0, 0.3);
  text-decoration: line-through;
  cursor: not-allowed;
  border-color: rgba(0, 0, 0, 0.3);
}
```

**Barra de Confirmación**
```css
.schedule-confirmation-bar {
  position: sticky;
  bottom: 0;
  padding: 16px;
  background-color: var(--surface-light);
  border-top: 1px solid var(--outline-variant);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.schedule-selection-text {
  font-size: var(--font-size-body);
  text-align: center;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.schedule-selection-date {
  font-weight: 700;
}

.schedule-confirm-button {
  width: 100%;
  height: 48px;
  background-color: var(--primary);
  color: #FFFFFF;
  border-radius: 16px;
  font-size: var(--font-size-body);
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

---

### FASE 6: CONFIRMACIÓN DE RESERVA

#### Estructura
- Tarjeta de resumen
- Desglose de precios
- Formulario de información del usuario
- Método de pago
- Checkbox de términos
- Botón de confirmación sticky

#### Componentes

**Tarjeta de Resumen**
```css
.booking-summary-card {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.booking-summary-image {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.booking-summary-info {
  flex: 1;
}

.booking-summary-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.booking-summary-location {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.booking-summary-details {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.booking-summary-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
```

**Desglose de Precios**
```css
.price-breakdown-card {
  background-color: var(--surface-light);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.price-breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.price-breakdown-label {
  color: var(--text-secondary);
}

.price-breakdown-value {
  color: var(--text-primary);
}

.price-breakdown-total {
  border-top: 1px solid var(--outline-variant);
  margin-top: 8px;
  padding-top: 8px;
  font-weight: 700;
  font-size: 16px;
}
```

**Formulario de Usuario**
```css
.user-info-section {
  margin-bottom: 20px;
}

.user-info-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.user-info-field {
  margin-bottom: 12px;
}

.user-info-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: block;
}

.user-info-input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  font-size: 14px;
  background-color: var(--surface-light);
}
```

**Tarjeta de Método de Pago**
```css
.payment-method-card {
  background-color: var(--surface-light);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.payment-method-logo {
  width: 48px;
  height: 30px;
  object-fit: contain;
}

.payment-method-info {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.payment-method-change {
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
  cursor: pointer;
}
```

**Checkbox de Términos**
```css
.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.terms-checkbox-input {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid var(--outline-variant);
  cursor: pointer;
  margin-top: 2px;
}

.terms-checkbox-label {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.terms-checkbox-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: underline;
}
```

**Botón de Confirmación**
```css
.booking-confirm-button {
  position: sticky;
  bottom: 0;
  width: 100%;
  padding: 16px;
  background-color: var(--surface-light);
  border-top: 1px solid var(--outline-variant);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.booking-confirm-button-primary {
  width: 100%;
  height: 56px;
  background-color: var(--primary);
  color: #FFFFFF;
  border-radius: 16px;
  font-size: var(--font-size-body);
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.booking-confirm-button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.booking-confirm-icon {
  width: 20px;
  height: 20px;
}
```

**Modal de Éxito**
```css
.success-modal {
  background-color: var(--surface-light);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  max-height: 80vh;
}

.success-icon {
  width: 64px;
  height: 64px;
  color: #16A34A;
  margin: 0 auto 16px;
}

.success-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.success-message {
  font-size: 14px;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
```

---

## 📱 BREAKPOINTS RESPONSIVOS

### Definición Estricta

```css
/* Móvil */
@media (max-width: 599px) {
  --columns: 1;
  --padding-horizontal: 16px;
  --font-size-title: 28px;
  --font-size-body: 14px;
}

/* Tablet Pequeña */
@media (min-width: 600px) and (max-width: 899px) {
  --columns: 2;
  --padding-horizontal: 16px;
  --font-size-title: 28px;
  --font-size-body: 14px;
}

/* Tablet */
@media (min-width: 900px) and (max-width: 1199px) {
  --columns: 3;
  --padding-horizontal: 32px;
  --font-size-title: 32px;
  --font-size-body: 16px;
}

/* Desktop */
@media (min-width: 1200px) and (max-width: 1399px) {
  --columns: 4;
  --padding-horizontal: 48px;
  --font-size-title: 40px;
  --font-size-body: 18px;
}

/* Desktop Grande */
@media (min-width: 1400px) and (max-width: 1799px) {
  --columns: 5;
  --padding-horizontal: 48px;
  --font-size-title: 40px;
  --font-size-body: 18px;
}

/* Desktop Extra Grande (Tablet Horizontal 1980x720) */
@media (min-width: 1800px) {
  --columns: 6;
  --padding-horizontal: 48px;
  --font-size-title: 40px;
  --font-size-body: 18px;
}
```

---

## 🌑 SOMBRAS Y EFECTOS

### Sombras Estándar

```css
/* Sombra Sutil (Cards) */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);

/* Sombra Media (Cards Elevadas) */
--shadow-md: 0 6px 12px rgba(0, 0, 0, 0.05);

/* Sombra Grande (Modales) */
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);

/* Sombra Extra Grande (Bottom Sheets) */
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.15);

/* Sombra de Elevación (Sticky Elements) */
--shadow-sticky: 0 -4px 12px rgba(0, 0, 0, 0.05);
```

### Transiciones

```css
/* Transición Estándar */
--transition-standard: all 0.2s ease;

/* Transición Rápida */
--transition-fast: all 0.15s ease;

/* Transición Lenta */
--transition-slow: all 0.3s ease;
```

### Backdrop Blur

```css
/* Blur para Overlays */
backdrop-filter: blur(4px);
-webkit-backdrop-filter: blur(4px);
```

---

## 8. COMPONENTES ADICIONALES IMPLEMENTADOS

### Componentes de Gestión (GestionPage)

**Botones de Acción en Tabla**
```css
.btn-edit,
.btn-delete {
  padding: var(--spacing-sm) var(--spacing-lg); /* 8px 16px */
  border-radius: var(--radius-md); /* 12px */
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium); /* 500 */
  transition: var(--transition-standard);
  font-family: 'Inter', sans-serif;
}

.btn-edit {
  background: color-mix(in srgb, #3b82f6 15%, transparent);
  color: #2563eb;
  border: 1px solid #3b82f6;
}

.btn-delete {
  background: color-mix(in srgb, var(--destructive) 15%, transparent);
  color: var(--destructive);
  border: 1px solid var(--destructive);
}
```

**Botones de Estado**
```css
.btn-warning {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  color: #d97706;
  border: 1px solid #f59e0b;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: 'Inter', sans-serif;
}

.btn-success {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success); /* #16A34A */
  border: 1px solid var(--success);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: 'Inter', sans-serif;
}
```

### Componentes de Modal

**Botones de Modal de Confirmación**
```css
.confirm-modal-actions .btn-danger {
  background-color: var(--destructive); /* #EF4444 */
  color: #FFFFFF;
  padding: 14px 24px;
  border-radius: var(--radius-md); /* 12px */
  font-weight: var(--font-weight-bold); /* 700 */
  font-size: var(--font-size-body);
  font-family: 'Inter', sans-serif;
}

.confirm-modal-actions .btn-cancel {
  background-color: transparent;
  color: var(--primary); /* #16A34A */
  padding: 14px 24px;
  border: 2px solid var(--primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-body);
  font-family: 'Inter', sans-serif;
}
```

### Componentes de Calendario Público

**Botones de Servicio**
```css
.servicio-btn {
  padding: var(--spacing-md) var(--spacing-lg); /* 12px 16px */
  border-radius: var(--radius-lg); /* 16px */
  border: 1px solid var(--outline-variant-light);
  background: rgba(22, 163, 74, var(--opacity-05));
  color: var(--text-secondary-light);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: 'Inter', sans-serif;
}

.servicio-btn.selected {
  border-color: var(--primary);
  background: rgba(22, 163, 74, var(--opacity-15));
  color: var(--primary);
}
```

**Botones de Horario**
```css
.hora-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--outline-variant-light);
  border-radius: var(--radius-md); /* 12px */
  background: var(--surface-light);
  color: var(--text-primary-light);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: 'Inter', sans-serif;
}

.hora-btn.selected {
  background-color: var(--primary);
  color: #FFFFFF;
  border-color: var(--primary);
  font-weight: var(--font-weight-bold);
}
```

**Botón de Confirmación Sticky**
```css
.confirm-button {
  width: 100%;
  height: 56px; /* Desktop: 56px, Móvil: 48px */
  border-radius: var(--radius-xl); /* 20px */
  background-color: var(--primary);
  color: #FFFFFF;
  border: none;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  font-family: 'Inter', sans-serif;
  padding: 14px 24px;
  transition: var(--transition-standard);
}
```

### Componentes de Contacto (DemoContactCard)

**Botones de Contacto**
```css
.whatsapp-button {
  background: #25D366; /* Color específico WhatsApp */
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 24px;
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-body);
  font-family: 'Inter', sans-serif;
}

.email-button {
  background-color: var(--primary); /* #16A34A */
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 24px;
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-body);
  font-family: 'Inter', sans-serif;
}
```

### Componentes de Ubicación (LocationSelector)

**Inputs de Dirección**
```css
.address-input {
  padding: 15px 16px;
  border: 1px solid var(--outline-variant-light);
  border-radius: var(--radius-lg); /* 16px */
  font-size: var(--font-size-body);
  background-color: var(--surface-light);
  color: var(--text-primary-light);
  height: 56px; /* Desktop: 56px, Móvil: 48px */
  font-family: 'Inter', sans-serif;
}

.address-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
}
```

**Botón de Búsqueda**
```css
.search-location-btn {
  padding: 14px 24px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  font-family: 'Inter', sans-serif;
}
```

### Componentes de Marketplace (MarketplacePage)

**Barra de Búsqueda**
```css
.search-input-wrapper {
  height: 56px; /* Desktop: 56px, Móvil: 48px */
  border-radius: var(--radius-lg); /* 16px */
  border: 1px solid var(--outline-variant-light);
  background-color: var(--surface-light);
}

.search-input {
  padding: 15px 16px; /* Valor exacto de weekly-input */
  font-size: var(--font-size-body);
  font-family: 'Inter', sans-serif;
}
```

**Filtros (Chips)**
```css
.filter-button {
  height: 38px; /* Valor exacto de filter-chip */
  padding: 0 var(--spacing-lg); /* 0 16px */
  border-radius: var(--radius-md); /* 12px */
  border: 1px solid var(--outline-variant-light);
  background-color: var(--surface-light);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium); /* 500 */
  font-family: 'Inter', sans-serif;
}

.filter-button.active {
  background-color: var(--primary); /* #16A34A */
  color: #FFFFFF;
  border-color: var(--primary);
}
```

**Tarjeta de Servicio**
```css
.service-card {
  border-radius: var(--radius-xl); /* 20px */
  background-color: var(--surface-light);
  padding: var(--spacing-md); /* 12px */
  box-shadow: var(--shadow-sm);
  transition: var(--transition-standard);
  font-family: 'Inter', sans-serif;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

**Botón de Favoritos**
```css
.favorite-button {
  width: 2rem; /* 32px */
  height: 2rem; /* 32px */
  border-radius: var(--radius-full);
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  transition: var(--transition-standard);
  font-family: 'Inter', sans-serif;
}

.favorite-button.active {
  background-color: rgba(239, 68, 68, 0.9); /* Rojo para favorito activo */
}
```

**Botón Flotante de Mapa**
```css
.map-fab {
  height: 3.5rem; /* 56px */
  padding: 0 var(--spacing-2xl); /* 0 24px */
  border-radius: var(--radius-full);
  background-color: var(--primary); /* #16A34A */
  color: #FFFFFF;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium); /* 500 */
  box-shadow: var(--shadow-lg);
  font-family: 'Inter', sans-serif;
}

.map-fab:hover {
  opacity: 0.9; /* Valor exacto de weekly-filled-button */
}
```

### Componentes de Detalle de Servicio (ServiceDetailPage)

**Header Sticky**
```css
.service-detail-header {
  padding: var(--spacing-lg); /* 16px */
  background-color: rgba(246, 247, 248, 0.8); /* background-light con alpha */
  backdrop-filter: blur(8px);
}
```

**Título de Servicio**
```css
.service-detail-title {
  font-size: var(--font-size-title); /* Responsivo: 40px/32px/28px */
  font-weight: var(--font-weight-bold); /* 700 */
  line-height: var(--line-height-tight); /* 1.2 */
  color: var(--text-primary-light);
  font-family: 'Inter', sans-serif;
}
```

**Características (Features)**
```css
.feature-item {
  width: 6rem; /* 96px - Valor exacto */
}

.feature-icon {
  width: 3.5rem; /* 56px */
  height: 3.5rem; /* 56px */
  background-color: rgba(22, 163, 74, var(--opacity-08)); /* 0.08 */
  border-radius: var(--radius-xl); /* 20px */
  color: var(--primary); /* #16A34A */
}
```

**Descripción Expandible**
```css
.description-text {
  font-size: var(--font-size-small);
  line-height: var(--line-height-relaxed); /* 1.75 */
  color: var(--text-secondary-light);
  max-height: 4.8rem; /* ~3 líneas */
  transition: max-height 0.3s ease-out;
  font-family: 'Inter', sans-serif;
}

.description-text.expanded {
  max-height: none;
}
```

**Footer de Reserva**
```css
.booking-footer {
  padding: var(--spacing-lg); /* 16px */
  background-color: rgba(246, 247, 248, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--outline-variant-light);
  box-shadow: var(--shadow-sticky);
}

.book-button {
  border-radius: var(--radius-lg); /* 16px */
  background-color: var(--primary); /* #16A34A */
  padding: 14px 24px; /* Valor exacto de weekly-filled-button */
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold); /* 700 */
  font-family: 'Inter', sans-serif;
}

.book-button:hover {
  opacity: 0.9; /* Valor exacto de weekly-filled-button */
}
```

---

## 9. COMPONENTES MIGRADOS EN PRODUCCIÓN

Los siguientes componentes han sido migrados a estilos estrictos en `weekly.pe`:

- ✅ **LoginForm.css** - Botones, inputs, labels, cards
- ✅ **DashboardPage.css** - Formularios, botones, inputs, cards
- ✅ **LandingPage.css** - Botones primarios y secundarios
- ✅ **PublicCalendarPage.css** - Botones de servicio, horarios, confirmación, inputs, modales
- ✅ **GestionPage.css** - Botones de acción, inputs, labels, botones de estado
- ✅ **Modal.css** - Botones primarios, secundarios, peligro, cancelar
- ✅ **DemoContactCard.css** - Botones de contacto, inputs, cards
- ✅ **LocationSelector.css** - Inputs de dirección, botones de búsqueda
- ✅ **UserCalendarView.css** - Selects, labels, botones FullCalendar, cards
- ✅ **MarketplacePage.css** - Header, búsqueda, filtros, cards, botones, favoritos, mapa
- ✅ **ServiceDetailPage.css** - Header, galería, contenido, características, host, descripción, footer de reserva

Todos estos componentes usan valores exactos de esta guía y están adaptados al sistema multi-tenant existente.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Antes de Implementar

- [ ] Verificar que todos los colores HEX sean exactos
- [ ] Confirmar que la fuente Inter esté cargada desde Google Fonts
- [ ] Validar que todos los border-radius sean exactos
- [ ] Revisar que los espaciados coincidan pixel por pixel
- [ ] Asegurar que las transiciones sean idénticas

### Durante la Implementación

- [ ] No modificar valores sin autorización
- [ ] No usar colores aproximados
- [ ] No cambiar tamaños de fuente
- [ ] No alterar espaciados
- [ ] No modificar border-radius

### Después de la Implementación

- [ ] Comparar visualmente con el diseño original
- [ ] Verificar en diferentes breakpoints
- [ ] Validar en modo claro y oscuro
- [ ] Probar todas las interacciones
- [ ] Confirmar que las animaciones sean idénticas

---

## ⚠️ REGLAS ESTRICTAS

1. **NO MODIFICAR** ningún valor de color sin autorización explícita
2. **NO APROXIMAR** valores numéricos (usar exactos)
3. **NO CAMBIAR** la familia de fuente (Inter es obligatoria)
4. **NO ALTERAR** los breakpoints sin justificación técnica
5. **NO CREAR** variaciones de los componentes sin aprobación
6. **NO USAR** colores similares o "casi iguales"
7. **NO AJUSTAR** espaciados "por si acaso"
8. **NO MODIFICAR** border-radius por preferencias personales

---

## 📞 CONTACTO

Para dudas sobre implementación o solicitudes de modificación de estilos, contactar al equipo de diseño de Weekly.

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.1.0  
**Estado:** ✅ Estilos Oficiales - Uso Estricto - Implementado en Producción

