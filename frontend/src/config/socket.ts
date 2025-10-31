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
  if (!socket) {
    socket = io(getBaseUrl(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 5000,
      autoConnect: true,
      forceNew: false
    });
  }

  if (tenant && joinedTenant !== tenant) {
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



