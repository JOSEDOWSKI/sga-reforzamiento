// Base de datos demo completa para modo demo
import { Aliado, Service, Colaborador, Establecimiento, SlotDisponible } from '@types';

// Detectar si estamos en modo demo
export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('demo.weekly.pe') || hostname === 'demo.weekly.pe';
};

// Aliados demo
export const DEMO_ALIADOS: Aliado[] = [
  {
    id: 1,
    nombre: 'Salón Bella Vista',
    descripcion: 'Salón de belleza profesional con los mejores estilistas de Lima. Especialistas en cortes modernos, coloración y tratamientos capilares. Más de 10 años de experiencia.',
    email: 'contacto@salonbellavista.com',
    telefono: '+51 999 888 777',
    direccion: 'Av. Principal 123, Miraflores',
    ciudad: 'lima',
    pais: 'peru',
    logo_url: 'https://via.placeholder.com/300x200?text=Salon+Bella+Vista',
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
    nombre: 'Spa Relax & Wellness',
    descripcion: 'Centro de relajación y bienestar integral. Ofrecemos masajes terapéuticos, faciales, tratamientos corporales y sesiones de relajación. Ambiente tranquilo y profesional.',
    email: 'info@sparelax.com',
    telefono: '+51 999 888 666',
    direccion: 'Jr. Los Olivos 456, San Isidro',
    ciudad: 'lima',
    pais: 'peru',
    logo_url: 'https://via.placeholder.com/300x200?text=Spa+Relax',
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
    descripcion: 'Atención dental de calidad con tecnología de última generación. Especialistas en ortodoncia, implantes, blanqueamiento y odontología general. Consultorios modernos y equipados.',
    email: 'contacto@clinicasonrisa.com',
    telefono: '+51 999 888 555',
    direccion: 'Av. San Martín 789, Surco',
    ciudad: 'lima',
    pais: 'peru',
    logo_url: 'https://via.placeholder.com/300x200?text=Clinica+Dental',
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
  {
    id: 4,
    nombre: 'Academia de Música Harmony',
    descripcion: 'Escuela de música para todas las edades. Clases de piano, guitarra, violín, canto y más. Profesores certificados y metodología personalizada.',
    email: 'info@harmony.com',
    telefono: '+51 999 888 444',
    direccion: 'Calle Las Flores 321, La Molina',
    ciudad: 'lima',
    pais: 'peru',
    logo_url: 'https://via.placeholder.com/300x200?text=Academia+Harmony',
    categoria: 'academia',
    estado: 'activo',
    show_in_marketplace: true,
    timezone: 'America/Lima',
    rating: 4.6,
    num_reviews: 34,
    distancia_km: 7.1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    nombre: 'Cancha Deportiva El Gol',
    descripcion: 'Canchas de fútbol sintético y natural. Alquiler por horas, torneos y eventos. Iluminación LED, vestuarios y estacionamiento. Ideal para partidos entre amigos.',
    email: 'reservas@elgol.com',
    telefono: '+51 999 888 333',
    direccion: 'Av. Deportiva 567, San Borja',
    ciudad: 'lima',
    pais: 'peru',
    logo_url: 'https://via.placeholder.com/300x200?text=Cancha+El+Gol',
    categoria: 'cancha',
    estado: 'activo',
    show_in_marketplace: true,
    timezone: 'America/Lima',
    rating: 4.4,
    num_reviews: 89,
    distancia_km: 4.3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    nombre: 'Gimnasio FitZone',
    descripcion: 'Gimnasio moderno con equipos de última generación. Entrenadores personales, clases grupales, área de cardio y pesas. Ambiente motivador y profesional.',
    email: 'info@fitzone.com',
    telefono: '+51 999 888 222',
    direccion: 'Av. Ejército 890, Magdalena',
    ciudad: 'lima',
    pais: 'peru',
    logo_url: 'https://via.placeholder.com/300x200?text=Gimnasio+FitZone',
    categoria: 'gimnasio',
    estado: 'activo',
    show_in_marketplace: true,
    timezone: 'America/Lima',
    rating: 4.9,
    num_reviews: 156,
    distancia_km: 6.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Servicios demo por aliado
export const DEMO_SERVICIOS: Record<number, Service[]> = {
  1: [ // Salón Bella Vista
    {
      id: 101,
      aliado_id: 1,
      name: 'Corte de Cabello',
      description: 'Corte moderno y personalizado según tu estilo',
      duration_minutes: 45,
      price: 35.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 102,
      aliado_id: 1,
      name: 'Coloración Completa',
      description: 'Tinte profesional con productos de calidad',
      duration_minutes: 120,
      price: 120.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 103,
      aliado_id: 1,
      name: 'Tratamiento Capilar',
      description: 'Hidratación y reparación profunda',
      duration_minutes: 60,
      price: 80.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 104,
      aliado_id: 1,
      name: 'Peinado y Maquillaje',
      description: 'Peinado para eventos especiales',
      duration_minutes: 90,
      price: 95.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  2: [ // Spa Relax
    {
      id: 201,
      aliado_id: 2,
      name: 'Masaje Relajante',
      description: 'Masaje de cuerpo completo para relajación',
      duration_minutes: 60,
      price: 100.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 202,
      aliado_id: 2,
      name: 'Facial Limpieza Profunda',
      description: 'Tratamiento facial con productos naturales',
      duration_minutes: 75,
      price: 85.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 203,
      aliado_id: 2,
      name: 'Tratamiento Corporal',
      description: 'Exfoliación e hidratación corporal',
      duration_minutes: 90,
      price: 120.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  3: [ // Clínica Dental
    {
      id: 301,
      aliado_id: 3,
      name: 'Consulta General',
      description: 'Revisión dental completa',
      duration_minutes: 30,
      price: 80.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 302,
      aliado_id: 3,
      name: 'Limpieza Dental',
      description: 'Limpieza profesional y profilaxis',
      duration_minutes: 45,
      price: 120.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 303,
      aliado_id: 3,
      name: 'Blanqueamiento',
      description: 'Tratamiento de blanqueamiento dental',
      duration_minutes: 90,
      price: 350.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  4: [ // Academia
    {
      id: 401,
      aliado_id: 4,
      name: 'Clase de Piano',
      description: 'Clase individual de piano',
      duration_minutes: 60,
      price: 50.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 402,
      aliado_id: 4,
      name: 'Clase de Guitarra',
      description: 'Clase individual de guitarra',
      duration_minutes: 60,
      price: 45.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  5: [ // Cancha
    {
      id: 501,
      aliado_id: 5,
      name: 'Alquiler Cancha Sintética',
      description: 'Alquiler por hora de cancha sintética',
      duration_minutes: 60,
      price: 80.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  6: [ // Gimnasio
    {
      id: 601,
      aliado_id: 6,
      name: 'Entrenamiento Personal',
      description: 'Sesión de entrenamiento personalizado',
      duration_minutes: 60,
      price: 60.00,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Colaboradores demo por aliado
export const DEMO_COLABORADORES: Record<number, Colaborador[]> = {
  1: [ // Salón Bella Vista
    {
      id: 1001,
      aliado_id: 1,
      nombre: 'María González',
      email: 'maria@salonbellavista.com',
      telefono: '+51 999 111 222',
      rol: 'colaborador',
      tarifa_por_hora: 40,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 1002,
      aliado_id: 1,
      nombre: 'Carlos Ramírez',
      email: 'carlos@salonbellavista.com',
      telefono: '+51 999 111 333',
      rol: 'colaborador',
      tarifa_por_hora: 45,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 1003,
      aliado_id: 1,
      nombre: 'Ana Martínez',
      email: 'ana@salonbellavista.com',
      telefono: '+51 999 111 444',
      rol: 'colaborador',
      tarifa_por_hora: 38,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  2: [ // Spa Relax
    {
      id: 2001,
      aliado_id: 2,
      nombre: 'Laura Sánchez',
      email: 'laura@sparelax.com',
      telefono: '+51 999 222 111',
      rol: 'colaborador',
      tarifa_por_hora: 50,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2002,
      aliado_id: 2,
      nombre: 'Roberto Torres',
      email: 'roberto@sparelax.com',
      telefono: '+51 999 222 222',
      rol: 'colaborador',
      tarifa_por_hora: 55,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  3: [ // Clínica Dental
    {
      id: 3001,
      aliado_id: 3,
      nombre: 'Dr. Pedro Mendoza',
      email: 'pedro@clinicasonrisa.com',
      telefono: '+51 999 333 111',
      rol: 'colaborador',
      tarifa_por_hora: 100,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3002,
      aliado_id: 3,
      nombre: 'Dra. Carmen López',
      email: 'carmen@clinicasonrisa.com',
      telefono: '+51 999 333 222',
      rol: 'colaborador',
      tarifa_por_hora: 120,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  4: [ // Academia
    {
      id: 4001,
      aliado_id: 4,
      nombre: 'Prof. Juan Pérez',
      email: 'juan@harmony.com',
      telefono: '+51 999 444 111',
      rol: 'colaborador',
      tarifa_por_hora: 50,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  5: [ // Cancha
    {
      id: 5001,
      aliado_id: 5,
      nombre: 'Administrador Cancha',
      email: 'admin@elgol.com',
      telefono: '+51 999 555 111',
      rol: 'admin',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  6: [ // Gimnasio
    {
      id: 6001,
      aliado_id: 6,
      nombre: 'Entrenador Miguel',
      email: 'miguel@fitzone.com',
      telefono: '+51 999 666 111',
      rol: 'colaborador',
      tarifa_por_hora: 60,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 6002,
      aliado_id: 6,
      nombre: 'Entrenadora Sofía',
      email: 'sofia@fitzone.com',
      telefono: '+51 999 666 222',
      rol: 'colaborador',
      tarifa_por_hora: 65,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Establecimientos demo por aliado
export const DEMO_ESTABLECIMIENTOS: Record<number, Establecimiento[]> = {
  1: [
    {
      id: 10001,
      aliado_id: 1,
      nombre: 'Sucursal Principal',
      direccion: 'Av. Principal 123, Miraflores',
      telefono: '+51 999 888 777',
      email: 'contacto@salonbellavista.com',
      latitud: -12.1194,
      longitud: -77.0302,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  2: [
    {
      id: 20001,
      aliado_id: 2,
      nombre: 'Spa Central',
      direccion: 'Jr. Los Olivos 456, San Isidro',
      telefono: '+51 999 888 666',
      email: 'info@sparelax.com',
      latitud: -12.0969,
      longitud: -77.0302,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  3: [
    {
      id: 30001,
      aliado_id: 3,
      nombre: 'Clínica Principal',
      direccion: 'Av. San Martín 789, Surco',
      telefono: '+51 999 888 555',
      email: 'contacto@clinicasonrisa.com',
      latitud: -12.0833,
      longitud: -76.9667,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  4: [
    {
      id: 40001,
      aliado_id: 4,
      nombre: 'Sede Principal',
      direccion: 'Calle Las Flores 321, La Molina',
      telefono: '+51 999 888 444',
      email: 'info@harmony.com',
      latitud: -12.0833,
      longitud: -76.9667,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  5: [
    {
      id: 50001,
      aliado_id: 5,
      nombre: 'Cancha 1 - Sintética',
      direccion: 'Av. Deportiva 567, San Borja',
      telefono: '+51 999 888 333',
      email: 'reservas@elgol.com',
      latitud: -12.0833,
      longitud: -76.9667,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  6: [
    {
      id: 60001,
      aliado_id: 6,
      nombre: 'Gimnasio Principal',
      direccion: 'Av. Ejército 890, Magdalena',
      telefono: '+51 999 888 222',
      email: 'info@fitzone.com',
      latitud: -12.0833,
      longitud: -76.9667,
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Generar slots disponibles demo
export const generarSlotsDemo = (
  colaboradorId: number,
  colaboradorNombre: string,
  fechaInicio: string,
  fechaFin: string
): SlotDisponible[] => {
  const slots: SlotDisponible[] = [];
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);
  
  // Generar slots de 9:00 AM a 6:00 PM cada 30 minutos
  const horas = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const minutos = [0, 30];
  
  let fechaActual = new Date(fechaInicioObj);
  
  while (fechaActual <= fechaFinObj) {
    const fechaStr = fechaActual.toISOString().split('T')[0];
    const diaSemana = fechaActual.getDay();
    
    // No generar slots los domingos (0) y algunos horarios ocupados aleatoriamente
    if (diaSemana !== 0) {
      horas.forEach((hora) => {
        minutos.forEach((minuto) => {
          // Omitir algunos slots aleatoriamente para simular ocupados
          const esOcupado = Math.random() < 0.3; // 30% de probabilidad de estar ocupado
          
          // No ocupar slots de 12:00-13:00 (almuerzo)
          const esAlmuerzo = hora === 12 && minuto === 0;
          
          if (!esAlmuerzo) {
            slots.push({
              fecha: fechaStr,
              hora: `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`,
              disponible: !esOcupado,
              colaborador_id: colaboradorId,
              colaborador_nombre: colaboradorNombre,
            });
          }
        });
      });
    }
    
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  return slots;
};

