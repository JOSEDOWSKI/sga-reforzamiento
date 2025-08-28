import { useState } from 'react';

export const useSplashScreen = () => {
    const [showSplash, setShowSplash] = useState(false);

    const showSplashScreen = () => {
        setShowSplash(true);
    };

    const hideSplash = () => {
        setShowSplash(false);
    };

    const resetSplash = () => {
        setShowSplash(true);
    };

    return {
        showSplash,
        isInitialized: true, // Siempre inicializado para compatibilidad
        showSplashScreen,
        hideSplash,
        resetSplash
    };
}; 