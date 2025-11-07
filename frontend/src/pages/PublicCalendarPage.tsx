import React, { useState, useEffect } from 'react';
import './PublicCalendarPage.css';
import confetti from 'canvas-confetti';
import apiClient from '../config/api';
import { useTenantConfig } from '../hooks/useTenantConfig';

// Interfaces
interface Colaborador {
    id: number;
    nombre: string;
    email: string;
    especialidades?: string[];
    establecimiento_id?: number;
}

interface Servicio {
    id: number;
    nombre: string;
    descripcion?: string;
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

interface ReservaFormData {
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_email: string;
    cliente_dni: string;
    servicio_descripcion: string;
    precio: string;
    notas: string;
}

const PublicCalendarPage: React.FC = () => {
    const { config: tenantConfig, isLoading: loadingConfig } = useTenantConfig();
    
    // Estados para datos de la API
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estado para colaborador seleccionado
    const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
    
    // Estados para el calendario
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    // Estado para hora seleccionada
    const [selectedHora, setSelectedHora] = useState<string | null>(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
    
    // Estado para el modal de reserva
    const [showReservaModal, setShowReservaModal] = useState(false);
    const [reservaForm, setReservaForm] = useState<ReservaFormData>({
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_email: '',
        cliente_dni: '',
        servicio_descripcion: '',
        precio: '',
        notas: ''
    });
    
    // Estado para el modal de confirmación
    const [showConfirmacion, setShowConfirmacion] = useState(false);
    const [success, setSuccess] = useState(false);

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

    // Obtener colaboradores
    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await apiClient.get('/public/staff');
                const staffData = response.data.data || [];
                setColaboradores(staffData);
                // Seleccionar el primer colaborador por defecto solo si no hay uno seleccionado
                if (staffData.length > 0 && !selectedColaborador) {
                    setSelectedColaborador(staffData[0]);
                }
            } catch (err: any) {
                console.error('Error obteniendo colaboradores:', err);
            }
        };
        fetchColaboradores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Obtener disponibilidad cuando cambia el colaborador o fecha
    useEffect(() => {
        if (!selectedColaborador) return;

        const fetchAvailability = async () => {
            try {
                const hoy = new Date();
                const finSemana = new Date();
                finSemana.setDate(hoy.getDate() + 30); // Próximos 30 días

                const fecha_desde = hoy.toISOString().split('T')[0];
                const fecha_hasta = finSemana.toISOString().split('T')[0];

                const url = `/public/availability?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}&staff_id=${selectedColaborador.id}`;
                const response = await apiClient.get(url);
                setAvailability(response.data.data || []);
            } catch (err: any) {
                console.error('Error obteniendo disponibilidad:', err);
            }
        };

        fetchAvailability();
    }, [selectedColaborador]);

    // Calcular horarios disponibles para la fecha seleccionada
    useEffect(() => {
        if (!selectedDate || !selectedColaborador) {
            setHorariosDisponibles([]);
            return;
        }

        // Generar horarios típicos del día (8:00 AM a 8:00 PM, cada hora)
        const horariosBase: string[] = [];
        for (let hora = 8; hora <= 20; hora++) {
            horariosBase.push(`${hora.toString().padStart(2, '0')}:00`);
        }

        // Filtrar horarios ocupados
        const fechaSeleccionadaStr = selectedDate.toISOString().split('T')[0];
        const horariosOcupados = availability
            .filter(slot => {
                const slotDate = new Date(slot.inicio);
                const slotDateStr = slotDate.toISOString().split('T')[0];
                return slotDateStr === fechaSeleccionadaStr && 
                       slot.colaborador_id === selectedColaborador.id && 
                       slot.ocupado;
            })
            .map(slot => {
                const slotDate = new Date(slot.inicio);
                const horas = slotDate.getHours();
                const minutos = slotDate.getMinutes();
                return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
            });

        // Filtrar horarios pasados si es hoy
        const ahora = new Date();
        const esHoy = selectedDate.toDateString() === ahora.toDateString();
        const horariosDisponiblesFiltrados = horariosBase.filter(hora => {
            // Verificar si está ocupado
            if (horariosOcupados.includes(hora)) return false;
            
            // Si es hoy, verificar que no sea pasado
            if (esHoy) {
                const [h, m] = hora.split(':').map(Number);
                const horaCompleta = new Date();
                horaCompleta.setHours(h, m, 0, 0);
                // Solo mostrar horarios al menos 30 minutos en el futuro
                return horaCompleta.getTime() > ahora.getTime() + 30 * 60 * 1000;
            }
            
            // Si no es hoy, verificar que no sea un día pasado
            const fechaCompleta = new Date(selectedDate);
            const [h, m] = hora.split(':').map(Number);
            fechaCompleta.setHours(h, m, 0, 0);
            return fechaCompleta.getTime() > ahora.getTime();
        });

        setHorariosDisponibles(horariosDisponiblesFiltrados);
    }, [selectedDate, selectedColaborador, availability]);

