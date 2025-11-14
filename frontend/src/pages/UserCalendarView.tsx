import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import apiClient from '../config/api';
import demoApiClient from '../utils/demoApiClient';
import { useAuth } from '../hooks/useAuth';
import './UserCalendarView.css';

interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Staff {
  id: number;
  nombre: string;
  especialidades?: string;
}

interface Reserva {
  id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  establecimiento_nombre: string;
  colaborador_nombre: string;
  estado: string;
  notas?: string;
}

const UserCalendarView: React.FC = () => {
  const { user: _user } = useAuth();
  // Detectar modo demo directamente del hostname (más confiable)
  const hostname = window.location.hostname;
  const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
  const client = isDemoMode ? demoApiClient : apiClient;
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Formulario de reserva
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    cliente_dni: '',
    servicio_descripcion: '',
    precio: '',
    notas: ''
  });

  const calendarRef = useRef<FullCalendar>(null);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showReservaModal) {
        setShowReservaModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showReservaModal]);

  // Obtener servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await client.get('/servicios');
        setServicios(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo servicios:', err);
      }
    };
    fetchServicios();
  }, [client]);

  // Obtener staff cuando se selecciona servicio
  useEffect(() => {
    if (!selectedServicio) {
      setStaff([]);
      return;
    }

    const fetchStaff = async () => {
      try {
        const response = await client.get(`/staff${isDemoMode ? '' : '?establecimiento_id=' + selectedServicio}`);
        setStaff(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo staff:', err);
      }
    };
    fetchStaff();
  }, [selectedServicio, client, isDemoMode]);

  // Obtener reservas propias del usuario
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await client.get('/reservas');
        setReservas(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo reservas:', err);
      }
    };
    fetchReservas();
  }, [client]);

  // Obtener disponibilidad cuando cambian los filtros
  useEffect(() => {
    if (!selectedServicio || !selectedStaff) {
      return;
    }

    const fetchAvailability = async () => {
      try {
        const hoy = new Date();
        const finSemana = new Date();
        finSemana.setDate(hoy.getDate() + 14);

        const fecha_desde = hoy.toISOString().split('T')[0];
        const fecha_hasta = finSemana.toISOString().split('T')[0];

        // Obtener disponibilidad para referencia (las reservas ocupadas se mostrarán automáticamente)
        // Los slots ocupados se manejarán desde el endpoint /public/availability
        await client.get(`/public/availability?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}&servicio_id=${selectedServicio}&staff_id=${selectedStaff}`);
      } catch (err: any) {
        console.error('Error obteniendo disponibilidad:', err);
      }
    };

    fetchAvailability();
  }, [selectedServicio, selectedStaff]);

  // Generar eventos del calendario (reservas propias + disponibilidad)
  const calendarEvents = reservas.map(reserva => ({
    id: `reserva-${reserva.id}`,
    title: `${reserva.establecimiento_nombre} - ${reserva.colaborador_nombre}`,
    start: reserva.fecha_hora_inicio,
    end: reserva.fecha_hora_fin,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#fff',
    extendedProps: {
      reserva: true,
      ...reserva
    }
  }));

  // Manejar selección de fecha/hora para nueva reserva
  const handleDateSelect = (selectInfo: any) => {
    // Obtener fecha/hora actual
    const ahora = new Date();
    const fechaSeleccionada = new Date(selectInfo.start);
    
    // Comparar solo el día (sin hora) para verificar si es un día pasado
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const diaSeleccionado = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate());
    
    // Si el día seleccionado es anterior a hoy, rechazar
    if (diaSeleccionado.getTime() < hoy.getTime()) {
      alert('No puedes agendar citas en días pasados. Por favor, selecciona un día actual o futuro.');
      return;
    }
    
    // Si es el mismo día, verificar que la hora sea futura (con margen de 30 minutos)
    if (diaSeleccionado.getTime() === hoy.getTime()) {
      const minutosDiferencia = (fechaSeleccionada.getTime() - ahora.getTime()) / (1000 * 60);
      
      // Permitir solo si la hora es al menos 30 minutos en el futuro
      if (minutosDiferencia < -30) {
        alert('No puedes agendar citas en horarios pasados. Por favor, selecciona un horario al menos 30 minutos en el futuro.');
        return;
      }
    }

    // Si no hay servicio o staff seleccionado, abrir modal para seleccionarlos
    // Ya no rechazamos el click, simplemente abrimos el modal
    if (!selectedServicio || !selectedStaff) {
      setSelectedTime(selectInfo.start);
      setShowReservaModal(true);
      return;
    }

    // Si hay servicio y staff seleccionados, verificar conflictos
    const conflicto = reservas.some(r => {
      const inicio = new Date(r.fecha_hora_inicio);
      const fin = new Date(r.fecha_hora_fin);
      return (selectInfo.start >= inicio && selectInfo.start < fin) ||
             (selectInfo.end > inicio && selectInfo.end <= fin);
    });

    if (conflicto) {
      alert('Tienes una reserva en este horario. Por favor, selecciona otro.');
      return;
    }

    setSelectedTime(selectInfo.start);
    setShowReservaModal(true);
  };

  // Manejar envío del formulario de reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!selectedTime || !selectedServicio || !selectedStaff) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    // Calcular fecha fin (asumir 1 hora de duración por defecto)
    const fechaFin = new Date(selectedTime);
    fechaFin.setHours(fechaFin.getHours() + 1);

    // En modo demo, mostrar mensaje informativo (no se pueden crear reservas reales)
    if (isDemoMode) {
      setError('En modo demo no se pueden crear reservas reales. Esta es solo una demostración.');
      setLoading(false);
      return;
    }

    try {
      const servicioNombre = servicios.find(s => s.id === selectedServicio)?.nombre || '';
      await client.post('/reservas', {
        fecha_hora_inicio: selectedTime.toISOString(),
        fecha_hora_fin: fechaFin.toISOString(),
        establecimiento_id: selectedServicio,
        colaborador_id: selectedStaff,
        cliente_nombre: formData.cliente_nombre,
        cliente_telefono: formData.cliente_telefono,
        cliente_email: formData.cliente_email || null,
        cliente_dni: formData.cliente_dni || null,
        servicio_descripcion: servicioNombre || formData.servicio_descripcion || null,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        notas: formData.notas || null
      });

      setSuccess(true);
      setShowReservaModal(false);
      
      // Limpiar formulario
      setFormData({
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_email: '',
        cliente_dni: '',
        servicio_descripcion: '',
        precio: '',
        notas: ''
      });

      // Recargar reservas
      const response = await client.get('/reservas');
      setReservas(response.data.data || []);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Variables para mostrar en el modal (si es necesario)
  // const servicioNombre = servicios.find(s => s.id === selectedServicio)?.nombre || '';
  // const staffNombre = staff.find(s => s.id === selectedStaff)?.nombre || '';

  return (
    <div className="user-calendar-view">
      <header className="user-calendar-header">
        <h1>Mi Calendario de Reservas</h1>
        <p>Gestiona tus citas y agenda nuevas reservas</p>
      </header>

      {success && (
        <div className="success-message">
          ✅ ¡Reserva creada exitosamente!
        </div>
      )}

      <div className="user-calendar-filters">
        <div className="filter-group">
          <label>Servicio:</label>
          <select
            value={selectedServicio || ''}
            onChange={(e) => {
              setSelectedServicio(e.target.value ? parseInt(e.target.value) : null);
              setSelectedStaff(null);
            }}
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {selectedServicio && (
          <div className="filter-group">
            <label>Profesional:</label>
            <select
              value={selectedStaff || ''}
              onChange={(e) => setSelectedStaff(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Selecciona un profesional</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="user-calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={calendarEvents}
          selectable={true}
          select={handleDateSelect}
          dayMaxEvents={true}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          views={{
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' }
            },
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
            },
            timeGridDay: {
              titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
            }
          }}
          height="auto"
          editable={false}
          eventClick={(clickInfo) => {
            const reserva = clickInfo.event.extendedProps;
            alert(`Reserva: ${reserva.establecimiento_nombre}\nProfesional: ${reserva.colaborador_nombre}\nCliente: ${reserva.cliente_nombre}\nEstado: ${reserva.estado}`);
          }}
        />
      </div>

      {/* Modal de nueva reserva */}
      {showReservaModal && (
        <div className="modal-overlay" onClick={() => setShowReservaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva Reserva</h2>
            <p><strong>Fecha/Hora:</strong> {selectedTime?.toLocaleString('es-ES')}</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Servicio *</label>
                <select
                  required
                  value={selectedServicio || ''}
                  onChange={(e) => {
                    setSelectedServicio(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedStaff(null);
                  }}
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              {selectedServicio && (
                <div className="form-group">
                  <label>Profesional *</label>
                  <select
                    required
                    value={selectedStaff || ''}
                    onChange={(e) => setSelectedStaff(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">Selecciona un profesional</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Nombre del Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={formData.cliente_telefono}
                  onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                  required
                  placeholder="Ej: +51 987 654 321"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="form-group">
                <label>DNI</label>
                <input
                  type="text"
                  value={formData.cliente_dni}
                  onChange={(e) => setFormData({...formData, cliente_dni: e.target.value})}
                  placeholder="Ej: 12345678"
                />
              </div>

              <div className="form-group">
                <label>Notas adicionales</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  rows={3}
                  placeholder="Información adicional sobre la reserva..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowReservaModal(false)} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCalendarView;

