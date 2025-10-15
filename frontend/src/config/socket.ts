import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let joinedTenant: string | null = null;

function getBaseUrl(): string {
  const raw = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  return String(raw).replace(/\/$/, '').replace(/\/api$/, '');
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



