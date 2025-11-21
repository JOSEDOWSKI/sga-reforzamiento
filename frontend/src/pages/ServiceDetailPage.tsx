import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analytics } from '../utils/analytics';
import { useFavorites } from '../hooks/useFavorites';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance, formatDistance } from '../utils/distanceUtils';
import { shareService, getShareUrl } from '../utils/shareUtils';
import apiClient from '../config/api';
import './ServiceDetailPage.css';

interface Service {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  city?: string;
  rating?: number;
  reviews?: number;
  imagenes?: string[];
  categoria?: string;
  tenant_name?: string;
  features?: string[];
  host?: {
    nombre: string;
    experiencia?: string;
    avatar?: string;
  };
  latitud?: number;
  longitud?: number;
}

const ServiceDetailPage: React.FC = () => {
  const params = useParams<{ ciudad?: string; categoria?: string; id?: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { coordinates } = useGeolocation();
  
  // Extraer ID del parámetro (puede venir como "123-salon-bella-vista")
  const idParam = params.id || '';
  const serviceId = idParam.split('-')[0];
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex] = useState(0); // TODO: Implementar navegación de imágenes en el futuro
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        // Cargar desde API usando el ID
        const response = await apiClient.get(`/public/tenants/${serviceId}`);
        const tenant = response.data.data || response.data;
        
        const serviceData = {
          id: tenant.id,
          nombre: tenant.name || tenant.display_name || tenant.cliente_nombre,
          descripcion: tenant.cliente_direccion || 'Servicio disponible',
          precio: 0,
          ubicacion: tenant.cliente_direccion || '',
          city: tenant.city || params.ciudad || '',
          rating: 4.5,
          reviews: 0,
          imagenes: [],
          categoria: tenant.category || params.categoria || 'Servicio',
          tenant_name: tenant.tenant_name,
          features: [],
          host: {
            nombre: tenant.cliente_nombre || 'Anfitrión',
            experiencia: undefined,
            avatar: undefined
          },
          latitud: tenant.latitud,
          longitud: tenant.longitud,
        };
        
        setService(serviceData);
        
        // Calcular distancia si tenemos coordenadas
        if (coordinates && tenant.latitud !== undefined && tenant.longitud !== undefined) {
          // Asegurar que latitud y longitud sean números
          const lat = typeof tenant.latitud === 'string' ? parseFloat(tenant.latitud) : Number(tenant.latitud);
          const lng = typeof tenant.longitud === 'string' ? parseFloat(tenant.longitud) : Number(tenant.longitud);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const calculatedDistance = calculateDistance(
              coordinates.lat,
              coordinates.lng,
              lat,
              lng
            );
            setDistance(calculatedDistance);
          }
        }
        
        // Track view
        analytics.viewService(
          tenant.id,
          tenant.name || tenant.display_name,
          tenant.category || params.categoria,
          tenant.city || params.ciudad
        );
      } catch (error) {
        console.error('Error cargando servicio:', error);
        // Fallback a datos de ejemplo si falla
        if (serviceId) {
          setService({
            id: parseInt(serviceId),
            nombre: 'Salón de Belleza Bella Vista',
            descripcion: 'Experimenta la mejor atención en nuestro salón de belleza.',
            precio: 50,
            ubicacion: params.ciudad ? `${params.ciudad}, Perú` : 'Lima, Perú',
            city: params.ciudad || 'Lima',
            rating: 4.92,
            reviews: 215,
            imagenes: [],
            categoria: params.categoria || 'Belleza',
            features: ['Wi-Fi Rápido', 'Estacionamiento'],
            host: {
              nombre: 'María González',
              experiencia: 'Superhost · 5 años de experiencia',
              avatar: undefined
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    } else {
      setLoading(false);
    }
  }, [serviceId, params.ciudad, params.categoria]);

  // Recalcular distancia cuando cambien las coordenadas
  useEffect(() => {
    if (service && coordinates && service.latitud !== undefined && service.longitud !== undefined) {
      // Asegurar que latitud y longitud sean números
      const lat = typeof service.latitud === 'string' ? parseFloat(service.latitud) : service.latitud;
      const lng = typeof service.longitud === 'string' ? parseFloat(service.longitud) : service.longitud;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const calculatedDistance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          lat,
          lng
        );
        setDistance(calculatedDistance);
      } else {
        setDistance(null);
      }
    } else {
      setDistance(null);
    }
  }, [service, coordinates]);

  if (loading) {
    return <div className="service-detail-loading">Cargando...</div>;
  }

  if (!service) {
    return (
      <div className="service-detail-error">
        <p>Servicio no encontrado</p>
        <button onClick={() => navigate('/')}>Volver al marketplace</button>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      {/* Header sticky */}
      <div className="service-detail-header">
        <button 
          className="icon-button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="header-actions">
          <button 
            className="icon-button" 
            aria-label="Compartir"
            onClick={async () => {
              if (service) {
                const shareUrl = getShareUrl(window.location.pathname);
                await shareService(
                  service.nombre,
                  service.descripcion || `Descubre ${service.nombre} en Weekly`,
                  shareUrl
                );
                analytics.trackEvent('share_service', {
                  service_id: service.id,
                  service_name: service.nombre
                });
              }
            }}
          >
            <span className="material-symbols-outlined">share</span>
          </button>
          <button 
            className={`icon-button ${isFavorite(service?.id || 0) ? 'favorite-active' : ''}`}
            aria-label={isFavorite(service?.id || 0) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            onClick={() => {
              if (service) {
                toggleFavorite(service.id);
                analytics.trackEvent('toggle_favorite', {
                  service_id: service.id,
                  service_name: service.nombre,
                  is_favorite: !isFavorite(service.id)
                });
              }
            }}
          >
            <span className={`material-symbols-outlined ${isFavorite(service?.id || 0) ? 'filled' : ''}`}>
              {isFavorite(service?.id || 0) ? 'favorite' : 'favorite_border'}
            </span>
          </button>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="service-image-gallery">
        <div 
          className="service-main-image"
          style={{
            backgroundImage: service.imagenes && service.imagenes.length > 0
              ? `url(${service.imagenes[currentImageIndex]})`
              : 'linear-gradient(135deg, var(--primary) 0%, #22c55e 100%)'
          }}
        >
          {service.imagenes && service.imagenes.length > 1 && (
            <div className="image-counter">
              {currentImageIndex + 1} / {service.imagenes.length}
            </div>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="service-detail-content">
        <h1 className="service-detail-title">{service.nombre}</h1>
        
        <div className="service-detail-meta">
          {service.rating && (
            <div className="meta-item">
              <span className="material-symbols-outlined filled-star">star</span>
              <span className="rating-value">{service.rating}</span>
              <span className="reviews-text">({service.reviews} reseñas)</span>
            </div>
          )}
          {service.ubicacion && (
            <div className="meta-item">
              <span className="material-symbols-outlined">location_on</span>
              <span className="location-text">
                {service.ubicacion}
                {distance !== null && (
                  <span className="service-distance"> • {formatDistance(distance)}</span>
                )}
                {coordinates && distance !== null && distance < 5 && (
                  <span className="service-nearby"> • Cerca de ti</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        {(params.ciudad || params.categoria) && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="/" className="breadcrumb-link">Inicio</a>
            {params.ciudad && (
              <>
                <span className="breadcrumb-separator">/</span>
                <a href={`/${params.ciudad}`} className="breadcrumb-link">{params.ciudad}</a>
              </>
            )}
            {params.categoria && (
              <>
                <span className="breadcrumb-separator">/</span>
                <a href={`/${params.ciudad}/${params.categoria}`} className="breadcrumb-link">{params.categoria}</a>
              </>
            )}
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{service.nombre}</span>
          </nav>
        )}

        <hr className="divider" />

        {/* Mapa y Cómo llegar */}
        {service.latitud && service.longitud && (
          <div className="map-section">
            <h2 className="section-title">Ubicación</h2>
            <div className="map-container">
              <iframe
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '16px' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${service.latitud},${service.longitud}&zoom=15`}
              />
            </div>
            <button 
              className="directions-button"
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${service.latitud},${service.longitud}`;
                window.open(mapsUrl, '_blank');
                analytics.trackEvent('click_directions', {
                  service_id: service.id,
                  service_name: service.nombre
                });
              }}
            >
              <span className="material-symbols-outlined">directions</span>
              Cómo llegar
            </button>
            <hr className="divider" />
          </div>
        )}

        {/* Características clave */}
        {service.features && service.features.length > 0 && (
          <>
            <h2 className="section-title">Características Clave</h2>
            <div className="features-grid">
              {service.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <p className="feature-name">{feature}</p>
                </div>
              ))}
            </div>
            <hr className="divider" />
          </>
        )}

        {/* Host */}
        {service.host && (
          <>
            <div className="host-section">
              <div className="host-info">
                <h2 className="section-title">Anfitrión: {service.host.nombre}</h2>
                {service.host.experiencia && (
                  <p className="host-experience">{service.host.experiencia}</p>
                )}
              </div>
              {service.host.avatar && (
                <img 
                  src={service.host.avatar} 
                  alt={service.host.nombre}
                  className="host-avatar"
                />
              )}
            </div>
            <hr className="divider" />
          </>
        )}

        {/* Breadcrumbs */}
        {(params.ciudad || params.categoria) && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="/" className="breadcrumb-link">Inicio</a>
            {params.ciudad && (
              <>
                <span className="breadcrumb-separator">/</span>
                <a href={`/${params.ciudad}`} className="breadcrumb-link">{params.ciudad}</a>
              </>
            )}
            {params.categoria && (
              <>
                <span className="breadcrumb-separator">/</span>
                <a href={`/${params.ciudad}/${params.categoria}`} className="breadcrumb-link">{params.categoria}</a>
              </>
            )}
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{service.nombre}</span>
          </nav>
        )}

        {/* Mapa y Cómo llegar */}
        {service.latitud && service.longitud && (
          <div className="map-section">
            <h2 className="section-title">Ubicación</h2>
            <div className="map-container">
              <iframe
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '16px' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${service.latitud},${service.longitud}&zoom=15`}
              />
            </div>
            <button 
              className="directions-button"
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${service.latitud},${service.longitud}`;
                window.open(mapsUrl, '_blank');
                analytics.trackEvent('click_directions', {
                  service_id: service.id,
                  service_name: service.nombre
                });
              }}
            >
              <span className="material-symbols-outlined">directions</span>
              Cómo llegar
            </button>
          </div>
        )}

        {/* Descripción */}
        {service.descripcion && (
          <div className="description-section">
            <h2 className="section-title">Acerca de este espacio</h2>
            <p className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
              {service.descripcion}
            </p>
            {service.descripcion.length > 150 && (
              <button 
                className="show-more-button"
                onClick={() => {
                  setShowFullDescription(!showFullDescription);
                  analytics.trackEvent('toggle_description', {
                    service_id: service.id,
                    expanded: !showFullDescription
                  });
                }}
              >
                {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
              </button>
            )}
          </div>
        )}

        {/* Espacio para el botón flotante */}
        <div className="bottom-spacer" />
      </div>

      {/* Botón flotante de reserva */}
      <div className="booking-footer">
        <div className="booking-price">
          <p className="price-amount">
            S/ {service.precio}
            <span className="price-unit">/ hora</span>
          </p>
          <p className="booking-dates">Selecciona fecha</p>
        </div>
        <button 
          className="book-button"
          onClick={() => {
            analytics.clickBooking(service.id, service.nombre, service.categoria);
            
            // Navegar a booking con nueva estructura de URL
            // SIEMPRE usar rutas dinámicas del marketplace, nunca subdominios de tenant
            if (service.tenant_name) {
              // Usar ciudad y categoría de params, o valores por defecto
              const citySlug = params.ciudad?.toLowerCase() || 'lima';
              const categorySlug = params.categoria?.toLowerCase() || service.categoria?.toLowerCase().replace(/\s+/g, '-') || 'servicio';
              const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              navigate(`/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}/booking`);
            } else {
              // Si no hay tenant_name, usar ruta genérica
              navigate(`/service/${service.id}/book`);
            }
          }}
        >
          Reservar Ahora
        </button>
      </div>
    </div>
  );
};

export default ServiceDetailPage;

