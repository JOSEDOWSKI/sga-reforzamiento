import { useState, useEffect } from 'react';
import apiClient from '../config/api';

interface TenantConfig {
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

export const useTenantConfig = () => {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener el tenant actual del hostname
        const hostname = window.location.hostname;
        let tenantName = 'demo'; // Default

        if (hostname.includes('.')) {
          const parts = hostname.split('.');
          tenantName = parts[0];
        }

        // Buscar la configuración del tenant
        const response = await apiClient.get(`/api/tenants/config/${tenantName}`);
        setConfig(response.data.data);
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
          tutorial_enabled: true, // Por defecto habilitado para demo
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  return {
    config,
    isLoading,
    error,
    isTutorialEnabled: config?.tutorial_enabled ?? false
  };
};
