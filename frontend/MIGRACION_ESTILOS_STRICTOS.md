# 🎨 Guía de Migración: Estilos Estrictos Weekly

## 📋 Resumen

Se ha implementado el sistema de estilos estrictos basado en `estilos_weekly.md`. Todos los valores son **EXACTOS** y no deben modificarse sin autorización.

## ✅ Cambios Implementados

### 1. Nuevo Archivo: `src/styles/weekly-strict.css`
- Contiene todos los valores exactos de la guía de estilos
- Variables CSS con valores estrictos
- Componentes base predefinidos
- Breakpoints responsivos exactos

### 2. Actualización: `src/index.css`
- Importa `weekly-strict.css` como base
- Valores actualizados para usar variables estrictas
- Border radius convertidos de `rem` a `px` (valores exactos)
- Fuente Inter forzada estrictamente

## 🎯 Valores Estrictos Implementados

### Colores
- **Primary**: `#16A34A` (Verde Weekly - NO MODIFICAR)
- **Background Light**: `#F6F7F8`
- **Background Dark**: `#101922`
- **Surface Light**: `#FFFFFF`
- **Surface Dark**: `#1B2734`

### Tipografía
- **Fuente**: `Inter` (obligatoria)
- **Tamaños Desktop**: 40px (title), 18px (body), 14px (small)
- **Tamaños Tablet**: 32px (title), 16px (body), 14px (small)
- **Tamaños Móvil**: 28px (title), 14px (body), 12px (small)

### Espaciados
- **Padding Desktop**: 48px horizontal, 24px vertical
- **Padding Tablet**: 32px horizontal, 20px vertical
- **Padding Móvil**: 16px horizontal, 16px vertical

### Border Radius
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px
- **full**: 9999px

## 🔧 Cómo Usar los Estilos Estrictos

### Opción 1: Usar Clases Predefinidas (Recomendado)

```tsx
// Botones
<button className="weekly-filled-button">Botón Primario</button>
<button className="weekly-outlined-button">Botón Secundario</button>

// Campos de Texto
<input type="text" className="weekly-text-field" placeholder="Texto..." />

// Tarjetas
<div className="weekly-card">
  <h2 className="weekly-text-title weekly-text-primary">Título</h2>
  <p className="weekly-text-body weekly-text-secondary">Contenido</p>
</div>

// Espaciado
<div className="weekly-p-horizontal weekly-p-vertical">
  Contenido con padding responsivo
</div>
```

### Opción 2: Usar Variables CSS Directamente

```css
.mi-componente {
  background-color: var(--primary); /* #16A34A */
  color: var(--text-primary-light);
  border-radius: var(--radius-lg); /* 16px */
  padding: var(--spacing-lg); /* 16px */
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold); /* 700 */
  box-shadow: var(--shadow-md);
  transition: var(--transition-standard);
}
```

### Opción 3: Usar Variables en Componentes React (Styled)

```tsx
const StyledButton = styled.button`
  background-color: var(--primary);
  color: #FFFFFF;
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-body);
  transition: var(--transition-standard);
`;
```

## 📱 Breakpoints Responsivos

Los breakpoints están definidos exactamente como en la guía:

```css
/* Móvil */
@media (max-width: 599px) { /* 1 columna */ }

/* Tablet Pequeña */
@media (min-width: 600px) and (max-width: 899px) { /* 2 columnas */ }

/* Tablet */
@media (min-width: 900px) and (max-width: 1199px) { /* 3 columnas */ }

/* Desktop */
@media (min-width: 1200px) and (max-width: 1399px) { /* 4 columnas */ }

/* Desktop Grande */
@media (min-width: 1400px) and (max-width: 1799px) { /* 5 columnas */ }

/* Desktop Extra Grande */
@media (min-width: 1800px) { /* 6 columnas */ }
```

## ⚠️ Reglas Estrictas

1. **NO MODIFICAR** valores en `weekly-strict.css` sin autorización
2. **NO APROXIMAR** valores numéricos (usar exactos)
3. **NO CAMBIAR** la familia de fuente (Inter es obligatoria)
4. **NO ALTERAR** los breakpoints sin justificación técnica
5. **NO CREAR** variaciones de componentes sin aprobación

## 🔄 Migración de Componentes Existentes

### Paso 1: Identificar Componentes
Revisar componentes que usan estilos inline o valores hardcodeados.

### Paso 2: Reemplazar Valores
```tsx
// ❌ ANTES
<button style={{ backgroundColor: '#16a34a', borderRadius: '8px' }}>

// ✅ DESPUÉS
<button className="weekly-filled-button">
// O usando variables:
<button style={{ 
  backgroundColor: 'var(--primary)', 
  borderRadius: 'var(--radius-sm)' 
}}>
```

### Paso 3: Usar Clases de Utilidad
```tsx
// ❌ ANTES
<h1 style={{ fontSize: '40px', fontWeight: 800 }}>

// ✅ DESPUÉS
<h1 className="weekly-text-title weekly-text-primary">
```

## 📝 Checklist de Migración

Para cada componente:

- [ ] Reemplazar colores hardcodeados por variables CSS
- [ ] Usar clases predefinidas cuando sea posible
- [ ] Verificar que los border-radius usen valores exactos
- [ ] Asegurar que los espaciados usen variables
- [ ] Validar que la fuente sea Inter
- [ ] Probar en todos los breakpoints
- [ ] Verificar modo claro y oscuro

## 🚀 Próximos Pasos

1. **Migrar componentes críticos** (botones, inputs, cards)
2. **Actualizar páginas principales** (Landing, Login, Dashboard)
3. **Validar visualmente** con el diseño original
4. **Documentar excepciones** si las hay

## 📞 Soporte

Para dudas sobre implementación o solicitudes de modificación, contactar al equipo de diseño de Weekly.

---

**Última actualización**: Noviembre 2024  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado - Listo para Migración

