import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../config/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { analytics } from '../utils/analytics';
import './MarketplacePage.css';

interface Service {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  city?: string;
  rating?: number;
  reviews?: number;
  imagen?: string;
  categoria?: string;
  tenant_name?: string;
  latitud?: number;
  longitud?: number;
}

interface MarketplacePageProps {
  city?: string;
  category?: string;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ city: propCity, category: propCategory }) => {
  const navigate = useNavigate();
  const params = useParams<{ ciudad?: string; categoria?: string }>();
  const { city: detectedCity, loading: geoLoading, setCity } = useGeolocation();
  
  // Usar ciudad de props, params, o geolocalización
  const activeCity = propCity || params.ciudad || detectedCity;
  const activeCategory = propCategory || params.categoria;
  
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(activeCity || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory || null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'rating' | 'name'>('default');

  // Redirigir a ciudad detectada si no hay ciudad en URL y se detectó una
  useEffect(() => {
    if (!propCity && !params.ciudad && detectedCity && !geoLoading) {
      analytics.geolocationDetected(detectedCity, 'browser');
      navigate(`/${detectedCity.toLowerCase()}`, { replace: true });
    }
  }, [detectedCity, geoLoading, propCity, params.ciudad, navigate]);

  // Track view marketplace
  useEffect(() => {
    analytics.viewMarketplace(activeCity || undefined);
  }, [activeCity]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        
        // Construir query params
        const queryParams = new URLSearchParams();
        if (selectedCity) queryParams.append('city', selectedCity);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        
        const response = await apiClient.get(`/public/tenants?${queryParams.toString()}`);
        const data = response.data;
        
        // Mapear tenants a servicios para el marketplace
        const servicesData = (data.data || data.tenants || []).map((tenant: any) => ({
          id: tenant.id,
          nombre: tenant.name || tenant.display_name || tenant.cliente_nombre || tenant.tenant_name,
          descripcion: tenant.address || tenant.cliente_direccion || 'Servicio disponible',
          precio: 0,
          ubicacion: tenant.address || tenant.cliente_direccion || 'Ubicación no disponible',
          city: tenant.city || tenant.cliente_direccion?.split(',')[0] || 'Sin ciudad',
          rating: 4.5,
          reviews: 0,
          categoria: tenant.category || tenant.tipo_negocio || 'Servicio',
          tenant_name: tenant.tenant_name,
          latitud: tenant.latitud,
          longitud: tenant.longitud,
        }));
        
        setServices(servicesData);
        
        // Extraer ciudades y categorías únicas
        const cities = [...new Set(servicesData.map((s: Service) => s.city).filter(Boolean))] as string[];
        const categories = [...new Set(servicesData.map((s: Service) => s.categoria).filter(Boolean))] as string[];
        setAvailableCities(cities.sort());
        setAvailableCategories(categories.sort());
      } catch (error) {
        console.error('Error cargando tenants:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTenants();
  }, [selectedCity, selectedCategory]);

  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.categoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = !selectedCity || service.city?.toLowerCase() === selectedCity.toLowerCase();
      const matchesCategory = !selectedCategory || service.categoria?.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCity && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nombre.localeCompare(b.nombre);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          // TODO: Calcular distancia real cuando tengamos coordenadas del usuario
          // Por ahora ordenar alfabéticamente por ciudad
          return (a.city || '').localeCompare(b.city || '');
        default:
          return 0;
      }
    });

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setCity(city);
    analytics.filterByCity(city);
    if (selectedCategory) {
      navigate(`/${city.toLowerCase()}/${selectedCategory.toLowerCase()}`);
    } else {
      navigate(`/${city.toLowerCase()}`);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    analytics.filterByCategory(category);
    if (selectedCity) {
      navigate(`/${selectedCity.toLowerCase()}/${category.toLowerCase()}`);
    }
  };

  const handleServiceClick = (service: Service) => {
    analytics.viewService(
      service.id,
      service.nombre,
      service.categoria,
      selectedCity || undefined
    );
    
    if (service.tenant_name) {
      const citySlug = selectedCity?.toLowerCase() || 'lima';
      const categorySlug = service.categoria?.toLowerCase().replace(/\s+/g, '-') || 'servicio';
      const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      navigate(`/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}`);
    } else {
      navigate(`/service/${service.id}`);
    }
  };

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  analytics.searchService(e.target.value, filteredServices.length);
                }
              }}
            />
          </div>
        </div>

          {/* Filtros */}
        <div className="filters-container">
          {/* Ordenamiento */}
          <div className="filter-dropdown">
            <button 
              className={`filter-button ${sortBy !== 'default' ? 'active' : ''}`}
              onClick={() => {
                const dropdown = document.getElementById('sort-dropdown');
                dropdown?.classList.toggle('show');
              }}
            >
              <span className="material-symbols-outlined">sort</span>
              <span>
                {sortBy === 'default' ? 'Ordenar' : 
                 sortBy === 'name' ? 'Nombre' :
                 sortBy === 'rating' ? 'Rating' :
                 sortBy === 'distance' ? 'Distancia' : 'Ordenar'}
              </span>
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
            <div id="sort-dropdown" className="dropdown-menu">
              <button
                className={`dropdown-item ${sortBy === 'default' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('default');
                  document.getElementById('sort-dropdown')?.classList.remove('show');
                }}
              >
                Por defecto
              </button>
              <button
                className={`dropdown-item ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('name');
                  document.getElementById('sort-dropdown')?.classList.remove('show');
                }}
              >
                Nombre (A-Z)
              </button>
              <button
                className={`dropdown-item ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('rating');
                  document.getElementById('sort-dropdown')?.classList.remove('show');
                }}
              >
                Mejor rating
              </button>
              <button
                className={`dropdown-item ${sortBy === 'distance' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('distance');
                  document.getElementById('sort-dropdown')?.classList.remove('show');
                }}
              >
                Más cercano
              </button>
            </div>
          </div>

          {/* Filtro de Ciudad */}
          <div className="filter-dropdown">
            <button 
              className={`filter-button ${selectedCity ? 'active' : ''}`}
              onClick={() => {
                const dropdown = document.getElementById('city-dropdown');
                dropdown?.classList.toggle('show');
              }}
            >
              <span className="material-symbols-outlined">location_on</span>
              <span>{selectedCity || 'Ciudad'}</span>
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
            <div id="city-dropdown" className="dropdown-menu">
              {availableCities.map(city => (
                <button
                  key={city}
                  className={`dropdown-item ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => {
                    handleCityChange(city);
                    document.getElementById('city-dropdown')?.classList.remove('show');
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Categoría */}
          <div className="filter-dropdown">
            <button 
              className={`filter-button ${selectedCategory ? 'active' : ''}`}
              onClick={() => {
                const dropdown = document.getElementById('category-dropdown');
                dropdown?.classList.toggle('show');
              }}
            >
              <span className="material-symbols-outlined">category</span>
              <span>{selectedCategory || 'Categoría'}</span>
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
            <div id="category-dropdown" className="dropdown-menu">
              <button
                className={`dropdown-item ${!selectedCategory ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(null);
                  document.getElementById('category-dropdown')?.classList.remove('show');
                }}
              >
                Todas
              </button>
              {availableCategories.map(category => (
                <button
                  key={category}
                  className={`dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => {
                    handleCategoryChange(category);
                    document.getElementById('category-dropdown')?.classList.remove('show');
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
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
                onChange={() => {
                  setViewMode('grid');
                  analytics.changeViewMode('grid');
                }}
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
                onChange={() => {
                  setViewMode('list');
                  analytics.changeViewMode('list');
                }}
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
                onClick={() => handleServiceClick(service)}
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

      {/* Botón flotante de mapa - Redirige a app móvil */}
      <button 
        className="map-fab"
        onClick={() => {
          // Redirigir a la app móvil para ver el mapa interactivo
          // TODO: Reemplazar con la URL real de la app móvil cuando esté disponible
          const appStoreUrl = 'https://apps.apple.com/app/weekly'; // iOS
          const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.weekly.app'; // Android
          
          // Detectar dispositivo y redirigir
          const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
          if (/android/i.test(userAgent)) {
            window.open(playStoreUrl, '_blank');
          } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            window.open(appStoreUrl, '_blank');
          } else {
            // Desktop: mostrar mensaje o abrir en nueva pestaña
            alert('El mapa interactivo está disponible en la app móvil de Weekly. Descárgala desde la App Store o Google Play.');
          }
        }}
        aria-label="Ver mapa en app móvil"
        title="Ver mapa interactivo en la app móvil"
      >
        <span className="material-symbols-outlined">map</span>
        <span>Mapa</span>
      </button>
    </div>
  );
};

export default MarketplacePage;

