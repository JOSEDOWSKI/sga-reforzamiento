/**
 * Datos mock para la demo cuando el backend no está disponible
 */

export interface MockServicio {
    id: number;
    nombre: string;
    descripcion: string;
    precio?: number;
    duracion_minutos?: number;
}

export interface MockStaff {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    especialidades?: string[];
    establecimiento_id?: number;
}

export interface MockCliente {
    id: number;
    nombre: string;
    telefono: string;
    email?: string;
    dni?: string;
}

export interface MockReserva {
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
    colaborador_id: number;
    colaborador_nombre: string;
    establecimiento_id: number;
    establecimiento_nombre: string;
    cliente_id: number;
    cliente_nombre: string;
    estado: string;
}

export interface MockCategoria {
    id: number;
    nombre: string;
    descripcion?: string;
    color?: string;
    curso_id?: number;
}

// Datos mock
export const mockServicios: MockServicio[] = [
    {
        id: 1,
        nombre: 'Probar la Demo',
        descripcion: 'Servicio principal para probar la funcionalidad de la demo',
        precio: 0,
        duracion_minutos: 30
    },
    {
        id: 2,
        nombre: 'Consulta General',
        descripcion: 'Consulta general de demostración',
        precio: 50,
        duracion_minutos: 60
    },
    {
        id: 3,
        nombre: 'Servicio Express',
        descripcion: 'Servicio rápido de demostración',
        precio: 25,
        duracion_minutos: 15
    }
];

export const mockStaff: MockStaff[] = [
    {
        id: 1,
        nombre: 'Colaborador Demo',
        email: 'colaborador@demo.weekly.pe',
        telefono: '+51 999 999 999',
        especialidades: ['Servicios Generales', 'Atención al Cliente'],
        establecimiento_id: 1
    },
    {
        id: 2,
        nombre: 'María García',
        email: 'maria@demo.weekly.pe',
        telefono: '+51 987 123 456',
        especialidades: ['Cortes', 'Peinados'],
        establecimiento_id: 1
    },
    {
        id: 3,
        nombre: 'Carlos López',
        email: 'carlos@demo.weekly.pe',
        telefono: '+51 987 123 457',
        especialidades: ['Consultas', 'Asesoría'],
        establecimiento_id: 1
    }
];

export const mockClientes: MockCliente[] = [
    {
        id: 1,
        nombre: 'Juan Pérez',
        telefono: '+51 987 111 222',
        email: 'juan@example.com',
        dni: '12345678'
    },
    {
        id: 2,
        nombre: 'María González',
        telefono: '+51 987 333 444',
        email: 'maria@example.com',
        dni: '87654321'
    },
    {
        id: 3,
        nombre: 'Pedro Sánchez',
        telefono: '+51 987 555 666',
        email: 'pedro@example.com',
        dni: '11223344'
    },
    {
        id: 4,
        nombre: 'Ana Martínez',
        telefono: '+51 987 777 888',
        email: 'ana@example.com',
        dni: '44332211'
    }
];

export const mockCategorias: MockCategoria[] = [
    {
        id: 1,
        nombre: 'Servicios Generales',
        descripcion: 'Categoría general para servicios',
        color: '#007bff',
        curso_id: 1
    },
    {
        id: 2,
        nombre: 'Consultas',
        descripcion: 'Consultas y asesorías',
        color: '#28a745',
        curso_id: 1
    },
    {
        id: 3,
        nombre: 'Servicios Express',
        descripcion: 'Servicios rápidos',
        color: '#ffc107',
        curso_id: 1
    }
];

// Generar reservas mock para los próximos días
const generateMockReservas = (): MockReserva[] => {
    const reservas: MockReserva[] = [];
    const hoy = new Date();
    const staff = mockStaff[0];
    
    // Crear algunas reservas para los próximos 7 días
    for (let i = 0; i < 5; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        fecha.setHours(9 + i, 30, 0, 0); // 9:30, 10:30, 11:30, etc.
        
        const fechaFin = new Date(fecha);
        fechaFin.setMinutes(fechaFin.getMinutes() + 30);
        
        reservas.push({
            id: i + 1,
            fecha_hora_inicio: fecha.toISOString(),
            fecha_hora_fin: fechaFin.toISOString(),
            nombre_alumno: mockClientes[i % mockClientes.length].nombre,
            telefono_alumno: mockClientes[i % mockClientes.length].telefono,
            curso_nombre: 'Establecimiento Demo',
            profesor_nombre: staff.nombre,
            tema_nombre: mockServicios[i % mockServicios.length].nombre,
            precio: mockServicios[i % mockServicios.length].precio || 0,
            estado_pago: i % 2 === 0 ? 'Pagado' : 'Falta pagar',
            duracion_horas: 0.5,
            colaborador_id: staff.id,
            colaborador_nombre: staff.nombre,
            establecimiento_id: 1,
            establecimiento_nombre: 'Establecimiento Demo',
            cliente_id: mockClientes[i % mockClientes.length].id,
            cliente_nombre: mockClientes[i % mockClientes.length].nombre,
            estado: 'confirmada'
        });
    }
    
    return reservas;
};

