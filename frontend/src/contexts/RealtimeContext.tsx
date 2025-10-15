import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, getSocket } from '../config/socket';
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
    if (!tenant) {
      return;
    }
    
    const socket = connectSocket(tenant);
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = (reason: string) => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const rebroadcast = (eventName: string) => (payload: any) => {
      window.dispatchEvent(new CustomEvent('realtime:event', { detail: { eventName, payload } }));
    };

    // Suscribir a todos los eventos relevantes y reemitir globalmente
    const events = [
      'reserva-created','reserva-updated','reserva-deleted','reserva-cancelled',
      'alumno-created','alumno-updated','alumno-deleted',
      'curso-created','curso-updated','curso-deleted',
      'profesor-created','profesor-updated','profesor-deleted',
      'tema-created','tema-updated','tema-deleted'
    ];
    
    events.forEach(ev => socket.on(ev, rebroadcast(ev)));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
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



