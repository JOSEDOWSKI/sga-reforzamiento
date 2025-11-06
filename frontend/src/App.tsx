import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';

// Páginas del tenant
import DashboardPage from './pages/DashboardPage';
import GestionServicios from './pages/GestionServicios';
import GestionStaff from './pages/GestionStaff';
import GestionClientes from './pages/GestionClientes';
import GestionCategorias from './pages/GestionCategorias';
import EstadisticasPage from './pages/EstadisticasPage';
import UserCalendarView from './pages/UserCalendarView';

// Páginas del panel global
import GlobalLoginPage from './pages/GlobalLoginPage';
import GestionTenantsPage from './pages/GestionTenantsPage';

// Login de tenant
import LoginPage from './pages/LoginPage';

// Landing page
import LandingPage from './pages/LandingPage';

// Calendario público (sin autenticación)
import PublicCalendarPage from './pages/PublicCalendarPage';
import DemoView from './pages/DemoView';

// Componentes
import Navbar from './components/Navbar';
import Header from './components/Header';
import GlobalNavbar from './components/GlobalNavbar';
import SplashScreen from './components/SplashScreen';
import SplashReset from './components/SplashReset';
import ProtectedRoute from './components/ProtectedRoute';
import TourOrchestrator from './tour/TourOrchestrator';
import TutorialSettings from './components/TutorialSettings';

// Contextos
import { AuthProvider } from './hooks/useAuth';
import { SplashProvider } from './contexts/SplashContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { useSplashScreen } from './hooks/useSplashScreen'; 
import { useTenantConfig } from './hooks/useTenantConfig';
import './App.css';
import './styles/GlobalPanel.css';

function TenantAppContent() {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);  
  const { showSplash, isInitialized, hideSplash } = useSplashScreen();
  const { isTutorialEnabled } = useTenantConfig();
  const [tutorialEnabled, setTutorialEnabled] = useState(isTutorialEnabled);
  const { user } = useAuth();
  
  // Determinar si el usuario es administrador
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    if (isNavOpen) {
      setIsNavOpen(false);
    }
    const random = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const root = document.documentElement;
    root.style.setProperty('--aurora1-x', `${random(-30, 30)}vw`);
    root.style.setProperty('--aurora1-y', `${random(-30, 30)}vh`);
    root.style.setProperty('--aurora1-r', `${random(-30, 30)}deg`);
    root.style.setProperty('--aurora2-x', `${random(-40, 40)}vw`);
    root.style.setProperty('--aurora2-y', `${random(-40, 40)}vh`);
    root.style.setProperty('--aurora2-r', `${random(-30, 30)}deg`);
  }, [location.pathname]);

  // Sincronizar el estado del tutorial con la configuración del tenant
  useEffect(() => {
    setTutorialEnabled(isTutorialEnabled);
  }, [isTutorialEnabled]);

  // Si el usuario no es admin, mostrar solo la vista de calendario
  if (!isAdmin) {
    return (
      <>
        {/* SplashScreen siempre por encima */}
        {(!isInitialized || showSplash) && <SplashScreen onComplete={hideSplash} />}

        <ProtectedRoute>
          <div className="app-container">
            <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
            <main className="content-container">
              <Routes>
                <Route path="/" element={<UserCalendarView />} />
                <Route path="/calendario" element={<UserCalendarView />} />
              </Routes>
            </main>
            <SplashReset />
          </div>
        </ProtectedRoute>
      </>
    );
  }

  // Vista completa para administradores
  return (
    <>
      {/* SplashScreen siempre por encima */}
      {(!isInitialized || showSplash) && <SplashScreen onComplete={hideSplash} />}

      <ProtectedRoute>
        <div className={`app-container ${isNavOpen ? 'nav-open' : ''}`}>
          <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
          <Navbar isNavOpen={isNavOpen} />

          {/* Tour solo cuando ya inicializó, no está el splash y el tutorial está habilitado */}
          {!showSplash && isInitialized && tutorialEnabled && <TourOrchestrator />}

          {/* Configuración de tutorial (siempre visible para administradores) */}
          {!showSplash && isInitialized && <TutorialSettings 
            isTutorialEnabled={tutorialEnabled}
            onToggleTutorial={() => setTutorialEnabled(!tutorialEnabled)}
          />}

          <main className="content-container">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/servicios" element={<GestionServicios />} />
              <Route path="/clientes" element={<GestionClientes />} />
              <Route path="/staff" element={<GestionStaff />} />
              <Route path="/categorias" element={<GestionCategorias />} />
              <Route path="/estadisticas" element={<EstadisticasPage />} />
              <Route path="/calendario" element={<UserCalendarView />} />
            </Routes>
          </main>

          {isNavOpen && (
            <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
          )}
          <SplashReset />
        </div>
      </ProtectedRoute>
    </>
  );
}

