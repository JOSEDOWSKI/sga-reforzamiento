import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Landing page para merchants.weekly.pe
import LandingPage from './pages/LandingPage';

// Ecommerce nuevo (desde weekly)
import { MarketplacePage } from './ecommerce/pages/MarketplacePage/MarketplacePage';
import { ServiceDetailPage } from './ecommerce/pages/ServiceDetailPage/ServiceDetailPage';
import { ServiceBookingPage } from './ecommerce/pages/ServiceBookingPage/ServiceBookingPage';

// Estilos del ecommerce (SOLO estos, no los del sistema antiguo)
import './ecommerce/styles/global.css';

// Estilos del sistema antiguo SOLO para LandingPage (merchants.weekly.pe)
// Se cargan condicionalmente solo cuando se necesita LandingPage

function AppContent() {
  const location = useLocation();
  const hostname = window.location.hostname;
  const pathname = location.pathname;

  // Normalizar hostname (sin www, sin puerto)
  const normalizedHost = hostname.replace(/^www\./, '').split(':')[0];

  // Detectar subdominio
  const parts = normalizedHost.split('.');
  const subdomain = parts.length >= 3 ? parts[0].toLowerCase() : null;

  // Dominios del marketplace
  const marketplaceDomains = [
    'weekly.pe',
    'localhost',
    ...(import.meta.env.VITE_MARKETPLACE_DOMAIN ? [import.meta.env.VITE_MARKETPLACE_DOMAIN] : []),
    ...(import.meta.env.VITE_WEEKLY_MARKETPLACE_DOMAIN ? [import.meta.env.VITE_WEEKLY_MARKETPLACE_DOMAIN] : []),
  ];

  // Dominios de merchants (landing page informativa)
  const merchantsDomains = [
    'merchants.weekly.pe',
    ...(import.meta.env.VITE_MERCHANTS_DOMAIN ? [import.meta.env.VITE_MERCHANTS_DOMAIN] : []),
    ...(import.meta.env.VITE_WEEKLY_MERCHANTS_DOMAIN ? [import.meta.env.VITE_WEEKLY_MERCHANTS_DOMAIN] : []),
  ];

  const isMarketplaceDomain = marketplaceDomains.includes(normalizedHost);
  const isMerchantsDomain = merchantsDomains.includes(normalizedHost);

  // Logs de debug
  useEffect(() => {
    console.log('🔍 AppContent Routing:', {
      hostname,
      normalizedHost,
      subdomain,
      pathname,
      isMarketplaceDomain,
      isMerchantsDomain,
    });
  }, [hostname, normalizedHost, subdomain, pathname, isMarketplaceDomain, isMerchantsDomain]);

  // PRIORIDAD 1: Dominios informativos de merchants (MÁXIMA PRIORIDAD)
  if (isMerchantsDomain || subdomain === 'merchants') {
    console.log('✅ PRIORIDAD 1: Detectado merchants.weekly.pe - Mostrando LandingPage');
    // LandingPage carga sus propios estilos internamente
    return <LandingPage />;
  }

  // PRIORIDAD 2: Dominios del marketplace/ecommerce (weekly.pe por defecto)
  if (isMarketplaceDomain) {
    console.log('✅ PRIORIDAD 2: Detectado weekly.pe - Mostrando Ecommerce');

    // Rutas dinámicas estilo Rappi: /:ciudad/:categoria/:aliadoId/booking
    const routeParts = pathname.split('/').filter(Boolean);
    
    if (routeParts.length >= 4 && routeParts[routeParts.length - 1] === 'booking') {
      // Página de reserva: /lima/peluqueria/123-salon-bella-vista/booking
      return <ServiceBookingPage />;
    }
    
    if (routeParts.length >= 3) {
      // Detalle del negocio: /lima/peluqueria/123-salon-bella-vista
      return <ServiceDetailPage />;
    }
    
    if (routeParts.length === 2) {
      // Marketplace por ciudad y categoría: /lima/peluqueria
      return <MarketplacePage />;
    }
    
    if (routeParts.length === 1) {
      // Marketplace por ciudad: /lima
      return <MarketplacePage />;
    }
    
    // Ruta raíz: redirigir a /lima por defecto
    if (pathname === '/' || pathname === '') {
      window.location.href = '/lima';
      return <div>Cargando...</div>;
    }
    
    // Fallback: mostrar marketplace
    return <MarketplacePage />;
  }

  // Si es localhost o IP local sin subdominio, también mostrar marketplace (desarrollo)
  const isLocalIP = hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  const isMainDomain = (hostname === 'localhost' || isLocalIP) && !subdomain;

  if (isMainDomain) {
    console.log('✅ Desarrollo local: Mostrando Ecommerce');
    
    const routeParts = pathname.split('/').filter(Boolean);
    
    if (routeParts.length >= 4 && routeParts[routeParts.length - 1] === 'booking') {
      return <ServiceBookingPage />;
    }
    
    if (routeParts.length >= 3) {
      return <ServiceDetailPage />;
    }
    
    if (routeParts.length === 2 || routeParts.length === 1) {
      return <MarketplacePage />;
    }
    
    if (pathname === '/' || pathname === '') {
      window.location.href = '/lima';
      return <div>Cargando...</div>;
    }
    
    return <MarketplacePage />;
  }

  // Fallback: Si llegamos aquí sin match, mostrar marketplace
  console.warn('⚠️ AppContent: No se encontró match, mostrando MarketplacePage como fallback');
  return <MarketplacePage />;
}

// -------- App principal --------
function App() {
  return (
    <Router>
      <Routes>
        {/* Todas las rutas pasan por AppContent que maneja el routing según dominio */}
        {/* merchants.weekly.pe → LandingPage (página de información para merchants) */}
        {/* weekly.pe → Ecommerce (marketplace con aliados) */}
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
