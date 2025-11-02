import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import './PublicCalendarPage.css';
import apiClient from '../config/api';

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

interface AvailabilitySlot {
  id: number;
  inicio: string;
  fin: string;
  establecimiento_id: number;
  establecimiento_nombre: string;
  colaborador_id: number;
  colaborador_nombre: string;
  ocupado: boolean;
}


const PublicCalendarPage: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showReservaModal) {
        setShowReservaModal(false);
        setSelectedServicio(null);
        setSelectedStaff(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showReservaModal]);

  // Obtener servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await apiClient.get('/public/servicios');
        setServicios(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo servicios:', err);
      }
    };
    fetchServicios();
  }, []);

  // Cargar staff completo al inicio
  useEffect(() => {
    const fetchAllStaff = async () => {
      try {
        const response = await apiClient.get('/public/staff');
        setStaff(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo staff:', err);
      }
    };
    fetchAllStaff();
  }, []);

  // Obtener disponibilidad general (sin filtros)
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const hoy = new Date();
        const finSemana = new Date();
        finSemana.setDate(hoy.getDate() + 14); // Próximos 14 días

        const fecha_desde = hoy.toISOString().split('T')[0];
        const fecha_hasta = finSemana.toISOString().split('T')[0];

        const url = `/public/availability?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`;
        const response = await apiClient.get(url);
        setAvailability(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo disponibilidad:', err);
      }
    };

    fetchAvailability();
  }, []);

  // Generar eventos del calendario
  const calendarEvents = availability.map(slot => ({
    id: slot.id.toString(),
    title: slot.ocupado ? 'Ocupado' : 'Disponible',
    start: slot.inicio,
    end: slot.fin,
    backgroundColor: slot.ocupado ? '#ef4444' : '#10b981',
    borderColor: slot.ocupado ? '#dc2626' : '#059669',
    textColor: '#fff',
    display: 'block',
    extendedProps: {
      ocupado: slot.ocupado,
      establecimiento_id: slot.establecimiento_id,
      colaborador_id: slot.colaborador_id
    }
  }));

  // Manejar selección de fecha/hora
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
    
    // Si llegamos aquí, el día es hoy o futuro, y si es hoy la hora es válida

    // Verificar si está ocupado
    const isOcupado = availability.some(
      slot => new Date(slot.inicio) <= selectInfo.start && 
              new Date(slot.fin) > selectInfo.start &&
              slot.ocupado
    );

    if (isOcupado) {
      alert('Este horario ya está ocupado. Por favor, selecciona otro.');
      return;
    }

    // Permitir seleccionar sin servicio/staff previo
    setSelectedTime(selectInfo.start);
    setShowReservaModal(true);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!selectedTime || !selectedServicio || !selectedStaff) {
      setError('Por favor, selecciona un servicio y un profesional');
      setLoading(false);
      return;
    }

    if (!formData.cliente_nombre.trim() || !formData.cliente_telefono.trim()) {
      setError('Por favor, completa tu nombre y teléfono');
      setLoading(false);
      return;
    }

    // Calcular fecha fin (asumir 1 hora de duración por defecto)
    const fechaFin = new Date(selectedTime);
    fechaFin.setHours(fechaFin.getHours() + 1);

    try {
      await apiClient.post('/public/reservas', {
        fecha_hora_inicio: selectedTime.toISOString(),
        fecha_hora_fin: fechaFin.toISOString(),
        establecimiento_id: selectedServicio,
        colaborador_id: selectedStaff,
        cliente_nombre: formData.cliente_nombre,
        cliente_telefono: formData.cliente_telefono,
        cliente_email: formData.cliente_email || null,
        cliente_dni: formData.cliente_dni || null,
        servicio_descripcion: formData.servicio_descripcion || null,
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
      setSelectedServicio(null);
      setSelectedStaff(null);

      // Recargar disponibilidad general
      const hoy = new Date();
      const finSemana = new Date();
      finSemana.setDate(hoy.getDate() + 14);
      const fecha_desde = hoy.toISOString().split('T')[0];
      const fecha_hasta = finSemana.toISOString().split('T')[0];
      const url = `/public/availability?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`;
      const availResponse = await apiClient.get(url);
      setAvailability(availResponse.data.data || []);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-calendar-page">
      <header className="public-calendar-header">
        <h1>Agenda tu Cita</h1>
        <p>Selecciona un horario disponible en el calendario para agendar tu cita</p>
      </header>

      {success && (
        <div className="success-message">
          ✅ ¡Reserva creada exitosamente! Te hemos enviado la confirmación.
        </div>
      )}

      {/* Calendario visible siempre */}
      <div className="public-calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={calendarEvents}
          selectable={true}
          select={handleDateSelect}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          height="auto"
          editable={false}
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
          eventClick={(clickInfo) => {
            if (clickInfo.event.extendedProps.ocupado) {
              alert('Este horario está ocupado. Por favor, selecciona otro.');
            }
          }}
        />
      </div>

      {/* Modal de Reserva */}
      {showReservaModal && (
        <div className="modal-overlay" onClick={() => {
          setShowReservaModal(false);
          setSelectedServicio(null);
          setSelectedStaff(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Agendar Cita</h2>
              <button
                type="button"
                onClick={() => {
                  setShowReservaModal(false);
                  setSelectedServicio(null);
                  setSelectedStaff(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827';
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.background = 'none';
                }}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <p><strong>Fecha y Hora Seleccionada:</strong> {selectedTime?.toLocaleString('es-PE')}</p>

            <form onSubmit={handleSubmit}>
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
                <label>Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={formData.cliente_telefono}
                  onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>DNI</label>
                <input
                  type="text"
                  value={formData.cliente_dni}
                  onChange={(e) => setFormData({...formData, cliente_dni: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Descripción del servicio</label>
                <textarea
                  value={formData.servicio_descripcion}
                  onChange={(e) => setFormData({...formData, servicio_descripcion: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Notas adicionales</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  rows={2}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="submit" disabled={loading || !selectedServicio || !selectedStaff} className="btn-primary">
                  {loading ? 'Creando...' : 'Confirmar Reserva'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReservaModal(false);
                    setSelectedServicio(null);
                    setSelectedStaff(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCalendarPage;

