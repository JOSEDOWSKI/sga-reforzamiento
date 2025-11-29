import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Header } from '@components/Header/Header';
import { ServiceCard } from '@components/ServiceCard/ServiceCard';
import { Filters } from '@components/Filters/Filters';
import { obtenerAliados, obtenerCategoriasPopulares } from '@services/api';
import { obtenerUbicacionCompleta, guardarCiudadPreferida } from '@utils/geolocation';
import { Aliado, FiltrosBusqueda, UbicacionUsuario } from '@types';
import { DemoBanner } from '@components/DemoBanner/DemoBanner';

const CATEGORIAS_ICONOS: Record<string, string> = {
  peluqueria: 'content_cut',
  spa: 'spa',
  clinica: 'local_hospital',
  academia: 'school',
  cancha: 'sports_soccer',
  gimnasio: 'fitness_center',
  restaurante: 'restaurant',
};

interface MarketplacePageProps {
  isDemoMode?: boolean;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ isDemoMode = false }) => {
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      {isDemoMode && <DemoBanner />}
      <Header onSearch={handleSearch} onCityChange={handleCityChange} />

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #34a853 0%, #2d8f47 100%)',
        color: '#fff',
        padding: '60px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#fff' }}>
            Reserva con los mejores profesionales
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '30px', opacity: 0.95 }}>
            Peluquerías, spas, consultorios, academias y más. Agenda tu cita en minutos.
          </p>
          <button style={{
            backgroundColor: '#fff',
            color: '#2d8f47',
            padding: '15px 30px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}>
            Explorar servicios
          </button>
        </div>
      </section>

      {/* Lo Más Buscado */}
      <section style={{ padding: '40px 20px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '30px', color: '#111827' }}>
          Lo Más Buscado
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px'
        }}>
          {categoriasPopulares.length > 0 ? categoriasPopulares.map((categoria) => (
            <div key={categoria} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '24px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#34a853' }}>
                {CATEGORIAS_ICONOS[categoria] || 'category'}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', textAlign: 'center' }}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </span>
            </div>
          )) : (
            <p style={{ color: '#6b7280' }}>Cargando categorías...</p>
          )}
        </div>
      </section>

      {/* Filtros y Listado */}
      <section style={{ padding: '40px 20px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Filters
            filtros={filtros}
            onFilterChange={handleFilterChange}
            categoriasDisponibles={categoriasPopulares}
          />
        </div>

        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '80px 20px',
            color: '#6b7280'
          }}>
            <div style={{
              border: '3px solid #e5e7eb',
              borderTopColor: '#34a853',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '20px'
            }}></div>
            <p>Cargando servicios...</p>
          </div>
        ) : aliados.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '80px 20px',
            gap: '16px',
            color: '#6b7280'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#9ca3af' }}>
              search_off
            </span>
            <p>No se encontraron servicios</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '30px', color: '#111827' }}>
              Servicios Disponibles
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {aliados.map((aliado) => (
                <ServiceCard key={aliado.id} aliado={aliado} ciudad={ciudadActual} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Sección Únete a Weekly */}
      <section style={{
        backgroundColor: '#f9fafb',
        padding: '80px 20px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '40px', color: '#111827', textAlign: 'center' }}>
          Únete a Weekly
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#34a853' }}>
              store
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Registra tu negocio</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Llega a más clientes y gestiona tus reservas fácilmente
            </p>
            <a href="https://merchants.weekly.pe" style={{
              backgroundColor: '#34a853',
              color: '#fff',
              padding: '8px 32px',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              marginTop: '8px'
            }}>
              Registrarse
            </a>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#34a853' }}>
              shopping_cart
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Registra tu comercio</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Vende tus productos y servicios en línea
            </p>
            <a href="https://merchants.weekly.pe" style={{
              backgroundColor: '#34a853',
              color: '#fff',
              padding: '8px 32px',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              marginTop: '8px'
            }}>
              Registrarse
            </a>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#34a853' }}>
              person
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Únete como profesional</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Ofrece tus servicios y crece tu negocio
            </p>
            <a href="https://merchants.weekly.pe" style={{
              backgroundColor: '#34a853',
              color: '#fff',
              padding: '8px 32px',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              marginTop: '8px'
            }}>
              Registrarse
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