export const mockReservas: MockReserva[] = generateMockReservas();

// Función para simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Funciones para manejar reservas en localStorage
const STORAGE_KEY = 'demo_reservas';

export const saveReserva = (reserva: MockReserva) => {
    try {
        const saved = getSavedReservas();
        // Asignar un ID único si no tiene
        if (!reserva.id) {
            const maxId = Math.max(...saved.map(r => r.id || 0), ...mockReservas.map(r => r.id));
            reserva.id = maxId + 1;
        }
        saved.push(reserva);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (err) {
        console.error('Error guardando reserva en localStorage:', err);
    }
};

export const getSavedReservas = (): MockReserva[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (err) {
        console.error('Error leyendo reservas de localStorage:', err);
    }
    return [];
};

export const clearSavedReservas = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.error('Error limpiando reservas de localStorage:', err);
    }
};

// Simular respuestas de API
export const mockApiResponses = {
    servicios: async () => {
        await delay(300);
        return { success: true, data: mockServicios };
    },
    staff: async () => {
        await delay(300);
        return { success: true, data: mockStaff };
    },
    clientes: async () => {
        await delay(300);
        return { success: true, data: mockClientes };
    },
    reservas: async () => {
        await delay(300);
        // Combinar reservas mock con reservas guardadas en localStorage
        const savedReservas = getSavedReservas();
        const allReservas = [...mockReservas, ...savedReservas];
        // Ordenar por fecha
        allReservas.sort((a, b) => 
            new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime()
        );
        return { success: true, data: allReservas };
    },
    categorias: async () => {
        await delay(300);
        return { success: true, data: mockCategorias };
    },
    buscarClientes: async (termino: string) => {
        await delay(200);
        const filtrados = mockClientes.filter(c => 
            c.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            c.telefono.includes(termino) ||
            (c.email && c.email.toLowerCase().includes(termino.toLowerCase()))
        );
        return { success: true, data: filtrados };
    },
    // Función para manejar peticiones directamente (usada por el adapter de axios)
    handleRequest: async (url: string, method: string, data?: any) => {
        await delay(100);
        
        if (method === 'get') {
            if (url.includes('/servicios')) {
                return { data: await mockApiResponses.servicios() };
            }
            if (url.includes('/staff')) {
                return { data: await mockApiResponses.staff() };
            }
            if (url.includes('/clientes')) {
                return { data: await mockApiResponses.clientes() };
            }
            if (url.includes('/reservas')) {
                return { data: await mockApiResponses.reservas() };
            }
            if (url.includes('/categorias')) {
                return { data: await mockApiResponses.categorias() };
            }
            if (url.includes('/tenants/config')) {
                return {
                    data: {
                        success: true,
                        data: {
                            id: 1,
                            tenant_name: 'demo',
                            display_name: 'Demo Weekly',
                            cliente_nombre: 'Demo Weekly',
                            cliente_email: 'demo@weekly.pe',
                            cliente_telefono: '+51 999 999 999',
                            cliente_direccion: 'Lima, Perú',
                            estado: 'activo',
                            plan: 'basico',
                            config: {
                                uiLabels: {
                                    colaboradores: 'Colaboradores',
                                    colaborador: 'Colaborador',
                                    servicios: 'Servicios',
                                    clientes: 'Clientes',
                                    establecimientos: 'Establecimientos'
                                },
                                features: {
                                    servicios: true,
                                    categorias: true,
                                    recursos: false
                                },
                                reservationMode: 'service_only'
                            }
                        }
                    }
                };
            }
            if (url.includes('/availability')) {
                // Retornar disponibilidad vacía (se calculará en el frontend)
                return { data: { success: true, data: [] } };
            }
            if (url.includes('/admin/tenant/config') && method === 'get') {
                // Configuración mock del tenant para demo
                const savedConfig = localStorage.getItem('demo_tenant_config');
                const defaultConfig = {
                    features: {
                        servicios: true,
                        categorias: true,
                        recursos_fisicos: false
                    },
                    uiLabels: {
                        colaborador: 'Colaborador',
                        colaboradores: 'Colaboradores',
                        establecimiento: 'Establecimiento',
                        establecimientos: 'Establecimientos',
                        cliente: 'Cliente',
                        clientes: 'Clientes',
                        reserva: 'Reserva',
                        reservas: 'Reservas',
                        recurso: 'Recurso',
                        recursos: 'Recursos'
                    },
                    entityNames: {
                        colaboradores: 'colaboradores',
                        establecimientos: 'establecimientos',
                        clientes: 'clientes',
                        reservas: 'reservas',
                        recursos: 'recursos'
                    },
                    reservationMode: 'servicio'
                };
                
                return {
                    data: {
                        success: true,
                        data: {
                            config: savedConfig ? JSON.parse(savedConfig) : defaultConfig
                        }
                    }
                };
            }
        }
        
        if (method === 'post' && (url.includes('/reservas') || url.includes('/public/reservas'))) {
            // Obtener datos de staff y servicios mock para completar la información
            const mockStaffData = await mockApiResponses.staff();
            const mockServiciosData = await mockApiResponses.servicios();
            
            const reservaData = typeof data === 'string' ? JSON.parse(data) : data;
            const staff = mockStaffData.data.find((s: any) => s.id === reservaData.colaborador_id) || mockStaffData.data[0];
            const servicio = mockServiciosData.data.find((s: any) => s.id === reservaData.servicio_id) || mockServiciosData.data[0];
            
            const nuevaReserva: MockReserva = {
                id: Date.now(),
                fecha_hora_inicio: reservaData.fecha_hora_inicio,
                fecha_hora_fin: reservaData.fecha_hora_fin,
                nombre_alumno: reservaData.cliente_nombre || reservaData.nombre_alumno || 'Cliente',
                telefono_alumno: reservaData.cliente_telefono || reservaData.telefono_alumno,
                curso_nombre: reservaData.establecimiento_nombre || servicio?.nombre || 'Establecimiento Demo',
                profesor_nombre: staff?.nombre || reservaData.colaborador_nombre || 'Colaborador Demo',
                tema_nombre: reservaData.servicio_descripcion || servicio?.nombre || 'Servicio',
                precio: reservaData.precio || servicio?.precio || 0,
                estado_pago: reservaData.estado_pago || 'Falta pagar',
                duracion_horas: reservaData.duracion_horas || (servicio?.duracion_minutos ? servicio.duracion_minutos / 60 : 0.5),
                colaborador_id: reservaData.colaborador_id || staff?.id || 1,
                colaborador_nombre: staff?.nombre || reservaData.colaborador_nombre || 'Colaborador Demo',
                establecimiento_id: reservaData.establecimiento_id || 1,
                establecimiento_nombre: reservaData.establecimiento_nombre || servicio?.nombre || 'Establecimiento Demo',
                cliente_id: reservaData.cliente_id || 1,
                cliente_nombre: reservaData.cliente_nombre || reservaData.nombre_alumno || 'Cliente',
                estado: 'confirmada'
            };
            saveReserva(nuevaReserva);
            return { data: { success: true, data: nuevaReserva } };
        }
        
        if (method === 'put' && url.includes('/admin/tenant/config')) {
            // Guardar configuración del tenant en localStorage para demo
            try {
                const requestData = typeof data === 'string' ? JSON.parse(data) : data;
                const configData = requestData.config || requestData;
                localStorage.setItem('demo_tenant_config', JSON.stringify(configData));
                return { 
                    data: { 
                        success: true, 
                        data: {
                            config: configData,
                            message: 'Configuración actualizada exitosamente'
                        }
                    } 
                };
            } catch (err) {
                return { data: { success: true, data: { config: data } } };
            }
        }
        
        if (method === 'post' && url.includes('/configuracion/logo')) {
            // En demo, simular subida de logo
            return { data: { success: true, url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2N2VlYSIvPjwvc3ZnPg==' } };
        }
        
        // Default: respuesta vacía
        return { data: { success: true, data: [] } };
    }
};

