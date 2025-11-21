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
  
  // En modo demo o landing page, no crear socket
  if (isDemoMode || isLandingPage) {
    // Retornar un socket mock que no se conecta
    if (!socket) {
      socket = io(getBaseUrl(), {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 1000, // Timeout muy corto
        autoConnect: false, // No conectar automáticamente
        forceNew: false,
        reconnection: false // Desactivar reconexión
      });
      
      // Prevenir cualquier intento de conexión
      socket.connect = () => {
        // No hacer nada en landing/demo
        return socket as any;
      };
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



