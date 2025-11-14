import axios from 'axios';
import { parseToon } from '../utils/toonParser';

// Detectar el entorno y configurar la URL base
const getBaseURL = () => {
    // En desarrollo
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    }
    
    // En producción
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si hay variable de entorno VITE_API_URL configurada, asegurar que termine en /api
    if (import.meta.env.VITE_API_URL) {
        const apiUrl = import.meta.env.VITE_API_URL;
        // Si termina en /api, usar tal cual; si no, agregar /api
        return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api`;
    }
    
    // Para dominios weekly.pe, usar api.weekly.pe/api
    if (currentHost.includes('weekly.pe')) {
        return `${protocol}//api.weekly.pe/api`;
    }
    
    // Para el dominio getdevtools.com, usar el mismo dominio para la API
    if (currentHost.includes('getdevtools.com')) {
        return `${protocol}//${currentHost}/api`;
    }
    
    // Para otros dominios, intentar usar el mismo dominio con puerto 4000
    if (currentHost.includes('.')) {
        return `${protocol}//${currentHost.replace(':3000', ':4000').replace(':5173', ':4000')}/api`;
    }
    
    return `${protocol}//${currentHost}/api`;
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/toon, application/json' // Preferir TOON para reducir tokens
    },
    withCredentials: true // Habilitado para permitir cookies y headers de autenticación
});

// Interceptor para agregar información del tenant
apiClient.interceptors.request.use((config) => {
    // Extraer tenant del subdominio
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Para getdevtools.com: admin.getdevtools.com -> "admin", cliente.getdevtools.com -> "cliente"
    if (hostname.includes('getdevtools.com') && parts.length >= 3) {
        const tenant = parts[0];
        config.headers['X-Tenant'] = tenant;
    }
    // Para weekly (desarrollo): admin.weekly -> "admin", cliente.weekly -> "cliente"
    else if (hostname.includes('weekly') && parts.length >= 2) {
        const tenant = parts[0];
        config.headers['X-Tenant'] = tenant;
    }
    // Para otros dominios con subdominios
    else if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        const tenant = parts[0];
        config.headers['X-Tenant'] = tenant;
    }
    
    return config;
});

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
    (response) => {
        // Si la respuesta es TOON, parsearla
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('application/toon') || contentType.includes('text/toon')) {
            try {
                response.data = parseToon(response.data);
            } catch (error) {
                console.warn('Error parsing TOON response, using as-is:', error);
            }
        }
        
        // Agregar información del tenant a la respuesta si está disponible
        if (response.headers['x-tenant']) {
            response.data.tenant = response.headers['x-tenant'];
        }
        return response;
    },
    (error) => {
        // Manejar errores de autenticación (401, 403)
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Verificar si estamos en modo demo
            const hostname = window.location.hostname;
            const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
            
            // En modo demo, no redirigir a login (permitir acceso sin autenticación)
            if (isDemoMode) {
                // Solo limpiar el token, pero no redirigir
                const { secureTokenStorage } = require('../utils/tokenSecurity');
                secureTokenStorage.clear();
                delete apiClient.defaults.headers.common['Authorization'];
                return Promise.reject(error);
            }
            
            // Solo redirigir si no estamos ya en la página de login y no es una ruta pública
            const pathname = window.location.pathname;
            const isPublicRoute = pathname.startsWith('/calendario') || 
                                  pathname.startsWith('/booking') ||
                                  pathname === '/' && window.location.hostname.includes('weekly.pe');
            
            if (!isPublicRoute) {
                // Limpiar token inválido
                const { secureTokenStorage } = require('../utils/tokenSecurity');
                secureTokenStorage.clear();
                delete apiClient.defaults.headers.common['Authorization'];
                
                // Redirigir al login si no estamos ya ahí
                if (pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        
        // Manejar errores comunes del SaaS
        if (error.response?.status === 400 && error.response?.data?.error === 'Invalid tenant identifier') {
            console.error('Tenant inválido:', error.response.data.message);
        }
        
        if (error.response?.status === 429) {
            console.warn('Rate limit excedido:', error.response.data.message);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient; 