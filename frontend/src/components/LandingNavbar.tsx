import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import './LandingNavbar.css';

const LandingNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="landing-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <div className="brand-logo">
            <div className="logo-icon">W</div>
          </div>
          <span className="brand-text">WEEKLY</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <a href="#features" className="nav-link">Características</a>
          <a href="#pricing" className="nav-link">Precios</a>
          <a href="#integrations" className="nav-link">Integraciones</a>
          <a href="#support" className="nav-link">Soporte</a>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <a href="http://panel.weekly.pe:5173" className="nav-link">Iniciar Sesión</a>
          <a href="http://demo.weekly.pe:5173" className="btn-nav-primary">
            Probar Gratis
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <a href="#features" className="mobile-nav-link" onClick={toggleMenu}>
              Características
            </a>
            <a href="#pricing" className="mobile-nav-link" onClick={toggleMenu}>
              Precios
            </a>
            <a href="#integrations" className="mobile-nav-link" onClick={toggleMenu}>
              Integraciones
            </a>
            <a href="#support" className="mobile-nav-link" onClick={toggleMenu}>
              Soporte
            </a>
            <div className="mobile-menu-actions">
              <a href="http://panel.weekly.pe:5173" className="mobile-nav-link" onClick={toggleMenu}>
                Iniciar Sesión
              </a>
              <a href="http://demo.weekly.pe:5173" className="btn-mobile-primary" onClick={toggleMenu}>
                Probar Gratis
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
