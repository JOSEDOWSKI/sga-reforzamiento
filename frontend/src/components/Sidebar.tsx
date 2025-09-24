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
        <h1 className="sidebar-brand">SGA</h1>
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
            <Link id="nav-cursos" 
              to="/cursos" 
              className={isActive('/cursos') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">📚</span>
              Gestión Cursos
            </Link>
          </li>
          <li>
            <Link  id="nav-profesores"
              to="/profesores" 
              className={isActive('/profesores') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">👨‍🏫</span>
              Gestión Profesores
            </Link>
          </li>
          <li>
            <Link 
              to="/temas" 
              className={isActive('/temas') ? 'active' : ''}
                onClick={closeSidebar}
            >
              <span className="sidebar-nav-icon">📝</span>
              Gestión Temas
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