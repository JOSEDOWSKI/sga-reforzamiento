import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Aliado } from '@types/index';
import { generarUrlNegocio } from '@utils/urls';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  aliado: Aliado;
  ciudad: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ aliado, ciudad }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const categoria = aliado.categoria || 'servicios';
    const url = generarUrlNegocio(ciudad, categoria, aliado.id, aliado.nombre);
    navigate(url);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className={styles.rating}>
        <span className="material-symbols-outlined">star</span>
        <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.imageContainer}>
        {aliado.logo_url ? (
          <img src={aliado.logo_url} alt={aliado.nombre} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className="material-symbols-outlined">store</span>
          </div>
        )}
        {aliado.categoria && (
          <span className={styles.categoryBadge}>{aliado.categoria}</span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{aliado.nombre}</h3>
        {aliado.descripcion && (
          <p className={styles.description}>{aliado.descripcion.substring(0, 100)}...</p>
        )}

        <div className={styles.footer}>
          <div className={styles.meta}>
            {renderRating(aliado.rating)}
            {aliado.num_reviews !== undefined && aliado.num_reviews > 0 && (
              <span className={styles.reviews}>({aliado.num_reviews})</span>
            )}
          </div>
          {aliado.distancia_km !== undefined && (
            <div className={styles.distance}>
              <span className="material-symbols-outlined">location_on</span>
              <span>{aliado.distancia_km} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

