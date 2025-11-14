# 🎯 PROMPT: Crear Biblioteca Digital Frontend-Only

## CONTEXTO DEL PROYECTO

Necesito crear una **biblioteca digital frontend-only** completamente nueva desde cero. Este es un proyecto independiente, no relacionado con otros proyectos existentes.

## OBJETIVO PRINCIPAL

Construir una aplicación web que permita:
- **CRUD completo de textos** (crear, leer, editar, borrar)
- **Gestionar un árbol dinámico de categorías/géneros** (crear, renombrar, eliminar, reorganizar)
- **Relacionar textos con uno o varios géneros**
- **Visualizar el árbol en una pestaña 3D** con nodos interactivos (zoom, arrastre, selección)

## ALCANCE DEL MVP

### ✅ INCLUIDO:
- CRUD completo de textos (título, contenido, géneros, metadatos opcionales)
- Gestión de géneros/categorías en árbol jerárquico
- Relaciones texto ↔ género (multiselect)
- Vista de árbol 3D interactiva (pestaña dedicada)
- Persistencia local frontend-only (IndexedDB)
- Abstracción de almacenamiento (adapter pattern)
- UX básico: listas, formularios, buscador, filtros por género
- Exportación simple de grafo (JSON)

### ❌ EXCLUIDO (no implementar):
- Backend o sincronización en nube
- Autenticación/usuarios/roles/permisos
- Editor WYSIWYG complejo (solo textarea + markdown opcional)
- Integración social
- Exportación masiva CSV (solo JSON básico)

## STACK TÉCNICO REQUERIDO

### Framework y Build:
- **React 19+** con **TypeScript**
- **Vite** como bundler
- **ESLint** configurado

### UI y Estilos:
- **TailwindCSS** (configuración completa)
- Fuente: **Inter** (sans-serif)
- Sistema de diseño con tokens consistentes

### Almacenamiento:
- **IndexedDB** usando la librería **idb** (v8+)
- Adapter pattern para permitir swap futuro a otro storage

### State Management:
- **Zustand** para estado global
- O **React Query** (opcional, pero Zustand recomendado)

### Visualización 3D:
- **@react-three/fiber** (v8+)
- **@react-three/drei** (v9+) para helpers
- Alternativa: **3d-force-graph** si react-three-fiber es muy complejo

### Utilidades:
- **Zod** para validación de esquemas
- **nanoid** para generación de IDs únicos
- **dayjs** para manejo de fechas
- **react-router-dom** para routing

### Testing (opcional MVP, pero incluir setup):
- **Vitest** + **@testing-library/react**

## MODELO DE DATOS

### Text (Texto):
```typescript
{
  id: string;              // nanoid
  title: string;           // requerido
  content: string;         // requerido
  genres: string[];        // array de IDs de géneros
  tags?: string[];         // opcional
  author?: string;         // opcional
  createdAt: string;       // ISO date
  updatedAt: string;       // ISO date
}
```

### Genre (Género/Categoría):
```typescript
{
  id: string;              // nanoid
  name: string;            // requerido
  parentId?: string;       // ID del género padre (null = raíz)
  position: number;        // orden dentro del mismo nivel
  metadata?: Record<string, any>; // opcional
}
```

## ARQUITECTURA

### Estructura de Carpetas:
```
src/
├── components/
│   ├── ui/              # Componentes atómicos (Button, Modal, Input, etc.)
│   ├── TextList.tsx     # Lista de textos
│   ├── TextEditor.tsx   # Formulario crear/editar texto
│   ├── GenreTree.tsx    # Árbol de géneros (sidebar)
│   ├── Graph3D.tsx      # Vista 3D del grafo
│   └── SearchBar.tsx    # Búsqueda global
├── hooks/
│   ├── useTexts.ts      # Hook para CRUD textos
│   ├── useGenres.ts     # Hook para gestión de géneros
│   ├── useStorage.ts    # Hook para acceso a IndexedDB
│   └── useGraphData.ts  # Hook para transformar datos a formato grafo
├── services/
│   └── storageAdapter.ts # Adapter IndexedDB (abstracción)
├── stores/
│   └── appStore.ts      # Zustand store global
├── types/
│   ├── text.ts          # Tipos TypeScript para Text
│   └── genre.ts         # Tipos TypeScript para Genre
├── utils/
│   ├── validation.ts    # Schemas Zod
│   └── graphTransform.ts # Transformar árbol a formato grafo
└── pages/
    ├── HomePage.tsx     # Lista principal de textos
    ├── TextDetailPage.tsx
    └── GraphPage.tsx    # Pestaña 3D
```

