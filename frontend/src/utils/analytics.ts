/**
 * Utilidades para Google Analytics GA4
 * Tracking de eventos en el marketplace
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Enviar evento a Google Analytics
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else {
    console.log('[Analytics]', eventName, eventParams);
  }
};

/**
 * Eventos específicos del marketplace
 */
export const analytics = {
  // Ver marketplace
  viewMarketplace: (city?: string) => {
    trackEvent('view_marketplace', {
      city: city || 'all',
      page_location: window.location.href,
    });
  },

  // Ver detalle de negocio
  viewService: (serviceId: number, serviceName: string, category?: string, city?: string) => {
    trackEvent('view_item', {
      item_id: serviceId.toString(),
      item_name: serviceName,
      item_category: category || 'Otros',
      city: city || 'all',
      page_location: window.location.href,
    });
  },

  // Click en agendar
  clickBooking: (serviceId: number, serviceName: string, category?: string) => {
    trackEvent('click_booking', {
      item_id: serviceId.toString(),
      item_name: serviceName,
      item_category: category || 'Otros',
      page_location: window.location.href,
    });
  },

  // Reserva completada
  completeBooking: (serviceId: number, serviceName: string, category?: string) => {
    trackEvent('complete_booking', {
      item_id: serviceId.toString(),
      item_name: serviceName,
      item_category: category || 'Otros',
      page_location: window.location.href,
    });
  },

  // Búsqueda
  searchService: (searchQuery: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchQuery,
      results_count: resultsCount,
      page_location: window.location.href,
    });
  },

  // Filtrar por ciudad
  filterByCity: (city: string) => {
    trackEvent('filter_by_city', {
      city: city,
      page_location: window.location.href,
    });
  },

  // Filtrar por categoría
  filterByCategory: (category: string) => {
    trackEvent('filter_by_category', {
      category: category,
      page_location: window.location.href,
    });
  },

  // Cambiar vista (grid/list)
  changeViewMode: (viewMode: 'grid' | 'list') => {
    trackEvent('change_view_mode', {
      view_mode: viewMode,
      page_location: window.location.href,
    });
  },

  // Geolocalización detectada
  geolocationDetected: (city: string, method: 'browser' | 'ip') => {
    trackEvent('geolocation_detected', {
      city: city,
      detection_method: method,
      page_location: window.location.href,
    });
  },

  // Método genérico para eventos personalizados
  trackEvent: (eventName: string, eventParams?: Record<string, any>) => {
    trackEvent(eventName, eventParams);
  },
};

