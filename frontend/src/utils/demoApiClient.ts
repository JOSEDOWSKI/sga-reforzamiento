import axios from 'axios';
import { mockApiResponses } from './demoMockData';

/**
 * Cliente API para modo DEMO
 * Usa rutas normales /api/ con header X-Tenant: demo
 * Si el backend no está disponible o hay errores CORS, usa datos mock
 */

// Adapter personalizado que intercepta TODAS las peticiones antes de que se envíen
const mockAdapter = async (config: any) => {
    // En modo demo, interceptar todas las peticiones y usar datos mock directamente
    // Esto evita que se envíen peticiones reales (incluyendo OPTIONS) al backend
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Manejar peticiones OPTIONS (preflight CORS) - responder inmediatamente
    if (method === 'options') {
        return {
            data: {},
            status: 200,
            statusText: 'OK',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Tenant, Authorization'
            },
            config: config,
            request: {}
        } as any;
    }
    
    // Para otras peticiones, usar datos mock
    const response = await mockApiResponses.handleRequest(url, method, config.data || {});
    return {
        ...response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config,
        request: {}
    } as any;
};

export const demoApiClient = axios.create({
    // Usar una URL local que nunca se conectará realmente
    baseURL: 'http://localhost:9999/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 100, // Timeout muy corto
    adapter: mockAdapter as any // Forzar el uso del adapter personalizado
});

// Interceptor para agregar header X-Tenant para demo
// Nota: El adapter personalizado ya maneja todas las peticiones, incluyendo OPTIONS
demoApiClient.interceptors.request.use((config) => {
    config.headers['X-Tenant'] = 'demo';
    return config;
});

// Interceptor de respuesta simplificado (el adapter ya maneja todo)
demoApiClient.interceptors.response.use(
    (response) => response,
    () => {
        // Si hay algún error inesperado, devolver datos vacíos
        return Promise.resolve({ data: { success: true, data: [] } });
    }
);

export default demoApiClient;

