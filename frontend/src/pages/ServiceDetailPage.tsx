import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ServiceDetailPage.css';

interface Service {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  rating?: number;
  reviews?: number;
  imagenes?: string[];
  categoria?: string;
  features?: string[];
  host?: {
    nombre: string;
    experiencia?: string;
    avatar?: string;
  };
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // TODO: Cargar servicio desde API
    // Por ahora datos de ejemplo
    if (id) {
      setService({
        id: parseInt(id),
        nombre: 'Salón de Belleza Bella Vista',
        descripcion: 'Experimenta la mejor atención en nuestro salón de belleza. Con un espacio abierto, ventanales amplios y una cocina completamente equipada, es el retiro urbano perfecto. Ubicado en el corazón de la ciudad, estás a solo pasos de los mejores restaurantes y atracciones.',
        precio: 50,
        ubicacion: 'Lima, Perú',
        rating: 4.92,
        reviews: 215,
        imagenes: [],
        categoria: 'Belleza',
        features: ['Wi-Fi Rápido', 'Estacionamiento', 'Mascotas Permitidas', 'Cocina Completa', 'Acceso a Piscina'],
        host: {
          nombre: 'María González',
          experiencia: 'Superhost · 5 años de experiencia',
          avatar: undefined
        }
      });
    }
    setLoading(false);
  }, [id]);

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
            // TODO: Navegar a página de reserva
            navigate(`/service/${service.id}/book`);
          }}
        >
          Reservar Ahora
        </button>
      </div>
    </div>
  );
};

export default ServiceDetailPage;

