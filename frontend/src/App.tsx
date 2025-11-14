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
import Configuracion from './pages/Configuracion';

// Páginas del panel global
import GlobalLoginPage from './pages/GlobalLoginPage';
import GestionTenantsPage from './pages/GestionTenantsPage';

// Login de tenant
import LoginPage from './pages/LoginPage';

// Landing pages
import LandingPage from './pages/LandingPage';
import DemoLandingPage from './pages/DemoLandingPage';

// Calendario público (sin autenticación)
import PublicCalendarPage from './pages/PublicCalendarPage';

// Componentes
import Navbar from './components/Navbar';
import Header from './components/Header';
import GlobalNavbar from './components/GlobalNavbar';
import SplashScreen from './components/SplashScreen';
import SplashReset from './components/SplashReset';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedFeatureRoute from './components/ProtectedFeatureRoute';
import TourOrchestrator from './tour/TourOrchestrator';
import TutorialSettings from './components/TutorialSettings';
import DemoAuthModal from './components/DemoAuthModal';

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
  
  // Detectar si estamos en modo demo
  const hostname = window.location.hostname;
  const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
  const [showDemoModal, setShowDemoModal] = useState(false);
  
  // Mostrar modal en demo si no hay usuario (solo una vez)
  useEffect(() => {
    if (isDemoMode && !user && isInitialized && !showSplash) {
      const hasSeenModal = localStorage.getItem('demo-auth-modal-seen') === 'true';
      if (!hasSeenModal) {
        setShowDemoModal(true);
      }
    }
  }, [isDemoMode, user, isInitialized, showSplash]);
  
  // Determinar el rol del usuario
  // En modo demo: /calendario = colaborador, /dashboard = admin, otros = admin
  const pathname = location.pathname;
  const isColaboradorView = isDemoMode && (pathname === '/calendario' || pathname === '/calendario/');
  const isAdmin = isDemoMode 
    ? !isColaboradorView  // En demo, admin si no es vista colaborador
    : (user?.rol === 'admin');

  useEffect(() => {
    // Solo cerrar el nav en móvil cuando cambia la ruta
    if (isNavOpen && window.innerWidth <= 768) {
      setIsNavOpen(false);
    }
    // Efectos de aurora al cambiar de ruta
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

  // Vista de colaborador en modo demo: solo calendario, sin sidebar, solo toggle tema
  if (isColaboradorView) {
    const colaboradorContent = (
      <div className="app-container">
        <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
        <main className="content-container" style={{ marginLeft: 0, paddingTop: '1rem' }}>
          <Routes>
            <Route path="/calendario" element={<UserCalendarView />} />
          </Routes>
        </main>
        <SplashReset />
      </div>
    );

    return (
      <>
        {(!isInitialized || showSplash) && <SplashScreen onComplete={hideSplash} />}
        {colaboradorContent}
      </>
    );
  }

  // Si el usuario no es admin, mostrar solo la vista de calendario
  // En modo demo, permitir acceso sin autenticación
  if (!isAdmin) {
    const nonAdminContent = (
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
    );

    return (
      <>
        {/* SplashScreen siempre por encima */}
        {(!isInitialized || showSplash) && <SplashScreen onComplete={hideSplash} />}

        {isDemoMode ? (
          nonAdminContent
        ) : (
          <ProtectedRoute>
            {nonAdminContent}
          </ProtectedRoute>
        )}
      </>
    );
  }

  // Vista completa para administradores
  // En modo demo, no requerir autenticación
  const content = (
    <>
      {/* SplashScreen siempre por encima */}
      {(!isInitialized || showSplash) && <SplashScreen onComplete={hideSplash} />}

      {/* En modo demo, no usar ProtectedRoute */}
      {isDemoMode ? (
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
                <Route path="/servicios" element={
                  <ProtectedFeatureRoute feature="servicios">
                    <GestionServicios />
                  </ProtectedFeatureRoute>
                } />
                <Route path="/clientes" element={<GestionClientes />} />
                <Route path="/staff" element={<GestionStaff />} />
                <Route path="/categorias" element={
                  <ProtectedFeatureRoute feature="categorias">
                    <GestionCategorias />
                  </ProtectedFeatureRoute>
                } />
                <Route path="/estadisticas" element={<EstadisticasPage />} />
                <Route path="/calendario" element={<UserCalendarView />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </Routes>
            </main>

          {isNavOpen && (
            <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
          )}
          <SplashReset />
        </div>
      ) : (
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
                <Route path="/servicios" element={
                  <ProtectedFeatureRoute feature="servicios">
                    <GestionServicios />
                  </ProtectedFeatureRoute>
                } />
                <Route path="/clientes" element={<GestionClientes />} />
                <Route path="/staff" element={<GestionStaff />} />
                <Route path="/categorias" element={
                  <ProtectedFeatureRoute feature="categorias">
                    <GestionCategorias />
                  </ProtectedFeatureRoute>
                } />
                <Route path="/estadisticas" element={<EstadisticasPage />} />
                <Route path="/calendario" element={<UserCalendarView />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </Routes>
            </main>

            {isNavOpen && (
              <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
            )}
            <SplashReset />
          </div>
        </ProtectedRoute>
      )}

      {/* Modal de autenticación demo */}
      {isDemoMode && (
        <DemoAuthModal 
          isOpen={showDemoModal} 
          onClose={() => setShowDemoModal(false)} 
        />
      )}
    </>
  );

  return content;
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
  
  // Si es demo.weekly.pe, mostrar landing page o booking
  if (hostname === 'demo.weekly.pe' || subdomain === 'demo') {
    // Si la ruta es /booking, mostrar calendario público
    if (pathname === '/booking' || pathname === '/booking/') {
      return <PublicCalendarPage />;
    }
    
    // Si la ruta es /login, mostrar login del tenant
    if (pathname === '/login' || pathname === '/login/') {
      return <LoginPage />;
    }
    
    // Si está en la raíz y no está autenticado, mostrar landing page de demo
    if (pathname === '/' || pathname === '') {
      if (!user) {
        return <DemoLandingPage />;
      }
      // Si está autenticado, redirigir al dashboard
      return <TenantAppContent />;
    }
    
    // Si es /calendario en demo, mostrar vista de colaborador (sin sidebar, solo calendario y toggle tema)
    if (pathname === '/calendario' || pathname === '/calendario/') {
      return <TenantAppContent />;
    }
    
    // Para rutas autenticadas o en demo (sin auth requerida), usar TenantAppContent
    // En demo, permitir acceso sin autenticación a todas las rutas de admin
    const adminRoutes = ['/dashboard', '/servicios', '/clientes', '/staff', 
                         '/categorias', '/estadisticas', '/configuracion', '/calendario'];
    const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    
    if (user || isAdminRoute) {
      return <TenantAppContent />;
    }
    
    // Si no está autenticado y no es una ruta pública ni de admin, mostrar landing
    return <DemoLandingPage />;
  }
  
  // Si es weekly.pe o www.weekly.pe, mostrar landing page o calendario público global
  const isMainDomain = 
    hostname === 'weekly.pe' || 
    hostname === 'www.weekly.pe';
  
  if (isMainDomain) {
    // Si es /booking en el dominio principal, mostrar calendario público global
    if (pathname === '/booking' || pathname === '/booking/') {
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
    // Si la ruta es /booking, mostrar calendario público del tenant (sin autenticación)
    // Este calendario usa la base de datos del tenant específico vía X-Tenant header
    if (pathname === '/booking' || pathname === '/booking/') {
      return <PublicCalendarPage />;
    }
    
    // Si la ruta es /login y no está autenticado, mostrar login del tenant
    if (pathname === '/login' && !user && !isLoading) {
      return <LoginPage />;
    }
    
    // Si está en la raíz del tenant y no está autenticado, redirigir a /booking del mismo tenant
    if (pathname === '/' && !user && !isLoading) {
      window.location.href = `/booking`;
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
              {/* /booking en tenant.weekly.pe muestra el calendario público del tenant */}
              {/* /booking en weekly.pe muestra el calendario público global */}
              {/* demo.weekly.pe muestra landing page en raíz y /booking para usuarios */}
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </RealtimeProvider>
        </AuthProvider>
      </SplashProvider>
    </Router>
  );
}

export default App;