import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import apiClient from '../config/api';
import { secureTokenStorage, detectTampering } from '../utils/tokenSecurity';

interface User {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    activo?: boolean;
    ultimo_acceso?: string;
    created_at?: string;
    userType?: 'global' | 'tenant';
    tenant?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginGlobal: (email: string, password: string) => Promise<void>;
    logout: () => void;
    verifyToken: () => Promise<boolean>;
    isGlobalUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    const login = async (email: string, password: string): Promise<void> => {
        try {
            setIsLoading(true);
            
            const response = await apiClient.post('/auth/login', {
                email,
                password
            });

            const { data } = response.data;
            const newToken = data?.token;
            const userData = data?.user;

            setToken(newToken);
            setUser(userData);
            secureTokenStorage.set(newToken);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        } catch (error: any) {
            console.error('Error en login:', error);
            
            logout();
            
            throw new Error(
                error.response?.data?.message || 'Error al iniciar sesión'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const loginGlobal = async (email: string, password: string): Promise<void> => {
        try {
            setIsLoading(true);
            
            const response = await apiClient.post('/global-auth/login', {
                email,
                password
            });

            console.log('Response from global auth:', response.data);

            const { data } = response.data;
            const newToken = data?.token;
            const userData = data?.user;

            if (!newToken) {
                throw new Error('Token no recibido del servidor');
            }

            setToken(newToken);
            setUser(userData);
            secureTokenStorage.set(newToken);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        } catch (error: any) {
            console.error('Error en login global:', error);
            
            logout();
            
            throw new Error(
                error.response?.data?.message || 'Error al iniciar sesión'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        setUser(null);
        setToken(null);
        secureTokenStorage.clear();
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const isGlobalUser = (): boolean => {
        return user?.userType === 'global' || user?.rol === 'super_admin';
    };

    const verifyToken = async (tokenToVerify?: string): Promise<boolean> => {
        try {
            const tokenToUse = tokenToVerify || token;
            if (!tokenToUse) {
                setIsLoading(false);
                return false;
            }

            // Asegurar que el header esté configurado
            if (tokenToVerify) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenToVerify}`;
            }

            // Determinar el endpoint de verificación basado en el tipo de usuario
            const verifyEndpoint = user?.userType === 'global' ? '/global-auth/verify' : '/auth/verify';
            const response = await apiClient.get(verifyEndpoint);
            const { user: userData } = response.data;
            
            setUser(userData);
            setIsLoading(false);
            return true;

        } catch (error: any) {
            console.error('Error verificando token:', error);
            
            logout();
            setIsLoading(false);
            return false;
        }
    };

    // Cargar token del localStorage al inicializar
    useEffect(() => {
        const initializeAuth = async () => {
            // Detectar manipulación del token
            if (detectTampering()) {
                console.warn('Token tampering detected - clearing session');
                secureTokenStorage.clear();
                setIsLoading(false);
                return;
            }

            const savedToken = secureTokenStorage.get();
            if (savedToken) {
                setToken(savedToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
                await verifyToken(savedToken);
            } else {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const authValue: AuthContextType = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        loginGlobal,
        logout,
        verifyToken,
        isGlobalUser
    };

    return React.createElement(
        AuthContext.Provider,
        { value: authValue },
        children
    );
};

export default useAuth;