function GlobalAppContent() {
  const { isAuthenticated, isGlobalUser } = useAuth();

  if (!isAuthenticated || !isGlobalUser()) {
    return <GlobalLoginPage />;
  }

  return (
    <div className="global-app-container">
      <GlobalNavbar />
      <main className="global-main-content">
        <Routes>
          <Route path="/" element={<GestionTenantsPage />} />
          <Route path="/super-admin/tenants" element={<GestionTenantsPage />} />
          <Route path="/super-admin/users" element={<div>Gestión de Usuarios Globales (Próximamente)</div>} />
          <Route path="/super-admin/billing" element={<div>Facturación (Próximamente)</div>} />
          <Route path="/super-admin/support" element={<div>Soporte (Próximamente)</div>} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  
  // Detectar el dominio actual
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Extraer subdominio si existe
  const parts = hostname.split('.');
  const subdomain = parts.length >= 3 && !hostname.includes('localhost') ? parts[0] : null;
  
  // Si es demo.weekly.pe, mostrar DemoView (acceso libre sin login)
  // Usamos solo demo.weekly.pe para mejor tracking y performance
  if (hostname === 'demo.weekly.pe' || subdomain === 'demo') {
    return <DemoView />;
  }
  
  // Si es weekly.pe o www.weekly.pe, mostrar landing page o calendario público global
  const isMainDomain = 
    hostname === 'weekly.pe' || 
    hostname === 'www.weekly.pe';
  
  if (isMainDomain) {
    // Si es /agendar en el dominio principal, mostrar calendario público global
    if (pathname === '/agendar' || pathname === '/agendar/') {
      return <PublicCalendarPage />;
    }
    // Si no, mostrar landing page
    return <LandingPage />;
  }
  
  // Si es panel.weekly o panel.weekly.pe, mostrar panel global directamente
  if (hostname === 'panel.weekly' || hostname === 'panel.weekly.pe' || subdomain === 'panel') {
    return <GlobalAppContent />;
  }
  
  // Determinar si es panel global o tenant basado en el usuario
  const isGlobalPanel = user?.userType === 'global' || user?.rol === 'super_admin';
  
  if (isGlobalPanel && !subdomain) {
    return <GlobalAppContent />;
  }
  
  // Si hay un subdominio y no es demo ni panel, es un tenant
  if (subdomain && subdomain !== 'demo' && subdomain !== 'panel' && subdomain !== 'api') {
    // Si la ruta es /agendar, mostrar calendario público del tenant (sin autenticación)
    // Este calendario usa la base de datos del tenant específico vía X-Tenant header
    if (pathname === '/agendar' || pathname === '/agendar/') {
      return <PublicCalendarPage />;
    }
    
    // Si la ruta es /login y no está autenticado, mostrar login del tenant
    if (pathname === '/login' && !user && !isLoading) {
      return <LoginPage />;
    }
    
    // Si está en la raíz del tenant y no está autenticado, redirigir a /agendar del mismo tenant
    if (pathname === '/' && !user && !isLoading) {
      window.location.href = `/agendar`;
      return <div>Cargando...</div>;
    }
    
    // Para rutas autenticadas, usar TenantAppContent (dashboard, servicios, etc.)
    return <TenantAppContent />;
  }
  
  // Default: TenantAppContent para rutas autenticadas
  return <TenantAppContent />;
}

// -------- App principal --------
function App() {
  return (
    <Router>
      <SplashProvider>
        <AuthProvider>
          <RealtimeProvider>
            <Routes>
              {/* Rutas públicas (sin autenticación) */}
              <Route path="/calendario-publico" element={<PublicCalendarPage />} />
              
              {/* Todas las rutas pasan por AppContent que maneja el routing según subdominio */}
              {/* /agendar en tenant.weekly.pe muestra el calendario público del tenant */}
              {/* /agendar en weekly.pe muestra el calendario público global */}
              {/* demo.weekly.pe muestra DemoView directamente */}
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </RealtimeProvider>
        </AuthProvider>
      </SplashProvider>
    </Router>
  );
}

export default App;