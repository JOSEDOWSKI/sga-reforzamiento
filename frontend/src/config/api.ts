import axios from 'axios';

// Detectar el entorno y configurar la URL base
const getBaseURL = () => {
    // En desarrollo
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    }
    
    // En producción
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si hay variable de entorno VITE_API_URL configurada, usarla
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Para dominios weekly.pe, usar api.weekly.pe
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
        'Content-Type': 'application/json'
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
        // Agregar información del tenant a la respuesta si está disponible
        if (response.headers['x-tenant']) {
            response.data.tenant = response.headers['x-tenant'];
        }
        return response;
    },
    (error) => {
        // Manejar errores comunes del SaaS
        if (error.response?.status === 400 && error.response?.data?.error === 'Invalid tenant identifier') {
            console.error('Tenant inválido:', error.response.data.message);
            // Redirigir a página de error o configuración
        }
        
        if (error.response?.status === 429) {
            console.warn('Rate limit excedido:', error.response.data.message);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient; 