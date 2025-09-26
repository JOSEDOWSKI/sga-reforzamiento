import React, { useState, useEffect, useRef } from "react";
import apiClient from "../config/api";
import "./DashboardPage.css";

// --- Imports para FullCalendar ---
import FullCalendar from "@fullcalendar/react";
import { DatesSetArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

// --- Definición de Tipos ---
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
interface Alumno {
  id: number;
  nombre: string;
  telefono: string;
  email?: string;
  dni?: string;
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

interface ModalReserva {
  isOpen: boolean;
  selectedTime: Date | null;
  editingReserva: Reserva | null;
}

const DashboardPage: React.FC = () => {
  // --- Estados para los datos ---
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnosSugeridos, setAlumnosSugeridos] = useState<Alumno[]>([]);

  // --- Estados para filtros ---
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroProfesor, setFiltroProfesor] = useState("");
  const [showCursoDropdown, setShowCursoDropdown] = useState(false);
  const [showProfesorDropdown, setShowProfesorDropdown] = useState(false);

  // --- Estados para el formulario ---
  const [selectedCurso, setSelectedCurso] = useState("");
  const [selectedTema, setSelectedTema] = useState("");
  const [selectedProfesor, setSelectedProfesor] = useState("");
  const [nombreAlumno, setNombreAlumno] = useState("");
  const [telefonoAlumno, setTelefonoAlumno] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [duracionHoras, setDuracionHoras] = useState("1");
  const [precio, setPrecio] = useState("0");
  const [estadoPago, setEstadoPago] = useState("Falta pagar");

  // --- Estados para el buscador de alumnos ---
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [crearNuevoAlumno, setCrearNuevoAlumno] = useState(false);
  const [nuevoAlumnoNombre, setNuevoAlumnoNombre] = useState("");
  const [nuevoAlumnoTelefono, setNuevoAlumnoTelefono] = useState("");
  const [buscandoAlumnos, setBuscandoAlumnos] = useState(false);

  // --- Estados para el modal ---
  const [modalReserva, setModalReserva] = useState<ModalReserva>({
    isOpen: false,
    selectedTime: null,
    editingReserva: null,
  });

  // --- Estados de Carga y Error ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [calendarTitle, setCalendarTitle] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const calendarRef = useRef<FullCalendar | null >(null);

  useEffect(() => {
    const handler = (e: any) => {
      const start: Date = e?.detail?.start ?? new Date(Date.now() + 2 * 60 * 60 * 1000);
      const durHrs: number = e?.detail?.durationHours ?? 1;
      const end = new Date(start.getTime() + durHrs * 60 * 60 * 1000);
      handleDateSelect({ start, end, allDay: false });
    };

    window.addEventListener("tour:open-reserva" as any, handler);
    return () => window.removeEventListener("tour:open-reserva" as any, handler);
  }, [cursos, profesores, temas]); // aseguramos que existan datos para prefills


  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [cursosRes, profesRes, reservasRes, temasRes, alumnosRes] = await Promise.all([
        apiClient.get("/cursos"),
        apiClient.get("/profesores"),
        apiClient.get("/reservas"),
        apiClient.get("/temas"),
        apiClient.get("/alumnos"),
      ]);
      setCursos(cursosRes.data.data);
      setProfesores(profesRes.data.data);
      setReservas(reservasRes.data.data);
      setTemas(temasRes.data.data);
      setAlumnos(alumnosRes.data.data);
      setError("");
    } catch (err) {
      setError("Error al cargar datos iniciales.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Función para buscar alumnos optimizada ---
  const buscarAlumnos = async (termino: string) => {
    if (termino.length < 1) {
      setAlumnosSugeridos([]);
      setBuscandoAlumnos(false);
      return;
    }

    setBuscandoAlumnos(true);
    try {
      const response = await apiClient.get(`/alumnos/search?q=${encodeURIComponent(termino)}`);
      setAlumnosSugeridos(response.data.data);
    } catch (err) {
      console.error("Error buscando alumnos:", err);
      setAlumnosSugeridos([]);
    } finally {
      setBuscandoAlumnos(false);
    }
  };

  // --- Función para crear nuevo alumno ---
  const crearAlumno = async () => {
    if (!nuevoAlumnoNombre.trim() || !nuevoAlumnoTelefono.trim()) {
      setError("Nombre y teléfono son obligatorios para crear un alumno");
      return;
    }

    try {
      const response = await apiClient.post("/alumnos", {
        nombre: nuevoAlumnoNombre.trim(),
        telefono: nuevoAlumnoTelefono.trim(),
      });

      const nuevoAlumno = response.data.data;
      setAlumnos(prev => [...prev, nuevoAlumno]);
      setAlumnoSeleccionado(nuevoAlumno);
      setNombreAlumno(nuevoAlumno.nombre);
      setTelefonoAlumno(nuevoAlumno.telefono);
      setCrearNuevoAlumno(false);
      setNuevoAlumnoNombre("");
      setNuevoAlumnoTelefono("");
      setBusquedaAlumno(""); // Limpiar búsqueda
      setMostrarSugerencias(false);
      setSuccess("Alumno creado con éxito");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error al crear el alumno";
      setError(errorMessage);
    }
  };

  // --- Función para manejar clic en botón "+" ---
  const handleCrearNuevoAlumno = () => {
    setCrearNuevoAlumno(true);
    setBusquedaAlumno(""); // Limpiar búsqueda
    setAlumnoSeleccionado(null);
    setMostrarSugerencias(false);
    setNombreAlumno("");
    setTelefonoAlumno("");
  };

  // --- Función para manejar selección de alumno existente ---
  const handleSeleccionarAlumno = (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    setNombreAlumno(alumno.nombre);
    setTelefonoAlumno(alumno.telefono);
    setBusquedaAlumno(alumno.nombre);
    setMostrarSugerencias(false);
    setCrearNuevoAlumno(false); // Ocultar formulario de crear alumno
  };

  // --- Cargar datos iniciales ---
  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Efecto para búsqueda de alumnos con debounce optimizado ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (busquedaAlumno.trim().length >= 1) {
        buscarAlumnos(busquedaAlumno);
      } else {
        setAlumnosSugeridos([]);
      }
    }, 150); // Reducido de 300ms a 150ms para mayor rapidez

    return () => clearTimeout(timeoutId);
  }, [busquedaAlumno]);

  // --- Cerrar dropdowns al hacer click fuera ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowCursoDropdown(false);
        setShowProfesorDropdown(false);
      }
      if (!target.closest(".alumno-search-container")) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    if (calendarRef.current) {
      (window as any).calendarApi = calendarRef.current?.getApi();
    }
  }, []);

  // --- Filtrar temas según el curso seleccionado ---
  const temasFiltrados = selectedCurso
    ? temas.filter((tema) => tema.curso_id === parseInt(selectedCurso))
    : [];

  // --- Filtrar reservas según filtros seleccionados ---
  const reservasFiltradas = reservas.filter((reserva) => {
    const cumpleFiltro =
      (!filtroCurso || reserva.curso_nombre === filtroCurso) &&
      (!filtroProfesor || reserva.profesor_nombre === filtroProfesor);
    return cumpleFiltro;
  });

  // --- Limpiar filtros ---
  const clearFilters = () => {
    setFiltroCurso("");
    setFiltroProfesor("");
    setShowCursoDropdown(false);
    setShowProfesorDropdown(false);
  };

  // --- Manejar clic en slot del calendario (crear nueva reserva) ---
  const handleDateSelect = (selectInfo: any) => {
    setModalReserva({
      isOpen: true,
      selectedTime: selectInfo.start,
      editingReserva: null,
    });

    // Prefills académicos (DEMO)
    const defaultCursoId = cursos[0]?.id?.toString() || "";
    const defaultProfesorId = profesores[0]?.id?.toString() || "";
    const temasDeCurso = defaultCursoId
      ? temas.filter((t) => t.curso_id === parseInt(defaultCursoId))
      : [];

    setSelectedCurso(defaultCursoId);
    setSelectedTema(temasDeCurso[0]?.id?.toString() || "");
    setSelectedProfesor(defaultProfesorId);

    const d = new Date(selectInfo.start || Date.now() + 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setNombreAlumno("");
    setTelefonoAlumno("");
    setDuracionHoras("1");
    setPrecio("50");
    setEstadoPago("Falta pagar");
    setFechaHora(local);

    // Limpiar estados del buscador de alumnos
    setBusquedaAlumno("");
    setAlumnoSeleccionado(null);
    setMostrarSugerencias(false);
    setCrearNuevoAlumno(false);
    setNuevoAlumnoNombre("");
    setNuevoAlumnoTelefono("");
    setNombreAlumno("");
    setTelefonoAlumno("");

    setError("");
    setSuccess("");
  };


  // --- Manejar clic en evento existente (editar reserva) ---
  const handleEventClick = (clickInfo: any) => {
    const reserva = reservas.find(
      (r) => r.id.toString() === clickInfo.event.id
    );
    if (reserva) {
      setModalReserva({
        isOpen: true,
        selectedTime: new Date(reserva.fecha_hora_inicio),
        editingReserva: reserva,
      });
      // Llenar formulario con datos de la reserva
      const curso = cursos.find((c) => c.nombre === reserva.curso_nombre);
      const profesor = profesores.find(
        (p) => p.nombre === reserva.profesor_nombre
      );

      setSelectedCurso(curso?.id.toString() || "");
      setSelectedProfesor(profesor?.id.toString() || "");
      setNombreAlumno(reserva.nombre_alumno);
      setTelefonoAlumno(reserva.telefono_alumno || "");
      setDuracionHoras(reserva.duracion_horas?.toString() || "1");
      setPrecio(reserva.precio?.toString() || "0");
      setEstadoPago(reserva.estado_pago || "Falta pagar");
      
      // Configurar el buscador de alumnos para edición
      setBusquedaAlumno(reserva.nombre_alumno);
      setAlumnoSeleccionado(null); // Permitir edición libre
      setMostrarSugerencias(false);
      setCrearNuevoAlumno(false);

      // Calcular fecha y hora para el input
      const fechaInicio = new Date(reserva.fecha_hora_inicio);
      const fechaFormateada = fechaInicio.toISOString().slice(0, 16);
      setFechaHora(fechaFormateada);
    }
  };

  // --- Cerrar modal ---
  const closeModal = () => {
    setModalReserva({
      isOpen: false,
      selectedTime: null,
      editingReserva: null,
    });
    // Limpiar estados del buscador de alumnos
    setBusquedaAlumno("");
    setAlumnoSeleccionado(null);
    setMostrarSugerencias(false);
    setCrearNuevoAlumno(false);
    setNuevoAlumnoNombre("");
    setNuevoAlumnoTelefono("");
    setNombreAlumno("");
    setTelefonoAlumno("");
    setBuscandoAlumnos(false);
    setAlumnosSugeridos([]);
    setError("");
    setSuccess("");
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones específicas por campo
    const camposFaltantes = [];

    if (!selectedCurso) {
      camposFaltantes.push("Curso");
    }
    if (!selectedTema) {
      camposFaltantes.push("Tema");
    }
    if (!selectedProfesor) {
      camposFaltantes.push("Profesor");
    }
    if (!fechaHora) {
      camposFaltantes.push("Fecha y hora");
    }

    // Validación inteligente de alumno
    if (crearNuevoAlumno) {
      // Si está en modo crear alumno, validar nombre y teléfono
      if (!nuevoAlumnoNombre.trim()) {
        camposFaltantes.push("Nombre del alumno");
      }
      if (!nuevoAlumnoTelefono.trim()) {
        camposFaltantes.push("Teléfono del alumno");
      }
    } else if (!alumnoSeleccionado && !busquedaAlumno.trim()) {
      // Si no está creando alumno y no hay búsqueda, es obligatorio
      camposFaltantes.push("Alumno");
    }

    if (camposFaltantes.length > 0) {
      const mensaje =
        camposFaltantes.length === 1
          ? `Falta completar el campo: ${camposFaltantes[0]}`
          : `Faltan completar los siguientes campos: ${camposFaltantes.join(
              ", "
            )}`;
      setError(mensaje);
      return;
    }

    const duracion = parseFloat(duracionHoras);
    if (duracion <= 0 || duracion > 6) {
      setError("La duración debe estar entre 0.5 y 6 horas.");
      return;
    }

    // Validar que la fecha no sea en el pasado (solo para nuevas reservas)
    if (!modalReserva.editingReserva) {
      const fechaInicio = new Date(fechaHora);
      const ahora = new Date();
      if (fechaInicio < ahora) {
        setError("No puedes crear reservas en el pasado.");
        return;
      }
    }

    try {
      let nombreAlumnoFinal = "";
      let telefonoAlumnoFinal = "";

      // Lógica inteligente para determinar qué datos usar
      if (crearNuevoAlumno) {
        // Crear alumno nuevo primero
        const response = await apiClient.post("/alumnos", {
          nombre: nuevoAlumnoNombre.trim(),
          telefono: nuevoAlumnoTelefono.trim(),
        });
        
        const nuevoAlumno = response.data.data;
        setAlumnos(prev => [...prev, nuevoAlumno]);
        
        nombreAlumnoFinal = nuevoAlumno.nombre;
        telefonoAlumnoFinal = nuevoAlumno.telefono;
      } else if (alumnoSeleccionado) {
        // Usar alumno existente seleccionado
        nombreAlumnoFinal = alumnoSeleccionado.nombre;
        telefonoAlumnoFinal = alumnoSeleccionado.telefono;
      } else {
        // Usar datos de búsqueda (alumno no registrado)
        nombreAlumnoFinal = busquedaAlumno;
        telefonoAlumnoFinal = telefonoAlumno;
      }

      const fechaInicio = new Date(fechaHora);
      const fechaFin = new Date(
        fechaInicio.getTime() + duracion * 60 * 60 * 1000
      );

      const reservaData = {
        curso_id: parseInt(selectedCurso),
        tema_id: parseInt(selectedTema),
        profesor_id: parseInt(selectedProfesor),
        nombre_alumno: nombreAlumnoFinal,
        telefono_alumno: telefonoAlumnoFinal,
        fecha_hora_inicio: fechaInicio.toISOString(),
        fecha_hora_fin: fechaFin.toISOString(),
        precio: parseFloat(precio),
        estado_pago: estadoPago,
        duracion_horas: duracion,
      };

      if (modalReserva.editingReserva) {
        // Actualizar reserva existente
        await apiClient.put(
          `/reservas/${modalReserva.editingReserva.id}`,
          reservaData
        );
        setSuccess("¡Reserva actualizada con éxito!");
      } else {
        // Crear nueva reserva
        await apiClient.post("/reservas", reservaData);
        setSuccess("¡Reserva creada con éxito!");
      }

      fetchAllData();
      closeModal();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "No se pudo guardar la reserva.";
      setError(errorMessage);
    }
  };

  // --- Eliminar reserva ---
  const handleDeleteReserva = async () => {
    if (
      modalReserva.editingReserva &&
      window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")
    ) {
      try {
        await apiClient.delete(`/reservas/${modalReserva.editingReserva.id}`);
        setSuccess("Reserva eliminada con éxito");
        fetchAllData();
        closeModal();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        setError("Error al eliminar la reserva");
      }
    }
  };

  // Mapear las reservas filtradas al formato que FullCalendar entiende
  const calendarEvents = reservasFiltradas.map((r) => ({
    id: r.id.toString(),
    title: `${r.curso_nombre} - ${r.nombre_alumno}`,
    start: r.fecha_hora_inicio,
    end: r.fecha_hora_fin,
    extendedProps: {
      profesor: r.profesor_nombre,
      tema: r.tema_nombre,
      precio: r.precio,
      estado_pago: r.estado_pago,
    },
    // Asignar colores basados en el curso
    backgroundColor: `hsl(${(r.curso_nombre.length * 25) % 360}, 45%, 55%)`,
    borderColor: `hsl(${(r.curso_nombre.length * 25) % 360}, 45%, 45%)`,
  }));

  // Componente personalizado para renderizar el contenido de los eventos
  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="custom-calendar-event">
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        <p>{eventInfo.event.extendedProps.tema}</p>
        <small>{eventInfo.event.extendedProps.estado_pago}</small>
      </div>
    );
  };

  // --- Handlers para el Calendario ---
  const handleCalendarNav = (action: "prev" | "next" | "today") => {
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
      {/* Mensajes de éxito y error */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Filtros mejorados */}
      <div className="filters-container">
        <div className="filters-header">
          <h3>Filtros</h3>

          <div className="filters-stats">
            <span>
              Mostrando {reservasFiltradas.length} de {reservas.length} reservas
            </span>
            {(filtroCurso || filtroProfesor) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        <div className="filters-row">
          <div className="filter-dropdown">
            <label>Filtrar por curso:</label>
            <div className="dropdown-container">
              <button
                id="filter-curso-btn"
                className={`dropdown-trigger ${
                  showCursoDropdown ? "active" : ""
                }`}
                onClick={() => setShowCursoDropdown(!showCursoDropdown)}
              >
                {filtroCurso || "Todos los cursos"}
                <svg
                  className="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {showCursoDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setFiltroCurso("");
                      setShowCursoDropdown(false);
                    }}
                  >
                    Todos los cursos
                  </button>
                  {cursos.map((curso) => (
                    <button
                      key={curso.id}
                      className="dropdown-item"
                      onClick={() => {
                        setFiltroCurso(curso.nombre);
                        setShowCursoDropdown(false);
                      }}
                    >
                      {curso.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-dropdown">
            <label>Filtrar por profesor:</label>
            <div className="dropdown-container">
              <button id="filter-profesor-btn"
                className={`dropdown-trigger ${
                  showProfesorDropdown ? "active" : ""
                }`}
                onClick={() => setShowProfesorDropdown(!showProfesorDropdown)}
              >
                {filtroProfesor || "Todos los profesores"}
                <svg
                  className="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {showProfesorDropdown && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setFiltroProfesor("");
                      setShowProfesorDropdown(false);
                    }}
                  >
                    Todos los profesores
                  </button>
                  {profesores.map((profesor) => (
                    <button
                      key={profesor.id}
                      className="dropdown-item"
                      onClick={() => {
                        setFiltroProfesor(profesor.nombre);
                        setShowProfesorDropdown(false);
                      }}
                    >
                      {profesor.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="calendar-view-fullwidth">
          <div className="calendar-header">
            <div className="calendar-header-left">
              <button
                className="today-button"
                onClick={() => handleCalendarNav("today")}
              >
                Hoy
              </button>
              <div className="calendar-nav">
                <button onClick={() => handleCalendarNav("prev")}>&lt;</button>
                <button onClick={() => handleCalendarNav("next")}>&gt;</button>
              </div>
              <h2 className="calendar-title">{calendarTitle}</h2>
            </div>
            <div className="calendar-header-right">
              <button
                onClick={() => handleViewChange("dayGridMonth")}
                className={currentView === "dayGridMonth" ? "active-view" : ""}
              >
                Mes
              </button>
              <button
                onClick={() => handleViewChange("timeGridWeek")}
                className={currentView === "timeGridWeek" ? "active-view" : ""}
              >
                Semana
              </button>
              <button
                onClick={() => handleViewChange("timeGridDay")}
                className={currentView === "timeGridDay" ? "active-view" : ""}
              >
                Día
              </button>
              <button
                onClick={() => handleViewChange("listWeek")}
                className={currentView === "listWeek" ? "active-view" : ""}
              >
                Agenda
              </button>
            </div>
          </div>
          <div id="dashboard-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
              ]}
              headerToolbar={false}
              datesSet={handleDatesSet}
              initialView="dayGridMonth"
              locale={esLocale}
              events={calendarEvents}
              eventContent={renderEventContent}
              height="auto"
              editable={true}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
            />
          </div>

        </div>
      </div>


      {/* Modal de Reserva */}
      {modalReserva.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content"  id="modal-content" role="dialog" aria-modal="true" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalReserva.editingReserva
                  ? "Editar Reserva"
                  : "Nueva Reserva"}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleBooking} className="modal-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-curso">Curso:</label>
                  <select
                    id="modal-curso"
                    value={selectedCurso}
                    onChange={(e) => setSelectedCurso(e.target.value)}
                    className={!selectedCurso && error ? "field-error" : ""}
                  >
                    <option value="">Seleccione un curso</option>
                    {cursos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {!selectedCurso && error && (
                    <span className="field-error-message">
                      Seleccione un curso
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="modal-tema">Tema:</label>
                  <select
                    id="modal-tema"
                    value={selectedTema}
                    onChange={(e) => setSelectedTema(e.target.value)}
                    className={!selectedTema && error ? "field-error" : ""}
                    disabled={!selectedCurso || temasFiltrados.length === 0}
                  >
                    <option value="">Seleccione un tema</option>
                    {temasFiltrados.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                  {!selectedTema && error && selectedCurso && (
                    <span className="field-error-message">
                      Seleccione un tema
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-profesor">Profesor:</label>
                  <select
                    id="modal-profesor"
                    value={selectedProfesor}
                    onChange={(e) => setSelectedProfesor(e.target.value)}
                    className={!selectedProfesor && error ? "field-error" : ""}
                  >
                    <option value="">Seleccione un profesor</option>
                    {profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  {!selectedProfesor && error && (
                    <span className="field-error-message">
                      Seleccione un profesor
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="modal-duracion">Duración (horas):</label>
                  <select
                    id="modal-duracion"
                    value={duracionHoras}
                    onChange={(e) => setDuracionHoras(e.target.value)}
                  >
                    <option value="0.5">30 minutos</option>
                    <option value="1">1 hora</option>
                    <option value="1.5">1.5 horas</option>
                    <option value="2">2 horas</option>
                    <option value="3">3 horas</option>
                    <option value="4">4 horas</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-fecha-hora">Fecha y Hora:</label>
                  <input
                    id="modal-fecha-hora"
                    type="datetime-local"
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                    className={!fechaHora && error ? "field-error" : ""}
                  />
                  {!fechaHora && error && (
                    <span className="field-error-message">
                      Seleccione fecha y hora
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="modal-precio">Precio (€):</label>
                  <input
                    id="modal-precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group form-group-full-width">
                  {!crearNuevoAlumno ? (
                    <>
                      <label htmlFor="modal-busqueda-alumno">
                        Buscar Alumno:
                      </label>
                      <div className="alumno-search-container">
                        <div className="alumno-search-input-container">
                          <input
                            id="modal-busqueda-alumno"
                            type="text"
                            value={busquedaAlumno}
                            onChange={(e) => {
                              setBusquedaAlumno(e.target.value);
                              setMostrarSugerencias(true);
                              setAlumnoSeleccionado(null);
                            }}
                            onFocus={() => setMostrarSugerencias(true)}
                            placeholder="Escriba el nombre del alumno..."
                            className={
                              (!alumnoSeleccionado && !busquedaAlumno.trim()) && error ? "field-error" : ""
                            }
                          />
                          <button
                            type="button"
                            className="add-alumno-btn"
                            onClick={handleCrearNuevoAlumno}
                            title="Crear nuevo alumno"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Sugerencias de alumnos */}
                        {mostrarSugerencias && (
                          <div className="alumno-suggestions">
                            {buscandoAlumnos ? (
                              <div className="alumno-suggestion-loading">
                                <div className="loading-spinner"></div>
                                <span>Buscando alumnos...</span>
                              </div>
                            ) : alumnosSugeridos.length > 0 ? (
                              alumnosSugeridos.map((alumno) => (
                                <div
                                  key={alumno.id}
                                  className="alumno-suggestion-item"
                                  onClick={() => handleSeleccionarAlumno(alumno)}
                                >
                                  <div className="alumno-name">{alumno.nombre}</div>
                                  <div className="alumno-phone">{alumno.telefono}</div>
                                  {alumno.email && (
                                    <div className="alumno-email">{alumno.email}</div>
                                  )}
                                </div>
                              ))
                            ) : busquedaAlumno.trim().length > 0 ? (
                              <div className="alumno-suggestion-no-results">
                                <span>No se encontraron alumnos</span>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {(!alumnoSeleccionado && !busquedaAlumno.trim()) && error && (
                          <span className="field-error-message">
                            Seleccione o busque un alumno
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <label>Crear Nuevo Alumno:</label>
                      <div className="nuevo-alumno-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Nombre:</label>
                            <input
                              type="text"
                              value={nuevoAlumnoNombre}
                              onChange={(e) => setNuevoAlumnoNombre(e.target.value)}
                              placeholder="Nombre del alumno"
                              className={!nuevoAlumnoNombre.trim() && error ? "field-error" : ""}
                            />
                            {!nuevoAlumnoNombre.trim() && error && (
                              <span className="field-error-message">
                                Nombre es obligatorio
                              </span>
                            )}
                          </div>
                          <div className="form-group">
                            <label>Teléfono:</label>
                            <input
                              type="tel"
                              value={nuevoAlumnoTelefono}
                              onChange={(e) => setNuevoAlumnoTelefono(e.target.value)}
                              placeholder="Teléfono del alumno"
                              className={!nuevoAlumnoTelefono.trim() && error ? "field-error" : ""}
                            />
                            {!nuevoAlumnoTelefono.trim() && error && (
                              <span className="field-error-message">
                                Teléfono es obligatorio
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="nuevo-alumno-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setCrearNuevoAlumno(false);
                              setNuevoAlumnoNombre("");
                              setNuevoAlumnoTelefono("");
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-estado-pago">Estado de Pago:</label>
                  <select
                    id="modal-estado-pago"
                    value={estadoPago}
                    onChange={(e) => setEstadoPago(e.target.value)}
                  >
                    <option value="Falta pagar">Falta pagar</option>
                    <option value="Pagado parcial">Pagado parcial</option>
                    <option value="Pagado completo">Pagado completo</option>
                  </select>
                </div>
              </div>

              {error && <div className="modal-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {modalReserva.editingReserva ? "Actualizar" : "Crear Reserva"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                {modalReserva.editingReserva && (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={handleDeleteReserva}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
