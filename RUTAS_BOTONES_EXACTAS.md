# 🎯 RUTAS DE BOTONES - ARCHIVOS EXACTOS

## 📍 DÓNDE ESTÁN LOS BOTONES QUE NAVEGAN

### 1. MARKETPLACEPAGE.TSX - Botones de servicios

**Archivo:** `frontend/src/pages/MarketplacePage.tsx`

#### Botón 1: "Los más elegidos" (Línea 656-661)
```typescript
<div
  key={service.id}
  className="top-service-card"
  onClick={() => handleServiceClick(service)}  // ← ESTE ES EL BOTÓN
>
```

#### Botón 2: Grid de servicios (Línea 707-711)
```typescript
<div
  key={service.id}
  className="service-card"
  onClick={() => handleServiceClick(service)}  // ← ESTE ES EL BOTÓN
>
```

#### Función que maneja el click (Línea 184-219)
```typescript
const handleServiceClick = (service: Service) => {
  // ... código ...
  navigate(targetPath, { replace: false });  // ← AQUÍ NAVEGA
};
```

### 2. SERVICEDETAILPAGE.TSX - Botón "Reservar Ahora"

**Archivo:** `frontend/src/pages/ServiceDetailPage.tsx`

#### Botón "Reservar Ahora" (Línea 460-484)
```typescript
<button 
  className="book-button"
  onClick={() => {
    // ... código ...
    navigate(targetPath, { replace: false });  // ← AQUÍ NAVEGA
  }}
>
  Reservar Ahora
</button>
```

### 3. APP.TSX - Routing principal

**Archivo:** `frontend/src/App.tsx`

#### Línea 328-345: Detección de subdominio
```typescript
const isMarketplaceMainDomain = hostname === 'weekly.pe' || hostname === 'merchants.weekly.pe';
const subdomain = !isMarketplaceMainDomain && ...;
```

#### Línea 440-456: Routing del marketplace
```typescript
if (isMarketplaceDomain) {
  // ... routing ...
  if (routeParts.length >= 4 && routeParts[routeParts.length - 1] === 'booking') {
    return <MarketplaceBookingPage />;  // ← DEBE SER ESTE
  }
  if (routeParts.length >= 3) {
    return <ServiceDetailPage />;  // ← DEBE SER ESTE
  }
}
```

#### Línea 486-514: Detección de tenant (DEBE estar después de marketplace)
```typescript
if (
  subdomain &&
  subdomain !== 'demo' &&
  subdomain !== 'panel' &&
  subdomain !== 'api' &&
  subdomain !== 'merchants' &&
  !isMarketplaceDomain  // ← CRÍTICO: Esta verificación
) {
  // ... código de tenant ...
}
```

## ✅ VERIFICACIÓN RÁPIDA

Abre la consola del navegador (F12) y busca estos logs cuando hagas click:

1. **Al hacer click en "Salón de Belleza":**
   ```
   🔍 App.tsx Routing Debug: { hostname: "weekly.pe", ... }
   🔍 handleServiceClick: { service: "Salón de Belleza", ... }
   ✅ Navegando a ruta dinámica del marketplace: /lima/peluqueria/123-salon-bella-vista
   ```

2. **Si ves esto, está mal:**
   ```
   🔍 Detectado subdominio de tenant: peluqueria
   ⚠️ Redirigiendo tenant desde raíz a /booking
   ```

## 🚨 SI AÚN TE REDIRIGE

1. **Abre la consola (F12)**
2. **Haz click en "Salón de Belleza"**
3. **Copia TODOS los logs que aparezcan**
4. **Compártelos conmigo**

Los logs me dirán EXACTAMENTE dónde está el problema.

