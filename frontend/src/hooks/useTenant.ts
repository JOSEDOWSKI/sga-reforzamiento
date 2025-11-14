import { useState, useEffect } from "react";

interface TenantInfo {
  id: string | null;
  displayName: string;
  isMultiTenant: boolean;
  subdomain: string | null;
}

export const useTenant = (): TenantInfo => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    id: null,
    displayName: "AgendaTe",
    isMultiTenant: false,
    subdomain: null,
  });

  useEffect(() => {
    const detectTenant = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';

      // En demo, intentar cargar displayName desde localStorage
      if (isDemoMode) {
        const saved = localStorage.getItem('demo_tenant_config');
        if (saved) {
          try {
            const configData = JSON.parse(saved);
            if (configData.displayName) {
              setTenantInfo({
                id: 'demo',
                displayName: configData.displayName,
                isMultiTenant: false,
                subdomain: null,
              });
              return;
            }
          } catch (e) {
            // Si hay error, continuar con la lógica normal
          }
        }
      }

      // Detectar si estamos en un subdominio (no localhost)
      if (parts.length >= 3 && !hostname.includes("localhost")) {
        const subdomain = parts[0];

        // Validar que no sea un subdominio del sistema (www, api, admin, etc.)
        const systemSubdomains = ["www", "api", "admin", "app", "dashboard"];

        if (!systemSubdomains.includes(subdomain)) {
          setTenantInfo({
            id: subdomain,
            displayName: `${
              subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
            } - AgendaTe`,
            isMultiTenant: true,
            subdomain: subdomain,
          });
          return;
        }
      }

      // Desarrollo local o dominio principal
      const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT || "demo";
      setTenantInfo({
        id: defaultTenant,
        displayName: "AgendaTe",
        isMultiTenant: false,
        subdomain: null,
      });
    };

    detectTenant();
    
    // Escuchar cambios en localStorage para actualizar el nombre en tiempo real
    const handleStorageChange = () => {
      const hostname = window.location.hostname;
      const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
      if (isDemoMode) {
        const saved = localStorage.getItem('demo_tenant_config');
        if (saved) {
          try {
            const configData = JSON.parse(saved);
            if (configData.displayName) {
              setTenantInfo(prev => ({
                ...prev,
                displayName: configData.displayName
              }));
            }
          } catch (e) {
            // Ignorar errores
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // También escuchar cambios en la misma pestaña usando un evento personalizado
    window.addEventListener('tenant-config-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tenant-config-updated', handleStorageChange);
    };
  }, []);

  return tenantInfo;
};

export default useTenant;
