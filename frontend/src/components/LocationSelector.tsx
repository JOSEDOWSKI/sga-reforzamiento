import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationSelector.css';

// Coordenadas de Arequipa, Perú (centro por defecto)
const DEFAULT_CENTER: [number, number] = [-16.4090, -71.5375];

interface LocationSelectorProps {
    address: string;
    onAddressChange: (address: string) => void;
    onLocationSelect: (lat: number, lng: number, address: string) => void;
    initialLat?: number | null;
    initialLng?: number | null;
}

// Componente para detectar clics en el mapa
const MapClickHandler: React.FC<{
    onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        },
    });
    return null;
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
    address,
    onAddressChange,
    onLocationSelect,
    initialLat,
    initialLng,
}) => {
    const [mapCenter, setMapCenter] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : DEFAULT_CENTER
    );
    const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [searching, setSearching] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');
    const [extracting, setExtracting] = useState(false);

    // Geocodificar dirección usando el backend
    const geocodeAddress = async (addressToGeocode: string) => {
        if (!addressToGeocode.trim()) {
            return;
        }

        setSearching(true);
        try {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            let apiUrl = '';

            if (hostname.includes('weekly.pe')) {
                apiUrl = `${protocol}//api.weekly.pe/api/geocode`;
            } else if (hostname.includes('getdevtools.com')) {
                apiUrl = `${protocol}//${hostname.replace('weekly-frontend', 'weekly-backend')}/api/geocode`;
            } else {
                apiUrl = `${protocol}//${hostname.replace(':5173', ':4000').replace(':3000', ':4000')}/api/geocode`;
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: addressToGeocode }),
            });

            const data = await response.json();
            if (data.success && data.lat && data.lng) {
                const lat = parseFloat(data.lat);
                const lng = parseFloat(data.lng);
                setSelectedPosition([lat, lng]);
                setMapCenter([lat, lng]);
                onLocationSelect(lat, lng, addressToGeocode);
            }
        } catch (error) {
            console.error('Error geocodificando dirección:', error);
        } finally {
            setSearching(false);
        }
    };

    // Extraer coordenadas de URL de Google Maps
    const extractCoordinatesFromGoogleMapsUrl = (url: string): { lat: number; lng: number } | null => {
        try {
            // Patrón 1: https://www.google.com/maps?q=lat,lng
            // Patrón 2: https://www.google.com/maps/@lat,lng,zoom
            // Patrón 3: https://www.google.com/maps/place/.../@lat,lng,zoom
            // Patrón 4: https://www.google.com/maps/search/?api=1&query=lat,lng
            
            // Intentar extraer de query parameter q=lat,lng
            const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (qMatch) {
                return {
                    lat: parseFloat(qMatch[1]),
                    lng: parseFloat(qMatch[2])
                };
            }
            
            // Intentar extraer de @lat,lng
            const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (atMatch) {
                return {
                    lat: parseFloat(atMatch[1]),
                    lng: parseFloat(atMatch[2])
                };
            }
            
            // Intentar extraer de query parameter query=lat,lng
            const queryMatch = url.match(/[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (queryMatch) {
                return {
                    lat: parseFloat(queryMatch[1]),
                    lng: parseFloat(queryMatch[2])
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error extrayendo coordenadas:', error);
            return null;
        }
    };

    // Procesar URL de Google Maps
    const handleGoogleMapsUrlPaste = async (url: string) => {
        if (!url.trim()) return;
        
        setExtracting(true);
        try {
            const coords = extractCoordinatesFromGoogleMapsUrl(url);
            
            if (coords) {
                setSelectedPosition([coords.lat, coords.lng]);
                setMapCenter([coords.lat, coords.lng]);
                
                // Reverse geocoding para obtener dirección
                try {
                    const reverseResponse = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
                    );
                    const reverseData = await reverseResponse.json();
                    const extractedAddress = reverseData.display_name || `${coords.lat}, ${coords.lng}`;
                    onAddressChange(extractedAddress);
                    onLocationSelect(coords.lat, coords.lng, extractedAddress);
                } catch (err) {
                    console.error('Error obteniendo dirección:', err);
                    onLocationSelect(coords.lat, coords.lng, `${coords.lat}, ${coords.lng}`);
                }
            } else {
                alert('No se pudieron extraer coordenadas de la URL. Asegúrate de que sea un link de compartir de Google Maps con coordenadas.');
            }
        } catch (error) {
            console.error('Error procesando URL:', error);
            alert('Error al procesar la URL de Google Maps');
        } finally {
            setExtracting(false);
        }
    };

    // Manejar clic en el mapa
    const handleMapClick = (lat: number, lng: number) => {
        setSelectedPosition([lat, lng]);
        setMapCenter([lat, lng]);
        
        // Reverse geocoding para obtener dirección
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                const address = data.display_name || `${lat}, ${lng}`;
                onAddressChange(address);
                onLocationSelect(lat, lng, address);
            })
            .catch(err => {
                console.error('Error obteniendo dirección:', err);
                onLocationSelect(lat, lng, `${lat}, ${lng}`);
            });
    };

    // Buscar dirección cuando el usuario presiona Enter
    const handleAddressKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            geocodeAddress(address);
        }
    };

    // Icono del marcador
    const createMarkerIcon = () => {
        return L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    };

    return (
        <div className="location-selector">
            <div className="location-input-group">
                <label>Dirección</label>
                <div className="address-input-wrapper">
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        onKeyPress={handleAddressKeyPress}
                        placeholder="Ej: Av. Ejemplo 123, Lima, Perú"
                        className="address-input"
                    />
                    <button
                        type="button"
                        onClick={() => geocodeAddress(address)}
                        disabled={searching || !address.trim()}
                        className="search-location-btn"
                        title="Buscar ubicación en el mapa"
                    >
                        {searching ? '⏳' : '🔍'}
                    </button>
                </div>
                
                <div className="google-maps-url-section">
                    <label className="google-maps-label">
                        📎 O pegar link de Google Maps (desde botón "Compartir")
                    </label>
                    <div className="google-maps-input-wrapper">
                        <input
                            type="text"
                            value={googleMapsUrl}
                            onChange={(e) => setGoogleMapsUrl(e.target.value)}
                            onPaste={(e) => {
                                const pastedUrl = e.clipboardData.getData('text');
                                setTimeout(() => handleGoogleMapsUrlPaste(pastedUrl), 100);
                            }}
                            placeholder="https://www.google.com/maps/place/... o pega aquí el link"
                            className="google-maps-url-input"
                        />
                        <button
                            type="button"
                            onClick={() => handleGoogleMapsUrlPaste(googleMapsUrl)}
                            disabled={extracting || !googleMapsUrl.trim()}
                            className="extract-coords-btn"
                            title="Extraer coordenadas del link"
                        >
                            {extracting ? '⏳' : '📍'}
                        </button>
                    </div>
                    <p className="google-maps-hint">
                        💡 Abre Google Maps → Busca la ubicación → Clic en "Compartir" → Copia el link → Pégalo aquí
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="toggle-map-btn"
                >
                    {showMap ? '▲ Ocultar Mapa' : '▼ Mostrar Mapa para Seleccionar Ubicación'}
                </button>
            </div>

            {showMap && (
                <div className="map-selector-container">
                    <p className="map-hint">
                        💡 Haz clic en el mapa para seleccionar la ubicación exacta
                    </p>
                    <MapContainer
                        center={mapCenter}
                        zoom={selectedPosition ? 15 : 13}
                        style={{ height: '300px', width: '100%' }}
                        className="location-map"
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={handleMapClick} />
                        {selectedPosition && (
                            <Marker
                                position={selectedPosition}
                                icon={createMarkerIcon()}
                            />
                        )}
                    </MapContainer>
                    {selectedPosition && (
                        <div className="coordinates-display">
                            <strong>Coordenadas:</strong> {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationSelector;

