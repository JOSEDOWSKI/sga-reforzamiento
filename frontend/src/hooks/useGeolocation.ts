import { useState, useEffect } from 'react';

interface GeolocationState {
  city: string | null;
  loading: boolean;
  error: string | null;
  coordinates: { lat: number; lng: number } | null;
}

/**
 * Hook para detectar la ciudad del usuario usando geolocalización
 * Con fallback a IP geolocation si el usuario no permite ubicación
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    city: null,
    loading: true,
    error: null,
    coordinates: null,
  });

  useEffect(() => {
    const detectCity = async () => {
      try {
        // Intentar obtener ubicación del navegador
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Guardar coordenadas
              setState(prev => ({ ...prev, coordinates: { lat: latitude, lng: longitude } }));

              // Reverse geocoding usando Google Maps Geocoding API
              // Nota: Necesitarás una API key de Google Maps
              try {
                const geocodeResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&language=es`
                );
                
                if (geocodeResponse.ok) {
                  const geocodeData = await geocodeResponse.json();
                  
                  // Buscar ciudad en los resultados
                  let city = null;
                  for (const result of geocodeData.results || []) {
                    const cityComponent = result.address_components?.find(
                      (component: any) => 
                        component.types.includes('locality') || 
                        component.types.includes('administrative_area_level_1')
                    );
                    
                    if (cityComponent) {
                      city = cityComponent.long_name;
                      break;
                    }
                  }

                  if (city) {
                    // Normalizar nombre de ciudad (ej: "Lima" en lugar de "Lima Province")
                    const normalizedCity = normalizeCityName(city);
                    setState({
                      city: normalizedCity,
                      loading: false,
                      error: null,
                      coordinates: { lat: latitude, lng: longitude },
                    });
                    
                    // Guardar en localStorage
                    localStorage.setItem('user_city', normalizedCity);
                    localStorage.setItem('user_coordinates', JSON.stringify({ lat: latitude, lng: longitude }));
                    return;
                  }
                }
              } catch (geocodeError) {
                console.warn('Error en reverse geocoding:', geocodeError);
              }

              // Si no se pudo obtener ciudad, usar fallback
              await fallbackToIPGeolocation();
            },
            async (error) => {
              // Usuario denegó permisos o error de geolocalización
              console.warn('Geolocalización denegada o error:', error);
              await fallbackToIPGeolocation();
            },
            {
              timeout: 10000,
              enableHighAccuracy: false,
            }
          );
        } else {
          // Navegador no soporta geolocalización
          await fallbackToIPGeolocation();
        }
      } catch (error) {
        console.error('Error detectando ciudad:', error);
        setState({
          city: null,
          loading: false,
          error: 'No se pudo detectar la ubicación',
          coordinates: null,
        });
      }
    };

    // Verificar si hay ciudad guardada en localStorage
    const savedCity = localStorage.getItem('user_city');
    if (savedCity) {
      const savedCoords = localStorage.getItem('user_coordinates');
      setState({
        city: savedCity,
        loading: false,
        error: null,
        coordinates: savedCoords ? JSON.parse(savedCoords) : null,
      });
    } else {
      detectCity();
    }
  }, []);

  const fallbackToIPGeolocation = async () => {
    try {
      // Usar servicio de IP geolocation (gratis)
      // Opción 1: ipapi.co (gratis, 1000 requests/día)
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const city = data.city || data.region || null;
        
        if (city) {
          const normalizedCity = normalizeCityName(city);
          setState({
            city: normalizedCity,
            loading: false,
            error: null,
            coordinates: data.latitude && data.longitude 
              ? { lat: data.latitude, lng: data.longitude }
              : null,
          });
          
          localStorage.setItem('user_city', normalizedCity);
          if (data.latitude && data.longitude) {
            localStorage.setItem('user_coordinates', JSON.stringify({ 
              lat: data.latitude, 
              lng: data.longitude 
            }));
          }
          return;
        }
      }
    } catch (error) {
      console.warn('Error en IP geolocation:', error);
    }

    // Si todo falla, usar ciudad por defecto o null
    setState({
      city: null,
      loading: false,
      error: null,
      coordinates: null,
    });
  };

  const normalizeCityName = (city: string): string => {
    // Normalizar nombres de ciudades comunes
    const cityMap: Record<string, string> = {
      'lima province': 'Lima',
      'lima': 'Lima',
      'arequipa': 'Arequipa',
      'cusco': 'Cusco',
      'trujillo': 'Trujillo',
      'chiclayo': 'Chiclayo',
      'piura': 'Piura',
      'iquitos': 'Iquitos',
      'huancayo': 'Huancayo',
      'tacna': 'Tacna',
    };

    const normalized = city.toLowerCase().trim();
    return cityMap[normalized] || city;
  };

  const setCity = (city: string) => {
    setState(prev => ({ ...prev, city }));
    localStorage.setItem('user_city', city);
  };

  return {
    ...state,
    setCity,
  };
};

