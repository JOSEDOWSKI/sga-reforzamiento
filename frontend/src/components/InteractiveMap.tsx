import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

// Coordenadas de Arequipa, Perú
const AREQUIPA_CENTER = [-16.4090, -71.5375];

// Datos de ejemplo de negocios en Arequipa
const businessLocations = [
  {
    id: 1,
    name: "Peluquería Elegance",
    category: "Peluquería",
    address: "Av. Dolores 123, Yanahuara",
    coordinates: [-16.3980, -71.5400],
    phone: "+51 54 123456",
    rating: 4.8,
    clients: 150
  },
  {
    id: 2,
    name: "Academia de Danza Arequipa",
    category: "Academia",
    address: "Calle San Francisco 456, Centro Histórico",
    coordinates: [-16.4090, -71.5375],
    phone: "+51 54 234567",
    rating: 4.9,
    clients: 200
  },
  {
    id: 3,
    name: "Clínica Dental Sonrisa",
    category: "Clínica",
    address: "Av. Ejército 789, Cayma",
    coordinates: [-16.4200, -71.5200],
    phone: "+51 54 345678",
    rating: 4.7,
    clients: 120
  },
  {
    id: 4,
    name: "Gimnasio FitLife",
    category: "Gimnasio",
    address: "Av. La Marina 321, Cerro Colorado",
    coordinates: [-16.3800, -71.5500],
    phone: "+51 54 456789",
    rating: 4.6,
    clients: 300
  },
  {
    id: 5,
    name: "Spa Relax Total",
    category: "Spa",
    address: "Calle Jerusalén 654, Selva Alegre",
    coordinates: [-16.3950, -71.5300],
    phone: "+51 54 567890",
    rating: 4.8,
    clients: 80
  }
];

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

const InteractiveMap: React.FC = () => {
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
      
      <div className="map-wrapper">
        <MapContainer
          center={AREQUIPA_CENTER}
          zoom={13}
          style={{ height: '500px', width: '100%' }}
          className="map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {businessLocations.map((business) => (
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
                  <p className="phone">{business.phone}</p>
                  <div className="stats">
                    <span className="rating">⭐ {business.rating}</span>
                    <span className="clients">👥 {business.clients} clientes</span>
                  </div>
                  <button className="visit-button">
                    Ver Perfil
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <h4>Leyenda</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
            <span>Peluquerías</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4ecdc4' }}></div>
            <span>Academias</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#45b7d1' }}></div>
            <span>Clínicas</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#96ceb4' }}></div>
            <span>Gimnasios</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#feca57' }}></div>
            <span>Spas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
