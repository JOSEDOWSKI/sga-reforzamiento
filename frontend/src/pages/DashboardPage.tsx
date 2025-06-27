import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../config/api';
import './DashboardPage.css';

// --- Imports para FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import { ViewApi, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

// --- Definición de Tipos ---
interface Curso { id: number; nombre: string; }
interface Tema { id: number; nombre: string; }
interface Profesor { id: number; nombre: string; }
interface Reserva {
    id: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    nombre_alumno: string;
    curso_nombre: string;
    profesor_nombre: string;
    tema_nombre: string;
}

const DashboardPage: React.FC = () => {
    // --- Estados para los datos de los desplegables ---
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [temas, setTemas] = useState<Tema[]>([]);
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [reservas, setReservas] = useState<Reserva[]>([]);

    // --- Estados para el formulario ---
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedTema, setSelectedTema] = useState('');
    const [selectedProfesor, setSelectedProfesor] = useState('');
    const [nombreAlumno, setNombreAlumno] = useState('');
    const [telefonoAlumno, setTelefonoAlumno] = useState('');
    const [fechaHora, setFechaHora] = useState('');

    // --- Estados de Carga y Error ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [calendarTitle, setCalendarTitle] = useState('');
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const calendarRef = useRef<FullCalendar>(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [cursosRes, profesRes, reservasRes] = await Promise.all([
                apiClient.get('/cursos'),
                apiClient.get('/profesores'),
                apiClient.get('/reservas'),
            ]);
            setCursos(cursosRes.data.data);
            setProfesores(profesRes.data.data);
            setReservas(reservasRes.data.data);
            setError('');
        } catch (err) {
            setError('Error al cargar datos iniciales.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Cargar datos iniciales ---
    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Cargar temas cuando se selecciona un curso ---
    useEffect(() => {
        if (selectedCurso) {
            const fetchTemas = async () => {
                try {
                    const response = await apiClient.get(`/cursos/${selectedCurso}/temas`);
                    setTemas(response.data.data);
                } catch (err) {
                    setError('Error al cargar los temas.');
                    console.error(err);
                }
            };
            fetchTemas();
        } else {
            setTemas([]);
        }
    }, [selectedCurso]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const bookingData = {
                curso_id: parseInt(selectedCurso),
                tema_id: parseInt(selectedTema),
                profesor_id: parseInt(selectedProfesor),
                nombre_alumno: nombreAlumno,
                fecha_hora_inicio: fechaHora,
            };
            await apiClient.post('/reservas', bookingData);
            
            fetchAllData();

            setSelectedCurso('');
            setSelectedTema('');
            setSelectedProfesor('');
            setNombreAlumno('');
            setTelefonoAlumno('');
            setFechaHora('');
            
            setSuccess('¡Reserva creada con éxito!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'No se pudo crear la reserva.';
            setError(errorMessage);
            setTimeout(() => setError(''), 5000);
        }
    };
    
    // Mapear las reservas al formato que FullCalendar entiende
    const calendarEvents = reservas.map(r => ({
        id: r.id.toString(),
        title: `${r.curso_nombre} - ${r.nombre_alumno}`,
        start: r.fecha_hora_inicio,
        end: r.fecha_hora_fin,
        extendedProps: {
            profesor: r.profesor_nombre,
            tema: r.tema_nombre
        },
        // Asignar colores basados en el curso para una mejor visualización
        backgroundColor: `hsl(${r.curso_nombre.length * 25 % 360}, 45%, 55%)`,
        borderColor: `hsl(${r.curso_nombre.length * 25 % 360}, 45%, 45%)`,
    }));
    
    // Componente personalizado para renderizar el contenido de los eventos
    const renderEventContent = (eventInfo: any) => {
        return (
            <div className="custom-calendar-event">
                <b>{eventInfo.timeText}</b>
                <i>{eventInfo.event.title}</i>
                <p>{eventInfo.event.extendedProps.tema}</p>
            </div>
        )
    }

    // --- Handlers para el Calendario Personalizado ---
    const handleCalendarNav = (action: 'prev' | 'next' | 'today') => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi[action]();
            setCalendarTitle(calendarApi.view.title);
        }
    };

    const handleViewChange = (view: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(view);
            setCurrentView(view);
        }
    };

    const handleDatesSet = (dateInfo: DatesSetArg) => {
        setCalendarTitle(dateInfo.view.title);
        setCurrentView(dateInfo.view.type);
    };

    return (
        <div>
            <h1>Dashboard de Reservas</h1>
            <div className="dashboard-container">
                <div className="booking-form">
                    <h2>Nueva Reserva</h2>
                    <form onSubmit={handleBooking}>
                        <div className="form-group">
                            <label htmlFor="curso">Curso:</label>
                            <select id="curso" value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)} required>
                                <option value="">Seleccione un curso</option>
                                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="tema">Tema:</label>
                            <select id="tema" value={selectedTema} onChange={e => setSelectedTema(e.target.value)} required disabled={!selectedCurso || temas.length === 0}>
                                <option value="">Seleccione un tema</option>
                                {temas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="profesor">Profesor:</label>
                            <select id="profesor" value={selectedProfesor} onChange={e => setSelectedProfesor(e.target.value)} required>
                                <option value="">Seleccione un profesor</option>
                                {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha-hora">Fecha y Hora de Inicio:</label>
                            <input id="fecha-hora" type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nombre-alumno">Nombre del Alumno:</label>
                            <input id="nombre-alumno" type="text" value={nombreAlumno} onChange={e => setNombreAlumno(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono-alumno">Teléfono del Alumno (Opcional):</label>
                            <input id="telefono-alumno" type="tel" value={telefonoAlumno} onChange={e => setTelefonoAlumno(e.target.value)} />
                        </div>
                        <button type="submit" className="form-button" disabled={loading}>Crear Reserva</button>
                    </form>
                    {error && <p className="form-message error">{error}</p>}
                    {success && <p className="form-message success">{success}</p>}
                </div>
                <div className="calendar-view">
                    <div className="calendar-header">
                        <div className="calendar-header-left">
                            <button className="today-button" onClick={() => handleCalendarNav('today')}>Hoy</button>
                            <div className="calendar-nav">
                                <button onClick={() => handleCalendarNav('prev')}>&lt;</button>
                                <button onClick={() => handleCalendarNav('next')}>&gt;</button>
                            </div>
                            <h2 className="calendar-title">{calendarTitle}</h2>
                        </div>
                        <div className="calendar-header-right">
                             <button onClick={() => handleViewChange('dayGridMonth')} className={currentView === 'dayGridMonth' ? 'active-view' : ''}>Mes</button>
                             <button onClick={() => handleViewChange('timeGridWeek')} className={currentView === 'timeGridWeek' ? 'active-view' : ''}>Semana</button>
                             <button onClick={() => handleViewChange('timeGridDay')} className={currentView === 'timeGridDay' ? 'active-view' : ''}>Día</button>
                             <button onClick={() => handleViewChange('listWeek')} className={currentView === 'listWeek' ? 'active-view' : ''}>Agenda</button>
                        </div>
                    </div>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                        headerToolbar={false}
                        datesSet={handleDatesSet}
                        initialView="dayGridMonth"
                        locale={esLocale}
                        events={calendarEvents}
                        eventContent={renderEventContent}
                        height="auto"
                        editable={true}
                        selectable={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 