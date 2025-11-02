import React, { useState, useEffect, createContext, useContext } from 'react';
import { Calendar, Settings } from 'lucide-react';
import UserCalendarView from './UserCalendarView';
import DashboardPage from './DashboardPage';
import GestionServicios from './GestionServicios';
import GestionStaff from './GestionStaff';
import GestionClientes from './GestionClientes';
import GestionCategorias from './GestionCategorias';
import EstadisticasPage from './EstadisticasPage';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import './DemoView.css';

// Context para indicar que estamos en modo demo
export const DemoModeContext = createContext(false);
export const useDemoMode = () => {
  try {
    return useContext(DemoModeContext);
  } catch {
    return false; // Si no está en el contexto, no es modo demo
  }
};

type ViewMode = 'usuario' | 'admin';
type AdminView = 'dashboard' | 'servicios' | 'staff' | 'clientes' | 'categorias' | 'estadisticas' | 'calendario';

const DemoView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('usuario');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user } = useAuth();
  
  // Controlar overflow del body cuando está en demo para evitar fondo extra
  useEffect(() => {
    const originalOverflow = document.body.style.overflowY;
    const originalHeight = document.body.style.height;
    const originalMaxHeight = document.body.style.maxHeight;
    
    document.body.style.overflowY = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.maxHeight = '100vh';
    
    return () => {
      document.body.style.overflowY = originalOverflow;
      document.body.style.height = originalHeight;
      document.body.style.maxHeight = originalMaxHeight;
    };
  }, []);
  
  // Si el usuario está autenticado, usar su rol real
  useEffect(() => {
    if (user) {
      setViewMode(user.rol === 'admin' ? 'admin' : 'usuario');
    }
  }, [user]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'usuario' ? 'admin' : 'usuario');
    if (viewMode === 'usuario') {
      setAdminView('dashboard');
    }
  };

  const renderAdminView = () => {
    switch (adminView) {
      case 'servicios':
        return <GestionServicios />;
      case 'staff':
        return <GestionStaff />;
      case 'clientes':
        return <GestionClientes />;
      case 'categorias':
        return <GestionCategorias />;
      case 'estadisticas':
        return <EstadisticasPage />;
      case 'calendario':
        return <UserCalendarView />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <DemoModeContext.Provider value={true}>
      <div className="demo-view-container">
        {/* Banner de modo demo */}
        <div className="demo-banner">
        <div className="demo-banner-content">
          <div className="demo-banner-left">
            <span className="demo-badge">DEMO</span>
            <span className="demo-info">
              {viewMode === 'usuario' 
                ? '👤 Vista de Usuario - Solo Calendario y Reservas'
                : '👨‍💼 Vista de Administrador - Dashboard Completo'}
            </span>
          </div>
          <div className="demo-banner-right">
            <label className="view-mode-switch">
              <input
                type="checkbox"
                checked={viewMode === 'admin'}
                onChange={toggleViewMode}
              />
              <span className="switch-slider">
                <span className="switch-label-left">
                  <Calendar size={16} />
                  Usuario
                </span>
                <span className="switch-label-right">
                  <Settings size={16} />
                  Admin
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Contenido según el modo */}
      {viewMode === 'usuario' ? (
        // Vista de Usuario (sin navbar, solo calendario)
        <div className="demo-user-view">
          <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
          <main className="demo-content">
            <UserCalendarView />
          </main>
        </div>
      ) : (
        // Vista de Administrador (con navbar completo)
        <div className={`demo-admin-view ${isNavOpen ? 'nav-open' : ''}`}>
          <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
          <Navbar isNavOpen={isNavOpen} />
          <main className="demo-content">
            <div className="admin-view-selector">
              <button
                className={adminView === 'dashboard' ? 'active' : ''}
                onClick={() => setAdminView('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={adminView === 'servicios' ? 'active' : ''}
                onClick={() => setAdminView('servicios')}
              >
                Servicios
              </button>
              <button
                className={adminView === 'staff' ? 'active' : ''}
                onClick={() => setAdminView('staff')}
              >
                Staff
              </button>
              <button
                className={adminView === 'clientes' ? 'active' : ''}
                onClick={() => setAdminView('clientes')}
              >
                Clientes
              </button>
              <button
                className={adminView === 'categorias' ? 'active' : ''}
                onClick={() => setAdminView('categorias')}
              >
                Categorías
              </button>
              <button
                className={adminView === 'estadisticas' ? 'active' : ''}
                onClick={() => setAdminView('estadisticas')}
              >
                Estadísticas
              </button>
              <button
                className={adminView === 'calendario' ? 'active' : ''}
                onClick={() => setAdminView('calendario')}
              >
                Calendario
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
      )}
      </div>
    </DemoModeContext.Provider>
  );
};

export default DemoView;

