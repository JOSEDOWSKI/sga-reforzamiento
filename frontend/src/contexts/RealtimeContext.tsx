import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket } from '../config/socket';
import { useTenant } from '../hooks/useTenant';

type RealtimeContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const RealtimeContext = createContext<RealtimeContextType>({ socket: null, isConnected: false });

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id: tenant } = useTenant();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Detectar si estamos en modo demo o landing page
    const hostname = window.location.hostname;
    const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
    const isLandingPage = hostname === 'merchants.weekly.pe' || hostname === 'weekly.pe';
    
    // En modo demo o landing page, no intentar conectar WebSocket
    if (isDemoMode || isLandingPage) {
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    if (!tenant) {
      return;
    }
    
    const socket = connectSocket(tenant);
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = (_reason: string) => {
      setIsConnected(false);
    };

    // Manejar errores de conexión silenciosamente
    const onConnectError = (error: Error) => {
      console.warn('WebSocket connection error (ignored in demo mode):', error);
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    const rebroadcast = (eventName: string) => (payload: any) => {
      window.dispatchEvent(new CustomEvent('realtime:event', { detail: { eventName, payload } }));
    };

    // Suscribir a todos los eventos relevantes y reemitir globalmente
    const events = [
      'reserva-created','reserva-updated','reserva-deleted','reserva-cancelled',
      'alumno-created','alumno-updated','alumno-deleted',
      'curso-created','curso-updated','curso-deleted',
      'profesor-created','profesor-updated','profesor-deleted',
      'tema-created','tema-updated','tema-deleted',
      'tenant-config-updated' // Evento para notificar cambios en configuración del tenant
    ];
    
    events.forEach(ev => socket.on(ev, rebroadcast(ev)));
    
    // Escuchar evento de configuración actualizada y disparar evento global
    socket.on('tenant-config-updated', () => {
      window.dispatchEvent(new Event('tenant-config-updated'));
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      events.forEach(ev => socket.off(ev));
      socketRef.current = null;
    };
  }, [tenant]);

  return (
    <RealtimeContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);



