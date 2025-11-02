import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

// Coordenadas de Arequipa, Perú (centro por defecto)
const AREQUIPA_CENTER: [number, number] = [-16.4090, -71.5375];

interface TenantLocation {
  id: number;
  tenant_name: string;
  name: string;
  category: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  email?: string;
  plan: string;
  estado: string;
}

// Iconos personalizados para diferentes categorías
const createCustomIcon = (category: string) => {
  const colors: { [key: string]: string } = {
    'Peluquería': '#ff6b6b',
    'Academia': '#4ecdc4',
    'Clínica': '#45b7d1',
    'Gimnasio': '#96ceb4',
    'Spa': '#feca57'
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${colors[category] || '#667eea'};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
    ">${category.charAt(0)}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Categorías disponibles
const categories = [
  { name: 'Peluquería', color: '#ff6b6b', icon: '✂️' },
  { name: 'Academia', color: '#4ecdc4', icon: '🎓' },
  { name: 'Clínica', color: '#45b7d1', icon: '🏥' },
  { name: 'Gimnasio', color: '#96ceb4', icon: '💪' },
  { name: 'Spa', color: '#feca57', icon: '🧘' }
];

// Componente para ajustar el mapa a las ubicaciones visibles
const MapBounds: React.FC<{ locations: TenantLocation[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      map.setView(AREQUIPA_CENTER, 13);
      return;
    }

    // Calcular bounds de todas las ubicaciones visibles
    const bounds = locations.map(loc => loc.coordinates as [number, number]);
    
    if (bounds.length > 0) {
      const latLngBounds = L.latLngBounds(bounds);
      
      // Si hay solo una ubicación, centrar y hacer zoom 15
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        // Si hay múltiples, ajustar el mapa para mostrar todas
        map.fitBounds(latLngBounds, {
          padding: [50, 50],
          maxZoom: 16
        });
      }
    }
  }, [locations, map]);

  return null;
};

const InteractiveMap: React.FC = () => {
  const [businessLocations, setBusinessLocations] = useState<TenantLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories.map(cat => cat.name));
  const [showAll, setShowAll] = useState(true);

  // Cargar tenants desde el backend
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Usar el dominio correcto para la API pública
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        let apiUrl = '';
        
        if (hostname.includes('weekly.pe')) {
          apiUrl = `${protocol}//api.weekly.pe/api/public/tenants`;
        } else if (hostname.includes('getdevtools.com')) {
          apiUrl = `${protocol}//${hostname.replace('weekly-frontend', 'weekly-backend')}/api/public/tenants`;
        } else {
          apiUrl = `${protocol}//${hostname.replace(':5173', ':4000').replace(':3000', ':4000')}/api/public/tenants`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success && data.data) {
          setBusinessLocations(data.data);
        }
      } catch (error) {
        console.error('Error cargando tenants:', error);
        // Mantener datos vacíos si falla
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Función para alternar categoría
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName];
      
      setShowAll(newSelection.length === categories.length);
      return newSelection;
    });
  };

  // Función para mostrar/ocultar todas las categorías
  const toggleShowAll = () => {
    if (showAll) {
      setSelectedCategories([]);
      setShowAll(false);
    } else {
      setSelectedCategories(categories.map(cat => cat.name));
      setShowAll(true);
    }
  };

  // Filtrar negocios basado en categorías seleccionadas
  const filteredBusinesses = useMemo(() => 
    businessLocations.filter(business => 
      selectedCategories.includes(business.category)
    ),
    [businessLocations, selectedCategories]
  );

  // Calcular centro del mapa basado en ubicaciones visibles
  const mapCenter = useMemo(() => {
    if (filteredBusinesses.length === 0) {
      return AREQUIPA_CENTER;
    }
    
    // Calcular centro promedio de las ubicaciones visibles
    const sumLat = filteredBusinesses.reduce((sum, loc) => sum + loc.coordinates[0], 0);
    const sumLng = filteredBusinesses.reduce((sum, loc) => sum + loc.coordinates[1], 0);
    const count = filteredBusinesses.length;
    
    return [sumLat / count, sumLng / count] as [number, number];
  }, [filteredBusinesses]);

  useEffect(() => {
    // Fix para iconos de Leaflet en React
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="interactive-map-container">
      <div className="map-header">
        <h3>Negocios que confían en WEEKLY</h3>
        <p>Descubre los establecimientos en Arequipa que ya gestionan sus citas de manera inteligente</p>
      </div>

      {/* Leyenda interactiva en la parte superior */}
      <div className="interactive-legend">
        <div className="legend-controls">
          <button 
            className={`legend-toggle-btn ${showAll ? 'active' : ''}`}
            onClick={toggleShowAll}
          >
            {showAll ? 'Ocultar Todo' : 'Mostrar Todo'}
          </button>
        </div>
        <div className="legend-buttons">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`legend-button ${selectedCategories.includes(category.name) ? 'active' : 'inactive'}`}
              onClick={() => toggleCategory(category.name)}
              style={{
                '--category-color': category.color
              } as React.CSSProperties}
            >
              <span className="legend-icon">{category.icon}</span>
              <span className="legend-text">{category.name}</span>
              <span className="legend-count">
                ({businessLocations.filter(b => b.category === category.name).length})
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="map-wrapper">
        {loading ? (
          <div style={{ 
            height: '500px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '1.1rem'
          }}>
            Cargando ubicaciones...
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={filteredBusinesses.length === 1 ? 15 : 13}
            style={{ height: '500px', width: '100%' }}
            className="map-container"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Ajustar mapa a las ubicaciones visibles */}
            <MapBounds locations={filteredBusinesses} />
            
            {filteredBusinesses.map((business) => (
            <Marker
              key={business.id}
              position={business.coordinates}
              icon={createCustomIcon(business.category)}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <h4>{business.name}</h4>
                  <p className="category">{business.category}</p>
                  <p className="address">{business.address}</p>
                  {business.phone && <p className="phone">{business.phone}</p>}
                  
                  <div className="popup-actions">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.coordinates[0] + ',' + business.coordinates[1])}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link-button"
                    >
                      📍 Ver en Google Maps
                    </a>
                    <a
                      href={`https://${business.tenant_name}.weekly.pe/calendario-publico`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="calendar-link-button"
                    >
                      📅 Agendar Cita
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
