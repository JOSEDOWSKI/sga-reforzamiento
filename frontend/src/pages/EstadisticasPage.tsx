import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

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
      setLoading(false);
    } catch (err: any) {
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

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
      temasDisponibles: temas.length
    };
  };

  const stats = calcularEstadisticas();

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Cargando estadísticas...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card fade-in">
        <div className="card-header">
          <h2 className="card-title">📊 Estadísticas del Sistema</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Métricas Principales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Total Reservas</h3>
              <div className="stat-number">{stats.totalReservas}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>Horas Totales</h3>
              <div className="stat-number">{stats.horasTotales.toFixed(1)}h</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Alumnos Únicos</h3>
              <div className="stat-number">{stats.alumnosUnicos}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Cursos Activos</h3>
              <div className="stat-number">{stats.cursosActivos}</div>
            </div>
          </div>
        </div>

        {/* Estadísticas por Período */}
        <div className="card slide-up">
          <div className="card-header">
            <h3 className="card-title">📈 Actividad Reciente</h3>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card period">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h4>Este Mes</h4>
                <div className="stat-number">{stats.reservasEsteMes}</div>
                <div className="stat-subtitle">{stats.horasEsteMes.toFixed(1)} horas</div>
              </div>
            </div>

            <div className="stat-card period">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h4>Esta Semana</h4>
                <div className="stat-number">{stats.reservasEstaSemana}</div>
                <div className="stat-subtitle">{stats.horasEstaSemana.toFixed(1)} horas</div>
              </div>
            </div>

            <div className="stat-card period">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h4>Hoy</h4>
                <div className="stat-number">{stats.reservasHoy}</div>
                <div className="stat-subtitle">{stats.horasHoy.toFixed(1)} horas</div>
              </div>
            </div>

            <div className="stat-card period">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h4>Duración Promedio</h4>
                <div className="stat-number">{stats.promedioDuracion}h</div>
                <div className="stat-subtitle">por clase</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Cursos */}
        <div className="card slide-up">
          <div className="card-header">
            <h3 className="card-title">🏆 Top 5 Cursos Más Populares</h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Curso</th>
                  <th>Reservas</th>
                  <th>Horas</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCursos.map((curso, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`position-badge position-${index + 1}`}>
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
        </div>

        {/* Top Profesores */}
        <div className="card slide-up">
          <div className="card-header">
            <h3 className="card-title">👨‍🏫 Top 5 Profesores Más Activos</h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Profesor</th>
                  <th>Reservas</th>
                  <th>Horas</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProfesores.map((profesor, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`position-badge position-${index + 1}`}>
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
        </div>

        {/* Resumen del Sistema */}
        <div className="card slide-up">
          <div className="card-header">
            <h3 className="card-title">📋 Resumen del Sistema</h3>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card summary">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h4>Cursos Registrados</h4>
                <div className="stat-number">{stats.cursosActivos}</div>
              </div>
            </div>

            <div className="stat-card summary">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-content">
                <h4>Profesores Activos</h4>
                <div className="stat-number">{stats.profesoresActivos}</div>
              </div>
            </div>

            <div className="stat-card summary">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h4>Temas Disponibles</h4>
                <div className="stat-number">{stats.temasDisponibles}</div>
              </div>
            </div>

            <div className="stat-card summary">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Total Reservas</h4>
                <div className="stat-number">{stats.totalReservas}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage; 