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
  distancia?: number | null;
}

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ ciudad?: string; categoria?: string }>();
  const { city: detectedCity, loading: geoLoading, setCity, coordinates } = useGeolocation();
  const { toggleFavorite, isFavorite } = useFavorites();

  // ========== TEXTOS EDITABLES ==========
  const TEXTS = {
    // Header
    title: 'Weekly',
    searchPlaceholder: 'Buscar servicios...',
    
    // Sidebar
    sidebarLogin: 'Ingreso',
    sidebarRegister: 'Registro',
    sidebarPromo: 'Descubre nuestras promociones',
    sidebarSections: 'SECCIONES',
    sidebarOthers: 'OTROS',
    sidebarAllServices: 'Todos los servicios',
    sidebarRegisterBusiness: 'Registra tu negocio',
    sidebarBecomeDelivery: 'Quiero ser repartidor',
    sidebarAdvertise: 'Pauta en Weekly',
    sidebarCountry: 'Perú',
    
    // Hero
    heroTitle: 'Reserva con los mejores profesionales',
    heroSubtitle: 'Peluquerías, spas, consultorios, academias y más. Agenda tu cita en minutos.',
    heroButton: 'Explorar servicios',
    
    // Categorías
    popularSearches: 'Lo más buscado',
    featuredTitle: 'Profesionales destacados',
    featuredSeeAll: 'Ver todos',
    allServices: 'Todos los servicios',
    
    // Filtros
    filterSort: 'Ordenar',
    filterCity: 'Ciudad',
    filterCategory: 'Categoría',
    sortDefault: 'Por defecto',
    sortName: 'Nombre (A-Z)',
    sortRating: 'Mejor rating',
    sortDistance: 'Más cercano',
    filterAll: 'Todas',
    
    // Estados
    loading: 'Cargando servicios...',
    noResults: 'No se encontraron servicios',
    noResultsDesc: 'Intenta cambiar los filtros',
    clearFilters: 'Limpiar filtros',
    
    // Join section
    joinTitle: 'Únete a Weekly',
    joinBusinessTitle: 'Registra tu negocio',
    joinBusinessDesc: 'Gestiona tus reservas y aumenta tus clientes',
    joinBusinessButton: 'Conocer más',
    joinCommerceTitle: 'Registra tu comercio',
    joinCommerceDesc: 'Expande tu alcance con nuestra plataforma',
    joinCommerceButton: 'Conocer más',
    joinProfessionalTitle: '¡Únete como profesional!',
    joinProfessionalDesc: 'Ofrece tus servicios y gestiona tu agenda',
    joinProfessionalButton: '¡Regístrate ahora!',
    
    // Map button
    mapButton: 'Mapa',
  };
  // ========================================

  const activeCity = params.ciudad || detectedCity;
  const activeCategory = params.categoria;

  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(activeCity || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory || null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'rating' | 'name'>('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirigir a ciudad detectada
  useEffect(() => {
    if (!params.ciudad && detectedCity && !geoLoading) {
      analytics.geolocationDetected(detectedCity, 'browser');
      navigate(`/${detectedCity.toLowerCase()}`, { replace: true });
    }
  }, [detectedCity, geoLoading, params.ciudad, navigate]);

  useEffect(() => {
    analytics.viewMarketplace(activeCity || undefined);
  }, [activeCity]);

  // Fetch servicios
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedCity) queryParams.append('city', selectedCity);
        if (selectedCategory) queryParams.append('category', selectedCategory);

        const response = await apiClient.get(`/public/tenants?${queryParams.toString()}`);
        const data = response.data;

        const servicesData = (data.data || data.tenants || []).map((tenant: {
          id: number;
          name?: string;
          display_name?: string;
          cliente_nombre?: string;
          tenant_name?: string;
          address?: string;
          cliente_direccion?: string;
          city?: string;
          category?: string;
          tipo_negocio?: string;
          latitud?: string | number;
          longitud?: string | number;
        }) => {
          let distancia: number | null = null;
          if (coordinates && tenant.latitud && tenant.longitud) {
            distancia = calculateDistance(
              coordinates.lat,
              coordinates.lng,
              typeof tenant.latitud === 'string' ? parseFloat(tenant.latitud) : Number(tenant.latitud),
              typeof tenant.longitud === 'string' ? parseFloat(tenant.longitud) : Number(tenant.longitud)
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
            distancia,
          };
        });

        setServices(servicesData);
        const cities = [...new Set(servicesData.map((s: Service) => s.city).filter(Boolean))] as string[];
        const categories = [...new Set(servicesData.map((s: Service) => s.categoria).filter(Boolean))] as string[];
        setAvailableCities(cities.sort());
        setAvailableCategories(categories.sort());
      } catch (error: unknown) {
        console.error('Error cargando tenants:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [selectedCity, selectedCategory, coordinates]);

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
          if (a.distancia !== null && a.distancia !== undefined && b.distancia !== null && b.distancia !== undefined) {
            return a.distancia - b.distancia;
          }
          if (a.distancia !== null && a.distancia !== undefined) return -1;
          if (b.distancia !== null && b.distancia !== undefined) return 1;
          return 0;
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
    const currentHost = window.location.hostname;
    if (currentHost !== 'weekly.pe' && !currentHost.includes('localhost')) {
      return;
    }

    analytics.viewService(service.id, service.nombre, service.categoria, selectedCity || undefined);
    const citySlug = selectedCity?.toLowerCase() || 'lima';
    const categorySlug = service.categoria?.toLowerCase().replace(/\s+/g, '-') || 'servicio';
    const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}`, { replace: false });
  };

  // Sidebar: abrir en desktop por defecto
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
    <div className="marketplace-page">
      {/* Sidebar */}
      <aside className={`marketplace-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-content">
            <div className="sidebar-auth">
              <button className="sidebar-btn-primary" onClick={() => navigate('/login')}>
                {TEXTS.sidebarLogin}
              </button>
              <button className="sidebar-btn-secondary" onClick={() => navigate('/register')}>
                {TEXTS.sidebarRegister}
              </button>
            </div>

            <button className="sidebar-promo">
              <span className="material-symbols-outlined">local_offer</span>
              <span>{TEXTS.sidebarPromo}</span>
            </button>

            <div className="sidebar-section">
              <h3 className="sidebar-section-title">{TEXTS.sidebarSections}</h3>
              <nav className="sidebar-nav">
                <button
                  className={`sidebar-nav-item ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <span>{TEXTS.sidebarAllServices}</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                {availableCategories.slice(0, 6).map(category => (
                  <button
                    key={category}
                    className={`sidebar-nav-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <span>{category}</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-section-title">{TEXTS.sidebarOthers}</h3>
              <nav className="sidebar-nav">
                <button className="sidebar-nav-item" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  <span>{TEXTS.sidebarRegisterBusiness}</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="sidebar-nav-item" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  <span>{TEXTS.sidebarBecomeDelivery}</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="sidebar-nav-item" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  <span>{TEXTS.sidebarAdvertise}</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>

            <div className="sidebar-country">
              <button className="sidebar-country-btn">
                <span className="country-flag">🇵🇪</span>
                <span>{TEXTS.sidebarCountry}</span>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Contenido principal */}
      <div className="marketplace-main">
        {/* Header */}
        <div className="marketplace-header">
          <div className="marketplace-header-top">
            {!sidebarOpen && (
              <button className="icon-button" onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}
            <h1 className="marketplace-title">{TEXTS.title}</h1>
            <button className="icon-button">
              <span className="material-symbols-outlined">location_on</span>
            </button>
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <div className="search-icon-wrapper">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder={TEXTS.searchPlaceholder}
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
                  {sortBy === 'default' ? TEXTS.filterSort :
                   sortBy === 'name' ? TEXTS.sortName :
                   sortBy === 'rating' ? TEXTS.sortRating :
                   TEXTS.sortDistance}
                </span>
                <span className="material-symbols-outlined">arrow_drop_down</span>
              </button>
              <div id="sort-dropdown" className="dropdown-menu">
                <button className={`dropdown-item ${sortBy === 'default' ? 'active' : ''}`} onClick={() => { setSortBy('default'); document.getElementById('sort-dropdown')?.classList.remove('show'); }}>
                  {TEXTS.sortDefault}
                </button>
                <button className={`dropdown-item ${sortBy === 'name' ? 'active' : ''}`} onClick={() => { setSortBy('name'); document.getElementById('sort-dropdown')?.classList.remove('show'); }}>
                  {TEXTS.sortName}
                </button>
                <button className={`dropdown-item ${sortBy === 'rating' ? 'active' : ''}`} onClick={() => { setSortBy('rating'); document.getElementById('sort-dropdown')?.classList.remove('show'); }}>
                  {TEXTS.sortRating}
                </button>
                <button className={`dropdown-item ${sortBy === 'distance' ? 'active' : ''}`} onClick={() => { setSortBy('distance'); document.getElementById('sort-dropdown')?.classList.remove('show'); }}>
                  {TEXTS.sortDistance}
                </button>
              </div>
            </div>

            <div className="filter-dropdown">
              <button
                className={`filter-button ${selectedCity ? 'active' : ''}`}
                onClick={() => {
                  const dropdown = document.getElementById('city-dropdown');
                  dropdown?.classList.toggle('show');
                }}
              >
                <span className="material-symbols-outlined">location_on</span>
                <span>{selectedCity || TEXTS.filterCity}</span>
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

            <div className="filter-dropdown">
              <button
                className={`filter-button ${selectedCategory ? 'active' : ''}`}
                onClick={() => {
                  const dropdown = document.getElementById('category-dropdown');
                  dropdown?.classList.toggle('show');
                }}
              >
                <span className="material-symbols-outlined">category</span>
                <span>{selectedCategory || TEXTS.filterCategory}</span>
                <span className="material-symbols-outlined">arrow_drop_down</span>
              </button>
              <div id="category-dropdown" className="dropdown-menu">
                <button className={`dropdown-item ${!selectedCategory ? 'active' : ''}`} onClick={() => { setSelectedCategory(null); document.getElementById('category-dropdown')?.classList.remove('show'); }}>
                  {TEXTS.filterAll}
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
                <input type="radio" name="view-mode" value="grid" checked={viewMode === 'grid'} onChange={() => { setViewMode('grid'); analytics.changeViewMode('grid'); }} className="sr-only" />
              </label>
              <label className={`view-toggle-option ${viewMode === 'list' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">view_list</span>
                <span>Lista</span>
                <input type="radio" name="view-mode" value="list" checked={viewMode === 'list'} onChange={() => { setViewMode('list'); analytics.changeViewMode('list'); }} className="sr-only" />
              </label>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main className="marketplace-content">
          {/* Hero */}
          <section className="hero-banner">
            <div className="hero-banner-content">
              <div className="hero-banner-text">
                <h2 className="hero-banner-title">{TEXTS.heroTitle}</h2>
                <p className="hero-banner-subtitle">{TEXTS.heroSubtitle}</p>
                <button className="hero-banner-button" onClick={() => document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  {TEXTS.heroButton}
                </button>
              </div>
              <div className="hero-banner-illustration">
                <div className="hero-illustration-placeholder">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
              </div>
            </div>
          </section>

          {/* Categorías */}
          <section className="main-categories-grid">
            {availableCategories.length > 0 ? (
              availableCategories.slice(0, 6).map((category) => {
                const categoryIcons: { [key: string]: string } = {
                  'Peluquería': 'content_cut',
                  'Salón de Belleza': 'face',
                  'Spa': 'spa',
                  'Clínica': 'local_hospital',
                  'Academia': 'school',
                  'Gimnasio': 'fitness_center',
                  'Veterinaria': 'pets',
                  'Cancha': 'sports_soccer'
                };
                const icon = categoryIcons[category] || 'store';
                return (
                  <button
                    key={category}
                    className={`main-category-card ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <div className="main-category-icon">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <span className="main-category-name">{category}</span>
                  </button>
                );
              })
            ) : (
              <>
                <button className={`main-category-card ${selectedCategory === 'Peluquería' ? 'active' : ''}`} onClick={() => handleCategoryChange('Peluquería')}>
                  <div className="main-category-icon"><span className="material-symbols-outlined">content_cut</span></div>
                  <span className="main-category-name">Peluquería</span>
                </button>
                <button className={`main-category-card ${selectedCategory === 'Spa' ? 'active' : ''}`} onClick={() => handleCategoryChange('Spa')}>
                  <div className="main-category-icon"><span className="material-symbols-outlined">spa</span></div>
                  <span className="main-category-name">Spa</span>
                </button>
                <button className={`main-category-card ${selectedCategory === 'Clínica' ? 'active' : ''}`} onClick={() => handleCategoryChange('Clínica')}>
                  <div className="main-category-icon"><span className="material-symbols-outlined">local_hospital</span></div>
                  <span className="main-category-name">Clínica</span>
                </button>
                <button className={`main-category-card ${selectedCategory === 'Academia' ? 'active' : ''}`} onClick={() => handleCategoryChange('Academia')}>
                  <div className="main-category-icon"><span className="material-symbols-outlined">school</span></div>
                  <span className="main-category-name">Academia</span>
                </button>
              </>
            )}
          </section>

          {/* Lo más buscado */}
          <section className="popular-searches">
            <h3 className="section-title">{TEXTS.popularSearches}</h3>
            <div className="popular-searches-chips">
              {availableCategories.length > 0 ? (
                availableCategories.slice(0, 10).map(category => (
                  <button key={category} className="search-chip" onClick={() => { handleCategoryChange(category); analytics.searchService(category, filteredServices.length); }}>
                    {category}
                  </button>
                ))
              ) : (
                ['Peluquería', 'Spa', 'Clínica', 'Academia', 'Gimnasio', 'Veterinaria', 'Salón', 'Masajes', 'Estética', 'Consultorio'].map(term => (
                  <button key={term} className="search-chip" onClick={() => { setSearchQuery(term); analytics.searchService(term, filteredServices.length); }}>
                    {term}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Destacados */}
          {filteredServices.length > 0 && (
            <section className="featured-services">
              <div className="section-header">
                <h3 className="section-title">{TEXTS.featuredTitle}</h3>
                <button className="section-see-all" onClick={() => document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  {TEXTS.featuredSeeAll}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <div className="featured-services-grid">
                {filteredServices.slice(0, 8).map((service) => (
                  <div key={service.id} className="featured-service-card" onClick={() => handleServiceClick(service)}>
                    <div className="featured-service-image">
                      {service.imagen ? (
                        <img src={service.imagen} alt={service.nombre} />
                      ) : (
                        <div className="featured-service-placeholder">
                          <span className="material-symbols-outlined">store</span>
                        </div>
                      )}
                      {service.distancia !== null && service.distancia !== undefined && service.distancia < 3 && (
                        <span className="featured-badge nearby">Cerca</span>
                      )}
                    </div>
                    <div className="featured-service-info">
                      <h4 className="featured-service-name">{service.nombre}</h4>
                      <p className="featured-service-category">{service.categoria}</p>
                      {service.rating && (
                        <div className="featured-service-rating">
                          <span className="material-symbols-outlined filled-star">star</span>
                          <span>{service.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Grid de servicios */}
          {loading ? (
            <div className="loading-message">{TEXTS.loading}</div>
          ) : filteredServices.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">search_off</span>
              <h3 className="empty-title">{TEXTS.noResults}</h3>
              <p className="empty-description">{TEXTS.noResultsDesc}</p>
              {(selectedCity || selectedCategory) && (
                <button className="empty-action-button" onClick={() => { setSelectedCity(null); setSelectedCategory(null); navigate('/'); }}>
                  {TEXTS.clearFilters}
                </button>
              )}
            </div>
          ) : (
            <section className="services-section">
              <h3 className="section-title">{TEXTS.allServices}</h3>
              <div className={`services-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredServices.map((service) => (
                  <div key={service.id} className="service-card" onClick={() => handleServiceClick(service)}>
                    <div className="service-image-container">
                      <div className="service-image" style={{ backgroundImage: service.imagen ? `url(${service.imagen})` : 'linear-gradient(135deg, var(--primary) 0%, #22c55e 100%)' }} />
                      <button className={`favorite-button ${isFavorite(service.id) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }} aria-label={isFavorite(service.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                        <span className={`material-symbols-outlined ${isFavorite(service.id) ? 'filled' : ''}`}>
                          {isFavorite(service.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                      {service.distancia !== null && service.distancia !== undefined && service.distancia < 2 && (
                        <span className="service-badge nearby">Cerca</span>
                      )}
                      {service.rating && service.rating >= 4.5 && (
                        <span className="service-badge popular">Popular</span>
                      )}
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

          {/* Join section */}
          <section className="join-section">
            <h3 className="section-title">{TEXTS.joinTitle}</h3>
            <div className="join-cards">
              <div className="join-card">
                <span className="material-symbols-outlined join-card-icon">content_cut</span>
                <h4 className="join-card-title">{TEXTS.joinBusinessTitle}</h4>
                <p className="join-card-description">{TEXTS.joinBusinessDesc}</p>
                <button className="join-card-button" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  {TEXTS.joinBusinessButton}
                </button>
              </div>
              <div className="join-card">
                <span className="material-symbols-outlined join-card-icon">store</span>
                <h4 className="join-card-title">{TEXTS.joinCommerceTitle}</h4>
                <p className="join-card-description">{TEXTS.joinCommerceDesc}</p>
                <button className="join-card-button" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  {TEXTS.joinCommerceButton}
                </button>
              </div>
              <div className="join-card">
                <span className="material-symbols-outlined join-card-icon">delivery_dining</span>
                <h4 className="join-card-title">{TEXTS.joinProfessionalTitle}</h4>
                <p className="join-card-description">{TEXTS.joinProfessionalDesc}</p>
                <button className="join-card-button join-card-button-primary" onClick={() => window.open('https://merchants.weekly.pe', '_blank')}>
                  {TEXTS.joinProfessionalButton}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Map FAB */}
        <button className="map-fab" onClick={() => { analytics.trackEvent('view_map', { city: selectedCity || undefined, category: selectedCategory || undefined, services_count: filteredServices.length }); if (selectedCity) { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCity + ', Perú')}`, '_blank'); } else { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Servicios Weekly Perú')}`, '_blank'); } }} aria-label="Ver mapa">
          <span className="material-symbols-outlined">map</span>
          <span>{TEXTS.mapButton}</span>
        </button>
      </div>
    </div>
  );
};

export default MarketplacePage;
