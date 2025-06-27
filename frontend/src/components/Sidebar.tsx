import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón de menú móvil */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay para móvil */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-brand">SGA</h1>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''}
                onClick={closeSidebar}
              >
                <span className="sidebar-nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/cursos" 
                className={isActive('/cursos') ? 'active' : ''}
                onClick={closeSidebar}
              >
                <span className="sidebar-nav-icon">📚</span>
                Gestión Cursos
              </Link>
            </li>
            <li>
              <Link 
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