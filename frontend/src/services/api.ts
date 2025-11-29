import axios from 'axios';
import { Aliado, Service, Colaborador, Establecimiento, FiltrosBusqueda, SlotDisponible, ReservaFormData, Reserva } from '@types';
import {
  isDemoMode,
  DEMO_ALIADOS,
  DEMO_SERVICIOS,
  DEMO_COLABORADORES,
  DEMO_ESTABLECIMIENTOS,
  generarSlotsDemo,
} from './demoData';

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
  // Si estamos en modo demo, usar datos demo directamente
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Usando datos demo para aliados');
    let filtered = [...DEMO_ALIADOS];
    
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
    console.warn('Error conectando con API, usando datos demo:', error);
    // En caso de error, usar datos demo
    let filtered = [...DEMO_ALIADOS];
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
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Usando datos demo para aliado', id);
    const aliado = DEMO_ALIADOS.find((a) => a.id === id);
    if (aliado) return aliado;
    throw new Error('Aliado no encontrado');
  }

  try {
    const response = await api.get<Aliado>(`/marketplace/aliados/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando datos demo:', error);
    const aliado = DEMO_ALIADOS.find((a) => a.id === id);
    if (aliado) return aliado;
    throw new Error('Aliado no encontrado');
  }
};

/**
 * Obtiene servicios de un aliado
 */
export const obtenerServiciosPorAliado = async (aliadoId: number): Promise<Service[]> => {
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Usando datos demo para servicios', aliadoId);
    return DEMO_SERVICIOS[aliadoId] || [];
  }

  try {
    const response = await api.get<Service[]>(`/marketplace/aliados/${aliadoId}/servicios`);
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando datos demo:', error);
    return DEMO_SERVICIOS[aliadoId] || [];
  }
};

/**
 * Obtiene establecimientos de un aliado
 */
export const obtenerEstablecimientosPorAliado = async (
  aliadoId: number
): Promise<Establecimiento[]> => {
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Usando datos demo para establecimientos', aliadoId);
    return DEMO_ESTABLECIMIENTOS[aliadoId] || [];
  }

  try {
    const response = await api.get<Establecimiento[]>(
      `/marketplace/aliados/${aliadoId}/establecimientos`
    );
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando datos demo:', error);
    return DEMO_ESTABLECIMIENTOS[aliadoId] || [];
  }
};

/**
 * Obtiene colaboradores de un aliado
 */
export const obtenerColaboradoresPorAliado = async (
  aliadoId: number
): Promise<Colaborador[]> => {
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Usando datos demo para colaboradores', aliadoId);
    return DEMO_COLABORADORES[aliadoId] || [];
  }

  try {
    const response = await api.get<Colaborador[]>(
      `/marketplace/aliados/${aliadoId}/colaboradores`
    );
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando datos demo:', error);
    return DEMO_COLABORADORES[aliadoId] || [];
  }
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
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Generando slots demo', { aliadoId, colaboradorId, fechaInicio, fechaFin });
    const colaborador = DEMO_COLABORADORES[aliadoId]?.find((c) => c.id === colaboradorId);
    if (colaborador) {
      return generarSlotsDemo(colaboradorId, colaborador.nombre, fechaInicio, fechaFin);
    }
    return [];
  }

  try {
    const params = new URLSearchParams({
      colaborador_id: colaboradorId.toString(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });

    const response = await api.get<SlotDisponible[]>(
      `/marketplace/aliados/${aliadoId}/slots-disponibles?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, generando slots demo:', error);
    const colaborador = DEMO_COLABORADORES[aliadoId]?.find((c) => c.id === colaboradorId);
    if (colaborador) {
      return generarSlotsDemo(colaboradorId, colaborador.nombre, fechaInicio, fechaFin);
    }
    return [];
  }
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
  const categoriasDemo = ['peluqueria', 'spa', 'clinica', 'academia', 'cancha', 'gimnasio'];
  
  if (isDemoMode()) {
    console.log('🎮 Modo Demo: Usando categorías demo');
    return categoriasDemo;
  }

  try {
    const params = ciudad ? `?ciudad=${ciudad}` : '';
    const response = await api.get<string[]>(`/marketplace/categorias-populares${params}`);
    return response.data;
  } catch (error) {
    console.warn('Error conectando con API, usando categorías demo:', error);
    return categoriasDemo;
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

