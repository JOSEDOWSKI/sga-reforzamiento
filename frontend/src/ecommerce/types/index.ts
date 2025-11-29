// Tipos basados en la estructura de la base de datos

export interface Aliado {
  id: number;
  nombre: string;
  descripcion?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais: string;
  logo_url?: string;
  timezone: string;
  categoria?: string;
  estado: 'activo' | 'suspendido' | 'cancelado';
  show_in_marketplace: boolean;
  created_at: string;
  updated_at: string;
  ultimo_acceso?: string;
  // Campos calculados para el frontend
  rating?: number;
  num_reviews?: number;
  distancia_km?: number;
}

export interface Establecimiento {
  id: number;
  aliado_id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Colaborador {
  id: number;
  aliado_id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'vendedor' | 'colaborador';
  tarifa_por_hora?: number;
  establecimiento_id?: number;
  activo: boolean;
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: number;
  aliado_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  aliado_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  category_id?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HorarioAtencion {
  id: number;
  aliado_id: number;
  colaborador_id: number;
  dia_semana: number; // 0=domingo, 1=lunes, ..., 6=sábado
  hora_apertura: string;
  hora_cierre: string;
  break_start?: string;
  break_end?: string;
  intervalo_minutos: number;
  activo: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
  rangos?: HorarioAtencionRango[];
}

export interface HorarioAtencionRango {
  id: number;
  horario_atencion_id: number;
  hora_inicio: string;
  hora_fin: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reserva {
  id: number;
  aliado_id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  colaborador_id: number;
  establecimiento_id: number;
  perfil_cliente_id: number;
  service_id?: number;
  notas?: string;
  precio?: number;
  estado: 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
  recurrence_rule?: string;
  recurrence_id?: number;
  created_at: string;
  updated_at: string;
}

export interface UsuarioGlobal {
  id: number;
  email: string;
  telefono: string;
  created_at: string;
  updated_at: string;
}

export interface PerfilClienteAliado {
  id: number;
  aliado_id: number;
  usuario_global_id: number;
  notes?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para el frontend
export interface UbicacionUsuario {
  latitud: number;
  longitud: number;
  ciudad: string;
  direccion?: string;
}

export interface FiltrosBusqueda {
  ciudad?: string;
  categoria?: string;
  ordenarPor?: 'relevancia' | 'nombre' | 'rating' | 'distancia';
  distanciaMaxima?: number; // en km
  busquedaTexto?: string;
}

export interface SlotDisponible {
  fecha: string;
  hora: string;
  disponible: boolean;
  colaborador_id: number;
  colaborador_nombre: string;
}

export interface ReservaFormData {
  aliado_id: number;
  establecimiento_id: number;
  colaborador_id: number;
  service_id?: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  notas?: string;
}

