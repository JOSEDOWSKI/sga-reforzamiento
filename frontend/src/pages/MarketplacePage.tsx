import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../config/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { useFavorites } from '../hooks/useFavorites';
import { calculateDistance, formatDistance } from '../utils/distanceUtils';
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
  distancia?: number | null; // Distancia en km desde el usuario
  serviceType?: string;
}

interface MarketplacePageProps {
  city?: string;
  category?: string;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ city: propCity, category: propCategory }) => {
  const navigate = useNavigate();
  const params = useParams<{ ciudad?: string; categoria?: string }>();
  const { city: detectedCity, loading: geoLoading, setCity, coordinates } = useGeolocation();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Usar ciudad de props, params, o geolocalización
  const activeCity = propCity || params.ciudad || detectedCity;
  const activeCategory = propCategory || params.categoria;

  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(activeCity || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory || null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null); // Nuevo estado para tipo de servicio
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableServiceTypes, setAvailableServiceTypes] = useState<string[]>([]); // Nuevo estado para tipos de servicio disponibles
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'rating' | 'name'>('default');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Visible por defecto en desktop

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
        if (selectedServiceType) queryParams.append('service_type', selectedServiceType); // Añadir tipo de servicio a los query params

        const response = await apiClient.get(`/public/tenants?${queryParams.toString()}`);
        const data = response.data;

        // Mapear tenants a servicios para el marketplace
        const servicesData = (data.data || data.tenants || []).map((tenant: any) => {
          let distancia: number | null = null;

          // Calcular distancia si tenemos coordenadas del usuario y del servicio
          if (coordinates && tenant.latitud && tenant.longitud) {
            distancia = calculateDistance(
              coordinates.lat,
              coordinates.lng,
              parseFloat(tenant.latitud),
              parseFloat(tenant.longitud)
            );
          }

          return {
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
            distancia: distancia, // Distancia en km
            serviceType: tenant.service_type || 'General', // Asumiendo que el API devuelve un campo service_type
          };
        });

        setServices(servicesData);

        // Extraer ciudades, categorías y tipos de servicio únicos
        const cities = [...new Set(servicesData.map((s: Service) => s.city).filter(Boolean))] as string[];
        const categories = [...new Set(servicesData.map((s: Service) => s.categoria).filter(Boolean))] as string[];
        const serviceTypes = [...new Set(servicesData.map((s: Service) => s.serviceType).filter(Boolean))] as string[];

        setAvailableCities(cities.sort());
        setAvailableCategories(categories.sort());
        setAvailableServiceTypes(serviceTypes.sort()); // Establecer tipos de servicio disponibles
      } catch (error: any) {
        console.error('Error cargando tenants:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
          console.error('❌ Error de CORS o red. Verifica que el backend permita el origen:', window.location.origin);
        }
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [selectedCity, selectedCategory, selectedServiceType, coordinates]); // Añadir selectedServiceType como dependencia

  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.categoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !selectedCity || service.city?.toLowerCase() === selectedCity.toLowerCase();
      const matchesCategory = !selectedCategory || service.categoria?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesServiceType = !selectedServiceType || service.serviceType?.toLowerCase() === selectedServiceType.toLowerCase(); // Nuevo filtro

      return matchesSearch && matchesCity && matchesCategory && matchesServiceType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nombre.localeCompare(b.nombre);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          // Ordenar por distancia si está disponible
          if (a.distancia !== null && a.distancia !== undefined && b.distancia !== null && b.distancia !== undefined) {
            return a.distancia - b.distancia;
          }
          if (a.distancia !== null && a.distancia !== undefined) return -1;
          if (b.distancia !== null && b.distancia !== undefined) return 1;
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

  const handleServiceTypeChange = (type: string) => {
    setSelectedServiceType(type);
    analytics.filterByServiceType(type); // New analytics event
    // No navigation change for service type for now, as per instruction
  };

  const handleServiceClick = (service: Service) => {
    // PREVENIR cualquier redirección a subdominios de tenant
    const currentHost = window.location.hostname;
    if (currentHost !== 'weekly.pe' && !currentHost.includes('localhost')) {
      console.error('❌ ERROR: Intento de navegación desde dominio incorrecto:', currentHost);
      return;
    }

    console.log('🔍 handleServiceClick:', {
      service: service.nombre,
      tenant_name: service.tenant_name,
      selectedCity,
      categoria: service.categoria,
      currentHost
    });

    analytics.viewService(
      service.id,
      service.nombre,
      service.categoria,
      selectedCity || undefined
    );

    // SIEMPRE usar rutas dinámicas del marketplace, NUNCA subdominios de tenant
    // BLOQUEAR explícitamente cualquier intento de usar tenant_name para redirección
    const citySlug = selectedCity?.toLowerCase() || 'lima';
    const categorySlug = service.categoria?.toLowerCase().replace(/\s+/g, '-') || 'servicio';
    const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const targetPath = `/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}`;

    console.log('✅ Navegando a ruta dinámica del marketplace:', targetPath);
    console.log('🚫 BLOQUEADO: No se usará tenant_name para redirección');

    // Usar navigate, NUNCA window.location.href
    navigate(targetPath, { replace: false });
  };

  // Detectar si es desktop para mostrar sidebar por defecto
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`marketplace-page ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar de navegación */}
      <aside className={`marketplace-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-content">
            {/* Botones de autenticación */}
            <div className="sidebar-auth">
              <button className="sidebar-btn-primary" onClick={() => navigate('/login')}>
                Ingreso
              </button>
              <button className="sidebar-btn-secondary" onClick={() => navigate('/register')}>
                Registro
              </button>
            </div>

            {/* Promociones */}
            <button className="sidebar-promo">
              <span className="material-symbols-outlined">local_offer</span>
              <span>Descubre nuestras promociones</span>
            </button>

            {/* Secciones */}
            <div className="sidebar-section">
              <h3 className="sidebar-section-title">SECCIONES</h3>
              <nav className="sidebar-nav">
                {availableCategories.length > 0 ? (
                  availableCategories.slice(0, 6).map(category => (
                    <button
                      key={category}
                      className={`sidebar-nav-item ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      <span>{category}</span>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      className={`sidebar-nav-item ${!selectedCategory ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <span>Todos los servicios</span>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <button
                      className={`sidebar-nav-item ${selectedCategory === 'Restaurantes' ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('Restaurantes')}
                    >
                      <span>Restaurantes</span>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <button
                      className={`sidebar-nav-item ${selectedCategory === 'Servicios' ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('Servicios')}
                    >
                      <span>Servicios</span>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </>
                )}
                {availableCategories.length > 6 && (
                  <button className="sidebar-nav-item sidebar-nav-more">
                    <span>Ver más</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Otros */}
            <div className="sidebar-section">
              <h3 className="sidebar-section-title">OTROS</h3>
              <nav className="sidebar-nav">
                <button className="sidebar-nav-item" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  <span>Registra tu negocio</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="sidebar-nav-item" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  <span>Quiero ser repartidor</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="sidebar-nav-item" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  <span>Pauta en Weekly</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>

            {/* Selector de país */}
            <div className="sidebar-country">
              <button className="sidebar-country-btn">
                <span className="country-flag">🇵🇪</span>
                <span>Perú</span>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal con sidebar */}
      <div className="marketplace-main">
        {/* Header con búsqueda */}
        <div className="marketplace-header">
          <div className="marketplace-header-top">
            {!sidebarOpen && (
              <button
                className="icon-button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Mostrar menú"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}
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

            {/* Filtro de Tipo de Servicio */}
            <div className="filter-dropdown">
              <button
                className={`filter-button ${selectedServiceType ? 'active' : ''}`}
                onClick={() => {
                  const dropdown = document.getElementById('service-type-dropdown');
                  dropdown?.classList.toggle('show');
                }}
              >
                <span className="material-symbols-outlined">build</span>
                <span>{selectedServiceType || 'Tipo de Servicio'}</span>
                <span className="material-symbols-outlined">arrow_drop_down</span>
              </button>
              <div id="service-type-dropdown" className="dropdown-menu">
                <button
                  className={`dropdown-item ${!selectedServiceType ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedServiceType(null);
                    document.getElementById('service-type-dropdown')?.classList.remove('show');
                  }}
                >
                  Todos
                </button>
                {availableServiceTypes.map(type => (
                  <button
                    key={type}
                    className={`dropdown-item ${selectedServiceType === type ? 'active' : ''}`}
                    onClick={() => {
                      handleServiceTypeChange(type);
                      document.getElementById('service-type-dropdown')?.classList.remove('show');
                    }}
                  >
                    {type}
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
          {/* Banner promocional */}
          <section className="hero-banner">
            <div className="hero-banner-content">
              <div className="hero-banner-text">
                <h2 className="hero-banner-title">Encuentra los mejores profesionales cerca de ti</h2>
                <p className="hero-banner-subtitle">
                  Reserva citas en salones, spas, consultorios y más servicios.
                </p>
                <p className="hero-banner-terms">*Aplican TyC</p>
                <button
                  className="hero-banner-button"
                  onClick={() => {
                    document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ¡Reserva ahora!
                </button>
              </div>
              <div className="hero-banner-illustration">
                {/* Ilustración placeholder */}
                <div className="hero-illustration-placeholder">
                  <span className="material-symbols-outlined">delivery_dining</span>
                </div>
              </div>
            </div>
          </section>

          {/* Banner de promociones */}
          <section className="promotions-banner">
            <button
              className="promotions-banner-button"
              onClick={() => {
                // Por ahora scrollear a servicios, luego puede ser una página de promos
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="material-symbols-outlined">settings</span>
              <span>Descubre los mejores profesionales para ti</span>
            </button>
          </section>

          {/* Categorías principales */}
          <section className="main-categories">
            <button
              className="main-category-btn main-category-restaurants"
              onClick={() => handleCategoryChange('Restaurantes')}
            >
              Restaurantes
            </button>
            <button
              className="main-category-btn main-category-supermarkets"
              onClick={() => handleCategoryChange('Supermercados')}
            >
              Supermercados
            </button>
          </section>

          {/* Iconos de servicios */}
          <section className="service-icons">
            {availableCategories.slice(0, 8).map((category, index) => {
              const icons = ['local_pharmacy', 'flash_on', 'store', 'wine_bar', 'shopping_bag', 'flight', 'bolt', 'card_giftcard'];
              return (
                <button
                  key={category}
                  className={`service-icon-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  <div className="service-icon-circle">
                    <span className="material-symbols-outlined">{icons[index] || 'category'}</span>
                  </div>
                  <span className="service-icon-label">{category}</span>
                </button>
              );
            })}
          </section>

          {/* Lo más buscado */}
          <section className="popular-searches">
            <h3 className="section-title">Lo más buscado</h3>
            <div className="popular-searches-chips">
              {['Makis', 'Pizza', 'Pollo', 'Chifa', 'Pollo a la brasa', 'Postres', 'Menu', 'Alitas', 'Agua', 'Vape'].map(term => (
                <button
                  key={term}
                  className="search-chip"
                  onClick={() => {
                    setSearchQuery(term);
                    analytics.searchService(term, filteredServices.length);
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Los más elegidos */}
          {filteredServices.length > 0 && (
            <section className="top-services">
              <h3 className="section-title">¡Los mejores profesionales!</h3>
              <div className="top-services-grid">
                {filteredServices.slice(0, 10).map((service) => (
                  <div
                    key={service.id}
                    className="top-service-card"
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="top-service-logo">
                      {service.imagen ? (
                        <img src={service.imagen} alt={service.nombre} />
                      ) : (
                        <div className="top-service-logo-placeholder">
                          <span className="material-symbols-outlined">store</span>
                        </div>
                      )}
                    </div>
                    <span className="top-service-name">{service.nombre}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Grid de servicios */}
          {loading ? (
            <div className="loading-message">Cargando servicios...</div>
          ) : filteredServices.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">search_off</span>
              <h3 className="empty-title">No se encontraron servicios</h3>
              <p className="empty-description">
                {selectedCity || selectedCategory
                  ? `Intenta cambiar los filtros de ${selectedCity ? 'ciudad' : ''}${selectedCity && selectedCategory ? ' o ' : ''}${selectedCategory ? 'categoría' : ''}`
                  : 'No hay servicios disponibles en este momento'}
              </p>
              {(selectedCity || selectedCategory) && (
                <button
                  className="empty-action-button"
                  onClick={() => {
                    setSelectedCity(null);
                    setSelectedCategory(null);
                    navigate('/');
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <section className="services-section">
              <h3 className="section-title">Todos los servicios</h3>
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
                        className={`favorite-button ${isFavorite(service.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(service.id);
                          analytics.trackEvent('toggle_favorite', {
                            service_id: service.id,
                            service_name: service.nombre,
                            is_favorite: !isFavorite(service.id)
                          });
                        }}
                        aria-label={isFavorite(service.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <span className={`material-symbols-outlined ${isFavorite(service.id) ? 'filled' : ''}`}>
                          {isFavorite(service.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </div>
                    <div className="service-info">
                      <h3 className="service-name">{service.nombre}</h3>
                      <p className="service-location">
                        {service.ubicacion}
                        {service.distancia !== null && service.distancia !== undefined && (
                          <span className="service-distance"> • {formatDistance(service.distancia)}</span>
                        )}
                        {coordinates && service.distancia !== null && service.distancia !== undefined && service.distancia < 5 && (
                          <span className="service-nearby"> • Cerca de ti</span>
                        )}
                      </p>
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
            </section>
          )}

          {/* Sección "Únete a Weekly" */}
          <section className="join-section">
            <h3 className="section-title">Únete a Weekly</h3>
            <div className="join-cards">
              <div className="join-card">
                <span className="material-symbols-outlined join-card-icon">content_cut</span>
                <h4 className="join-card-title">Registra tu negocio</h4>
                <p className="join-card-description">Gestiona tus reservas y aumenta tus clientes</p>
                <button className="join-card-button" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  Conocer más
                </button>
              </div>
              <div className="join-card">
                <span className="material-symbols-outlined join-card-icon">store</span>
                <h4 className="join-card-title">Registra tu comercio</h4>
                <p className="join-card-description">Expande tu alcance con nuestra plataforma</p>
                <button className="join-card-button" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  Conocer más
                </button>
              </div>
              <div className="join-card">
                <span className="material-symbols-outlined join-card-icon">delivery_dining</span>
                <h4 className="join-card-title">¡Únete como profesional!</h4>
                <p className="join-card-description">Ofrece tus servicios y gestiona tu agenda</p>
                <button className="join-card-button join-card-button-primary" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  ¡Regístrate ahora!
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Botón flotante de mapa - Funcional */}
        <button
          className="map-fab"
          onClick={() => {
            analytics.trackEvent('view_map', {
              city: selectedCity || undefined,
              category: selectedCategory || undefined,
              services_count: filteredServices.length
            });

            // En desktop, mostrar un modal con mapa o redirigir a Google Maps
            // Por ahora, abrir Google Maps con la ubicación de la ciudad seleccionada
            if (selectedCity) {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCity + ', Perú')}`;
              window.open(mapsUrl, '_blank');
            } else {
              // Si no hay ciudad, mostrar todas las ubicaciones de servicios
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Servicios Weekly Perú')}`;
              window.open(mapsUrl, '_blank');
            }
          }}
          aria-label="Ver mapa"
          title="Ver servicios en el mapa"
        >
          <span className="material-symbols-outlined">map</span>
          <span>Mapa</span>
        </button>
      </div>
    </div>
  );
};

export default MarketplacePage;

