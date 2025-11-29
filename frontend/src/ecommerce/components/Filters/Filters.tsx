import React from 'react';
import { FiltrosBusqueda } from '@types/index';
import styles from './Filters.module.css';

interface FiltersProps {
  filtros: FiltrosBusqueda;
  onFilterChange: (filtros: FiltrosBusqueda) => void;
  categoriasDisponibles?: string[];
}

export const Filters: React.FC<FiltersProps> = ({
  filtros,
  onFilterChange,
  categoriasDisponibles = [],
}) => {
  const handleOrdenarChange = (ordenarPor: FiltrosBusqueda['ordenarPor']) => {
    onFilterChange({ ...filtros, ordenarPor });
  };

  const handleCategoriaChange = (categoria?: string) => {
    onFilterChange({ ...filtros, categoria: categoria || undefined });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Ordenar por:</label>
        <select
          className={styles.filterSelect}
          value={filtros.ordenarPor || 'relevancia'}
          onChange={(e) => handleOrdenarChange(e.target.value as FiltrosBusqueda['ordenarPor'])}
        >
          <option value="relevancia">Relevancia</option>
          <option value="nombre">Nombre (A-Z)</option>
          <option value="rating">Mejor rating</option>
          <option value="distancia">Más cercano</option>
        </select>
      </div>

      {categoriasDisponibles.length > 0 && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Categoría:</label>
          <select
            className={styles.filterSelect}
            value={filtros.categoria || ''}
            onChange={(e) => handleCategoriaChange(e.target.value || undefined)}
          >
            <option value="">Todas las categorías</option>
            {categoriasDisponibles.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