## DISEÑO Y UX

### Identidad Visual:
- **Estilo**: Limpio, orientado a lectura, profesional
- **Tono**: Neutro, legible, biblioteca digital

### Paleta de Colores:
- **Primario**: Azul profundo `#2563eb`
- **Fondo**: Blanco `#ffffff` y gris suave `#f7fafc`
- **Acentos**: Verde `#10b981` (confirmaciones), Rojo `#ef4444` (errores)
- **Nodos 3D**: Paleta graduada por tipo/recurrencia

### Tipografía:
- **Fuente**: Inter (sans-serif)
- **Jerarquía**: 
  - Títulos: `text-2xl` / `text-xl`
  - Subtítulos: `text-lg`
  - Cuerpo: `text-base` (16px)
  - Lectura larga: `leading-relaxed` (line-height 1.6)

### Componentes UI Requeridos:

1. **Header**:
   - Título de la app
   - Búsqueda global
   - Botón "+ Nuevo Texto"

2. **Sidebar**:
   - Árbol de géneros (lista colapsable)
   - Botón "Crear Género"
   - Drag & drop para reorganizar

3. **Lista Principal**:
   - Tarjetas/rows de textos
   - Muestra: título, snippet, géneros, acciones (editar, eliminar)

4. **Editor Modal/Panel**:
   - Campos: título, contenido (textarea), géneros (multiselect)
   - Botones: Guardar, Cancelar

5. **Vista Detalle**:
   - Metadata completa
   - Texto completo
   - Acciones rápidas

6. **Pestaña 3D**:
   - Canvas 3D responsivo
   - Controles: zoom, fit, reset layout
   - Panel lateral con info del nodo seleccionado

7. **Toast/Alerts**:
   - Confirmaciones y errores
   - Auto-dismiss

8. **Toolbar Inferior**:
   - Indicador "Guardado localmente"

### Patrones UX:
- Flujo rápido: +Nuevo → modal → guardar → ver en lista
- Edición inline para título (opcional)
- Confirmación para acciones destructivas
- Drag & drop para reorganizar árbol
- Selección de nodo 3D muestra detalles y botón "ir a texto"

### Accesibilidad:
- Contraste AA mínimo
- Navegación por teclado (Tab, Enter, Esc)
- Focus-visible claros
- Etiquetas ARIA en controles 3D
- Estructura semántica (nav, main, article)

### Comportamientos 3D:
- Layout inicial: force-directed o radial por profundidad
- Interacciones: hover tooltip, click seleccionar, drag nodo
- Performance: LOD para >1000 nodos (mostrar labels solo al acercar)

## REQUISITOS FUNCIONALES DETALLADOS

### F1. CRUD Textos:
- **F1.1 Crear**: Título, contenido, géneros (multiselect), tags opcionales, autor opcional
- **F1.2 Leer**: Listado con búsqueda, vista detalle completa
- **F1.3 Actualizar**: Editar todos los campos
- **F1.4 Eliminar**: Con confirmación modal

### F2. Gestión de Géneros:
- **F2.1 Crear**: Nombre y padre opcional
- **F2.2 Renombrar**: Edición inline
- **F2.3 Eliminar**: Con opción de reasignar textos o eliminar relación
- **F2.4 Reorganizar**: Drag & drop para cambiar padre
- **F2.5 Exportar/Importar**: JSON (opcional MVP)

### F3. Visualización 3D:
- **F3.1 Pestaña "Grafo"** con canvas 3D
- **F3.2 Nodos** = géneros, **Enlaces** = relaciones padre-hijo
- **F3.3 Seleccionar nodo** muestra info y lista de textos asociados
- **F3.4 Búsqueda de nodo** por nombre y zoom automático
- **F3.5 Exportar subgrafo** como JSON

