# 📋 ARCHIVOS A MODIFICAR PARA CORREGIR RUTAS

## 🎯 PROBLEMA
Cuando haces click en "Salón de Belleza" te lleva a `peluqueria.weekly.pe` en lugar de `weekly.pe/lima/peluqueria/123-salon-bella-vista`

## 📁 ARCHIVOS QUE DEBES MODIFICAR

### 1. `frontend/src/pages/MarketplacePage.tsx`

**Línea 184-219**: Función `handleServiceClick` - ESTE ES EL BOTÓN PRINCIPAL

```typescript
const handleServiceClick = (service: Service) => {
  // PREVENIR cualquier redirección a subdominios de tenant
  const currentHost = window.location.hostname;
  if (currentHost !== 'weekly.pe' && !currentHost.includes('localhost')) {
    console.error('❌ ERROR: Intento de navegación desde dominio incorrecto:', currentHost);
    return;
  }
  
  console.log('🔍 handleServiceClick:', { 
    service: service.nombre, 
    tenant_name: service.tenant_name,
    selectedCity,
    categoria: service.categoria,
    currentHost
  });
  
  analytics.viewService(
    service.id,
    service.nombre,
    service.categoria,
    selectedCity || undefined
  );
  
  // SIEMPRE usar rutas dinámicas del marketplace, NUNCA subdominios de tenant
  // BLOQUEAR explícitamente cualquier intento de usar tenant_name para redirección
  const citySlug = selectedCity?.toLowerCase() || 'lima';
  const categorySlug = service.categoria?.toLowerCase().replace(/\s+/g, '-') || 'servicio';
  const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const targetPath = `/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}`;
  
  console.log('✅ Navegando a ruta dinámica del marketplace:', targetPath);
  console.log('🚫 BLOQUEADO: No se usará tenant_name para redirección');
  
  // Usar navigate, NUNCA window.location.href
  navigate(targetPath, { replace: false });
};
```

**Línea 660**: Botón en "Los más elegidos" - USA `handleServiceClick` ✅

**Línea 711**: Botón en grid de servicios - USA `handleServiceClick` ✅

### 2. `frontend/src/pages/ServiceDetailPage.tsx`

**Línea 460-484**: Botón "Reservar Ahora" - ESTE ES EL BOTÓN DE RESERVA

```typescript
<button 
  className="book-button"
  onClick={() => {
    // PREVENIR cualquier redirección a subdominios de tenant
    const currentHost = window.location.hostname;
    if (currentHost !== 'weekly.pe' && !currentHost.includes('localhost')) {
      console.error('❌ ERROR: Intento de navegación desde dominio incorrecto:', currentHost);
      return;
    }
    
    analytics.clickBooking(service.id, service.nombre, service.categoria);
    
    // SIEMPRE usar rutas dinámicas del marketplace, NUNCA subdominios de tenant
    // Navegar a la nueva página de booking del marketplace
    const citySlug = params.ciudad?.toLowerCase() || 'lima';
    const categorySlug = params.categoria?.toLowerCase() || service.categoria?.toLowerCase().replace(/\s+/g, '-') || 'servicio';
    const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const targetPath = `/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}/booking`;
    
    console.log('✅ Navegando a booking del marketplace:', targetPath);
    console.log('🚫 BLOQUEADO: No se usará tenant_name para redirección');
    
    // Usar navigate, NUNCA window.location.href
    navigate(targetPath, { replace: false });
  }}
>
  Reservar Ahora
</button>
```

### 3. `frontend/src/App.tsx`

**Línea 328-330**: Detección de subdominio - DEBE estar ANTES de detectar tenant

```typescript
// Extraer subdominio si existe
// IMPORTANTE: NO detectar subdominio si estamos en weekly.pe o merchants.weekly.pe
const parts = hostname.split('.');
const isMarketplaceMainDomain = hostname === 'weekly.pe' || hostname === 'merchants.weekly.pe';
const subdomain = !isMarketplaceMainDomain && parts.length >= 3 && !hostname.includes('localhost') ? parts[0] : null;
```

**Línea 432**: Routing para `/booking` - DEBE usar MarketplaceBookingPage

```typescript
if (routeParts.length >= 4 && routeParts[routeParts.length - 1] === 'booking') {
  // Usar la nueva página de booking del marketplace
  return <MarketplaceBookingPage />;
}
```

**Línea 486-492**: Verificación de tenant - DEBE excluir marketplace

```typescript
if (
  subdomain &&
  subdomain !== 'demo' &&
  subdomain !== 'panel' &&
  subdomain !== 'api' &&
  subdomain !== 'merchants' &&
  !isMarketplaceDomain // Asegurar que no estamos en el marketplace
) {
```

### 4. `frontend/src/config/api.ts`

**Línea 55-58**: Interceptor de API - NO debe agregar X-Tenant en weekly.pe

```typescript
// IMPORTANTE: NO agregar X-Tenant si estamos en el marketplace (weekly.pe o merchants.weekly.pe)
const isMarketplaceDomain = hostname === 'weekly.pe' || hostname === 'merchants.weekly.pe';
if (isMarketplaceDomain) {
  // En el marketplace, NO agregar X-Tenant header
  return config;
}
```

## 🔍 VERIFICACIÓN

Después de modificar, verifica en la consola del navegador:

1. Al hacer click en "Salón de Belleza" deberías ver:
   ```
   🔍 handleServiceClick: { service: "Salón de Belleza", ... }
   ✅ Navegando a ruta dinámica del marketplace: /lima/peluqueria/123-salon-bella-vista
   🚫 BLOQUEADO: No se usará tenant_name para redirección
   ```

2. La URL debería cambiar a:
   - ✅ `https://weekly.pe/lima/peluqueria/123-salon-bella-vista`
   - ❌ NO `https://peluqueria.weekly.pe/booking`

## ⚠️ SI AÚN TE REDIRIGE

1. **Limpia la caché del navegador completamente**
2. **Abre en modo incógnito**
3. **Verifica que el deploy se haya completado**
4. **Revisa los logs de la consola para ver qué está pasando**

