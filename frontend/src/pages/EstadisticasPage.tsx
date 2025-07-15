import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css';

interface Reserva {
    id: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    nombre_alumno: string;
    curso_nombre: string;
    profesor_nombre: string;
    tema_nombre: string;
    precio?: number;
    estado_pago?: string;
}

interface Curso {
    id: number;
    nombre: string;
}

interface Profesor {
    id: number;
    nombre: string;
}

interface Tema {
    id: number;
    nombre: string;
    curso_id: number;
}

const EstadisticasPage: React.FC = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [temas, setTemas] = useState<Tema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reservasRes, cursosRes, profesoresRes, temasRes] = await Promise.all([
                apiClient.get('/reservas'),
                apiClient.get('/cursos'),
                apiClient.get('/profesores'),
                apiClient.get('/temas'),
            ]);
            
            setReservas(reservasRes.data.data);
            setCursos(cursosRes.data.data);
            setProfesores(profesoresRes.data.data);
            setTemas(temasRes.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Calcular estadísticas
    const calcularEstadisticas = () => {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Reservas pagadas por período
        const pagadas = reservas.filter(r => r.estado_pago === 'Pagado completo');
        const pagadasEsteMes = pagadas.filter(r => new Date(r.fecha_hora_inicio) >= inicioMes);
        const pagadasEstaSemana = pagadas.filter(r => new Date(r.fecha_hora_inicio) >= inicioSemana);
        const pagadasHoy = pagadas.filter(r => {
            const fecha = new Date(r.fecha_hora_inicio);
            return fecha.toDateString() === ahora.toDateString();
        });

        // Ingresos por período
        const ingresosTotales = pagadas.reduce((sum, r) => sum + (r.precio || 0), 0);
        const ingresosMes = pagadasEsteMes.reduce((sum, r) => sum + (r.precio || 0), 0);
        const ingresosSemana = pagadasEstaSemana.reduce((sum, r) => sum + (r.precio || 0), 0);
        const ingresosHoy = pagadasHoy.reduce((sum, r) => sum + (r.precio || 0), 0);

        // Reservas por período
        const reservasEsteMes = reservas.filter(r => new Date(r.fecha_hora_inicio) >= inicioMes);
        const reservasEstaSemana = reservas.filter(r => new Date(r.fecha_hora_inicio) >= inicioSemana);
        const reservasHoy = reservas.filter(r => {
            const fecha = new Date(r.fecha_hora_inicio);
            return fecha.toDateString() === ahora.toDateString();
        });

        // Horas totales
        const calcularHoras = (reservas: Reserva[]) => {
            return reservas.reduce((total, r) => {
                const inicio = new Date(r.fecha_hora_inicio);
                const fin = new Date(r.fecha_hora_fin);
                return total + (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
            }, 0);
        };

        // Top cursos
        const cursoStats = cursos.map(curso => {
            const reservasCurso = reservas.filter(r => r.curso_nombre === curso.nombre);
            return {
                nombre: curso.nombre,
                totalReservas: reservasCurso.length,
                horasTotales: calcularHoras(reservasCurso),
                porcentaje: reservas.length > 0 ? (reservasCurso.length / reservas.length * 100).toFixed(1) : '0'
            };
        }).sort((a, b) => b.totalReservas - a.totalReservas);

        // Top profesores
        const profesorStats = profesores.map(profesor => {
            const reservasProfesor = reservas.filter(r => r.profesor_nombre === profesor.nombre);
            return {
                nombre: profesor.nombre,
                totalReservas: reservasProfesor.length,
                horasTotales: calcularHoras(reservasProfesor),
                porcentaje: reservas.length > 0 ? (reservasProfesor.length / reservas.length * 100).toFixed(1) : '0'
            };
        }).sort((a, b) => b.totalReservas - a.totalReservas);

        // Alumnos únicos
        const alumnosUnicos = new Set(reservas.map(r => r.nombre_alumno)).size;

        // Promedio de duración de clases
        const duraciones = reservas.map(r => {
            const inicio = new Date(r.fecha_hora_inicio);
            const fin = new Date(r.fecha_hora_fin);
            return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        });
        const promedioDuracion = duraciones.length > 0 
            ? (duraciones.reduce((a, b) => a + b, 0) / duraciones.length).toFixed(1)
            : '0';

        return {
            totalReservas: reservas.length,
            reservasEsteMes: reservasEsteMes.length,
            reservasEstaSemana: reservasEstaSemana.length,
            reservasHoy: reservasHoy.length,
            horasTotales: calcularHoras(reservas),
            horasEsteMes: calcularHoras(reservasEsteMes),
            horasEstaSemana: calcularHoras(reservasEstaSemana),
            horasHoy: calcularHoras(reservasHoy),
            alumnosUnicos,
            promedioDuracion,
            topCursos: cursoStats.slice(0, 5),
            topProfesores: profesorStats.slice(0, 5),
            cursosActivos: cursos.length,
            profesoresActivos: profesores.length,
            temasDisponibles: temas.length,
            ingresosTotales,
            ingresosMes,
            ingresosSemana,
            ingresosHoy
        };
    };

    const stats = calcularEstadisticas();

    if (loading) {
        return (
            <div className="page-container">
                <h1>Estadísticas</h1>
                <div className="loading-container">
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Estadísticas del Sistema</h1>
            
            {error && <div className="page-message error-message">{error}</div>}

            {/* Métricas Principales */}
            <div className="stats-overview">
                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <h3>Total Reservas</h3>
                            <div className="stat-number">{stats.totalReservas}</div>
                            <div className="stat-breakdown">
                                <span>Hoy: {stats.reservasHoy}</span>
                                <span>Esta semana: {stats.reservasEstaSemana}</span>
                                <span>Este mes: {stats.reservasEsteMes}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card secondary">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-content">
                            <h3>Horas Totales</h3>
                            <div className="stat-number">{stats.horasTotales.toFixed(1)}h</div>
                            <div className="stat-breakdown">
                                <span>Hoy: {stats.horasHoy.toFixed(1)}h</span>
                                <span>Esta semana: {stats.horasEstaSemana.toFixed(1)}h</span>
                                <span>Este mes: {stats.horasEsteMes.toFixed(1)}h</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Ingresos Totales</h3>
                            <div className="stat-number">€{stats.ingresosTotales.toFixed(2)}</div>
                            <div className="stat-breakdown">
                                <span>Hoy: €{stats.ingresosHoy.toFixed(2)}</span>
                                <span>Esta semana: €{stats.ingresosSemana.toFixed(2)}</span>
                                <span>Este mes: €{stats.ingresosMes.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Alumnos Únicos</h3>
                            <div className="stat-number">{stats.alumnosUnicos}</div>
                            <div className="stat-breakdown">
                                <span>Duración promedio: {stats.promedioDuracion}h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas del Sistema */}
            <div className="system-stats">
                <div className="form-and-list-container">
                    <div className="form-section">
                        <h2>Estado del Sistema</h2>
                        <div className="system-metrics">
                            <div className="metric-item">
                                <span className="metric-label">📚 Cursos Activos:</span>
                                <span className="metric-value">{stats.cursosActivos}</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">👨‍🏫 Profesores Activos:</span>
                                <span className="metric-value">{stats.profesoresActivos}</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">📝 Temas Disponibles:</span>
                                <span className="metric-value">{stats.temasDisponibles}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="list-section">
                        <h2>Resumen Rápido</h2>
                        <div className="summary-stats">
                            <div className="summary-item">
                                <strong>Reservas promedio por curso:</strong>
                                <span>{stats.cursosActivos > 0 ? (stats.totalReservas / stats.cursosActivos).toFixed(1) : '0'}</span>
                            </div>
                            <div className="summary-item">
                                <strong>Reservas promedio por profesor:</strong>
                                <span>{stats.profesoresActivos > 0 ? (stats.totalReservas / stats.profesoresActivos).toFixed(1) : '0'}</span>
                            </div>
                            <div className="summary-item">
                                <strong>Horas promedio por alumno:</strong>
                                <span>{stats.alumnosUnicos > 0 ? (stats.horasTotales / stats.alumnosUnicos).toFixed(1) : '0'}h</span>
                            </div>
                            <div className="summary-item">
                                <strong>Ingreso promedio por reserva:</strong>
                                <span>€{stats.totalReservas > 0 ? (stats.ingresosTotales / stats.totalReservas).toFixed(2) : '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Rankings */}
            <div className="rankings">
                <div className="form-and-list-container">
                    <div className="list-section">
                        <h2>Top Cursos</h2>
                        {stats.topCursos.length > 0 ? (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Posición</th>
                                            <th>Curso</th>
                                            <th>Reservas</th>
                                            <th>Horas</th>
                                            <th>%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topCursos.map((curso, index) => (
                                            <tr key={curso.nombre}>
                                                <td>
                                                    <span className={`ranking-badge ${index < 3 ? 'top-3' : ''}`}>
                                                        #{index + 1}
                                                    </span>
                                                </td>
                                                <td><strong>{curso.nombre}</strong></td>
                                                <td>{curso.totalReservas}</td>
                                                <td>{curso.horasTotales.toFixed(1)}h</td>
                                                <td>{curso.porcentaje}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No hay datos de cursos disponibles.</p>
                        )}
                    </div>
                    
                    <div className="list-section">
                        <h2>Top Profesores</h2>
                        {stats.topProfesores.length > 0 ? (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Posición</th>
                                            <th>Profesor</th>
                                            <th>Reservas</th>
                                            <th>Horas</th>
                                            <th>%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topProfesores.map((profesor, index) => (
                                            <tr key={profesor.nombre}>
                                                <td>
                                                    <span className={`ranking-badge ${index < 3 ? 'top-3' : ''}`}>
                                                        #{index + 1}
                                                    </span>
                                                </td>
                                                <td><strong>{profesor.nombre}</strong></td>
                                                <td>{profesor.totalReservas}</td>
                                                <td>{profesor.horasTotales.toFixed(1)}h</td>
                                                <td>{profesor.porcentaje}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No hay datos de profesores disponibles.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasPage; 