### F4. Búsqueda y Filtros:
- **F4.1 Buscar** por título y contenido
- **F4.2 Filtrar** por género o múltiples géneros

### F5. Persistencia:
- **F5.1 Todo en IndexedDB** (textos, géneros, relaciones)
- **F5.2 Adapter** para permitir swap futuro

## REQUISITOS NO FUNCIONALES

- **Performance**: Operaciones CRUD <100ms, grafo 3D interactivo hasta 500 nodos
- **Escalabilidad**: Soporte para decenas de miles de textos
- **Privacidad**: Todo en cliente, sin envío a terceros
- **Compatibilidad**: Chrome, Edge, Firefox, Safari (navegadores modernos)
- **Accesibilidad**: WCAG AA básico

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Setup y Infraestructura (Semana 1)
1. Crear proyecto React + Vite + TypeScript
2. Configurar TailwindCSS
3. Configurar ESLint
4. Crear estructura de carpetas
5. Implementar adapter IndexedDB
6. Crear modelos de datos (types)
7. Implementar schemas Zod

### Fase 2: CRUD Textos (Semana 2)
1. UI lista de textos (tarjetas)
2. Formulario crear/editar (modal)
3. Búsqueda por título/contenido
4. Filtros por género
5. Vista detalle
6. Integración con IndexedDB

### Fase 3: Gestión de Géneros (Semana 3)
1. CRUD géneros
2. Árbol jerárquico en sidebar
3. Drag & drop para reorganizar
4. Relaciones texto ↔ género (multiselect)
5. Validaciones (no eliminar género con textos si no se reasigna)

### Fase 4: Visualización 3D (Semana 4)
1. Setup react-three-fiber
2. Transformar árbol a formato grafo (nodes + links)
3. Render básico de nodos y enlaces
4. Interactividad (zoom, drag, selección)
5. Panel lateral con info de nodo
6. Búsqueda y zoom a nodo
7. Export JSON del grafo

### Fase 5: Polish y Tests (Semana 4-5)
1. Tests críticos (CRUD, persistencia)
2. Ajustes de UX
3. Optimizaciones de performance
4. Documentación básica (README)

## MÉTRICAS DE ÉXITO

- Flujo crear → editar → ver → borrar completado sin errores (>90%)
- Visualización 3D carga 500 nodos manteniendo interactividad (<200ms)
- Persistencia: cambios recuperables tras refresh (100%)
- Time-to-first-content: < 5 minutos desde instalación a crear primer texto

## ENTREGABLES ESPERADOS

1. ✅ Repo con proyecto React + Vite funcional
2. ✅ Módulo de storage (IndexedDB adapter) documentado
3. ✅ CRUD textos completo con UI
4. ✅ Gestión de categorías en árbol con drag & drop
5. ✅ Pestaña 3D con visualización interactiva
6. ✅ Export simple de grafo (JSON)
7. ✅ README con guía de instalación y uso
8. ✅ Build estático funcional (npm run build)

## INSTRUCCIONES ESPECÍFICAS PARA LA IA

1. **Crear el proyecto desde cero** en un directorio nuevo
2. **Seguir la estructura de carpetas** especificada
3. **Implementar TODAS las funcionalidades** del MVP
4. **Usar TypeScript** estrictamente (sin `any` innecesarios)
5. **Aplicar el diseño** con TailwindCSS según especificaciones
6. **Documentar el código** con comentarios claros
7. **Crear un README completo** con instrucciones de setup
8. **Asegurar que el build funciona** (`npm run build` debe generar dist/ sin errores)
9. **Incluir datos de ejemplo** (seed) para testing inicial
10. **Optimizar para performance** desde el inicio

## NOTAS IMPORTANTES

- Este es un proyecto **frontend-only**, NO necesita backend
- La persistencia es **100% local** (IndexedDB)
- No implementar autenticación ni usuarios
- El proyecto debe ser **completamente funcional** al finalizar
- Priorizar **funcionalidad sobre perfección visual** (pero mantener diseño limpio)

---

**¿Puedes crear este proyecto completo siguiendo todas estas especificaciones?**






