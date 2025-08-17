import { useState, useEffect } from 'react';

interface TenantInfo {
    id: string | null;
    displayName: string;
    isMultiTenant: boolean;
    subdomain: string | null;
}

export const useTenant = (): TenantInfo => {
    const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
        id: null,
        displayName: 'AgendaTe',
        isMultiTenant: false,
        subdomain: null
    });

    useEffect(() => {
        const detectTenant = () => {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            
            // Detectar si estamos en un subdominio (no localhost)
            if (parts.length >= 3 && !hostname.includes('localhost')) {
                const subdomain = parts[0];
                
                // Validar que no sea un subdominio del sistema (www, api, admin, etc.)
                const systemSubdomains = ['www', 'api', 'admin', 'app', 'dashboard'];
                
                if (!systemSubdomains.includes(subdomain)) {
                    setTenantInfo({
                        id: subdomain,
                        displayName: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} - AgendaTe`,
                        isMultiTenant: true,
                        subdomain: subdomain
                    });
                    return;
                }
            }
            
            // Desarrollo local o dominio principal
            const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT || 'demo';
            setTenantInfo({
                id: defaultTenant,
                displayName: 'AgendaTe Demo',
                isMultiTenant: false,
                subdomain: null
            });
        };

        detectTenant();
    }, []);

    return tenantInfo;
};

export default useTenant;