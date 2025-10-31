import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import { DatesSetArg } from "@fullcalendar/core";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Socket } from "socket.io-client";
import { connectSocket } from "../config/socket";
import "./FullscreenCalendar.css";

// --- Definición de Tipos ---
interface Servicio {
  id: number;
  nombre: string;
}
interface Categoria {
  id: number;
  nombre: string;
  curso_id: number;
}
interface Staff {
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

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface Metrics {
  totalHoy: number;
  enCurso: number;
  proximos: number;
  completados: number;
  ingresosEsperados: number;
  ingresosConfirmados: number;
  tiempoPromedioTurno: number;
}

interface FullscreenCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  reservas: Reserva[];
  servicios: Servicio[];
  staff: Staff[];
  categorias: Categoria[];
  onRefreshData: () => void;
  tenant: string;
}

const FullscreenCalendar: React.FC<FullscreenCalendarProps> = ({
  isOpen,
  onClose,
  reservas,
  servicios,
  staff,
  categorias: _categorias,
  onRefreshData,
  tenant
}) => {
  // Estados principales
  const [calendarTitle, setCalendarTitle] = useState("Turnos de Hoy");
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showMetrics, setShowMetrics] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  
  // Filtros inteligentes
  const [filterStaff, setFilterStaff] = useState<string>("");
  const [filterServicio, setFilterServicio] = useState<string>("");
  const [filterEstadoPago, setFilterEstadoPago] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Refs
  const calendarRef = useRef<FullCalendar | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular métricas en tiempo real
  const metrics: Metrics = useMemo(() => {
    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const reservasHoy = reservas.filter((r) => {
      const inicio = new Date(r.fecha_hora_inicio);
      return inicio >= hoy && inicio < manana;
    });

    const enCurso = reservasHoy.filter((r) => {
      const inicio = new Date(r.fecha_hora_inicio);
      const fin = new Date(r.fecha_hora_fin);
      return inicio <= now && fin >= now;
    }).length;

    const proximos = reservasHoy.filter((r) => {
      const inicio = new Date(r.fecha_hora_inicio);
      return inicio > now;
    }).length;

    const completados = reservasHoy.filter((r) => {
      const fin = new Date(r.fecha_hora_fin);
      return fin < now;
    }).length;

    const ingresosEsperados = reservasHoy.reduce((sum, r) => sum + (r.precio || 0), 0);
    const ingresosConfirmados = reservasHoy
      .filter((r) => r.estado_pago === 'Pagado')
      .reduce((sum, r) => sum + (r.precio || 0), 0);

    const duraciones = reservasHoy
      .map((r) => r.duracion_horas || 1)
      .filter((d) => d > 0);
    const tiempoPromedioTurno = duraciones.length > 0
      ? duraciones.reduce((sum, d) => sum + d, 0) / duraciones.length
      : 0;

    return {
      totalHoy: reservasHoy.length,
      enCurso,
      proximos,
      completados,
      ingresosEsperados,
      ingresosConfirmados,
      tiempoPromedioTurno: Math.round(tiempoPromedioTurno * 100) / 100,
    };
  }, [reservas]);

  // Función para agregar notificación
  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remover después de 5 segundos
    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notificationTimeoutRef.current.delete(id);
    }, 5000);

    notificationTimeoutRef.current.set(id, timeout);
  }, []);

  // Configurar WebSocket con notificaciones
  useEffect(() => {
    if (isOpen && tenant) {
      const socket = connectSocket(tenant);

      socket.on('connect', () => {
        setIsConnected(true);
        addNotification('success', 'Conectado en tiempo real');
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
        addNotification('error', 'Error de conexión');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Eventos de reservas con notificaciones
      socket.on('reserva-created', () => {
        addNotification('success', 'Nuevo turno creado');
        onRefreshData();
      });

      socket.on('reserva-updated', () => {
        addNotification('info', 'Turno actualizado');
        onRefreshData();
      });

      socket.on('reserva-deleted', () => {
        addNotification('warning', 'Turno eliminado');
        onRefreshData();
      });

      socket.on('reserva-cancelled', () => {
        addNotification('warning', 'Turno cancelado');
        onRefreshData();
      });

      // Escuchar entidades auxiliares
      const refrescar = (_label: string) => (_payload: any) => {
        onRefreshData();
      };

      socket.on('cliente-created', refrescar('Cliente creado'));
      socket.on('cliente-updated', refrescar('Cliente actualizado'));
      socket.on('cliente-deleted', refrescar('Cliente eliminado'));
      socket.on('servicio-created', refrescar('Servicio creado'));
      socket.on('servicio-updated', refrescar('Servicio actualizado'));
      socket.on('servicio-deleted', refrescar('Servicio eliminado'));
      socket.on('staff-created', refrescar('Staff creado'));
      socket.on('staff-updated', refrescar('Staff actualizado'));
      socket.on('staff-deleted', refrescar('Staff eliminado'));
      socket.on('categoria-created', refrescar('Categoría creada'));
      socket.on('categoria-updated', refrescar('Categoría actualizada'));
      socket.on('categoria-deleted', refrescar('Categoría eliminada'));

      socketRef.current = socket;

      return () => {
        if (socketRef.current) {
          socketRef.current.off('reserva-created');
          socketRef.current.off('reserva-updated');
          socketRef.current.off('reserva-deleted');
          socketRef.current.off('reserva-cancelled');
          socketRef.current.off('cliente-created');
          socketRef.current.off('cliente-updated');
          socketRef.current.off('cliente-deleted');
          socketRef.current.off('servicio-created');
          socketRef.current.off('servicio-updated');
          socketRef.current.off('servicio-deleted');
          socketRef.current.off('staff-created');
          socketRef.current.off('staff-updated');
          socketRef.current.off('staff-deleted');
          socketRef.current.off('categoria-created');
          socketRef.current.off('categoria-updated');
          socketRef.current.off('categoria-deleted');
        }
        socketRef.current = null;
      };
    }
  }, [isOpen, tenant, onRefreshData, addNotification]);

  // Actualizar tiempo actual cada segundo
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Filtrar y mapear reservas con filtros aplicados
  const calendarEvents = useMemo(() => {
    const now = currentTime;
    const graceMs = 60 * 1000; // 1 minuto de gracia
    const threshold = new Date(now.getTime() - graceMs);

    let filtered = reservas.filter((r) => {
      const end = new Date(r.fecha_hora_fin);
      if (end < threshold) return false;

      // Aplicar filtros
      if (filterStaff && r.profesor_nombre !== filterStaff) return false;
      if (filterServicio && r.curso_nombre !== filterServicio) return false;
      if (filterEstadoPago && r.estado_pago !== filterEstadoPago) return false;

      return true;
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
      backgroundColor: `hsl(${(r.curso_nombre.length * 25) % 360}, 45%, 55%)`,
      borderColor: `hsl(${(r.curso_nombre.length * 25) % 360}, 45%, 45%)`,
    }));
  }, [reservas, filterStaff, filterServicio, filterEstadoPago, currentTime]);

  // Calcular turno actual y próximo
  const { currentTurno, nextTurno, timeRemaining } = useMemo(() => {
    const now = currentTime;
    let current: Reserva | null = null;
    let next: Reserva | null = null;
    let remaining = { hours: 0, minutes: 0 };

    // Aplicar mismos filtros
    let filtered = reservas.filter((r) => {
      const end = new Date(r.fecha_hora_fin);
      if (end < now) return false;

      if (filterStaff && r.profesor_nombre !== filterStaff) return false;
      if (filterServicio && r.curso_nombre !== filterServicio) return false;
      if (filterEstadoPago && r.estado_pago !== filterEstadoPago) return false;

      return true;
    });

    filtered.sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime());

    // Encontrar turno actual (en curso)
    for (const reserva of filtered) {
      const inicio = new Date(reserva.fecha_hora_inicio);
      const fin = new Date(reserva.fecha_hora_fin);
      
      if (inicio <= now && fin >= now) {
        current = reserva;
        // Calcular tiempo restante
        const diffMs = fin.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        remaining.hours = Math.floor(diffMins / 60);
        remaining.minutes = diffMins % 60;
        
        // Buscar próximo turno después del actual
        const nextIndex = filtered.indexOf(reserva) + 1;
        if (nextIndex < filtered.length) {
          next = filtered[nextIndex];
        }
        break;
      }
    }

    // Si no hay turno actual, buscar el próximo
    if (!current && filtered.length > 0) {
      for (const reserva of filtered) {
        const inicio = new Date(reserva.fecha_hora_inicio);
        if (inicio > now) {
          next = reserva;
          break;
        }
      }
    }

    return { currentTurno: current, nextTurno: next, timeRemaining: remaining };
  }, [reservas, filterStaff, filterServicio, filterEstadoPago, currentTime]);

  // Función para formatear tiempo restante
  const formatTimeRemaining = (hours: number, minutes: number): string => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}min`;
    }
    return 'Finalizando';
  };

  // Renderizar contenido de eventos mejorado
  const renderEventContent = (eventInfo: any) => {
    const start: Date | null = eventInfo.event.start;
    const end: Date | null = eventInfo.event.end;
    const now = new Date();
    const isOngoing = !!start && !!end && start <= now && end >= now;
    
    // Calcular minutos hasta el turno o minutos en curso
    let timeLabel = '';
    if (start) {
      const diffMs = start.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (isOngoing) {
        timeLabel = ' · En curso';
      } else if (diffMins > 0 && diffMins <= 15) {
        timeLabel = ` · En ${diffMins} min`;
      }
    }

    const containerClass = `fullscreen-event-content ${isOngoing ? 'event-ongoing' : 'event-upcoming'}`;
    const estadoPago = eventInfo.event.extendedProps.estado_pago;

    return (
      <div className={containerClass}>
        <div className="event-time">
          {eventInfo.timeText}{timeLabel}
          {estadoPago && (
            <span className={`event-payment-status ${estadoPago === 'Pagado' ? 'paid' : 'pending'}`}>
              {estadoPago === 'Pagado' ? ' ✓' : ' ●'}
            </span>
          )}
        </div>
        <div className="event-title">{eventInfo.event.extendedProps.profesor}</div>
        <div className="event-details">
          <div className="event-student">{eventInfo.event.title.split(' - ')[1]}</div>
          <div className="event-course">{eventInfo.event.title.split(' - ')[0]}</div>
          <div className="event-topic">{eventInfo.event.extendedProps.tema}</div>
          {eventInfo.event.extendedProps.precio && (
            <div className="event-price">${eventInfo.event.extendedProps.precio.toFixed(2)}</div>
          )}
        </div>
      </div>
    );
  };

  // Auto-scroll inteligente mejorado
  useEffect(() => {
    if (!isOpen || !autoScroll || presentationMode) return;

    const scrollToCurrent = () => {
      // Prioridad 1: Turnos en curso
      const ongoingEl = document.querySelector('.fullscreen-calendar-content .fc-list-event .event-ongoing');
      if (ongoingEl) {
        (ongoingEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Prioridad 2: Próximo turno (en los próximos 15 min)
      const upcomingEls = document.querySelectorAll('.fullscreen-calendar-content .fc-list-event .event-upcoming');
      for (const el of Array.from(upcomingEls)) {
        const timeEl = el.querySelector('.event-time');
        if (timeEl?.textContent?.includes('En ')) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      // Prioridad 3: Primer turno futuro
      if (upcomingEls.length > 0) {
        (upcomingEls[0] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Scroll inmediato y luego cada 30 segundos
    const timeout = setTimeout(scrollToCurrent, 500);
    const interval = setInterval(scrollToCurrent, 30000);
    autoScrollIntervalRef.current = interval;

    return () => {
      clearTimeout(timeout);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isOpen, autoScroll, presentationMode, calendarEvents]);

  // Notificar turnos próximos
  useEffect(() => {
    if (!isOpen || presentationMode) return;

    const checkUpcomingTurnos = () => {
      const now = new Date();
      calendarEvents.forEach((event) => {
        const start = event.start ? new Date(event.start) : null;
        if (!start) return;

        const diffMs = start.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // Notificar 5 minutos antes
        if (diffMins === 5) {
          const alumno = event.title.split(' - ')[1];
          addNotification('info', `Turno próximo: ${alumno} en 5 minutos`);
        }
      });
    };

    const interval = setInterval(checkUpcomingTurnos, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, [isOpen, presentationMode, calendarEvents, addNotification]);

  // Handlers
  const handleDatesSet = (_dateInfo: DatesSetArg) => {
    setCalendarTitle('Turnos de Hoy');
  };

  const clearFilters = () => {
    setFilterStaff("");
    setFilterServicio("");
    setFilterEstadoPago("");
  };

  const hasActiveFilters = filterStaff || filterServicio || filterEstadoPago;

  if (!isOpen) return null;

  return (
    <div className="fullscreen-calendar-overlay">
      <div className="fullscreen-calendar-container">
        {/* Header mejorado */}
        <div className="fullscreen-calendar-header">
          <div className="fullscreen-calendar-header-left">
            <h2 className="fullscreen-calendar-title">
              {calendarTitle}
              {hasActiveFilters && <span className="filter-badge">Filtros activos</span>}
            </h2>
          </div>

          <div className="fullscreen-calendar-header-center">
            <div className="header-controls">
              <button
                className={`control-btn ${showMetrics ? 'active' : ''}`}
                onClick={() => setShowMetrics(!showMetrics)}
                title="Métricas"
              >
                📊
              </button>
              <button
                className={`control-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                title="Filtros"
              >
                🔍
              </button>
              <button
                className={`control-btn ${autoScroll ? 'active' : ''}`}
                onClick={() => setAutoScroll(!autoScroll)}
                title="Auto-scroll"
              >
                ↕️
              </button>
              <button
                className={`control-btn ${presentationMode ? 'active' : ''}`}
                onClick={() => setPresentationMode(!presentationMode)}
                title="Modo presentación"
              >
                🖥️
              </button>
              <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {isConnected ? 'En línea' : 'Desconectado'}
              </div>
            </div>
          </div>

          <div className="fullscreen-calendar-header-right">
            <button className="fullscreen-close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Panel de turno actual y próximo */}
        {(currentTurno || nextTurno) && (
          <div className="current-next-panel">
            {currentTurno && (
              <div className="current-turno-card">
                <div className="turno-badge current">TURNO ACTUAL</div>
                <div className="turno-content">
                  <div className="turno-time-section">
                    <div className="turno-time-main">
                      {new Date(currentTurno.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(currentTurno.fecha_hora_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="turno-time-remaining">
                      <span className="time-label">Tiempo restante:</span>
                      <span className="time-value">{formatTimeRemaining(timeRemaining.hours, timeRemaining.minutes)}</span>
                    </div>
                  </div>
                  <div className="turno-details">
                    <div className="turno-client">{currentTurno.nombre_alumno}</div>
                    <div className="turno-service">{currentTurno.curso_nombre}</div>
                    <div className="turno-staff">{currentTurno.profesor_nombre}</div>
                    {currentTurno.tema_nombre && (
                      <div className="turno-topic">{currentTurno.tema_nombre}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {nextTurno && (
              <div className="next-turno-card">
                <div className="turno-badge next">PRÓXIMO TURNO</div>
                <div className="turno-content">
                  <div className="turno-time-section">
                    <div className="turno-time-main">
                      {new Date(nextTurno.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(nextTurno.fecha_hora_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="turno-time-upcoming">
                      {(() => {
                        const now = currentTime;
                        const inicio = new Date(nextTurno.fecha_hora_inicio);
                        const diffMs = inicio.getTime() - now.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMins / 60);
                        const remainingMins = diffMins % 60;
                        if (diffHours > 0) {
                          return `En ${diffHours}h ${remainingMins}min`;
                        } else {
                          return `En ${diffMins}min`;
                        }
                      })()}
                    </div>
                  </div>
                  <div className="turno-details">
                    <div className="turno-client">{nextTurno.nombre_alumno}</div>
                    <div className="turno-service">{nextTurno.curso_nombre}</div>
                    <div className="turno-staff">{nextTurno.profesor_nombre}</div>
                    {nextTurno.tema_nombre && (
                      <div className="turno-topic">{nextTurno.tema_nombre}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel de métricas */}
        {showMetrics && (
          <div className="metrics-panel">
            <div className="metric-item">
              <span className="metric-label">Total Hoy</span>
              <span className="metric-value">{metrics.totalHoy}</span>
            </div>
            <div className="metric-item highlight">
              <span className="metric-label">En Curso</span>
              <span className="metric-value">{metrics.enCurso}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Próximos</span>
              <span className="metric-value">{metrics.proximos}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Completados</span>
              <span className="metric-value">{metrics.completados}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Ingresos Esperados</span>
              <span className="metric-value">${metrics.ingresosEsperados.toFixed(2)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Ingresos Confirmados</span>
              <span className="metric-value success">${metrics.ingresosConfirmados.toFixed(2)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Duración Promedio</span>
              <span className="metric-value">{metrics.tiempoPromedioTurno}h</span>
            </div>
          </div>
        )}

        {/* Panel de filtros */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Staff:</label>
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Servicio:</label>
              <select
                value={filterServicio}
                onChange={(e) => setFilterServicio(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Estado Pago:</label>
              <select
                value={filterEstadoPago}
                onChange={(e) => setFilterEstadoPago(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos</option>
                <option value="Pagado">Pagado</option>
                <option value="Falta pagar">Falta pagar</option>
                <option value="Parcial">Parcial</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Notificaciones */}
        <div className="notifications-container">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification notification-${notif.type}`}
            >
              {notif.message}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className="fullscreen-calendar-content">
          <FullCalendar
            ref={calendarRef}
            plugins={[listPlugin, interactionPlugin]}
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