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
            
            // Detectar si estamos en weekly.pe (login universal) o en un subdominio específico
            const hostname = window.location.hostname;
            const isUniversalLogin = hostname === 'weekly.pe' || hostname === 'www.weekly.pe';
            
            let response;
            if (isUniversalLogin) {
                // Login universal - busca en todas las BDs
                response = await apiClient.post('/auth/universal-login', {
                    email,
                    password
                });
            } else {
                // Login normal - requiere header X-Tenant (ya lo envía el interceptor)
                response = await apiClient.post('/auth/login', {
                    email,
                    password
                });
            }

            const { data } = response.data;
            const newToken = data?.token || response.data.token;
            const userData = data?.user || response.data.user;
            const redirectTo = response.data.redirectTo || null;
            const tenant = response.data.tenant || null;

            if (!newToken) {
                throw new Error('Token no recibido del servidor');
            }

            setToken(newToken);
            setUser(userData);
            secureTokenStorage.set(newToken);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // Si hay redirectTo y es un tenant, redirigir
            if (redirectTo && tenant && tenant !== 'global' && isUniversalLogin) {
                // Login universal exitoso - redirigir al panel del tenant
                window.location.href = redirectTo;
                return; // No continuar ejecución
            }

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

            // Intentar decodificar el token JWT para determinar el tipo de usuario
            let isGlobalUser = false;
            try {
                const tokenParts = tokenToUse.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    isGlobalUser = payload.userType === 'global' || payload.rol === 'super_admin';
                }
            } catch (decodeError) {
                // Si no se puede decodificar, intentar con ambos endpoints
            }

            // Determinar el endpoint de verificación basado en el token decodificado
            const verifyEndpoint = isGlobalUser ? '/global-auth/verify' : '/auth/verify';
            
            try {
                const response = await apiClient.get(verifyEndpoint);
                const userData = response.data.user || response.data.data?.user;
                
                if (userData) {
                    setUser(userData);
                    setIsLoading(false);
                    return true;
                }
            } catch (endpointError: any) {
                // Si falla con un endpoint, intentar con el otro
                if (!isGlobalUser && endpointError.response?.status !== 401) {
                    try {
                        const globalResponse = await apiClient.get('/global-auth/verify');
                        const globalUserData = globalResponse.data.data?.user || globalResponse.data.user;
                        if (globalUserData) {
                            setUser(globalUserData);
                            setIsLoading(false);
                            return true;
                        }
                    } catch (globalError) {
                        // Ambos endpoints fallaron
                    }
                }
            }
            
            setIsLoading(false);
            return false;

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
            try {
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
                    
                    // Timeout para evitar que se quede cargando indefinidamente
                    const timeoutPromise = new Promise((resolve) => {
                        setTimeout(() => {
                            console.warn('Timeout en verificación de token');
                            setIsLoading(false);
                            resolve(false);
                        }, 8000); // 8 segundos máximo
                    });
                    
                    const verifyPromise = verifyToken(savedToken);
                    
                    // Esperar a que termine la verificación o el timeout
                    await Promise.race([verifyPromise, timeoutPromise]);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error inicializando autenticación:', error);
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