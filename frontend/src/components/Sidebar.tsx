import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Botón de menú móvil - solo en móviles reales */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      )}

      {/* Overlay para móvil - solo en móviles reales */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-brand">Weekly</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link id="nav-dashboard"
              to="/" 
              className={isActive('/') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link id="nav-servicios" 
              to="/servicios" 
              className={isActive('/servicios') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">📚</span>
              Gestión Servicios
            </Link>
          </li>
          <li>
            <Link  id="nav-staff"
              to="/staff" 
              className={isActive('/staff') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">👨‍🏫</span>
              Gestión Staff
            </Link>
          </li>
          <li>
            <Link id="nav-alumnos"
              to="/alumnos"
              className={isActive('/alumnos') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">🎓</span>
              Gestión Alumnos
            </Link>
          </li>
          <li>
            <Link 
              to="/categorias" 
              className={isActive('/categorias') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">📝</span>
              Gestión Categorías
            </Link>
          </li>
          <li>
            <Link 
              to="/estadisticas" 
              className={isActive('/estadisticas') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">📈</span>
              Estadísticas
            </Link>
          </li>
        </ul>
      </nav>
    </div>
    </>
  );
};

export default Sidebar; 