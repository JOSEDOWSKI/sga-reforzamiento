import React, { useState, useEffect, useRef } from "react";
import apiClient from "../config/api";
import demoApiClient from "../utils/demoApiClient";
import FullscreenCalendar from "../components/FullscreenCalendar";
import { useRealtimeData } from "../hooks/useRealtimeData";
import useTenant from "../hooks/useTenant";
import { useTenantLabels } from "../utils/tenantLabels";
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
interface Servicio {
  id: number;
  nombre: string;
}
interface Categoria {
  id: number;
  nombre: string;
  curso_id: number;
}
interface Staff {
  id: number;
  nombre: string;
}
interface Cliente {
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
  // --- Hook para obtener el tenant ---
  const { id: tenant } = useTenant();
  // Labels del tenant
  const labels = useTenantLabels();
  // Detectar modo demo directamente del hostname (más confiable)
  const hostname = window.location.hostname;
  const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
  const client = isDemoMode ? demoApiClient : apiClient;
  
  // --- Estados para los datos ---
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([]);

  // --- Estados para filtros ---
  const [filtroServicio, setFiltroServicio] = useState("");
  const [filtroStaff, setFiltroStaff] = useState("");
  const [showServicioDropdown, setShowServicioDropdown] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  // --- Estados para el formulario ---
  const [selectedServicio, setSelectedServicio] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [duracionHoras, setDuracionHoras] = useState("1");
  const [precio, setPrecio] = useState("0");
  const [estadoPago, setEstadoPago] = useState("Falta pagar");

  // --- Estados para el buscador de clientes ---
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [crearNuevoCliente, setCrearNuevoCliente] = useState(false);
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState("");
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState("");
  const [buscandoClientes, setBuscandoClientes] = useState(false);

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

