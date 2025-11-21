import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import { useMarketplaceProfile } from '../hooks/useMarketplaceProfile';
import { useAuth } from '../hooks/useAuth';
import { analytics } from '../utils/analytics';
import './MarketplaceBookingPage.css';

interface Colaborador {
  id: number;
  nombre: string;
  email: string;
  especialidades?: string[];
  establecimiento_id?: number;
  avatar?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
}

interface AvailabilitySlot {
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  disponible: boolean;
  colaborador_id: number;
  colaborador_nombre: string;
}

const MarketplaceBookingPage: React.FC = () => {
  const params = useParams<{ ciudad?: string; categoria?: string; id?: string }>();
  const navigate = useNavigate();
  const { profile, saveProfile } = useMarketplaceProfile();
  const { user, isLoading: authLoading } = useAuth();
  
  // Extraer ID del servicio
  const idParam = params.id || '';
  const serviceId = idParam.split('-')[0];
  
  // Estados
  const [service, setService] = useState<any>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Cargar datos del servicio
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/public/tenants/${serviceId}`);
        const tenant = response.data.data || response.data;
        
        setService({
          id: tenant.id,
          nombre: tenant.name || tenant.display_name || tenant.cliente_nombre,
          descripcion: tenant.cliente_direccion || 'Servicio disponible',
          precio: tenant.precio || 0,
          imagenes: tenant.imagenes || [],
          tenant_name: tenant.tenant_name,
        });
        
        // Configurar header X-Tenant para las siguientes requests
        if (apiClient.defaults && tenant.tenant_name) {
          apiClient.defaults.headers.common['X-Tenant'] = tenant.tenant_name;
        }
      } catch (err: any) {
        console.error('Error cargando servicio:', err);
        setError('No se pudo cargar la información del servicio');
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);
  
  // Cargar servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await apiClient.get('/public/servicios');
        setServicios(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          setSelectedServicio(response.data.data[0]);
        }
      } catch (err: any) {
        console.error('Error obteniendo servicios:', err);
      }
    };
    
    if (service?.tenant_name) {
      fetchServicios();
    }
  }, [service]);
  
  // Cargar colaboradores
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const url = selectedServicio
          ? `/public/staff?servicio_id=${selectedServicio.id}`
          : '/public/staff';
        const response = await apiClient.get(url);
        const staffData = response.data.data || [];
        setColaboradores(staffData);
        if (staffData.length > 0 && !selectedColaborador) {
          setSelectedColaborador(staffData[0]);
        }
      } catch (err: any) {
        console.error('Error obteniendo colaboradores:', err);
      }
    };
    
    if (service?.tenant_name) {
      fetchColaboradores();
    }
  }, [service, selectedServicio]);
  
  // Cargar disponibilidad
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedColaborador || !selectedDate) return;
      
      try {
        const fecha_desde = new Date(selectedDate);
        fecha_desde.setHours(0, 0, 0, 0);
        const fecha_hasta = new Date(selectedDate);
        fecha_hasta.setHours(23, 59, 59, 999);
        
        const url = `/public/availability?fecha_desde=${fecha_desde.toISOString()}&fecha_hasta=${fecha_hasta.toISOString()}&staff_id=${selectedColaborador.id}`;
        const response = await apiClient.get(url);
        setAvailability(response.data.data || []);
      } catch (err: any) {
        console.error('Error obteniendo disponibilidad:', err);
        setAvailability([]);
      }
    };
    
    fetchAvailability();
  }, [selectedColaborador, selectedDate]);
  
  // Obtener horarios disponibles para la fecha seleccionada
  const getAvailableTimes = () => {
    if (!selectedDate || !selectedColaborador) return [];
    
    const dayAvailability = availability.filter(slot => {
      const slotDate = new Date(slot.fecha_hora_inicio);
      return slotDate.toDateString() === selectedDate.toDateString() &&
             slot.disponible &&
             slot.colaborador_id === selectedColaborador.id;
    });
    
    return dayAvailability.map(slot => {
      const date = new Date(slot.fecha_hora_inicio);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
  };
  
  const handleConfirmBooking = () => {
    // Verificar que todo esté seleccionado
    if (!selectedColaborador || !selectedDate || !selectedTime) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    // Si no está logueado, mostrar modal de login
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Si está logueado, mostrar modal de pago
    setShowPaymentModal(true);
  };
  
  const handlePayment = async () => {
    // Aquí iría la lógica de pago
    // Por ahora, crear la reserva directamente
    try {
      const [hora, minuto] = selectedTime!.split(':').map(Number);
      const fechaHoraInicio = new Date(selectedDate!);
      fechaHoraInicio.setHours(hora, minuto, 0, 0);
      
      const fechaHoraFin = new Date(fechaHoraInicio);
      fechaHoraFin.setHours(fechaHoraFin.getHours() + 1);
      
      const establecimientoId = selectedServicio?.id || service?.id;
      
      await apiClient.post('/reservas', {
        fecha_hora_inicio: fechaHoraInicio.toISOString(),
        fecha_hora_fin: fechaHoraFin.toISOString(),
        establecimiento_id: establecimientoId,
        colaborador_id: selectedColaborador!.id,
        cliente_nombre: profile?.nombre || user?.nombre || '',
        cliente_telefono: profile?.telefono || user?.telefono || '',
        cliente_email: profile?.email || user?.email || '',
        cliente_dni: profile?.dni || '',
        servicio_descripcion: selectedServicio?.nombre || '',
        precio: service?.precio || 0,
        notas: ''
      });
      
      analytics.completeBooking(service?.id, service?.nombre, service?.categoria);
      
      // Redirigir a página de confirmación
      navigate(`/${params.ciudad}/${params.categoria}/${params.id}/confirmacion`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la reserva');
    }
  };
  
  if (loading) {
    return <div className="marketplace-booking-loading">Cargando...</div>;
  }
  
  if (error && !service) {
    return <div className="marketplace-booking-error">{error}</div>;
  }
  
  const availableTimes = getAvailableTimes();
  
  return (
    <div className="marketplace-booking-page">
      {/* Header con botón de volver */}
      <div className="booking-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="booking-title">Reservar en {service?.nombre}</h1>
      </div>
      
      {/* Galería de fotos */}
      {service?.imagenes && service.imagenes.length > 0 && (
        <div className="booking-gallery">
          {service.imagenes.map((img: string, index: number) => (
            <img key={index} src={img} alt={`${service.nombre} ${index + 1}`} />
          ))}
        </div>
      )}
      
      {/* Selección de servicio (si hay múltiples) */}
      {servicios.length > 1 && (
        <div className="booking-section">
          <h2 className="section-title">Selecciona un servicio</h2>
          <div className="servicios-grid">
            {servicios.map(serv => (
              <button
                key={serv.id}
                className={`servicio-btn ${selectedServicio?.id === serv.id ? 'active' : ''}`}
                onClick={() => setSelectedServicio(serv)}
              >
                {serv.nombre}
                {serv.precio && <span className="precio">S/ {serv.precio}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Selección de profesional */}
      <div className="booking-section">
        <h2 className="section-title">Elige tu profesional</h2>
        <div className="colaboradores-grid">
          {colaboradores.map(colaborador => (
            <button
              key={colaborador.id}
              className={`colaborador-card ${selectedColaborador?.id === colaborador.id ? 'selected' : ''}`}
              onClick={() => setSelectedColaborador(colaborador)}
            >
              <div className="colaborador-avatar">
                {colaborador.avatar ? (
                  <img src={colaborador.avatar} alt={colaborador.nombre} />
                ) : (
                  <span>{colaborador.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="colaborador-info">
                <h3>{colaborador.nombre}</h3>
                {colaborador.especialidades && colaborador.especialidades.length > 0 && (
                  <p>{colaborador.especialidades.join(', ')}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Selección de fecha */}
      <div className="booking-section">
        <h2 className="section-title">Elige la fecha</h2>
        <input
          type="date"
          className="date-input"
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      
      {/* Selección de hora */}
      {selectedDate && (
        <div className="booking-section">
          <h2 className="section-title">Elige la hora</h2>
          {availableTimes.length === 0 ? (
            <p className="no-times">No hay horarios disponibles para esta fecha</p>
          ) : (
            <div className="times-grid">
              {availableTimes.map(time => (
                <button
                  key={time}
                  className={`time-btn ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Botón de confirmar */}
      <div className="booking-footer">
        <div className="booking-summary">
          <p className="summary-item">
            <span>Profesional:</span>
            <strong>{selectedColaborador?.nombre || 'No seleccionado'}</strong>
          </p>
          <p className="summary-item">
            <span>Fecha:</span>
            <strong>{selectedDate ? selectedDate.toLocaleDateString('es-PE') : 'No seleccionada'}</strong>
          </p>
          <p className="summary-item">
            <span>Hora:</span>
            <strong>{selectedTime || 'No seleccionada'}</strong>
          </p>
          <p className="summary-item total">
            <span>Total:</span>
            <strong>S/ {service?.precio || 0}</strong>
          </p>
        </div>
        <button
          className="confirm-button"
          onClick={handleConfirmBooking}
          disabled={!selectedColaborador || !selectedDate || !selectedTime}
        >
          {user ? 'Continuar al pago' : 'Iniciar sesión para reservar'}
        </button>
      </div>
      
      {/* Modal de login */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Inicia sesión para continuar</h2>
            <p>Necesitas iniciar sesión para completar tu reserva</p>
            <div className="modal-buttons">
              <button
                className="btn-primary"
                onClick={() => {
                  // Guardar datos de la reserva en localStorage
                  localStorage.setItem('pendingBooking', JSON.stringify({
                    colaborador: selectedColaborador,
                    fecha: selectedDate,
                    hora: selectedTime,
                    servicio: selectedServicio
                  }));
                  navigate('/login');
                }}
              >
                Iniciar sesión
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowLoginModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmar pago</h2>
            <div className="payment-summary">
              <p>Total a pagar: <strong>S/ {service?.precio || 0}</strong></p>
            </div>
            <div className="modal-buttons">
              <button
                className="btn-primary"
                onClick={handlePayment}
              >
                Pagar y confirmar
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceBookingPage;