    // Funciones del calendario
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Días vacíos antes del primer día del mes
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    // Funciones de navegación del calendario
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        setSelectedDate(null);
    };

    const handleDateClick = (day: number) => {
        if (day !== null) {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            newDate.setHours(0, 0, 0, 0);
            
            // No permitir seleccionar días pasados
            if (newDate < hoy) {
                alert('No puedes seleccionar días pasados');
                return;
            }
            
            setSelectedDate(newDate);
            setSelectedHora(null);
        }
    };

    const handleHoraSelect = (hora: string) => {
        setSelectedHora(hora);
        setShowReservaModal(true);
    };

    // Manejar envío del formulario
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!selectedDate || !selectedHora || !selectedColaborador) {
            setError('Por favor, completa todos los campos');
            setLoading(false);
            return;
        }

        if (!reservaForm.cliente_nombre.trim() || !reservaForm.cliente_telefono.trim()) {
            setError('Por favor, completa tu nombre y teléfono');
            setLoading(false);
            return;
        }

        // Construir fecha/hora completa
        const [hora, minuto] = selectedHora.split(':').map(Number);
        const fechaHoraInicio = new Date(selectedDate);
        fechaHoraInicio.setHours(hora, minuto, 0, 0);
        
        const fechaHoraFin = new Date(fechaHoraInicio);
        fechaHoraFin.setHours(fechaHoraFin.getHours() + 1); // Duración de 1 hora por defecto

        // Obtener el primer servicio disponible
        // Si el colaborador tiene establecimiento_id, usar ese, sino el primero disponible
        let establecimientoId: number | null = null;
        
        if (selectedColaborador.establecimiento_id) {
            // Si el colaborador tiene un establecimiento asignado, usar ese
            establecimientoId = selectedColaborador.establecimiento_id;
        } else if (servicios.length > 0) {
            // Si no, usar el primer servicio disponible
            establecimientoId = servicios[0].id;
        }
        
        if (!establecimientoId) {
            setError('No hay servicios disponibles para este profesional');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/public/reservas', {
                fecha_hora_inicio: fechaHoraInicio.toISOString(),
                fecha_hora_fin: fechaHoraFin.toISOString(),
                establecimiento_id: establecimientoId,
                colaborador_id: selectedColaborador.id,
                cliente_nombre: reservaForm.cliente_nombre,
                cliente_telefono: reservaForm.cliente_telefono,
                cliente_email: reservaForm.cliente_email || null,
                cliente_dni: reservaForm.cliente_dni || null,
                servicio_descripcion: reservaForm.servicio_descripcion || null,
                precio: reservaForm.precio ? parseFloat(reservaForm.precio) : null,
                notas: reservaForm.notas || null
            });

            setShowReservaModal(false);
            setShowConfirmacion(true);
            setSuccess(true);
            
            // Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Limpiar formulario
            setReservaForm({
                cliente_nombre: '',
                cliente_telefono: '',
                cliente_email: '',
                cliente_dni: '',
                servicio_descripcion: '',
                precio: '',
                notas: ''
            });
            setSelectedDate(null);
            setSelectedHora(null);

            // Recargar disponibilidad
            const hoy = new Date();
            const finSemana = new Date();
            finSemana.setDate(hoy.getDate() + 30);
            const fecha_desde = hoy.toISOString().split('T')[0];
            const fecha_hasta = finSemana.toISOString().split('T')[0];
            const url = `/public/availability?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}&staff_id=${selectedColaborador.id}`;
            const availResponse = await apiClient.get(url);
            setAvailability(availResponse.data.data || []);

            setTimeout(() => {
                setShowConfirmacion(false);
                setSuccess(false);
            }, 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    const calendarDays = generateCalendarDays();
    const empresaInfo = tenantConfig || {
        display_name: 'WEEKLY',
        cliente_nombre: 'Cliente',
        cliente_direccion: '',
        cliente_telefono: ''
    };

    return (
        <div className="reservas-page">
            <div className="reservas-grid">
                {/* Primera columna: Información de la empresa y colaboradores */}
                <div className="columna-info">
                    <div className="empresa-info">
                        <h1>{empresaInfo.display_name || empresaInfo.cliente_nombre}</h1>
                        {empresaInfo.cliente_direccion && (
                            <div className="contacto">
                                {empresaInfo.cliente_direccion && (
                                    <span>📍 {empresaInfo.cliente_direccion}</span>
                                )}
                                {empresaInfo.cliente_telefono && (
                                    <span>📞 {empresaInfo.cliente_telefono}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profesores-list">
                        <h2>Nuestros Profesionales</h2>
                        {loadingConfig ? (
                            <p style={{ color: '#a0aec0' }}>Cargando...</p>
                        ) : colaboradores.length === 0 ? (
                            <p style={{ color: '#a0aec0' }}>No hay profesionales disponibles</p>
                        ) : (
                            colaboradores.map(colaborador => (
                                <div
                                    key={colaborador.id}
                                    className={`profesor-card ${selectedColaborador?.id === colaborador.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedColaborador(colaborador)}
                                >
                                    <div className="profesor-avatar">
                                        {colaborador.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="profesor-info">
                                        <h3>{colaborador.nombre}</h3>
                                        {colaborador.especialidades && colaborador.especialidades.length > 0 && (
                                            <p>{colaborador.especialidades.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Segunda columna: Calendario */}
                <div className="columna-calendario">
                    <h2>Selecciona una Fecha</h2>
                    <div className="calendario">
                        <div className="calendar-header">
                            <button onClick={handlePrevMonth}>◀</button>
                            <h3>{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                            <button onClick={handleNextMonth}>▶</button>
                        </div>
                        <div className="calendar-weekdays">
                            <div>Do</div>
                            <div>Lu</div>
                            <div>Ma</div>
                            <div>Mi</div>
                            <div>Ju</div>
                            <div>Vi</div>
                            <div>Sa</div>
                        </div>
                        <div className="calendar-days">
                            {calendarDays.map((day, index) => {
                                const dayDate = day !== null ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                                const hoy = new Date();
                                hoy.setHours(0, 0, 0, 0);
                                const isPast = dayDate && dayDate < hoy;
                                
                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${day === null ? 'empty' : ''} ${
                                            selectedDate?.getDate() === day ? 'selected' : ''
                                        } ${isPast ? 'past' : ''}`}
                                        onClick={() => !isPast && day !== null && handleDateClick(day)}
                                        style={isPast ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tercera columna: Horarios disponibles */}
                <div className="columna-horarios">
                    <h2>Horarios Disponibles</h2>
                    {!selectedColaborador ? (
                        <p className="placeholder-text">Selecciona un profesional para ver horarios</p>
                    ) : !selectedDate ? (
                        <p className="placeholder-text">Selecciona una fecha para ver los horarios disponibles</p>
                    ) : horariosDisponibles.length === 0 ? (
                        <p className="placeholder-text">No hay horarios disponibles para esta fecha</p>
                    ) : (
                        <div className="horarios-grid">
                            {horariosDisponibles.map(hora => (
                                <button
                                    key={hora}
                                    className={`hora-btn ${selectedHora === hora ? 'selected' : ''}`}
                                    onClick={() => handleHoraSelect(hora)}
                                >
                                    {hora}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Reserva */}
            {showReservaModal && (
                <div className="modal-overlay" onClick={() => setShowReservaModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Completa tu Reserva</h2>
                            <button
                                type="button"
                                onClick={() => setShowReservaModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#a0aec0',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        {selectedDate && selectedHora && (
                            <p style={{ color: '#a0aec0', marginBottom: '1rem' }}>
                                <strong>Fecha y Hora:</strong> {selectedDate.toLocaleDateString('es-ES')} a las {selectedHora}
                            </p>
                        )}
                        {selectedColaborador && (
                            <p style={{ color: '#a0aec0', marginBottom: '1rem' }}>
                                <strong>Profesional:</strong> {selectedColaborador.nombre}
                            </p>
                        )}
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre completo *</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    value={reservaForm.cliente_nombre}
                                    onChange={e => setReservaForm(prev => ({...prev, cliente_nombre: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefono">Número de teléfono *</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    value={reservaForm.cliente_telefono}
                                    onChange={e => setReservaForm(prev => ({...prev, cliente_telefono: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={reservaForm.cliente_email}
                                    onChange={e => setReservaForm(prev => ({...prev, cliente_email: e.target.value}))}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dni">DNI</label>
                                <input
                                    type="text"
                                    id="dni"
                                    value={reservaForm.cliente_dni}
                                    onChange={e => setReservaForm(prev => ({...prev, cliente_dni: e.target.value}))}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcion">Descripción del servicio</label>
                                <textarea
                                    id="descripcion"
                                    value={reservaForm.servicio_descripcion}
                                    onChange={e => setReservaForm(prev => ({...prev, servicio_descripcion: e.target.value}))}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="notas">Notas adicionales</label>
                                <textarea
                                    id="notas"
                                    value={reservaForm.notas}
                                    onChange={e => setReservaForm(prev => ({...prev, notas: e.target.value}))}
                                    rows={2}
                                />
                            </div>
                            {error && (
                                <div style={{ 
                                    color: '#ef4444', 
                                    padding: '0.75rem', 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    {error}
                                </div>
                            )}
                            <div className="modal-buttons">
                                <button 
                                    type="button" 
                                    onClick={() => setShowReservaModal(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading || !reservaForm.cliente_nombre.trim() || !reservaForm.cliente_telefono.trim()}
                                >
                                    {loading ? 'Creando...' : 'Confirmar Reserva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            {showConfirmacion && (
                <div className="modal-overlay">
                    <div className="modal-content success">
                        <h2>¡Reserva Confirmada! 🎉</h2>
                        <p>Tu reserva ha sido registrada exitosamente</p>
                        <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginTop: '0.5rem' }}>
                            Te hemos enviado la confirmación por email
                        </p>
                        <button onClick={() => {
                            setShowConfirmacion(false);
                            setSelectedDate(null);
                            setSelectedHora(null);
                            setReservaForm({
                                cliente_nombre: '',
                                cliente_telefono: '',
                                cliente_email: '',
                                cliente_dni: '',
                                servicio_descripcion: '',
                                precio: '',
                                notas: ''
                            });
                        }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicCalendarPage;