  // --- Estados para pantalla completa ---
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

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
  }, [servicios, staff, categorias]); // aseguramos que existan datos para prefills


  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [serviciosRes, staffRes, reservasRes, categoriasRes] = await Promise.all([
        client.get("/servicios"),
        client.get("/staff"),
        client.get("/reservas"),
        client.get("/categorias"),
      ]);
      setServicios(serviciosRes.data.data);
      setStaff(staffRes.data.data);
      setReservas(reservasRes.data.data);
      setCategorias(categoriasRes.data.data);
      setError("");
    } catch (err) {
      setError("Error al cargar datos iniciales.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Función para buscar clientes optimizada ---
  const buscarClientes = async (termino: string) => {
    if (termino.length < 1) {
      setClientesSugeridos([]);
      setBuscandoClientes(false);
      return;
    }

    setBuscandoClientes(true);
    try {
      // En modo demo, intentar usar /clientes/search o /clientes con filtro
      let response;
      try {
        response = await client.get(`/clientes/search?q=${encodeURIComponent(termino)}`);
      } catch (e) {
        // Si no existe /clientes/search, buscar en /clientes y filtrar localmente
        const allClientes = await client.get('/clientes');
        const filtrados = allClientes.data.data.filter((c: any) => 
          c.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
          c.telefono?.includes(termino) ||
          c.email?.toLowerCase().includes(termino.toLowerCase())
        );
        response = { data: { data: filtrados } };
      }
      setClientesSugeridos(response.data.data);
    } catch (err) {
      console.error("Error buscando clientes:", err);
      // En modo demo, usar datos mock si falla
      if (isDemoMode) {
        const { mockApiResponses } = await import('../utils/demoMockData');
        const mockResult = await mockApiResponses.buscarClientes(termino);
        setClientesSugeridos(mockResult.data);
      } else {
        setClientesSugeridos([]);
      }
    } finally {
      setBuscandoClientes(false);
    }
  };


  // --- Función para manejar clic en botón "+" ---
  const handleCrearNuevoCliente = () => {
    setCrearNuevoCliente(true);
    setBusquedaCliente(""); // Limpiar búsqueda
    setClienteSeleccionado(null);
    setMostrarSugerencias(false);
    setTelefonoCliente("");
  };

  // --- Función para manejar selección de cliente existente ---
  const handleSeleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setTelefonoCliente(cliente.telefono);
    setBusquedaCliente(cliente.nombre);
    setMostrarSugerencias(false);
    setCrearNuevoCliente(false); // Ocultar formulario de crear cliente
  };

  // --- Configurar actualizaciones en tiempo real ---
  const { isConnected: _isConnected } = useRealtimeData({
    events: [
      'reserva-created', 'reserva-updated', 'reserva-deleted', 'reserva-cancelled',
      'cliente-created', 'cliente-updated', 'cliente-deleted',
      'servicio-created', 'servicio-updated', 'servicio-deleted',
      'staff-created', 'staff-updated', 'staff-deleted',
      'categoria-created', 'categoria-updated', 'categoria-deleted'
    ],
    onUpdate: fetchAllData,
    enabled: true
  });

  // --- Cargar datos iniciales ---
  useEffect(() => {
    fetchAllData();
  }, []);

  // Suscribirse a eventos globales de realtime y refrescar datos + pequeña animación
  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.eventName as string;
      // Filtrar solo eventos que afectan al dashboard
      if (!name) return;
      // Refrescar datos del dashboard
      fetchAllData();
      // Marcar una animación breve en el título del calendario
      const titleEl = document.querySelector('.calendar-title');
      if (titleEl) {
        titleEl.classList.add('pulse');
        setTimeout(() => titleEl.classList.remove('pulse'), 600);
      }
    };
    window.addEventListener('realtime:event', handler as any);
    return () => window.removeEventListener('realtime:event', handler as any);
  }, []);

  // --- Efecto para búsqueda de clientes con debounce optimizado ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (busquedaCliente.trim().length >= 1) {
        buscarClientes(busquedaCliente);
      } else {
        setClientesSugeridos([]);
      }
    }, 150); // Reducido de 300ms a 150ms para mayor rapidez

    return () => clearTimeout(timeoutId);
  }, [busquedaCliente]);

  // --- Cerrar dropdowns al hacer click fuera ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowServicioDropdown(false);
        setShowStaffDropdown(false);
      }
      if (!target.closest(".alumno-search-container")) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    if (calendarRef.current) {
      (window as any).calendarApi = calendarRef.current?.getApi();
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Filtrar categorías según el servicio seleccionado ---
  const categoriasFiltradas = selectedServicio
    ? categorias.filter((categoria) => categoria.curso_id === parseInt(selectedServicio))
    : [];

  // --- Filtrar reservas según filtros seleccionados ---
  const reservasFiltradas = reservas.filter((reserva) => {
    const cumpleFiltro =
      (!filtroServicio || reserva.curso_nombre === filtroServicio) &&
      (!filtroStaff || reserva.profesor_nombre === filtroStaff);
    return cumpleFiltro;
  });

  // --- Limpiar filtros ---
  const clearFilters = () => {
    setFiltroServicio("");
    setFiltroStaff("");
    setShowServicioDropdown(false);
    setShowStaffDropdown(false);
  };

  // --- Manejar clic en slot del calendario (crear nueva reserva) ---
  const handleDateSelect = (selectInfo: any) => {
    setModalReserva({
      isOpen: true,
      selectedTime: selectInfo.start,
      editingReserva: null,
    });

    // Prefills académicos (DEMO)
    const defaultServicioId = servicios[0]?.id?.toString() || "";
    const defaultStaffId = staff[0]?.id?.toString() || "";
    const categoriasDeServicio = defaultServicioId
      ? categorias.filter((c) => c.curso_id === parseInt(defaultServicioId))
      : [];

    setSelectedServicio(defaultServicioId);
    setSelectedCategoria(categoriasDeServicio[0]?.id?.toString() || "");
    setSelectedStaff(defaultStaffId);

    const d = new Date(selectInfo.start || Date.now() + 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setTelefonoCliente("");
    setDuracionHoras("1");
    setPrecio("50");
    setEstadoPago("Falta pagar");
    setFechaHora(local);

    // Limpiar estados del buscador de clientes
    setBusquedaCliente("");
    setClienteSeleccionado(null);
    setMostrarSugerencias(false);
    setCrearNuevoCliente(false);
    setNuevoClienteNombre("");
    setNuevoClienteTelefono("");
    setTelefonoCliente("");

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
      const servicio = servicios.find((s) => s.nombre === reserva.curso_nombre);
      const staffMember = staff.find(
        (s) => s.nombre === reserva.profesor_nombre
      );

      setSelectedServicio(servicio?.id.toString() || "");
      setSelectedStaff(staffMember?.id.toString() || "");
      setTelefonoCliente(reserva.telefono_alumno || "");
      setDuracionHoras(reserva.duracion_horas?.toString() || "1");
      setPrecio(reserva.precio?.toString() || "0");
      setEstadoPago(reserva.estado_pago || "Falta pagar");
      
      // Configurar el buscador de clientes para edición
      setBusquedaCliente(reserva.nombre_alumno);
      setClienteSeleccionado(null); // Permitir edición libre
      setMostrarSugerencias(false);
      setCrearNuevoCliente(false);

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
    // Limpiar estados del buscador de clientes
    setBusquedaCliente("");
    setClienteSeleccionado(null);
    setMostrarSugerencias(false);
    setCrearNuevoCliente(false);
    setNuevoClienteNombre("");
    setNuevoClienteTelefono("");
    setTelefonoCliente("");
    setBuscandoClientes(false);
    setClientesSugeridos([]);
    setError("");
    setSuccess("");
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalReserva.isOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalReserva.isOpen]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones específicas por campo
    const camposFaltantes = [];

    if (!selectedServicio) {
      camposFaltantes.push("Servicio");
    }
    if (!selectedCategoria) {
      camposFaltantes.push("Categoría");
    }
    if (!selectedStaff) {
      camposFaltantes.push("Staff");
    }
    if (!fechaHora) {
      camposFaltantes.push("Fecha y hora");
    }

    // Validación inteligente de cliente
    if (crearNuevoCliente) {
      // Si está en modo crear cliente, validar nombre y teléfono
      if (!nuevoClienteNombre.trim()) {
        camposFaltantes.push("Nombre del cliente");
      }
      if (!nuevoClienteTelefono.trim()) {
        camposFaltantes.push("Teléfono del cliente");
      }
    } else if (!clienteSeleccionado && !busquedaCliente.trim()) {
      // Si no está creando cliente y no hay búsqueda, es obligatorio
      camposFaltantes.push("Cliente");
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
      let nombreClienteFinal = "";
      let telefonoClienteFinal = "";

      // Lógica inteligente para determinar qué datos usar
      if (crearNuevoCliente) {
        // Crear cliente nuevo primero
        const response = await client.post("/alumnos", { // Still using old API endpoint
          nombre: nuevoClienteNombre.trim(),
          telefono: nuevoClienteTelefono.trim(),
        });
        
        const nuevoCliente = response.data.data;
        
        nombreClienteFinal = nuevoCliente.nombre;
        telefonoClienteFinal = nuevoCliente.telefono;
      } else if (clienteSeleccionado) {
        // Usar cliente existente seleccionado
        nombreClienteFinal = clienteSeleccionado.nombre;
        telefonoClienteFinal = clienteSeleccionado.telefono;
      } else {
        // Usar datos de búsqueda (cliente no registrado)
        nombreClienteFinal = busquedaCliente;
        telefonoClienteFinal = telefonoCliente;
      }

      const fechaInicio = new Date(fechaHora);
      const fechaFin = new Date(
        fechaInicio.getTime() + duracion * 60 * 60 * 1000
      );

      const reservaData = {
        curso_id: parseInt(selectedServicio),
        tema_id: parseInt(selectedCategoria),
        profesor_id: parseInt(selectedStaff),
        nombre_alumno: nombreClienteFinal,
        telefono_alumno: telefonoClienteFinal,
        fecha_hora_inicio: fechaInicio.toISOString(),
        fecha_hora_fin: fechaFin.toISOString(),
        precio: parseFloat(precio),
        estado_pago: estadoPago,
        duracion_horas: duracion,
      };

      if (modalReserva.editingReserva) {
        // Actualizar reserva existente
        await client.put(
          `/reservas/${modalReserva.editingReserva.id}`,
          reservaData
        );
        setSuccess("¡Reserva actualizada con éxito!");
      } else {
        // Crear nueva reserva
        await client.post("/reservas", reservaData);
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
        await client.delete(`/reservas/${modalReserva.editingReserva.id}`);
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
            {(filtroServicio || filtroStaff) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        <div className="filters-row">
          <div className="filter-dropdown">
            <label>Filtrar por servicio:</label>
            <div className="dropdown-container">
              <button
                id="filter-servicio-btn"
                className={`dropdown-trigger ${
                  showServicioDropdown ? "active" : ""
                }`}
                onClick={() => setShowServicioDropdown(!showServicioDropdown)}
              >
                {filtroServicio || "Todos los servicios"}
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
              {showServicioDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setFiltroServicio("");
                      setShowServicioDropdown(false);
                    }}
                  >
                    Todos los servicios
                  </button>
                  {servicios.map((servicio) => (
                    <button
                      key={servicio.id}
                      className="dropdown-item"
                      onClick={() => {
                        setFiltroServicio(servicio.nombre);
                        setShowServicioDropdown(false);
                      }}
                    >
                      {servicio.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-dropdown">
            <label>Filtrar por {labels.colaborador.toLowerCase()}:</label>
            <div className="dropdown-container">
              <button id="filter-staff-btn"
                className={`dropdown-trigger ${
                  showStaffDropdown ? "active" : ""
                }`}
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
              >
                {filtroStaff || `Todos los ${labels.colaboradores.toLowerCase()}`}
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
              {showStaffDropdown && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setFiltroStaff("");
                      setShowStaffDropdown(false);
                    }}
                  >
                    Todos los {labels.colaboradores.toLowerCase()}
                  </button>
                  {staff.map((staffMember) => (
                    <button
                      key={staffMember.id}
                      className="dropdown-item"
                      onClick={() => {
                        setFiltroStaff(staffMember.nombre);
                        setShowStaffDropdown(false);
                      }}
                    >
                      {staffMember.nombre}
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
              <button
                onClick={() => setIsFullscreenOpen(true)}
                className="fullscreen-button"
                title="Pantalla completa"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                Pantalla Completa
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
                  <label htmlFor="modal-servicio">Servicio:</label>
                  <select
                    id="modal-servicio"
                    value={selectedServicio}
                    onChange={(e) => setSelectedServicio(e.target.value)}
                    className={!selectedServicio && error ? "field-error" : ""}
                  >
                    <option value="">Seleccione un servicio</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                  {!selectedServicio && error && (
                    <span className="field-error-message">
                      Seleccione un servicio
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="modal-categoria">Categoría:</label>
                  <select
                    id="modal-categoria"
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                    className={!selectedCategoria && error ? "field-error" : ""}
                    disabled={!selectedServicio || categoriasFiltradas.length === 0}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categoriasFiltradas.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  {!selectedCategoria && error && selectedServicio && (
                    <span className="field-error-message">
                      Seleccione una categoría
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-staff">Staff:</label>
                  <select
                    id="modal-staff"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className={!selectedStaff && error ? "field-error" : ""}
                  >
                    <option value="">Seleccione un staff</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                  {!selectedStaff && error && (
                    <span className="field-error-message">
                      Seleccione un staff
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
                  {!crearNuevoCliente ? (
                    <>
                      <label htmlFor="modal-busqueda-cliente">
                        Buscar Cliente:
                      </label>
                      <div className="cliente-search-container">
                        <div className="cliente-search-input-container">
                          <input
                            id="modal-busqueda-cliente"
                            type="text"
                            value={busquedaCliente}
                            onChange={(e) => {
                              setBusquedaCliente(e.target.value);
                              setMostrarSugerencias(true);
                              setClienteSeleccionado(null);
                            }}
                            onFocus={() => setMostrarSugerencias(true)}
                            placeholder="Escriba el nombre del cliente..."
                            className={
                              (!clienteSeleccionado && !busquedaCliente.trim()) && error ? "field-error" : ""
                            }
                          />
                          <button
                            type="button"
                            className="add-cliente-btn"
                            onClick={handleCrearNuevoCliente}
                            title="Crear nuevo cliente"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Sugerencias de clientes */}
                        {mostrarSugerencias && (
                          <div className="cliente-suggestions">
                            {buscandoClientes ? (
                              <div className="cliente-suggestion-loading">
                                <div className="cliente-loading-spinner"></div>
                                <span>Buscando clientes...</span>
                              </div>
                            ) : clientesSugeridos.length > 0 ? (
                              clientesSugeridos.map((cliente) => (
                                <div
                                  key={cliente.id}
                                  className="cliente-suggestion-item"
                                  onClick={() => handleSeleccionarCliente(cliente)}
                                >
                                  <div className="cliente-name">{cliente.nombre}</div>
                                  <div className="cliente-phone">{cliente.telefono}</div>
                                  {cliente.email && (
                                    <div className="cliente-email">{cliente.email}</div>
                                  )}
                                </div>
                              ))
                            ) : busquedaCliente.trim().length > 0 ? (
                              <div className="cliente-suggestion-no-results">
                                <span>No se encontraron clientes</span>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {(!clienteSeleccionado && !busquedaCliente.trim()) && error && (
                          <span className="field-error-message">
                            Seleccione o busque un cliente
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <label>Crear Nuevo Cliente:</label>
                      <div className="nuevo-alumno-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Nombre:</label>
                            <input
                              type="text"
                              value={nuevoClienteNombre}
                              onChange={(e) => setNuevoClienteNombre(e.target.value)}
                              placeholder="Nombre del cliente"
                              className={!nuevoClienteNombre.trim() && error ? "field-error" : ""}
                            />
                            {!nuevoClienteNombre.trim() && error && (
                              <span className="field-error-message">
                                Nombre es obligatorio
                              </span>
                            )}
                          </div>
                          <div className="form-group">
                            <label>Teléfono:</label>
                            <input
                              type="tel"
                              value={nuevoClienteTelefono}
                              onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                              placeholder="Teléfono del cliente"
                              className={!nuevoClienteTelefono.trim() && error ? "field-error" : ""}
                            />
                            {!nuevoClienteTelefono.trim() && error && (
                              <span className="field-error-message">
                                Teléfono es obligatorio
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="nuevo-cliente-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setCrearNuevoCliente(false);
                              setNuevoClienteNombre("");
                              setNuevoClienteTelefono("");
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

      {/* Componente de pantalla completa */}
      <FullscreenCalendar
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        reservas={reservasFiltradas}
        servicios={servicios}
        staff={staff}
        categorias={categorias}
        onRefreshData={fetchAllData}
        tenant={tenant || 'default'}
      />
    </div>
  );
};

export default DashboardPage;
