import { useState, useEffect } from 'react';

const SPLASH_COOKIE_NAME = 'sga_splash_shown';
const SPLASH_COOKIE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const useSplashScreen = () => {
    const [showSplash, setShowSplash] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const checkSplashStatus = () => {
            try {
                // Obtener la cookie
                const cookies = document.cookie.split(';');
                const splashCookie = cookies.find(cookie => 
                    cookie.trim().startsWith(`${SPLASH_COOKIE_NAME}=`)
                );

                if (splashCookie) {
                    const timestamp = parseInt(splashCookie.split('=')[1]);
                    const now = Date.now();
                    
                    // Si han pasado más de 24 horas, mostrar el splash
                    if (now - timestamp > SPLASH_COOKIE_DURATION) {
                        setShowSplash(true);
                    } else {
                        setShowSplash(false);
                    }
                } else {
                    // Si no existe la cookie, mostrar el splash
                    setShowSplash(true);
                }
            } catch (error) {
                console.error('Error al verificar el estado del splash:', error);
                // En caso de error, mostrar el splash
                setShowSplash(true);
            }
            
            setIsInitialized(true);
        };

        checkSplashStatus();
    }, []);

    const hideSplash = () => {
        try {
            // Establecer la cookie con la fecha actual
            const expires = new Date(Date.now() + SPLASH_COOKIE_DURATION);
            document.cookie = `${SPLASH_COOKIE_NAME}=${Date.now()}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
            
            setShowSplash(false);
        } catch (error) {
            console.error('Error al establecer la cookie del splash:', error);
            setShowSplash(false);
        }
    };

    const resetSplash = () => {
        try {
            // Eliminar la cookie
            document.cookie = `${SPLASH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            setShowSplash(true);
        } catch (error) {
            console.error('Error al resetear el splash:', error);
        }
    };

    return {
        showSplash,
        isInitialized,
        hideSplash,
        resetSplash
    };
}; 