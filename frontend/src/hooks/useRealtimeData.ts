import { useEffect, useCallback } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';

interface UseRealtimeDataOptions {
  events: string[];
  onUpdate: () => void;
  enabled?: boolean;
}

/**
 * Hook personalizado para manejar actualizaciones de datos en tiempo real
 * @param events - Array de eventos WebSocket a escuchar
 * @param onUpdate - Función a ejecutar cuando se recibe un evento
 * @param enabled - Si está habilitado (por defecto true)
 */
export const useRealtimeData = ({ events, onUpdate, enabled = true }: UseRealtimeDataOptions) => {
  const { socket: _socket, isConnected } = useRealtime();

  const handleRealtimeEvent = useCallback((event: CustomEvent) => {
    const { eventName } = event.detail;
    if (events.includes(eventName)) {
      onUpdate();
    }
  }, [events, onUpdate]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Escuchar eventos globales del RealtimeContext
    window.addEventListener('realtime:event', handleRealtimeEvent as EventListener);

    return () => {
      window.removeEventListener('realtime:event', handleRealtimeEvent as EventListener);
    };
  }, [handleRealtimeEvent, enabled]);

  return { isConnected };
};