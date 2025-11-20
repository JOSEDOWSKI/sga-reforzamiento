import { useState, useEffect } from 'react';
import apiClient from '../config/api';

export interface MarketplaceProfile {
    id?: number;
    nombre: string;
    telefono: string;
    email?: string;
    dni?: string;
    direccion?: string;
    ciudad?: string;
    latitud?: number;
    longitud?: number;
}

const PROFILE_STORAGE_KEY = 'weekly_marketplace_profile';

/**
 * Hook para manejar el perfil del usuario del marketplace
 * Guarda el perfil en localStorage y sincroniza con el servidor
 */
export const useMarketplaceProfile = () => {
    const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
    const [loading, setLoading] = useState(false);

    // Cargar perfil desde localStorage al iniciar
    useEffect(() => {
        const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                setProfile(parsed);
                
                // Intentar sincronizar con el servidor si hay email o teléfono
                if (parsed.email || parsed.telefono) {
                    syncProfileFromServer(parsed.email || undefined, parsed.telefono);
                }
            } catch (error) {
                console.error('Error cargando perfil desde localStorage:', error);
            }
        }
    }, []);

    /**
     * Sincronizar perfil desde el servidor
     */
    const syncProfileFromServer = async (email?: string, telefono?: string) => {
        if (!email && !telefono) return;

        try {
            const params = email ? { email } : { telefono };
            const response = await apiClient.get('/public/marketplace-user/profile', { params });
            
            if (response.data.success && response.data.data) {
                const serverProfile = response.data.data;
                setProfile(serverProfile);
                localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(serverProfile));
            }
        } catch (error) {
            // Si no existe en el servidor, no hacer nada (usar localStorage)
            console.log('Perfil no encontrado en servidor, usando localStorage');
        }
    };

    /**
     * Guardar perfil (localStorage + servidor)
     */
    const saveProfile = async (newProfile: MarketplaceProfile): Promise<boolean> => {
        setLoading(true);
        try {
            // Guardar en localStorage inmediatamente
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
            setProfile(newProfile);

            // Intentar guardar en el servidor
            try {
                const response = await apiClient.post('/public/marketplace-user/profile', newProfile);
                if (response.data.success && response.data.data) {
                    // Actualizar con datos del servidor (puede incluir ID)
                    const serverProfile = response.data.data;
                    setProfile(serverProfile);
                    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(serverProfile));
                }
            } catch (serverError) {
                // Si falla el servidor, mantener en localStorage
                console.warn('Error guardando perfil en servidor, manteniendo en localStorage:', serverError);
            }

            return true;
        } catch (error) {
            console.error('Error guardando perfil:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar solo algunos campos del perfil
     */
    const updateProfile = async (updates: Partial<MarketplaceProfile>): Promise<boolean> => {
        const updatedProfile = { ...profile, ...updates } as MarketplaceProfile;
        return saveProfile(updatedProfile);
    };

    /**
     * Limpiar perfil
     */
    const clearProfile = () => {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
        setProfile(null);
    };

    return {
        profile,
        loading,
        saveProfile,
        updateProfile,
        clearProfile,
        syncProfileFromServer
    };
};

