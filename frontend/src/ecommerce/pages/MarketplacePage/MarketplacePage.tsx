import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Header } from '@components/Header/Header';
import { ServiceCard } from '@components/ServiceCard/ServiceCard';
import { Filters } from '@components/Filters/Filters';
import { obtenerAliados, obtenerCategoriasPopulares } from '@services/api';
import { obtenerUbicacionCompleta, guardarCiudadPreferida } from '@utils/geolocation';
import type { Aliado, FiltrosBusqueda, UbicacionUsuario } from '@types';
import styles from './MarketplacePage.module.css';

const CATEGORIAS_ICONOS: Record<string, string> = {
  peluqueria: 'content_cut',
  spa: 'spa',
  clinica: 'local_hospital',
  academia: 'school',
  cancha: 'sports_soccer',
  gimnasio: 'fitness_center',
  restaurante: 'restaurant',
};

export const MarketplacePage: React.FC = () => {
  const { ciudad, categoria } = useParams<{ ciudad?: string; categoria?: string }>();
  const [searchParams] = useSearchParams();
  const busquedaTexto = searchParams.get('busqueda') || undefined;

  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [categoriasPopulares, setCategoriasPopulares] = useState<string[]>([]);
  const [ubicacionUsuario, setUbicacionUsuario] = useState<UbicacionUsuario | null>(null);
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    ciudad: ciudad || 'lima',
    categoria: categoria,
    ordenarPor: 'relevancia',
    busquedaTexto,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inicializarUbicacion = async () => {
      try {
        const ubicacion = await obtenerUbicacionCompleta();
        setUbicacionUsuario(ubicacion);
        if (!ciudad) {
          guardarCiudadPreferida(ubicacion.ciudad);
          setFiltros((prev) => ({ ...prev, ciudad: ubicacion.ciudad }));
        }
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      }
    };

    inicializarUbicacion();
  }, [ciudad]);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [aliadosData, categoriasData] = await Promise.all([
          obtenerAliados(filtros, ubicacionUsuario || undefined),
          obtenerCategoriasPopulares(filtros.ciudad),
        ]);

        setAliados(aliadosData);
        setCategoriasPopulares(categoriasData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [filtros, ubicacionUsuario]);

  const handleSearch = (query: string) => {
    setFiltros((prev) => ({ ...prev, busquedaTexto: query }));
  };

  const handleCityChange = (newCity: string) => {
    setFiltros((prev) => ({ ...prev, ciudad: newCity }));
  };

  const handleFilterChange = (newFiltros: FiltrosBusqueda) => {
    setFiltros(newFiltros);
  };

  const ciudadActual = filtros.ciudad || 'lima';

  return (
    <div className={styles.page}>
      <Header onSearch={handleSearch} onCityChange={handleCityChange} />

      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Reserva con los mejores profesionales
          </h1>
          <p className={styles.heroSubtitle}>
            Peluquerías, spas, consultorios, academias y más. Agenda tu cita en minutos.
          </p>
          <button className={styles.heroButton}>
            Explorar servicios
          </button>
        </div>
      </section>

      {/* Lo Más Buscado */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Lo Más Buscado
        </h2>
        <div className={styles.categoriesGrid}>
          {categoriasPopulares.length > 0 ? categoriasPopulares.map((categoria) => (
            <div key={categoria} className={styles.categoryCard}>
              <span className="material-symbols-outlined">
                {CATEGORIAS_ICONOS[categoria] || 'category'}
              </span>
              <span className={styles.categoryName}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </span>
            </div>
          )) : (
            <p>Cargando categorías...</p>
          )}
        </div>
      </section>

      {/* Filtros y Listado */}
      <section className={styles.section}>
        <div className={styles.filtersContainer}>
          <Filters
            filtros={filtros}
            onFilterChange={handleFilterChange}
            categoriasDisponibles={categoriasPopulares}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando servicios...</p>
          </div>
        ) : aliados.length === 0 ? (
          <div className={styles.empty}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>
              search_off
            </span>
            <p>No se encontraron servicios</p>
          </div>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>
              Servicios Disponibles
            </h2>
            <div className={styles.servicesGrid}>
              {aliados.map((aliado) => (
                <ServiceCard key={aliado.id} aliado={aliado} ciudad={ciudadActual} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Sección Únete a Weekly */}
      <section className={styles.joinSection}>
        <h2 className={styles.joinTitle}>
          Únete a Weekly
        </h2>
        <div className={styles.joinGrid}>
          <div className={styles.joinCard}>
            <span className="material-symbols-outlined">store</span>
            <h3 className={styles.joinCardTitle}>Registra tu negocio</h3>
            <p className={styles.joinCardText}>
              Llega a más clientes y gestiona tus reservas fácilmente
            </p>
            <a href="https://merchants.weekly.pe" className={styles.joinButton}>
              Registrarse
            </a>
          </div>
          <div className={styles.joinCard}>
            <span className="material-symbols-outlined">shopping_cart</span>
            <h3 className={styles.joinCardTitle}>Registra tu comercio</h3>
            <p className={styles.joinCardText}>
              Vende tus productos y servicios en línea
            </p>
            <a href="https://merchants.weekly.pe" className={styles.joinButton}>
              Registrarse
            </a>
          </div>
          <div className={styles.joinCard}>
            <span className="material-symbols-outlined">person</span>
            <h3 className={styles.joinCardTitle}>Únete como profesional</h3>
            <p className={styles.joinCardText}>
              Ofrece tus servicios y crece tu negocio
            </p>
            <a href="https://merchants.weekly.pe" className={styles.joinButton}>
              Registrarse
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
