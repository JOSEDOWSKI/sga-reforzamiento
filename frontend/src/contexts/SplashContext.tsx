import React, { createContext, useContext, ReactNode } from 'react';
import { useSplashScreen } from '../hooks/useSplashScreen';

interface SplashContextType {
    showSplash: boolean;
    showSplashScreen: () => void;
    hideSplash: () => void;
    resetSplash: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export const useSplashContext = () => {
    const context = useContext(SplashContext);
    if (context === undefined) {
        throw new Error('useSplashContext must be used within a SplashProvider');
    }
    return context;
};

interface SplashProviderProps {
    children: ReactNode;
}

export const SplashProvider = ({ children }: SplashProviderProps) => {
    const splashScreen = useSplashScreen();

    return (
        <SplashContext.Provider value={splashScreen}>
            {children}
        </SplashContext.Provider>
    );
};