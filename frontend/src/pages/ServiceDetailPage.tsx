import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analytics } from '../utils/analytics';
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
}

const ServiceDetailPage: React.FC = () => {
  const params = useParams<{ ciudad?: string; categoria?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Extraer ID del parámetro (puede venir como "123-salon-bella-vista")
  const idParam = params.id || '';
  const serviceId = idParam.split('-')[0];
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex] = useState(0); // TODO: Implementar navegación de imágenes en el futuro

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        // Cargar desde API usando el ID
        const response = await apiClient.get(`/public/tenants/${serviceId}`);
        const tenant = response.data.data || response.data;
        
        setService({
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
          }
        });
        
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
          <button className="icon-button" aria-label="Compartir">
            <span className="material-symbols-outlined">share</span>
          </button>
          <button className="icon-button" aria-label="Favorito">
            <span className="material-symbols-outlined">favorite_border</span>
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
              <span className="location-text">{service.ubicacion}</span>
            </div>
          )}
        </div>

        <hr className="divider" />

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

        {/* Descripción */}
        {service.descripcion && (
          <div className="description-section">
            <h2 className="section-title">Acerca de este espacio</h2>
            <p className="description-text">{service.descripcion}</p>
            <button className="show-more-button">Mostrar más</button>
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
            if (service.tenant_name && params.ciudad && params.categoria) {
              const citySlug = params.ciudad.toLowerCase();
              const categorySlug = params.categoria.toLowerCase();
              const serviceSlug = service.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              navigate(`/${citySlug}/${categorySlug}/${service.id}-${serviceSlug}/booking`);
            } else if (service.tenant_name) {
              // Fallback a ruta antigua si no hay ciudad/categoría
              window.location.href = `https://${service.tenant_name}.weekly.pe/booking`;
            } else {
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

