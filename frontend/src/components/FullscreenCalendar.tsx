import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import { DatesSetArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Socket } from "socket.io-client";
import { connectSocket, getSocket } from "../config/socket";
import "./FullscreenCalendar.css";

// --- Definición de Tipos ---
interface Curso {
  id: number;
  nombre: string;
}
interface Tema {
  id: number;
  nombre: string;
  curso_id: number;
}
interface Profesor {
  id: number;
  nombre: string;
}
interface Reserva {
  id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  nombre_alumno: string;
  telefono_alumno?: string;
  curso_nombre: string;
  profesor_nombre: string;
  tema_nombre: string;
  precio?: number;
  estado_pago?: string;
  duracion_horas?: number;
}

interface FullscreenCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  reservas: Reserva[];
  cursos: Curso[];
  profesores: Profesor[];
  temas: Tema[];
  onRefreshData: () => void;
  tenant: string;
}

const FullscreenCalendar: React.FC<FullscreenCalendarProps> = ({
  isOpen,
  onClose,
  reservas,
  cursos,
  profesores,
  temas,
  onRefreshData,
  tenant
}) => {
  const [calendarTitle, setCalendarTitle] = useState("Turnos de Hoy");
  const [isConnected, setIsConnected] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Configurar WebSocket
  useEffect(() => {
    if (isOpen && tenant) {
      const socket = connectSocket(tenant);

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('connect_error', (error) => {
        setIsConnected(false);
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
      });

      // Escuchar eventos de reservas
      socket.on('reserva-created', (data) => {
        onRefreshData();
      });

      socket.on('reserva-updated', (data) => {
        onRefreshData();
      });

      socket.on('reserva-deleted', (data) => {
        onRefreshData();
      });

      socket.on('reserva-cancelled', (data) => {
        onRefreshData();
      });

      // Escuchar entidades auxiliares (alumnos, cursos, profesores, temas)
      const refrescar = (_label: string) => (_payload: any) => {
        onRefreshData();
      };

      socket.on('alumno-created', refrescar('Alumno creado'));
      socket.on('alumno-updated', refrescar('Alumno actualizado'));
      socket.on('alumno-deleted', refrescar('Alumno eliminado'));

      socket.on('curso-created', refrescar('Curso creado'));
      socket.on('curso-updated', refrescar('Curso actualizado'));
      socket.on('curso-deleted', refrescar('Curso eliminado'));

      socket.on('profesor-created', refrescar('Profesor creado'));
      socket.on('profesor-updated', refrescar('Profesor actualizado'));
      socket.on('profesor-deleted', refrescar('Profesor eliminado'));

      socket.on('tema-created', refrescar('Tema creado'));
      socket.on('tema-updated', refrescar('Tema actualizado'));
      socket.on('tema-deleted', refrescar('Tema eliminado'));

      socketRef.current = socket;

      return () => {
        // Solo limpiamos listeners para no cerrar el socket global
        if (socketRef.current) {
          socketRef.current.off('reserva-created');
          socketRef.current.off('reserva-updated');
          socketRef.current.off('reserva-deleted');
          socketRef.current.off('reserva-cancelled');
          socketRef.current.off('alumno-created');
          socketRef.current.off('alumno-updated');
          socketRef.current.off('alumno-deleted');
          socketRef.current.off('curso-created');
          socketRef.current.off('curso-updated');
          socketRef.current.off('curso-deleted');
          socketRef.current.off('profesor-created');
          socketRef.current.off('profesor-updated');
          socketRef.current.off('profesor-deleted');
          socketRef.current.off('tema-created');
          socketRef.current.off('tema-updated');
          socketRef.current.off('tema-deleted');
        }
        socketRef.current = null;
      };
    }
  }, [isOpen, tenant, onRefreshData]);

  // Mapear reservas: ocultar pasadas (con pequeña gracia) y ordenar por inicio
  const calendarEvents = (() => {
    const now = new Date();
    const graceMs = 60 * 1000; // 1 minuto de gracia para no cortar abrupto
    const threshold = new Date(now.getTime() - graceMs);

    const filtered = reservas.filter((r) => {
      const end = new Date(r.fecha_hora_fin);
      return end >= threshold; // mantener en curso o próximas
    });

    filtered.sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime());

    return filtered.map((r) => ({
      id: r.id.toString(),
      title: `${r.curso_nombre} - ${r.nombre_alumno}`,
      start: r.fecha_hora_inicio,
      end: r.fecha_hora_fin,
      extendedProps: {
        profesor: r.profesor_nombre,
        tema: r.tema_nombre,
        precio: r.precio,
        estado_pago: r.estado_pago,
        telefono: r.telefono_alumno,
      },
      // Colores coherentes por curso
      backgroundColor: `hsl(${(r.curso_nombre.length * 25) % 360}, 45%, 55%)`,
      borderColor: `hsl(${(r.curso_nombre.length * 25) % 360}, 45%, 45%)`,
    }));
  })();

  // Componente personalizado para renderizar el contenido de los eventos
  const renderEventContent = (eventInfo: any) => {
    const start: Date | null = eventInfo.event.start;
    const end: Date | null = eventInfo.event.end;
    const now = new Date();
    const isOngoing = !!start && !!end && start <= now && end >= now;

    const containerClass = `fullscreen-event-content ${isOngoing ? 'event-ongoing' : 'event-upcoming'}`;

    return (
      <div className={containerClass}>
        <div className="event-time">{eventInfo.timeText}{isOngoing ? ' · En curso' : ''}</div>
        <div className="event-title">{eventInfo.event.extendedProps.profesor}</div>
        <div className="event-details">
          <div className="event-student">{eventInfo.event.title.split(' - ')[1]}</div>
          <div className="event-course">{eventInfo.event.title.split(' - ')[0]}</div>
          <div className="event-topic">{eventInfo.event.extendedProps.tema}</div>
        </div>
      </div>
    );
  };

  // Handlers para el Calendario
  const handleCalendarNav = () => {};

  const handleViewChange = (_view: string) => {};

  const handleDatesSet = (_dateInfo: DatesSetArg) => {
    setCalendarTitle('Turnos de Hoy');
  };

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        onRefreshData();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [isOpen, onRefreshData]);

  // Autoscroll al siguiente turno pendiente en lista
  useEffect(() => {
    if (!isOpen) return;
    const scrollToNext = () => {
      // buscar filas de eventos de lista que tengan la clase de próximos o en curso
      const nextEl = document.querySelector('.fullscreen-calendar-content .fc-list-event .event-ongoing') 
        || document.querySelector('.fullscreen-calendar-content .fc-list-event .event-upcoming');
      if (nextEl && 'scrollIntoView' in nextEl) {
        (nextEl as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    const t = setTimeout(scrollToNext, 200); // esperar a que FullCalendar pinte
    return () => clearTimeout(t);
  }, [isOpen, calendarEvents]);

  if (!isOpen) return null;

  return (
    <div className="fullscreen-calendar-overlay">
      <div className="fullscreen-calendar-container">
        {/* Header minimal para pantalla de turnos */}
        <div className="fullscreen-calendar-header">
          <div className="fullscreen-calendar-header-left">
            <h2 className="fullscreen-calendar-title">{calendarTitle}</h2>
          </div>
          
          <div className="fullscreen-calendar-header-center" />

          <div className="fullscreen-calendar-header-right">
            <button className="fullscreen-close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Lista de turnos en pantalla completa */}
        <div className="fullscreen-calendar-content">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              listPlugin,
              interactionPlugin,
            ]}
            headerToolbar={false}
            datesSet={handleDatesSet}
            initialView="listDay"
            locale={esLocale}
            events={calendarEvents}
            eventContent={renderEventContent}
            height="100%"
            editable={false}
            selectable={false}
            nowIndicator={true}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenCalendar;
