import { useState, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'weekly_favorites';

/**
 * Hook para manejar favoritos del marketplace
 * Guarda los IDs de servicios favoritos en localStorage
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Cargar favoritos desde localStorage al iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error cargando favoritos desde localStorage:', error);
        setFavorites([]);
      }
    }
  }, []);

  /**
   * Agregar o quitar un servicio de favoritos
   */
  const toggleFavorite = (serviceId: number) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(serviceId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      // Guardar en localStorage
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  /**
   * Verificar si un servicio está en favoritos
   */
  const isFavorite = (serviceId: number): boolean => {
    return favorites.includes(serviceId);
  };

  /**
   * Limpiar todos los favoritos
   */
  const clearFavorites = () => {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    setFavorites([]);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
};

