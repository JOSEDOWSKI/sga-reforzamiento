import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let joinedTenant: string | null = null;

function getBaseUrl(): string {
  // Si hay variable de entorno VITE_WS_URL configurada, usarla
  if ((import.meta as any).env?.VITE_WS_URL) {
    return String((import.meta as any).env.VITE_WS_URL).replace(/\/$/, '').replace(/\/api$/, '');
  }
  
  // Si hay variable de entorno VITE_API_URL configurada, derivar WebSocket URL
  if ((import.meta as any).env?.VITE_API_URL) {
    const raw = (import.meta as any).env.VITE_API_URL;
    return String(raw).replace(/\/$/, '').replace(/\/api$/, '').replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  }
  
  // En desarrollo
  if ((import.meta as any).env?.DEV) {
    const raw = 'http://localhost:4000';
    return String(raw).replace(/\/$/, '').replace(/\/api$/, '');
  }
  
  // En producción, detectar automáticamente
  const hostname = window.location.hostname;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Para dominios weekly.pe, usar api.weekly.pe
  if (hostname.includes('weekly.pe')) {
    return `${protocol}//api.weekly.pe`;
  }
  
  // Para otros dominios, usar el mismo dominio con puerto 4000
  return `${protocol}//${hostname.replace(':3000', ':4000').replace(':5173', ':4000')}`;
}

export function connectSocket(tenant: string): Socket {
  // Detectar si estamos en modo demo o landing page
  const hostname = window.location.hostname;
  const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
  const isLandingPage = hostname === 'merchants.weekly.pe' || hostname === 'weekly.pe';
  
  // En modo demo o landing page, retornar un socket mock que NO intenta conectarse
  if (isDemoMode || isLandingPage) {
    // Crear un socket mock completamente deshabilitado
    if (!socket) {
      // Crear un objeto mock que imita la interfaz de Socket pero no hace nada
      socket = {
        id: undefined,
        connected: false,
        disconnected: true,
        connect: () => socket as any,
        disconnect: () => socket as any,
        on: () => socket as any,
        once: () => socket as any,
        off: () => socket as any,
        emit: () => socket as any,
        removeAllListeners: () => socket as any,
        close: () => socket as any,
        compress: () => socket as any,
        io: {
          uri: '',
          opts: {},
          engine: {} as any,
          _reconnection: false,
          _reconnectionAttempts: 0,
          _reconnectionDelay: 0,
          _reconnectionDelayMax: 0,
          _randomizationFactor: 0,
          _timeout: 0,
          _readyState: 'closed',
          _skipReconnect: true,
        } as any,
      } as any;
    }
    return socket;
  }

  if (!socket) {
    socket = io(getBaseUrl(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 5000,
      autoConnect: true,
      forceNew: false
    });
    
    // Manejar errores de conexión silenciosamente
    socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error:', error);
    });
  }

  if (tenant && joinedTenant !== tenant && !isDemoMode) {
    // Cuando el socket esté conectado, unirse a la sala del tenant
    if (socket.connected) {
      socket.emit('join-tenant', tenant);
      joinedTenant = tenant;
    } else {
      socket.once('connect', () => {
        socket?.emit('join-tenant', tenant);
        joinedTenant = tenant;
      });
    }
  }

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  // Mantener el socket vivo durante toda la app; no desconectar por defecto
  // Si fuera necesario cerrar explícitamente (por logout global), se puede llamar a esta función
  if (socket) {
    socket.disconnect();
    socket = null;
    joinedTenant = null;
  }
}



