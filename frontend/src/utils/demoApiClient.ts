import axios from 'axios';

/**
 * Cliente API para modo DEMO
 * Usa rutas públicas /api/demo que no requieren autenticación
 */
const getBaseURL = () => {
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL || 'http://localhost:4000/api/demo';
    }
    
    const protocol = window.location.protocol;
    return `${protocol}//api.weekly.pe/api/demo`;
};

export const demoApiClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar header X-Tenant para demo
demoApiClient.interceptors.request.use((config) => {
    config.headers['X-Tenant'] = 'demo';
    return config;
});

export default demoApiClient;

