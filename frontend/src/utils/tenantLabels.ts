/**
 * Utilidades para obtener labels personalizados del tenant
 * Usa el hook useTenantConfig internamente
 */

import { useTenantConfig } from '../hooks/useTenantConfig';

/**
 * Hook para obtener labels personalizados fácilmente
 */
export const useTenantLabels = () => {
  const { getLabel, getEntityName, isFeatureEnabled, getReservationMode, personalizationConfig } = useTenantConfig();

  return {
    // Labels comunes
    colaborador: getLabel('colaborador'),
    colaboradores: getLabel('colaboradores'),
    establecimiento: getLabel('establecimiento'),
    establecimientos: getLabel('establecimientos'),
    cliente: getLabel('cliente'),
    clientes: getLabel('clientes'),
    reserva: getLabel('reserva'),
    reservas: getLabel('reservas'),
    recurso: getLabel('recurso') || 'Recurso',
    recursos: getLabel('recursos') || 'Recursos',
    
    // Nombres de entidades
    entityNames: {
      colaboradores: getEntityName('colaboradores'),
      establecimientos: getEntityName('establecimientos'),
      clientes: getEntityName('clientes'),
      reservas: getEntityName('reservas'),
      recursos: getEntityName('recursos') || 'recursos'
    },
    
    // Features
    features: {
      servicios: isFeatureEnabled('servicios'),
      categorias: isFeatureEnabled('categorias'),
      recursos_fisicos: isFeatureEnabled('recursos_fisicos')
    },
    
    // Modo de reserva
    reservationMode: getReservationMode(),
    
    // Config completo
    config: personalizationConfig
  };
};


