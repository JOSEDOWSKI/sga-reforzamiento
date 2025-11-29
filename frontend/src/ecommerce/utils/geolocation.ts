import { UbicacionUsuario } from '@types/index';

/**
 * Obtiene la ubicación del usuario usando el navegador
 */
export const obtenerUbicacionUsuario = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por el navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Convierte coordenadas a ciudad usando reverse geocoding
 * Nota: Requiere Google Maps API o servicio similar
 */
export const obtenerCiudadDesdeCoordenadas = async (
  lat: number,
  lng: number,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    // Fallback: usar geolocalización por IP o ciudad por defecto
    return 'lima';
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Buscar componente de tipo "locality" o "administrative_area_level_1"
      const locality = data.results[0].address_components.find(
        (component: any) =>
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_1')
      );

      if (locality) {
        return locality.long_name.toLowerCase().replace(/\s+/g, '-');
      }
    }

    return 'lima'; // Fallback
  } catch (error) {
    console.error('Error obteniendo ciudad desde coordenadas:', error);
    return 'lima';
  }
};

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @returns Distancia en kilómetros
 */
export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;

  return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Obtiene la ubicación del usuario con fallback
 */
export const obtenerUbicacionCompleta = async (
  googleMapsApiKey?: string
): Promise<UbicacionUsuario> => {
  try {
    const position = await obtenerUbicacionUsuario();
    const ciudad = await obtenerCiudadDesdeCoordenadas(
      position.coords.latitude,
      position.coords.longitude,
      googleMapsApiKey
    );

    return {
      latitud: position.coords.latitude,
      longitud: position.coords.longitude,
      ciudad,
    };
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    // Fallback: usar ciudad guardada en localStorage o ciudad por defecto
    const ciudadGuardada = localStorage.getItem('weekly_ciudad') || 'lima';
    return {
      latitud: 0,
      longitud: 0,
      ciudad: ciudadGuardada,
    };
  }
};

/**
 * Guarda la ciudad preferida del usuario en localStorage
 */
export const guardarCiudadPreferida = (ciudad: string): void => {
  localStorage.setItem('weekly_ciudad', ciudad);
};

/**
 * Obtiene la ciudad preferida del usuario desde localStorage
 */
export const obtenerCiudadPreferida = (): string => {
  return localStorage.getItem('weekly_ciudad') || 'lima';
};

