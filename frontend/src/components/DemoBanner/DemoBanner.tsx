import React from 'react';
import styles from './DemoBanner.module.css';

export const DemoBanner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className="material-symbols-outlined">info</span>
        <div className={styles.text}>
          <strong>Modo Demo</strong>
          <span>Puedes explorar y reservar servicios sin necesidad de crear una cuenta</span>
        </div>
      </div>
    </div>
  );
};

