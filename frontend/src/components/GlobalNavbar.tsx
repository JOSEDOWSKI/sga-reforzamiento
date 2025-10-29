import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './GlobalNavbar.css';

const GlobalNavbar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    {
      path: '/',
      label: 'Gestión de Clientes',
      icon: Users,
      description: 'Administrar clientes y sus plataformas'
    },
    {
      path: '/super-admin/users',
      label: 'Usuarios Globales',
      icon: Settings,
      description: 'Gestión de usuarios del sistema'
    },
    {
      path: '/super-admin/billing',
      label: 'Facturación',
      icon: BarChart3,
      description: 'Gestión de pagos y facturas'
    },
    {
      path: '/super-admin/support',
      label: 'Soporte',
      icon: HelpCircle,
      description: 'Centro de ayuda y soporte'
    }
  ];

  return (
    <nav className="global-navbar">
      <div className="global-nav-header">
        <div className="global-logo">
          <div className="logo-icon">W</div>
          <div className="logo-text">
            <span className="logo-title">WEEKLY</span>
            <span className="logo-subtitle">Super Admin</span>
          </div>
        </div>
      </div>

      <div className="global-nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`global-nav-link ${isActive ? 'active' : ''}`}
              title={item.description}
            >
              <Icon size={20} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="global-nav-footer">
        <button 
          className="logout-button"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
