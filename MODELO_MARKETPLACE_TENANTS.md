# Modelo Marketplace + Tenants - Weekly

## 🎯 Concepto

**El marketplace NO descarta los tenants.** Es una capa de descubrimiento que permite a los usuarios encontrar negocios y luego navegar a sus calendarios públicos.

## 📊 Arquitectura

### 1. Marketplace (weekly.pe)
- **Propósito**: Descubrimiento de negocios
- **Funcionalidad**: 
  - Lista de negocios disponibles
  - Búsqueda y filtros
  - Información básica (nombre, ubicación, rating, precio)
- **Navegación**: Click en negocio → Calendario público del tenant

### 2. Tenants (tenant.weekly.pe)
- **Propósito**: Panel administrativo y calendario público del negocio
- **Funcionalidades**:
  - Panel admin completo (dashboard, servicios, colaboradores, reservas)
  - Calendario público en `/booking`
  - Configuración personalizada
  - Base de datos aislada por tenant

### 3. Merchants Landing (merchants.weekly.pe)
- **Propósito**: Página informativa para merchants (futuros clientes)
- **Funcionalidad**: Información sobre el producto, planes, características

## 🔄 Flujo de Usuario

### Cliente buscando servicio:
```
1. weekly.pe (Marketplace)
   ↓ Click en "Salón de Belleza"
2. peluqueria.weekly.pe/booking (Calendario público)
   ↓ Seleccionar fecha, hora, colaborador
3. Completar reserva
   ✅ Reserva confirmada
```

### Merchant (dueño del negocio):
```
1. merchants.weekly.pe (Landing)
   ↓ Registrarse
2. panel.weekly.pe (Panel global)
   ↓ Crear tenant
3. peluqueria.weekly.pe (Panel admin del tenant)
   ↓ Gestionar servicios, colaboradores, reservas
```

## 🏗️ Estructura de Datos

### Marketplace
- Lista de tenants activos
- Información pública de cada tenant:
  - Nombre del negocio
  - Ubicación (lat/lng)
  - Categoría/rubro
  - Rating y reviews
  - Precios
  - Imágenes

### Tenants
- Cada tenant tiene su propia base de datos: `weekly_{tenant_name}`
- Datos aislados:
  - Servicios/Establecimientos
  - Colaboradores
  - Clientes
  - Reservas
  - Configuración personalizada

## 🔗 Integración

### Marketplace → Tenant
Cuando un usuario hace click en un negocio en el marketplace:
```javascript
// MarketplacePage.tsx
onClick={() => {
  if (service.tenant_name) {
    window.location.href = `https://${service.tenant_name}.weekly.pe/booking`;
  }
}}
```

### Tenant → Marketplace
Los tenants pueden aparecer en el marketplace si:
- Están activos
- Tienen servicios configurados
- Están en la lista de tenants permitidos

## ✅ Ventajas del Modelo

1. **Descubrimiento**: Los usuarios encuentran negocios fácilmente
2. **Aislamiento**: Cada tenant tiene su propia BD y configuración
3. **Personalización**: Cada negocio puede personalizar su sistema
4. **Escalabilidad**: Fácil agregar nuevos tenants sin afectar otros
5. **SEO**: Cada tenant tiene su propio dominio/subdominio

## 🚫 Lo que NO cambia

- Los tenants siguen existiendo y funcionando igual
- Cada tenant mantiene su panel admin
- Cada tenant mantiene su base de datos aislada
- Cada tenant mantiene su configuración personalizada
- El marketplace es solo una capa adicional de descubrimiento

