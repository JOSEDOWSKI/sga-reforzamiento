/**
 * Utilidades de seguridad para tokens
 */

// Generar un hash simple del token para verificar integridad
const generateTokenHash = (token: string): string => {
    if (!token) {
        console.warn('generateTokenHash called with undefined/null token');
        return '';
    }
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString();
};

// Guardar token de forma segura
export const secureTokenStorage = {
    set: (token: string) => {
        const hash = generateTokenHash(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token_hash', hash);
        localStorage.setItem('token_timestamp', Date.now().toString());
    },

    get: (): string | null => {
        const token = localStorage.getItem('auth_token');
        const storedHash = localStorage.getItem('token_hash');
        const timestamp = localStorage.getItem('token_timestamp');

        if (!token || !storedHash || !timestamp) {
            return null;
        }

        // Verificar integridad del token
        const currentHash = generateTokenHash(token);
        if (currentHash !== storedHash) {
            console.warn('Token integrity check failed - possible tampering detected');
            secureTokenStorage.clear();
            return null;
        }

        // Verificar que el token no sea demasiado viejo (máximo 2 horas + 5 minutos de gracia)
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = (2 * 60 * 60 * 1000) + (5 * 60 * 1000); // 2h 5min
        
        if (tokenAge > maxAge) {
            console.warn('Token expired by age');
            secureTokenStorage.clear();
            return null;
        }

        return token;
    },

    clear: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_hash');
        localStorage.removeItem('token_timestamp');
        localStorage.removeItem('last_activity');
    },

    isValid: (): boolean => {
        return secureTokenStorage.get() !== null;
    }
};

// Detectar si el localStorage ha sido manipulado externamente
export const detectTampering = (): boolean => {
    const token = localStorage.getItem('auth_token');
    const hash = localStorage.getItem('token_hash');
    
    if (!token || !hash) return false;
    
    return generateTokenHash(token) !== hash;
};