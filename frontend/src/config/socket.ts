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
      const mockSocket = {
        connected: false,
        disconnected: true,
        id: undefined,
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
        connect: () => mockSocket as any,
        disconnect: () => mockSocket as any,
        on: () => mockSocket as any,
        off: () => mockSocket as any,
        emit: () => false,
        close: () => mockSocket as any,
        open: () => mockSocket as any,
        send: () => mockSocket as any,
        receive: () => mockSocket as any,
        compress: () => mockSocket as any,
        binary: () => mockSocket as any,
        volatile: () => mockSocket as any,
        timeout: () => mockSocket as any,
        any: () => mockSocket as any,
        addEventListener: () => {},
        removeEventListener: () => {},
        removeAllListeners: () => mockSocket as any,
        once: () => mockSocket as any,
        listeners: () => [],
        hasListeners: () => false,
        eventNames: () => [],
        active: () => false,
        local: () => mockSocket as any,
        broadcast: () => mockSocket as any,
        to: () => mockSocket as any,
        in: () => mockSocket as any,
        except: () => mockSocket as any,
        use: () => mockSocket as any,
        join: () => mockSocket as any,
        leave: () => mockSocket as any,
        leaveAll: () => mockSocket as any,
        toJSON: () => ({}),
      } as any as Socket;
      socket = mockSocket;
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



