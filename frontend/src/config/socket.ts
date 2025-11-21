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
  
  // En modo demo o landing page, NO crear socket en absoluto
  if (isDemoMode || isLandingPage) {
    // Retornar null o un objeto mock que no intente conectarse
    // Esto previene completamente cualquier intento de conexión WebSocket
    if (!socket) {
      // Crear un objeto mock que implementa la interfaz Socket pero no hace nada
      socket = {
        connected: false,
        disconnected: true,
        id: undefined,
        connect: () => socket as any,
        disconnect: () => socket as any,
        on: () => socket as any,
        off: () => socket as any,
        emit: () => false,
        close: () => socket as any,
        open: () => socket as any,
        send: () => socket as any,
        receive: () => socket as any,
        compress: () => socket as any,
        binary: () => socket as any,
        volatile: () => socket as any,
        timeout: () => socket as any,
        any: () => socket as any,
        addEventListener: () => {},
        removeEventListener: () => {},
        removeAllListeners: () => socket as any,
        once: () => socket as any,
        listeners: () => [],
        hasListeners: () => false,
        eventNames: () => [],
        active: () => false,
        disconnected: true,
        auth: {},
        _callbacks: {},
        _opts: {},
        nsp: '/',
        client: {} as any,
        server: {} as any,
        adapter: {} as any,
        acks: {},
        flags: {},
        rooms: new Set(),
        data: {},
        handshake: {} as any,
        request: {} as any,
        query: {},
        volatile: () => socket as any,
        binary: () => socket as any,
        local: () => socket as any,
        broadcast: () => socket as any,
        to: () => socket as any,
        in: () => socket as any,
        except: () => socket as any,
        use: () => socket as any,
        join: () => socket as any,
        leave: () => socket as any,
        leaveAll: () => socket as any,
        toJSON: () => ({}),
      } as any as Socket;
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



