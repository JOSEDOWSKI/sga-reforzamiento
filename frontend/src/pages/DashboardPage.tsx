import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '../config/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar el localizador para español
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
        'es': es,
    },
});

interface Reserva {
    id: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    nombre_alumno: string;
    curso_nombre: string;
    profesor_nombre: string;
    tema_nombre: string;
}

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

interface ModalReserva {
    isOpen: boolean;
    selectedTime: Date | null;
}

const DashboardPage: React.FC = () => {
    // --- Estados para los datos ---
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [temas, setTemas] = useState<Tema[]>([]);
    const [profesores, setProfesores] = useState<Profesor[]>([]);

    // --- Estados para el filtro ---
    const [filtroCurso, setFiltroCurso] = useState('');

    // --- Estados para el calendario ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('week');

    // --- Estado para la reserva seleccionada ---
    const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);

    // --- Estados para el modal ---
    const [modalReserva, setModalReserva] = useState<ModalReserva>({
        isOpen: false,
        selectedTime: null
    });

    // --- Estados para el formulario del modal ---
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedTema, setSelectedTema] = useState('');
    const [selectedProfesor, setSelectedProfesor] = useState('');
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [telefonoAlumno, setTelefonoAlumno] = useState('');
    const [duracionHoras, setDuracionHoras] = useState('1'); // Duración por defecto: 1 hora

    // --- Estados de Carga y Error ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchAllData = async () => {
        try {
            const [cursosRes, profesRes, reservasRes, temasRes] = await Promise.all([
                apiClient.get('/cursos'),
                apiClient.get('/profesores'),
                apiClient.get('/reservas'),
                apiClient.get('/temas'),
            ]);
            setCursos(cursosRes.data.data);
            setProfesores(profesRes.data.data);
            setReservas(reservasRes.data.data);
            setTemas(temasRes.data.data);
            setError('');
        } catch (err) {
            setError('Error al cargar datos iniciales.');
            console.error(err);
        }
    };

    // --- Cargar datos iniciales ---
    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Filtrar temas según el curso seleccionado ---
    const temasFiltrados = selectedCurso 
        ? temas.filter(tema => tema.curso_id === parseInt(selectedCurso))
        : [];

    // --- Manejar clic en el calendario ---
    const handleSelectSlot = (slotInfo: any) => {
        setModalReserva({
            isOpen: true,
            selectedTime: slotInfo.start
        });
        // Limpiar formulario
        setSelectedCurso('');
        setSelectedTema('');
        setSelectedProfesor('');
        setNombreAlumno('');
        setTelefonoAlumno('');
        setDuracionHoras('1'); // Resetear duración a 1 hora
    };

    // --- Manejar clic en evento existente ---
    const handleSelectEvent = (event: any) => {
        setReservaSeleccionada(event.resource);
    };

    // --- Cerrar modal ---
    const closeModal = () => {
        setModalReserva({ isOpen: false, selectedTime: null });
        setError('');
        setSuccess('');
    };

    // --- Manejar navegación del calendario ---
    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
        console.log('Navegando a:', newDate);
        // Mostrar feedback temporal
        setSuccess(`Navegando a ${newDate.toLocaleDateString('es-ES')}`);
        setTimeout(() => setSuccess(''), 2000);
    };

    // --- Manejar cambio de vista del calendario ---
    const handleViewChange = (newView: string) => {
        setCurrentView(newView);
        console.log('Cambiando vista a:', newView);
        // Mostrar feedback temporal
        const viewNames = {
            'month': 'Mes',
            'week': 'Semana',
            'day': 'Día'
        };
        setSuccess(`Vista cambiada a ${viewNames[newView as keyof typeof viewNames]}`);
        setTimeout(() => setSuccess(''), 2000);
    };

    // --- Crear reserva desde el modal ---
    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalReserva.selectedTime) {
            setError('No se ha seleccionado una fecha y hora.');
            return;
        }

        // Validaciones del formulario
        if (!selectedCurso || !selectedTema || !selectedProfesor || !nombreAlumno.trim()) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        // Validar duración
        const duracion = parseFloat(duracionHoras);
        if (duracion <= 0 || duracion > 6) {
            setError('La duración debe estar entre 30 minutos y 6 horas.');
            return;
        }

        // Validar que la fecha no sea en el pasado
        const fechaInicio = new Date(modalReserva.selectedTime);
        const ahora = new Date();
        if (fechaInicio < ahora) {
            setError('No puedes crear reservas en el pasado.');
            return;
        }

        setError('');
        setSuccess('');
        
        try {
            const fechaFin = new Date(fechaInicio.getTime() + duracion * 60 * 60 * 1000);

            const bookingData = {
                curso_id: parseInt(selectedCurso),
                tema_id: parseInt(selectedTema),
                profesor_id: parseInt(selectedProfesor),
                nombre_alumno: nombreAlumno.trim(),
                fecha_hora_inicio: fechaInicio.toISOString(),
                fecha_hora_fin: fechaFin.toISOString(),
            };
            
            await apiClient.post('/reservas', bookingData);
            
            // Refrescar datos
            fetchAllData();
            
            // Cerrar modal y limpiar formulario
            closeModal();
            setSuccess(`¡Reserva creada con éxito! Clase de ${duracion === 0.5 ? '30 minutos' : duracion === 1 ? '1 hora' : `${duracion} horas`}`);

        } catch (err: any) {
            setError(err.response?.data?.error || 'No se pudo crear la reserva. Verifica que el horario esté disponible.');
            console.error(err);
        }
    };
    
    // --- Filtrar reservas según el curso seleccionado para el calendario ---
    const reservasFiltradas = filtroCurso 
        ? reservas.filter(r => r.curso_nombre === cursos.find(c => c.id === parseInt(filtroCurso))?.nombre)
        : reservas;
    
    // --- Formatear eventos para el calendario ---
    const calendarEvents = reservasFiltradas.map(reserva => {
        const start = new Date(reserva.fecha_hora_inicio);
        const end = new Date(reserva.fecha_hora_fin);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        // Determinar la clase CSS basada en la duración
        let durationClass = 'reserva-event';
        if (durationHours < 1) {
            durationClass += ' short-duration';
        } else if (durationHours > 1.5) {
            durationClass += ' long-duration';
        }
        
        // Formatear la duración para mostrar
        const durationText = durationHours === 0.5 ? '30min' : 
                           durationHours === 1 ? '1h' : 
                           durationHours === 1.5 ? '1.5h' : 
                           durationHours === 2 ? '2h' : 
                           durationHours === 2.5 ? '2.5h' : 
                           durationHours === 3 ? '3h' : 
                           `${durationHours}h`;
        
        return {
            id: reserva.id,
            title: `${reserva.nombre_alumno} - ${reserva.curso_nombre} (${durationText})`,
            start: start,
            end: end,
            resource: reserva,
            className: durationClass
        };
    });

    return (
        <div className="container">
            <div className="card fade-in">
                <div className="card-header">
                    <h2 className="card-title">🗓️ Dashboard - Calendario de Reforzamiento</h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {/* Filtros */}
                <div className="filters-section">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label htmlFor="filtroCurso">Filtrar por Curso:</label>
                            <select
                                id="filtroCurso"
                                className="form-control"
                                value={filtroCurso}
                                onChange={(e) => setFiltroCurso(e.target.value)}
                            >
                                <option value="">Todos los cursos</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Calendario */}
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    views={['month', 'week', 'day']}
                    view={currentView as any}
                    date={currentDate}
                    onNavigate={handleNavigate}
                    onView={handleViewChange}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    step={30}
                    timeslots={2}
                    min={new Date(0, 0, 0, 7, 0, 0)} // 7:00 AM
                    max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
                    popup
                    messages={{
                        next: "Siguiente",
                        previous: "Anterior",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        noEventsInRange: "No hay eventos en este rango.",
                        showMore: total => `+ Ver ${total} más`,
                        date: "Fecha",
                        time: "Hora",
                        event: "Evento"
                    }}
                    components={{
                        event: (props: any) => (
                            <div 
                                className={props.className || ''}
                                title={`${props.title}\nHaz clic para ver detalles`}
                                style={{ cursor: 'pointer' }}
                            >
                                {props.title}
                            </div>
                        )
                    }}
                />
            </div>

            {/* Sidebar de visualización de reserva */}
            {reservaSeleccionada && (
                <div className="reserva-sidebar-overlay" onClick={() => setReservaSeleccionada(null)}>
                    <div className="reserva-sidebar" onClick={e => e.stopPropagation()}>
                        <div className="reserva-sidebar-header">
                            <h2>📄 Detalles de la Reserva</h2>
                            <button className="close-button" onClick={() => setReservaSeleccionada(null)}>
                                ×
                            </button>
                        </div>
                        <div className="reserva-sidebar-details">
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">👤 Alumno:</span>
                                <span className="reserva-sidebar-value">{reservaSeleccionada.nombre_alumno}</span>
                            </div>
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">📚 Curso:</span>
                                <span className="reserva-sidebar-value">{reservaSeleccionada.curso_nombre}</span>
                            </div>
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">📝 Tema:</span>
                                <span className="reserva-sidebar-value">{reservaSeleccionada.tema_nombre}</span>
                            </div>
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">👨‍🏫 Profesor:</span>
                                <span className="reserva-sidebar-value">{reservaSeleccionada.profesor_nombre}</span>
                            </div>
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">⏰ Inicio:</span>
                                <span className="reserva-sidebar-value">{new Date(reservaSeleccionada.fecha_hora_inicio).toLocaleString('es-ES')}</span>
                            </div>
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">⏰ Fin:</span>
                                <span className="reserva-sidebar-value">{new Date(reservaSeleccionada.fecha_hora_fin).toLocaleString('es-ES')}</span>
                            </div>
                            <div className="reserva-sidebar-row">
                                <span className="reserva-sidebar-label">⏱️ Duración:</span>
                                <span className="reserva-sidebar-value">{
                                    (() => {
                                        const start = new Date(reservaSeleccionada.fecha_hora_inicio);
                                        const end = new Date(reservaSeleccionada.fecha_hora_fin);
                                        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                        if (duration === 0.5) return '30 minutos';
                                        if (duration === 1) return '1 hora';
                                        if (duration === 1.5) return '1 hora y 30 minutos';
                                        if (duration % 1 === 0) return `${duration} horas`;
                                        return `${duration} horas`;
                                    })()
                                }</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reserva */}
            {modalReserva.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📅 Nueva Reserva de Reforzamiento</h2>
                            <button className="close-button" onClick={closeModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleBooking}>
                            <div className="form-group">
                                <label>Curso:</label>
                                <select 
                                    className="form-control"
                                    value={selectedCurso} 
                                    onChange={e => setSelectedCurso(e.target.value)} 
                                    required
                                >
                                    <option value="">Selecciona un curso</option>
                                    {cursos.map(curso => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tema:</label>
                                <select 
                                    className="form-control"
                                    value={selectedTema} 
                                    onChange={e => setSelectedTema(e.target.value)} 
                                    required
                                    disabled={!selectedCurso}
                                >
                                    <option value="">Selecciona un tema</option>
                                    {temasFiltrados.map(tema => (
                                        <option key={tema.id} value={tema.id}>
                                            {tema.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Profesor:</label>
                                <select 
                                    className="form-control"
                                    value={selectedProfesor} 
                                    onChange={e => setSelectedProfesor(e.target.value)} 
                                    required
                                >
                                    <option value="">Selecciona un profesor</option>
                                    {profesores.map(profesor => (
                                        <option key={profesor.id} value={profesor.id}>
                                            {profesor.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nombre del Alumno:</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={nombreAlumno} 
                                    onChange={e => setNombreAlumno(e.target.value)} 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Duración de la Clase:</label>
                                <select 
                                    className="form-control"
                                    value={duracionHoras} 
                                    onChange={e => setDuracionHoras(e.target.value)} 
                                    required
                                >
                                    <option value="0.5">30 minutos</option>
                                    <option value="1">1 hora</option>
                                    <option value="1.5">1 hora y 30 minutos</option>
                                    <option value="2">2 horas</option>
                                    <option value="2.5">2 horas y 30 minutos</option>
                                    <option value="3">3 horas</option>
                                </select>
                                {modalReserva.selectedTime && (
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                        <strong>Horario:</strong> {new Date(modalReserva.selectedTime).toLocaleString('es-ES', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} - {new Date(new Date(modalReserva.selectedTime).getTime() + parseFloat(duracionHoras) * 60 * 60 * 1000).toLocaleTimeString('es-ES', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label>Teléfono del Alumno (Opcional):</label>
                                <input 
                                    type="tel" 
                                    className="form-control"
                                    value={telefonoAlumno} 
                                    onChange={e => setTelefonoAlumno(e.target.value)} 
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    ✅ Confirmar Reserva
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    ❌ Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage; 