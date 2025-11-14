import React, { useState, createContext, useContext } from 'react';
import { useTenant } from '../hooks/useTenant';
import PublicCalendarPage from '../pages/PublicCalendarPage';
import DashboardPage from '../pages/DashboardPage';
import GestionServicios from '../pages/GestionServicios';
import UserCalendarView from '../pages/UserCalendarView';
import Navbar from './Navbar';
import Header from './Header';
import './DemoModeWrapper.css';

// Contexto para modo demo
export const DemoModeContext = createContext<{
  isDemoMode: boolean;
  viewMode: 'usuario' | 'admin';
  setViewMode: (mode: 'usuario' | 'admin') => void;
}>({
  isDemoMode: false,
  viewMode: 'usuario',
  setViewMode: () => {}
});

export const useDemoMode = () => {
  try {
    const context = useContext(DemoModeContext);
    return context.isDemoMode;
  } catch {
    return false; // Si no está en el contexto, no es modo demo
  }
};

interface DemoModeWrapperProps {
  children?: React.ReactNode;
}

const DemoModeWrapper: React.FC<DemoModeWrapperProps> = ({ children }) => {
  const tenantInfo = useTenant();
  const isDemoTenant = tenantInfo.id === 'demo';
  const [viewMode, setViewMode] = useState<'usuario' | 'admin'>('usuario');

  // Si no es demo, renderizar children normalmente
  if (!isDemoTenant) {
    return <>{children}</>;
  }

  return (
    <DemoModeContext.Provider value={{ isDemoMode: true, viewMode, setViewMode }}>
      <div className="demo-mode-wrapper">
        {/* Banner de modo demo con selector */}
        <div className="demo-banner">
          <div className="demo-banner-content">
            <div className="demo-banner-left">
              <span className="demo-badge">DEMO</span>
              <span className="demo-info">
                {viewMode === 'usuario' 
                  ? '👤 Vista de Usuario - Calendario Público'
                  : '👨‍💼 Vista de Administrador - Dashboard Completo'}
              </span>
            </div>
            <div className="demo-banner-right">
              <label className="view-mode-switch">
                <input
                  type="checkbox"
                  checked={viewMode === 'admin'}
                  onChange={(e) => setViewMode(e.target.checked ? 'admin' : 'usuario')}
                />
                <span className="switch-slider">
                  <span className="switch-label-left">👤 Usuario</span>
                  <span className="switch-label-right">👨‍💼 Admin</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Contenido según el modo */}
        <div className="demo-content">
          {viewMode === 'usuario' ? (
            <PublicCalendarPage />
          ) : (
            <DemoAdminView />
          )}
        </div>
      </div>
    </DemoModeContext.Provider>
  );
};

// Vista de administrador en modo demo (sin autenticación real)
type AdminView = 'dashboard' | 'servicios' | 'calendario';

const DemoAdminView: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>('dashboard');

  const renderAdminView = () => {
    switch (adminView) {
      case 'servicios':
        return <GestionServicios />;
      case 'calendario':
        return <UserCalendarView />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`demo-admin-view ${isNavOpen ? 'nav-open' : ''}`}>
      <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
      <Navbar isNavOpen={isNavOpen} />
      <main className="demo-content">
        <div className="admin-view-selector">
          <button
            className={adminView === 'dashboard' ? 'active' : ''}
            onClick={() => setAdminView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={adminView === 'servicios' ? 'active' : ''}
            onClick={() => setAdminView('servicios')}
          >
            🎯 Servicios
          </button>
          <button
            className={adminView === 'calendario' ? 'active' : ''}
            onClick={() => setAdminView('calendario')}
          >
            📅 Calendario
          </button>
        </div>
        <div className="admin-view-content">
          {renderAdminView()}
        </div>
      </main>
      {isNavOpen && (
        <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
      )}
    </div>
  );
};

export default DemoModeWrapper;

