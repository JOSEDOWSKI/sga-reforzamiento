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

// Páginas del panel global
import GlobalLoginPage from './pages/GlobalLoginPage';
import GestionTenantsPage from './pages/GestionTenantsPage';

// Landing page
import LandingPage from './pages/LandingPage';

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
  const { isTutorialEnabled, config } = useTenantConfig();
  const [tutorialEnabled, setTutorialEnabled] = useState(isTutorialEnabled);

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
              <Route path="/servicios" element={<GestionServicios />} />
              <Route path="/clientes" element={<GestionClientes />} />
              <Route path="/staff" element={<GestionStaff />} />
              <Route path="/categorias" element={<GestionCategorias />} />
              <Route path="/estadisticas" element={<EstadisticasPage />} />
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
  const { user } = useAuth();
  
  // Detectar el dominio actual
  const hostname = window.location.hostname;
  
  // Si es weekly.pe, mostrar landing page
  if (hostname === 'weekly.pe') {
    return <LandingPage />;
  }
  
  // Si es panel.weekly, mostrar panel global directamente
  if (hostname === 'panel.weekly') {
    return <GlobalAppContent />;
  }
  
  // Determinar si es panel global o tenant basado en el usuario
  const isGlobalPanel = user?.userType === 'global' || user?.rol === 'super_admin';
  
  if (isGlobalPanel) {
    return <GlobalAppContent />;
  }
  
  return <TenantAppContent />;
}

// -------- App principal --------
function App() {
  return (
    <Router>
      <SplashProvider>
        <AuthProvider>
          <RealtimeProvider>
            <AppContent />
          </RealtimeProvider>
        </AuthProvider>
      </SplashProvider>
    </Router>
  );
}

export default App;