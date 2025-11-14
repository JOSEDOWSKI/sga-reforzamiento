import { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { demoApiClient } from '../utils/demoApiClient';

interface TenantConfigBase {
  id: number;
  tenant_name: string;
  display_name: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_direccion: string;
  estado: string;
  plan: string;
  tutorial_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface PersonalizationConfig {
  entityNames: {
    colaboradores: string;
    establecimientos: string;
    clientes: string;
    reservas: string;
    recursos?: string;
  };
  features: {
    servicios: boolean;
    categorias: boolean;
    recursos_fisicos: boolean;
  };
  reservationMode: 'servicio' | 'recurso' | 'servicio_recurso';
  uiLabels: {
    colaborador: string;
    colaboradores: string;
    establecimiento: string;
    establecimientos: string;
    cliente: string;
    clientes: string;
    reserva: string;
    reservas: string;
    recurso?: string;
    recursos?: string;
  };
}

interface TenantConfig extends TenantConfigBase {
  config?: PersonalizationConfig;
}

const defaultConfig: PersonalizationConfig = {
  entityNames: {
    colaboradores: 'colaboradores',
    establecimientos: 'establecimientos',
    clientes: 'clientes',
    reservas: 'reservas',
    recursos: 'recursos'
  },
  features: {
    servicios: true,
    categorias: true,
    recursos_fisicos: false
  },
  reservationMode: 'servicio',
  uiLabels: {
    colaborador: 'Colaborador',
    colaboradores: 'Colaboradores',
    establecimiento: 'Establecimiento',
    establecimientos: 'Establecimientos',
    cliente: 'Cliente',
    clientes: 'Clientes',
    reserva: 'Reserva',
    reservas: 'Reservas',
    recurso: 'Recurso',
    recursos: 'Recursos'
  }
};

export const useTenantConfig = () => {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener el tenant actual del hostname
      const hostname = window.location.hostname;
      const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
      let tenantName = 'demo'; // Default

      if (hostname.includes('.')) {
        const parts = hostname.split('.');
        tenantName = parts[0];
      }

      // En modo demo, cargar de localStorage primero
      if (isDemoMode) {
        const saved = localStorage.getItem('demo_tenant_config');
        if (saved) {
          try {
            const configData = JSON.parse(saved);
            const personalizationConfig: PersonalizationConfig = configData 
              ? { ...defaultConfig, ...configData }
              : defaultConfig;
            
            setConfig({
              id: 1,
              tenant_name: 'demo',
              display_name: configData.displayName || 'Demo Weekly',
              cliente_nombre: 'Cliente Demo',
              cliente_email: 'demo@weekly.com',
              cliente_telefono: '+51 987 654 321',
              cliente_direccion: 'Lima, Perú',
              estado: 'activo',
              plan: 'basico',
              tutorial_enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              config: personalizationConfig
            });
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing demo config:', e);
          }
        }
      }

      // En modo demo, usar demoApiClient; sino usar apiClient normal
      const client = isDemoMode ? demoApiClient : apiClient;
      
      // Buscar la configuración del tenant (baseURL ya incluye /api)
      const response = await client.get(`/tenants/config/${tenantName}`);
      const tenantData = response.data.data;
      
      // Si viene con config personalizado, usarlo; sino usar default
      const personalizationConfig: PersonalizationConfig = tenantData.config 
        ? { ...defaultConfig, ...tenantData.config }
        : defaultConfig;

      setConfig({
        ...tenantData,
        config: personalizationConfig
      });
    } catch (err: any) {
      console.error('Error fetching tenant config:', err);
      setError(err.response?.data?.message || 'Error al cargar configuración del tenant');
      
      // Fallback: usar configuración por defecto
      setConfig({
        id: 1,
        tenant_name: 'demo',
        display_name: 'Demo Tenant',
        cliente_nombre: 'Cliente Demo',
        cliente_email: 'demo@weekly.com',
        cliente_telefono: '+51 987 654 321',
        cliente_direccion: 'Lima, Perú',
        estado: 'activo',
        plan: 'basico',
        tutorial_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        config: defaultConfig
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    
    const hostname = window.location.hostname;
    const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
    
    const handleConfigUpdate = () => {
      loadConfig();
    };
    
    // Escuchar cambios en localStorage para demo mode
    if (isDemoMode) {
      window.addEventListener('tenant-config-updated', handleConfigUpdate);
      window.addEventListener('storage', handleConfigUpdate);
    } else {
      // En producción, escuchar evento de actualización (disparado cuando otro usuario guarda)
      window.addEventListener('tenant-config-updated', handleConfigUpdate);
      
      // También escuchar eventos de realtime
      const handleRealtimeEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.eventName === 'tenant-config-updated') {
          loadConfig();
        }
      };
      window.addEventListener('realtime:event', handleRealtimeEvent);
      
      // Recargar configuración periódicamente para detectar cambios de otros usuarios (fallback)
      const interval = setInterval(() => {
        loadConfig();
      }, 60000); // Cada 60 segundos (menos agresivo)
      
      return () => {
        window.removeEventListener('tenant-config-updated', handleConfigUpdate);
        window.removeEventListener('realtime:event', handleRealtimeEvent);
        clearInterval(interval);
      };
    }
    
    return () => {
      if (isDemoMode) {
        window.removeEventListener('tenant-config-updated', handleConfigUpdate);
        window.removeEventListener('storage', handleConfigUpdate);
      } else {
        window.removeEventListener('tenant-config-updated', handleConfigUpdate);
      }
    };
  }, []);

  // Helper para obtener label personalizado
  const getLabel = (key: keyof PersonalizationConfig['uiLabels']): string => {
    return config?.config?.uiLabels[key] || defaultConfig.uiLabels[key] || key;
  };

  // Helper para obtener nombre de entidad
  const getEntityName = (key: keyof PersonalizationConfig['entityNames']): string => {
    return config?.config?.entityNames[key] || defaultConfig.entityNames[key] || key;
  };

  // Helper para verificar si una feature está habilitada
  const isFeatureEnabled = (feature: keyof PersonalizationConfig['features']): boolean => {
    return config?.config?.features[feature] ?? defaultConfig.features[feature];
  };

  // Helper para obtener modo de reserva
  const getReservationMode = (): PersonalizationConfig['reservationMode'] => {
    return config?.config?.reservationMode || defaultConfig.reservationMode;
  };

  return {
    config,
    isLoading,
    error,
    isTutorialEnabled: config?.tutorial_enabled ?? false,
    // Helpers de personalización
    getLabel,
    getEntityName,
    isFeatureEnabled,
    getReservationMode,
    // Acceso directo a config personalizado
    personalizationConfig: config?.config || defaultConfig
  };
};
