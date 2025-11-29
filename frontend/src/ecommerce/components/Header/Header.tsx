import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { obtenerCiudadPreferida, guardarCiudadPreferida } from '@utils/geolocation';
import styles from './Header.module.css';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCityChange?: (city: string) => void;
}

const CIUDADES_DISPONIBLES = [
  { value: 'lima', label: 'Lima' },
  { value: 'arequipa', label: 'Arequipa' },
  { value: 'trujillo', label: 'Trujillo' },
  { value: 'cusco', label: 'Cusco' },
  { value: 'chiclayo', label: 'Chiclayo' },
];

export const Header: React.FC<HeaderProps> = ({ onSearch, onCityChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(obtenerCiudadPreferida());
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const ciudad = obtenerCiudadPreferida();
    setSelectedCity(ciudad);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      // Navegar a búsqueda con query
      navigate(`/${selectedCity}?busqueda=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    guardarCiudadPreferida(city);
    setShowCityDropdown(false);
    onCityChange?.(city);
    // Navegar a la nueva ciudad manteniendo la ruta actual si es posible
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && CIUDADES_DISPONIBLES.some((c) => c.value === pathParts[0])) {
      pathParts[0] = city;
      navigate(`/${pathParts.join('/')}`);
    } else {
      navigate(`/${city}`);
    }
  };

  const handleLogoClick = () => {
    navigate(`/${selectedCity}`);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={handleLogoClick}>
          <span className="material-symbols-outlined">calendar_today</span>
          <span className={styles.logoText}>Weekly</span>
        </div>

        {/* Búsqueda */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar servicios, negocios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
            <span className="material-symbols-outlined">search</span>
          </button>
        </form>

        {/* Selector de ciudad */}
        <div className={styles.citySelector}>
          <button
            className={styles.cityButton}
            onClick={() => setShowCityDropdown(!showCityDropdown)}
          >
            <span className="material-symbols-outlined">location_on</span>
            <span className={styles.cityName}>
              {CIUDADES_DISPONIBLES.find((c) => c.value === selectedCity)?.label || 'Lima'}
            </span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
          {showCityDropdown && (
            <div className={styles.cityDropdown}>
              {CIUDADES_DISPONIBLES.map((ciudad) => (
                <button
                  key={ciudad.value}
                  className={`${styles.cityOption} ${
                    selectedCity === ciudad.value ? styles.active : ''
                  }`}
                  onClick={() => handleCityChange(ciudad.value)}
                >
                  {ciudad.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={() => setIsSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <button className={styles.actionButton}>
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>

      {/* Sidebar móvil */}
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)}>
          <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sidebarHeader}>
              <h2>Menú</h2>
              <button onClick={() => setIsSidebarOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className={styles.sidebarNav}>
              <a href="#" className={styles.sidebarLink}>
                <span className="material-symbols-outlined">login</span>
                Ingresar / Registrarse
              </a>
              <a href="#" className={styles.sidebarLink}>
                <span className="material-symbols-outlined">local_offer</span>
                Promociones
              </a>
              <a href="#" className={styles.sidebarLink}>
                <span className="material-symbols-outlined">category</span>
                Categorías
              </a>
              <a href="https://merchants.weekly.pe" className={styles.sidebarLink}>
                <span className="material-symbols-outlined">store</span>
                Registra tu negocio
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

