# Plan de Migración a TOON - Weekly

## Resumen

TOON (Token-Oriented Object Notation) reduce el consumo de tokens en 30-60% comparado con JSON, especialmente beneficioso para:
- Comunicación con LLMs
- APIs públicas con respuestas grandes
- Almacenamiento de configuración
- Transferencia de datos estructurados

## Estado Actual

- **405 usos de JSON** en el backend
- **Sistema completo** usando JSON
- **Frontend** consume JSON exclusivamente

## Fase 1: Infraestructura (✅ COMPLETADO)

### Herramientas Creadas
1. ✅ `backend/src/utils/toonParser.js` - Parser y serializer TOON
2. ✅ `backend/src/middleware/toonMiddleware.js` - Middleware Express para TOON
3. ✅ `backend/src/utils/toonConverter.js` - Utilidades de conversión
4. ✅ Integración en `backend/src/index.js`

### Características
- Parseo de TOON en requests
- Respuestas automáticas en TOON si el cliente lo acepta
- Detección automática de formato preferido
- Compatibilidad con JSON (soporte dual)

## Fase 2: Endpoints Públicos (Pendiente)

### Prioridad Alta
1. **API Pública de Reservas** (`/api/public/*`)
   - Beneficio: Alto (muchas respuestas grandes)
   - Impacto: Bajo (solo lectura pública)
   
2. **Discovery de Tenants** (`/api/public/tenants`)
   - Beneficio: Alto (listas grandes de datos)
   - Impacto: Bajo (público)

3. **Configuración Pública** (`/api/tenants/config/:tenantName`)
   - Beneficio: Medio (configuraciones complejas)
   - Impacto: Bajo

### Implementación
```javascript
// Ejemplo: Actualizar publicController.js
async discover(req, res) {
    const tenants = await tenantDiscoveryService.discoverTenants(filters);
    
    // Detectar si acepta TOON
    if (req.get('Accept')?.includes('application/toon')) {
        return res.toon({ success: true, data: tenants });
    }
    
    res.json({ success: true, data: tenants });
}
```

## Fase 3: Frontend (Pendiente)

### Actualizar API Client
```typescript
// frontend/src/config/api.ts
const apiClient = axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/toon, application/json' // Preferir TOON
    }
});

// Parser TOON en interceptor
apiClient.interceptors.response.use(
    response => {
        if (response.headers['content-type']?.includes('application/toon')) {
            response.data = parseToon(response.data);
        }
        return response;
    }
);
```

### Crear Parser TOON en Frontend
```typescript
// frontend/src/utils/toonParser.ts
export function parseToon(toon: string): any {
    // Implementar parser TOON en TypeScript
}
```

## Fase 4: Almacenamiento (Opcional)

### Consideraciones
- PostgreSQL JSONB puede almacenar TOON como texto
- Evaluar si vale la pena cambiar formato de almacenamiento
- Mantener JSONB para compatibilidad con herramientas existentes

### Recomendación
- **NO cambiar** formato de almacenamiento en BD
- Usar TOON solo para **transmisión** (API requests/responses)
- Mantener JSONB en PostgreSQL

## Fase 5: Endpoints Administrativos (Opcional)

### Baja Prioridad
- Endpoints admin no necesitan optimización de tokens
- Mantener JSON para compatibilidad con herramientas
- Considerar TOON solo si hay integración con LLMs

## Estrategia de Migración

### Enfoque Gradual
1. ✅ **Fase 1**: Infraestructura (COMPLETADO)
2. ⏳ **Fase 2**: Endpoints públicos (2-3 días)
3. ⏳ **Fase 3**: Frontend (2-3 días)
4. ⏳ **Fase 4**: Testing y optimización (1-2 días)
5. ⏳ **Fase 5**: Documentación (1 día)

### Compatibilidad
- **Soporte dual**: JSON y TOON simultáneamente
- **Detección automática**: Basada en headers Accept/Content-Type
- **Fallback**: Si TOON falla, usar JSON
- **Sin breaking changes**: APIs existentes siguen funcionando

## Testing

### Casos de Prueba
1. Request con `Content-Type: application/toon`
2. Request con `Accept: application/toon`
3. Request con `?format=toon`
4. Request con `X-Response-Format: toon`
5. Comparar tamaño de respuestas JSON vs TOON
6. Verificar parsing correcto de estructuras complejas

### Métricas
- Reducción de tokens por endpoint
- Tiempo de parsing TOON vs JSON
- Tamaño de respuesta (bytes)
- Compatibilidad con clientes existentes

## Beneficios Esperados

### Para Weekly
- **30-60% reducción** en tokens para APIs públicas
- **Menor costo** si se integran LLMs en el futuro
- **Mejor rendimiento** en transferencia de datos grandes
- **Ventaja competitiva** al adoptar tecnología emergente

### Para Clientes
- **Respuestas más rápidas** (menos datos)
- **Menor uso de ancho de banda**
- **Mejor experiencia** en conexiones lentas

## Riesgos y Mitigaciones

### Riesgo 1: Compatibilidad
- **Mitigación**: Soporte dual JSON/TOON

### Riesgo 2: Parsing complejo
- **Mitigación**: Testing exhaustivo, fallback a JSON

### Riesgo 3: Ecosistema limitado
- **Mitigación**: Implementación propia, mantenimiento interno

## Próximos Pasos

1. ✅ Completar Fase 1 (Infraestructura)
2. ⏳ Implementar Fase 2 (Endpoints públicos)
3. ⏳ Actualizar frontend para consumir TOON
4. ⏳ Testing y validación
5. ⏳ Documentación para desarrolladores

---

**Última actualización**: Noviembre 2024
**Estado**: Fase 1 completada, Fase 2 en progreso

