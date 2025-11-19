import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MarketplacePage.css';

interface Service {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  rating?: number;
  reviews?: number;
  imagen?: string;
  categoria?: string;
}

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // TODO: Cargar servicios desde API
    // Por ahora datos de ejemplo
    setServices([
      {
        id: 1,
        nombre: 'Salón de Belleza Bella Vista',
        descripcion: 'Cortes, peinados y tratamientos capilares',
        precio: 50,
        ubicacion: 'Lima, Perú',
        rating: 4.9,
        reviews: 120,
        categoria: 'Belleza'
      },
      {
        id: 2,
        nombre: 'Cancha de Fútbol 5',
        descripcion: 'Cancha sintética con iluminación',
        precio: 80,
        ubicacion: 'San Isidro, Lima',
        rating: 4.8,
        reviews: 88,
        categoria: 'Deportes'
      },
      {
        id: 3,
        nombre: 'Academia de Refuerzo',
        descripcion: 'Clases particulares y grupales',
        precio: 60,
        ubicacion: 'Miraflores, Lima',
        rating: 5.0,
        reviews: 210,
        categoria: 'Educación'
      }
    ]);
    setLoading(false);
  }, []);

  const filteredServices = services.filter(service =>
    service.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="marketplace-page">
      {/* Header con búsqueda */}
      <div className="marketplace-header">
        <div className="marketplace-header-top">
          <button 
            className="icon-button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="marketplace-title">Weekly</h1>
          <button 
            className="icon-button"
            aria-label="Ubicación"
          >
            <span className="material-symbols-outlined">location_on</span>
          </button>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <div className="search-icon-wrapper">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar servicios, destinos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-container">
          <button className="filter-button">
            <span>Precio</span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
          <button className="filter-button">
            <span>Fechas</span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
          <button className="filter-button">
            <span>Calificación</span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
          <button className="filter-button">
            <span>Categoría</span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
        </div>

        {/* Toggle Grid/List */}
        <div className="view-toggle-container">
          <div className="view-toggle">
            <label className={`view-toggle-option ${viewMode === 'grid' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">grid_view</span>
              <span>Grid</span>
              <input
                type="radio"
                name="view-mode"
                value="grid"
                checked={viewMode === 'grid'}
                onChange={() => setViewMode('grid')}
                className="sr-only"
              />
            </label>
            <label className={`view-toggle-option ${viewMode === 'list' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">view_list</span>
              <span>Lista</span>
              <input
                type="radio"
                name="view-mode"
                value="list"
                checked={viewMode === 'list'}
                onChange={() => setViewMode('list')}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="marketplace-content">
        {loading ? (
          <div className="loading-message">Cargando servicios...</div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-message">No se encontraron servicios</div>
        ) : (
          <div className={`services-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="service-card"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="service-image-container">
                  <div 
                    className="service-image"
                    style={{
                      backgroundImage: service.imagen 
                        ? `url(${service.imagen})` 
                        : 'linear-gradient(135deg, var(--primary) 0%, #22c55e 100%)'
                    }}
                  />
                  <button 
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Toggle favorite
                    }}
                    aria-label="Agregar a favoritos"
                  >
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
                <div className="service-info">
                  <h3 className="service-name">{service.nombre}</h3>
                  <p className="service-location">{service.ubicacion}</p>
                  {service.rating && (
                    <div className="service-rating">
                      <span className="material-symbols-outlined filled-star">star</span>
                      <span className="rating-value">{service.rating}</span>
                      <span className="reviews-count">({service.reviews})</span>
                    </div>
                  )}
                  {service.precio && (
                    <p className="service-price">
                      S/ {service.precio}
                      <span className="price-unit">/hora</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Botón flotante de mapa */}
      <button 
        className="map-fab"
        onClick={() => setShowMap(!showMap)}
        aria-label="Ver mapa"
      >
        <span className="material-symbols-outlined">map</span>
        <span>Mapa</span>
      </button>
    </div>
  );
};

export default MarketplacePage;

