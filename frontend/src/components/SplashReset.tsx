import React from 'react';
import { useSplashScreen } from '../hooks/useSplashScreen';

const SplashReset: React.FC = () => {
    const { resetSplash } = useSplashScreen();  
    if (import.meta.env.MODE !== 'development') return null;
    return (
        <button
            onClick={resetSplash}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 10000,
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
            }}
            title="Resetear pantalla de carga (solo desarrollo)"
        >
            🔄
        </button>
    );
};

export default SplashReset; 