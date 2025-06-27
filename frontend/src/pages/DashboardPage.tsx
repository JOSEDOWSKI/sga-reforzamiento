import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import './DashboardPage.css'; // Importamos los nuevos estilos

// --- Imports para el Calendario (con sintaxis corregida) ---
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// --- Configuración del Localizer para el Calendario en Español ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes
    getDay,
    locales,
});

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
// Evento para el calendario
interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource?: any;
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
    const [telefonoAlumno, setTelefonoAlumno] = useState(''); // No está en la BD, lo omitimos por ahora
    const [fechaHora, setFechaHora] = useState('');

    // --- Estados de Carga y Error ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                    // No es necesario un loading global aquí para no bloquear toda la UI
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
            const response = await apiClient.post('/reservas', bookingData);
            
            // Refrescamos todas las reservas para tener la data completa y actualizada del JOIN
            fetchAllData();

            // Limpiar formulario
            setSelectedCurso('');
            setSelectedTema('');
            setSelectedProfesor('');
            setNombreAlumno('');
            setTelefonoAlumno('');
            setFechaHora('');
            
            setSuccess('¡Reserva creada con éxito!');
            // Ocultar el mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'No se pudo crear la reserva.';
            setError(errorMessage);
            console.error(err);
             // Ocultar el mensaje de error después de 3 segundos
            setTimeout(() => setError(''), 5000);
        }
    };
    
    // Mapear las reservas al formato que el calendario entiende
    const events: CalendarEvent[] = reservas.map(r => ({
        title: `${r.curso_nombre} - ${r.nombre_alumno}`,
        start: new Date(r.fecha_hora_inicio),
        end: new Date(r.fecha_hora_fin),
        resource: r, // Guardamos la reserva original por si acaso
    }));

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
                    <h2>Calendario de Clases</h2>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 'calc(100vh - 150px)', minHeight: '500px' }}
                        messages={{
                            next: "Siguiente",
                            previous: "Anterior",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            agenda: "Agenda",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 