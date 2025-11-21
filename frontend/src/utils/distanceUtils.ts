/**
 * Utilidades para cálculo de distancias
 */

/**
 * Calcular distancia entre dos puntos usando fórmula de Haversine
 * @param lat1 Latitud punto 1
 * @param lng1 Longitud punto 1
 * @param lat2 Latitud punto 2
 * @param lng2 Longitud punto 2
 * @returns Distancia en kilómetros
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Formatear distancia para mostrar
 * @param distanceKm Distancia en kilómetros
 * @returns String formateado (ej: "2.5 km" o "850 m")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

