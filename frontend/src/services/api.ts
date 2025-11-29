import axios from 'axios';
import { Aliado, Service, Colaborador, Establecimiento, FiltrosBusqueda, SlotDisponible, ReservaFormData, Reserva } from '@types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('weekly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Obtiene aliados (negocios) para el marketplace
 */
export const obtenerAliados = async (
  filtros: FiltrosBusqueda,
  ubicacionUsuario?: { latitud: number; longitud: number }
): Promise<Aliado[]> => {
  // Datos mock para desarrollo sin backend
  const mockAliados: Aliado[] = [
    {
      id: 1,
      nombre: 'Salón Bella Vista',
      descripcion: 'Salón de belleza profesional con los mejores estilistas',
      email: 'contacto@salonbellavista.com',
      telefono: '+51 999 888 777',
      direccion: 'Av. Principal 123',
      ciudad: 'lima',
      pais: 'peru',
      categoria: 'peluqueria',
      estado: 'activo',
      show_in_marketplace: true,
      timezone: 'America/Lima',
      rating: 4.5,
      num_reviews: 23,
      distancia_km: 2.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      nombre: 'Spa Relax',
      descripcion: 'Centro de relajación y bienestar',
      email: 'info@sparelax.com',
      telefono: '+51 999 888 666',
      direccion: 'Jr. Los Olivos 456',
      ciudad: 'lima',
      pais: 'peru',
      categoria: 'spa',
      estado: 'activo',
      show_in_marketplace: true,
      timezone: 'America/Lima',
      rating: 4.8,
      num_reviews: 45,
      distancia_km: 5.2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      nombre: 'Clínica Dental Sonrisa',
      descripcion: 'Atención dental de calidad',
      email: 'contacto@clinicasonrisa.com',
      telefono: '+51 999 888 555',
      direccion: 'Av. San Martín 789',
      ciudad: 'lima',
      pais: 'peru',
      categoria: 'clinica',
      estado: 'activo',
      show_in_marketplace: true,
      timezone: 'America/Lima',
      rating: 4.7,
      num_reviews: 67,
      distancia_km: 3.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  try {
    const params = new URLSearchParams();

    if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.busquedaTexto) params.append('busqueda', filtros.busquedaTexto);
    if (filtros.ordenarPor) params.append('ordenar_por', filtros.ordenarPor);
    if (filtros.distanciaMaxima) params.append('distancia_max', filtros.distanciaMaxima.toString());

    if (ubicacionUsuario) {
      params.append('lat', ubicacionUsuario.latitud.toString());
      params.append('lng', ubicacionUsuario.longitud.toString());
    }

    const response = await api.get<Aliado[]>(`/marketplace/aliados?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando datos mock:', error);
    // Filtrar datos mock según filtros
    let filtered = mockAliados;
    if (filtros.ciudad) {
      filtered = filtered.filter((a) => a.ciudad === filtros.ciudad);
    }
    if (filtros.categoria) {
      filtered = filtered.filter((a) => a.categoria === filtros.categoria);
    }
    if (filtros.busquedaTexto) {
      const search = filtros.busquedaTexto.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nombre.toLowerCase().includes(search) ||
          a.descripcion?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }
};

/**
 * Obtiene un aliado por ID
 */
export const obtenerAliadoPorId = async (id: number): Promise<Aliado> => {
  const response = await api.get<Aliado>(`/marketplace/aliados/${id}`);
  return response.data;
};

/**
 * Obtiene servicios de un aliado
 */
export const obtenerServiciosPorAliado = async (aliadoId: number): Promise<Service[]> => {
  const response = await api.get<Service[]>(`/marketplace/aliados/${aliadoId}/servicios`);
  return response.data;
};

/**
 * Obtiene establecimientos de un aliado
 */
export const obtenerEstablecimientosPorAliado = async (
  aliadoId: number
): Promise<Establecimiento[]> => {
  const response = await api.get<Establecimiento[]>(
    `/marketplace/aliados/${aliadoId}/establecimientos`
  );
  return response.data;
};

/**
 * Obtiene colaboradores de un aliado
 */
export const obtenerColaboradoresPorAliado = async (
  aliadoId: number
): Promise<Colaborador[]> => {
  const response = await api.get<Colaborador[]>(
    `/marketplace/aliados/${aliadoId}/colaboradores`
  );
  return response.data;
};

/**
 * Obtiene slots disponibles para un colaborador en un rango de fechas
 */
export const obtenerSlotsDisponibles = async (
  aliadoId: number,
  colaboradorId: number,
  fechaInicio: string,
  fechaFin: string
): Promise<SlotDisponible[]> => {
  const params = new URLSearchParams({
    colaborador_id: colaboradorId.toString(),
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  });

  const response = await api.get<SlotDisponible[]>(
    `/marketplace/aliados/${aliadoId}/slots-disponibles?${params.toString()}`
  );
  return response.data;
};

/**
 * Crea una reserva
 */
export const crearReserva = async (datosReserva: ReservaFormData): Promise<Reserva> => {
  const response = await api.post<Reserva>('/marketplace/reservas', datosReserva);
  return response.data;
};

/**
 * Obtiene categorías populares
 */
export const obtenerCategoriasPopulares = async (ciudad?: string): Promise<string[]> => {
  const mockCategorias = ['peluqueria', 'spa', 'clinica', 'academia', 'cancha', 'gimnasio'];
  
  try {
    const params = ciudad ? `?ciudad=${ciudad}` : '';
    const response = await api.get<string[]>(`/marketplace/categorias-populares${params}`);
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando datos mock:', error);
    return mockCategorias;
  }
};

/**
 * Búsqueda de aliados por texto
 */
export const buscarAliados = async (
  busqueda: string,
  ciudad?: string
): Promise<Aliado[]> => {
  const params = new URLSearchParams({ busqueda });
  if (ciudad) params.append('ciudad', ciudad);

  const response = await api.get<Aliado[]>(`/marketplace/buscar?${params.toString()}`);
  return response.data;
};

export default api;

