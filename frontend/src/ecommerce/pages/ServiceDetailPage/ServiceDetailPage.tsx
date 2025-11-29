import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@components/Header/Header';
import {
  obtenerAliadoPorId,
  obtenerServiciosPorAliado,
  obtenerEstablecimientosPorAliado,
} from '@services/api';
import { generarUrlReserva } from '@utils/urls';
import type { Aliado, Service, Establecimiento } from '@types';
import styles from './ServiceDetailPage.module.css';

type ViewMode = 'negocio' | 'servicio' | 'lugar';

export const ServiceDetailPage: React.FC = () => {
  const { ciudad, categoria, aliadoId } = useParams<{
    ciudad: string;
    categoria: string;
    aliadoId: string;
  }>();
  const navigate = useNavigate();

  const [aliado, setAliado] = useState<Aliado | null>(null);
  const [servicios, setServicios] = useState<Service[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('negocio');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!aliadoId) return;

      setLoading(true);
      try {
        const id = parseInt(aliadoId, 10);
        const [aliadoData, serviciosData, establecimientosData] = await Promise.all([
          obtenerAliadoPorId(id),
          obtenerServiciosPorAliado(id),
          obtenerEstablecimientosPorAliado(id),
        ]);

        setAliado(aliadoData);
        setServicios(serviciosData);
        setEstablecimientos(establecimientosData);

        // Si hay múltiples establecimientos, mostrar vista de lugares
        if (establecimientosData.length > 1) {
          setViewMode('lugar');
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [aliadoId]);

  const handleReservar = () => {
    if (!ciudad || !categoria || !aliadoId || !aliado) return;

    const url = generarUrlReserva(ciudad, categoria, parseInt(aliadoId, 10), aliado.nombre);
    navigate(url);
  };

  const handleSeleccionarServicio = (servicio: Service) => {
    setSelectedService(servicio);
    setViewMode('servicio');
  };

  const handleSeleccionarLugar = (_establecimiento: Establecimiento) => {
    // Continuar con el flujo de reserva
    handleReservar();
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!aliado) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.empty}>
          <span className="material-symbols-outlined">error</span>
          <p>Negocio no encontrado</p>
        </div>
      </div>
    );
  }

  // Vista de detalle del negocio
  if (viewMode === 'negocio') {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.container}>
          {/* Galería */}
          <div className={styles.gallery}>
            {aliado.logo_url ? (
              <img src={aliado.logo_url} alt={aliado.nombre} className={styles.mainImage} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className="material-symbols-outlined">store</span>
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className={styles.content}>
            <div className={styles.header}>
              <h1 className={styles.title}>{aliado.nombre}</h1>
              {aliado.categoria && (
                <span className={styles.category}>{aliado.categoria}</span>
              )}
            </div>

            {aliado.rating !== undefined && (
              <div className={styles.rating}>
                <span className="material-symbols-outlined">star</span>
                <span>{aliado.rating.toFixed(1)}</span>
                {aliado.num_reviews !== undefined && (
                  <span className={styles.reviews}>({aliado.num_reviews} reseñas)</span>
                )}
              </div>
            )}

            {aliado.descripcion && (
              <div className={styles.description}>
                <h2>Descripción</h2>
                <p>{aliado.descripcion}</p>
              </div>
            )}

            {/* Servicios disponibles */}
            {servicios.length > 0 && (
              <div className={styles.services}>
                <h2>Servicios Disponibles</h2>
                <div className={styles.servicesGrid}>
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className={styles.serviceCard}
                      onClick={() => handleSeleccionarServicio(servicio)}
                    >
                      <h3>{servicio.name}</h3>
                      {servicio.description && <p>{servicio.description}</p>}
                      {servicio.price && (
                        <span className={styles.price}>S/ {servicio.price.toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className={styles.actions}>
              <button className={styles.reservarButton} onClick={handleReservar}>
                Reservar Ahora
              </button>
              <button className={styles.secondaryButton}>
                <span className="material-symbols-outlined">share</span>
                Compartir
              </button>
              <button className={styles.secondaryButton}>
                <span className="material-symbols-outlined">favorite</span>
                Favoritos
              </button>
              <button className={styles.secondaryButton}>
                <span className="material-symbols-outlined">map</span>
                Ver en Mapa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de detalle del servicio
  if (viewMode === 'servicio' && selectedService) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.container}>
          <button className={styles.backButton} onClick={() => setViewMode('negocio')}>
            <span className="material-symbols-outlined">arrow_back</span>
            Volver
          </button>

          <div className={styles.serviceDetail}>
            <h1 className={styles.title}>{selectedService.name}</h1>
            {selectedService.description && (
              <div className={styles.description}>
                <p>{selectedService.description}</p>
              </div>
            )}
            {selectedService.price && (
              <div className={styles.priceSection}>
                <span className={styles.priceLabel}>Precio:</span>
                <span className={styles.price}>S/ {selectedService.price.toFixed(2)}</span>
              </div>
            )}
            {selectedService.duration_minutes && (
              <div className={styles.duration}>
                <span className="material-symbols-outlined">schedule</span>
                <span>Duración: {selectedService.duration_minutes} minutos</span>
              </div>
            )}

            <button className={styles.reservarButton} onClick={handleReservar}>
              Seleccionar servicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de detalle del lugar
  if (viewMode === 'lugar' && establecimientos.length > 0) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.container}>
          <button className={styles.backButton} onClick={() => setViewMode('negocio')}>
            <span className="material-symbols-outlined">arrow_back</span>
            Volver
          </button>

          <h1 className={styles.title}>Selecciona un lugar</h1>
          <div className={styles.establecimientosGrid}>
            {establecimientos.map((establecimiento) => (
              <div
                key={establecimiento.id}
                className={styles.establecimientoCard}
                onClick={() => handleSeleccionarLugar(establecimiento)}
              >
                <h3>{establecimiento.nombre}</h3>
                {establecimiento.direccion && <p>{establecimiento.direccion}</p>}
                {establecimiento.telefono && (
                  <p className={styles.telefono}>
                    <span className="material-symbols-outlined">phone</span>
                    {establecimiento.telefono}
                  </p>
                )}
                <button className={styles.selectButton}>Seleccionar lugar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

