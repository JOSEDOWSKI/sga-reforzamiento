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
          <a href="#map" className="nav-link">Ubicaciones</a>
          <a href="/demo" className="nav-link">Demo</a>
          <a href="#contact" className="nav-link">Contacto</a>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <a href="https://panel.weekly.pe" className="nav-link">Panel Admin</a>
          <a href="/demo" className="btn-nav-primary">
            Probar Demo
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
            <a href="#map" className="mobile-nav-link" onClick={toggleMenu}>
              Ubicaciones
            </a>
            <a href="/demo" className="mobile-nav-link" onClick={toggleMenu}>
              Demo
            </a>
            <a href="#contact" className="mobile-nav-link" onClick={toggleMenu}>
              Contacto
            </a>
            <div className="mobile-menu-actions">
              <a href="https://panel.weekly.pe" className="mobile-nav-link" onClick={toggleMenu}>
                Panel Admin
              </a>
              <a href="/demo" className="btn-mobile-primary" onClick={toggleMenu}>
                Probar Demo
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
