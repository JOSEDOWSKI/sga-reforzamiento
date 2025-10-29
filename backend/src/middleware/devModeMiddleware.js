/**
 * Middleware de desarrollo que simula la base de datos cuando PostgreSQL no está disponible
 * Solo se usa en modo desarrollo cuando no se puede conectar a la base de datos
 * Soporte para subdominios: cliente.weekly -> tenant "cliente"
 */

const devModeMiddleware = async (req, res, next) => {
    try {
        // Simular información del tenant basado en subdominio
        const host = req.get('host') || '';
        const subdomain = extractSubdomain(host);
        
               // Determinar el tipo de acceso
               if (subdomain === 'panel') {
                   // Panel global de super administración
                   req.tenant = 'global';
                   req.tenantType = 'global';
                   req.database = 'weekly_global';
               } else if (subdomain) {
            // Panel de cliente específico
            req.tenant = subdomain;
            req.tenantType = 'tenant';
            req.database = `weekly_${subdomain}`;
        } else {
            // Acceso público (sin subdominio)
            req.tenant = 'public';
            req.tenantType = 'public';
            req.database = null;
        }
        
        // En desarrollo, usar 'demo' como tenant por defecto para tenants
        const tenant = req.tenantType === 'tenant' ? (subdomain || process.env.DEFAULT_TENANT || 'demo') : req.tenant;
        
        // Simular conexión a base de datos
        const mockDb = {
            query: async (sql, params = []) => {
                console.log(`[DEV MODE] Simulando query: ${sql.substring(0, 100)}...`);
                
                // Simular respuestas básicas para diferentes queries
                
                // Queries para usuarios globales (super admin)
                if (sql.includes('usuarios_global') && sql.includes('email')) {
                    console.log(`[DEV MODE] Login global intentado para: ${params[0]}`);
                    return {
                        rows: [
                            {
                                id: 1,
                                email: 'admin@weekly.com',
                                password_hash: '$2b$10$FPuiZ88vpb307B6Pl467s.ir/aNT7tRYcXPtHwSMowlMYD9pZUc0i', // password: "password"
                                nombre: 'Super Administrador',
                                rol: 'super_admin',
                                activo: true,
                                ultimo_acceso: new Date(),
                                created_at: new Date('2024-01-01'),
                                updated_at: new Date('2024-01-01')
                            }
                        ]
                    };
                }
                
                       if (sql.includes('tenants')) {
                           return {
                               rows: [
                                   {
                                       id: 1,
                                       tenant_name: 'demo',
                                       display_name: 'Demo Tenant',
                                       cliente_nombre: 'Cliente Demo',
                                       cliente_email: 'demo@weekly.com',
                                       cliente_telefono: '+51 987 654 321',
                                       cliente_direccion: 'Lima, Perú',
                                       estado: 'activo',
                                       plan: 'basico',
                                       tutorial_enabled: true, // Tutorial habilitado solo para demo
                                       created_at: new Date('2024-01-01'),
                                       updated_at: new Date('2024-01-01')
                                   },
                                   {
                                       id: 2,
                                       tenant_name: 'cliente',
                                       display_name: 'Cliente Real',
                                       cliente_nombre: 'Empresa Cliente',
                                       cliente_email: 'cliente@weekly.com',
                                       cliente_telefono: '+51 987 123 456',
                                       cliente_direccion: 'Arequipa, Perú',
                                       estado: 'activo',
                                       plan: 'premium',
                                       tutorial_enabled: false, // Tutorial deshabilitado para clientes reales
                                       created_at: new Date('2024-01-15'),
                                       updated_at: new Date('2024-01-15')
                                   },
                                   {
                                       id: 3,
                                       tenant_name: 'peluqueria',
                                       display_name: 'Peluquería Bella Vista',
                                       cliente_nombre: 'Peluquería Bella Vista',
                                       cliente_email: 'info@bellavista.com',
                                       cliente_telefono: '+51 987 654 321',
                                       cliente_direccion: 'Av. Principal 123, Lima',
                                       estado: 'activo',
                                       plan: 'basico',
                                       tutorial_enabled: false, // Tutorial deshabilitado para clientes reales
                                       created_at: new Date('2024-01-20'),
                                       updated_at: new Date('2024-01-20')
                                   },
                                   {
                                       id: 4,
                                       tenant_name: 'academia',
                                       display_name: 'Academia Refuerzo Plus',
                                       cliente_nombre: 'Academia Refuerzo Plus',
                                       cliente_email: 'info@refuerzoplus.com',
                                       cliente_telefono: '+51 987 123 456',
                                       cliente_direccion: 'Jr. Educación 456, Lima',
                                       estado: 'activo',
                                       plan: 'premium',
                                       tutorial_enabled: false, // Tutorial deshabilitado para clientes reales
                                       created_at: new Date('2024-01-25'),
                                       updated_at: new Date('2024-01-25')
                                   }
                               ]
                           };
                       }
                
                if (sql.includes('SELECT') && sql.includes('establecimientos')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'Peluquería Bella Vista',
                                descripcion: 'Salón de belleza especializado en cortes y peinados',
                                tipo_negocio: 'peluqueria',
                                direccion: 'Av. Principal 123, Lima',
                                telefono: '+51 987 654 321',
                                email: 'info@bellavista.com',
                                activo: true,
                                created_at: new Date('2024-01-15'),
                                updated_at: new Date('2024-01-15')
                            },
                            {
                                id: 2,
                                nombre: 'Academia Refuerzo Plus',
                                descripcion: 'Centro de clases particulares y reforzamiento escolar',
                                tipo_negocio: 'clases_reforzamiento',
                                direccion: 'Jr. Educación 456, Lima',
                                telefono: '+51 987 123 456',
                                email: 'info@refuerzoplus.com',
                                activo: true,
                                created_at: new Date('2024-01-20'),
                                updated_at: new Date('2024-01-20')
                            },
                            {
                                id: 3,
                                nombre: 'Canchas Deportivas El Gol',
                                descripcion: 'Complejo deportivo con canchas de fútbol',
                                tipo_negocio: 'cancha_futbol',
                                direccion: 'Av. Deportiva 789, Lima',
                                telefono: '+51 987 789 123',
                                email: 'info@elgol.com',
                                activo: true,
                                created_at: new Date('2024-02-01'),
                                updated_at: new Date('2024-02-01')
                            },
                            {
                                id: 4,
                                nombre: 'Veterinaria Mascotas Felices',
                                descripcion: 'Clínica veterinaria y peluquería canina',
                                tipo_negocio: 'veterinaria',
                                direccion: 'Jr. Animales 321, Lima',
                                telefono: '+51 987 321 789',
                                email: 'info@mascotasfelices.com',
                                activo: true,
                                created_at: new Date('2024-02-10'),
                                updated_at: new Date('2024-02-10')
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('colaboradores')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'María González',
                                email: 'maria@bellavista.com',
                                telefono: '+51 987 654 321',
                                especialidades: ['Cortes', 'Peinados', 'Coloración'],
                                tarifa_por_hora: 25.00,
                                establecimiento_id: 1,
                                activo: true,
                                created_at: new Date('2024-01-15'),
                                updated_at: new Date('2024-01-15')
                            },
                            {
                                id: 2,
                                nombre: 'Prof. Juan Pérez',
                                email: 'juan@refuerzoplus.com',
                                telefono: '+51 987 123 456',
                                especialidades: ['Matemáticas', 'Física', 'Química'],
                                tarifa_por_hora: 30.00,
                                establecimiento_id: 2,
                                activo: true,
                                created_at: new Date('2024-01-20'),
                                updated_at: new Date('2024-01-20')
                            },
                            {
                                id: 3,
                                nombre: 'Dr. Carlos Veterinario',
                                email: 'carlos@mascotasfelices.com',
                                telefono: '+51 987 321 789',
                                especialidades: ['Cirugía', 'Consulta General', 'Peluquería Canina'],
                                tarifa_por_hora: 40.00,
                                establecimiento_id: 4,
                                activo: true,
                                created_at: new Date('2024-02-10'),
                                updated_at: new Date('2024-02-10')
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('clientes')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'Ana López',
                                telefono: '+51 987 111 111',
                                dni: '12345678',
                                email: 'ana@example.com',
                                activo: true,
                                created_at: new Date('2024-01-15'),
                                updated_at: new Date('2024-01-15')
                            },
                            {
                                id: 2,
                                nombre: 'Carlos Ruiz',
                                telefono: '+51 987 222 222',
                                dni: '87654321',
                                email: 'carlos@example.com',
                                activo: true,
                                created_at: new Date('2024-01-20'),
                                updated_at: new Date('2024-01-20')
                            },
                            {
                                id: 3,
                                nombre: 'María Fernández',
                                telefono: '+51 987 333 333',
                                dni: '11223344',
                                email: 'maria@example.com',
                                activo: true,
                                created_at: new Date('2024-02-01'),
                                updated_at: new Date('2024-02-01')
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('horarios_atencion')) {
                    return {
                        rows: [
                            // Peluquería - Horarios flexibles
                            { id: 1, establecimiento_id: 1, dia_semana: 1, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30, activo: true },
                            { id: 2, establecimiento_id: 1, dia_semana: 2, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30, activo: true },
                            { id: 3, establecimiento_id: 1, dia_semana: 3, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30, activo: true },
                            { id: 4, establecimiento_id: 1, dia_semana: 4, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30, activo: true },
                            { id: 5, establecimiento_id: 1, dia_semana: 5, hora_apertura: '09:00', hora_cierre: '18:00', intervalo_minutos: 30, activo: true },
                            { id: 6, establecimiento_id: 1, dia_semana: 6, hora_apertura: '10:00', hora_cierre: '16:00', intervalo_minutos: 30, activo: true },
                            
                            // Academia - Horarios diferentes
                            { id: 7, establecimiento_id: 2, dia_semana: 1, hora_apertura: '15:00', hora_cierre: '20:00', intervalo_minutos: 60, activo: true },
                            { id: 8, establecimiento_id: 2, dia_semana: 2, hora_apertura: '15:00', hora_cierre: '20:00', intervalo_minutos: 60, activo: true },
                            { id: 9, establecimiento_id: 2, dia_semana: 3, hora_apertura: '15:00', hora_cierre: '20:00', intervalo_minutos: 60, activo: true },
                            { id: 10, establecimiento_id: 2, dia_semana: 4, hora_apertura: '15:00', hora_cierre: '20:00', intervalo_minutos: 60, activo: true },
                            { id: 11, establecimiento_id: 2, dia_semana: 5, hora_apertura: '15:00', hora_cierre: '20:00', intervalo_minutos: 60, activo: true },
                            { id: 12, establecimiento_id: 2, dia_semana: 6, hora_apertura: '09:00', hora_cierre: '14:00', intervalo_minutos: 60, activo: true },
                            
                            // Canchas - Horarios extendidos
                            { id: 13, establecimiento_id: 3, dia_semana: 1, hora_apertura: '06:00', hora_cierre: '22:00', intervalo_minutos: 60, activo: true },
                            { id: 14, establecimiento_id: 3, dia_semana: 2, hora_apertura: '06:00', hora_cierre: '22:00', intervalo_minutos: 60, activo: true },
                            { id: 15, establecimiento_id: 3, dia_semana: 3, hora_apertura: '06:00', hora_cierre: '22:00', intervalo_minutos: 60, activo: true },
                            { id: 16, establecimiento_id: 3, dia_semana: 4, hora_apertura: '06:00', hora_cierre: '22:00', intervalo_minutos: 60, activo: true },
                            { id: 17, establecimiento_id: 3, dia_semana: 5, hora_apertura: '06:00', hora_cierre: '22:00', intervalo_minutos: 60, activo: true },
                            { id: 18, establecimiento_id: 3, dia_semana: 6, hora_apertura: '06:00', hora_cierre: '22:00', intervalo_minutos: 60, activo: true },
                            { id: 19, establecimiento_id: 3, dia_semana: 0, hora_apertura: '08:00', hora_cierre: '20:00', intervalo_minutos: 60, activo: true },
                            
                            // Veterinaria - Horarios médicos
                            { id: 20, establecimiento_id: 4, dia_semana: 1, hora_apertura: '08:00', hora_cierre: '17:00', intervalo_minutos: 30, activo: true },
                            { id: 21, establecimiento_id: 4, dia_semana: 2, hora_apertura: '08:00', hora_cierre: '17:00', intervalo_minutos: 30, activo: true },
                            { id: 22, establecimiento_id: 4, dia_semana: 3, hora_apertura: '08:00', hora_cierre: '17:00', intervalo_minutos: 30, activo: true },
                            { id: 23, establecimiento_id: 4, dia_semana: 4, hora_apertura: '08:00', hora_cierre: '17:00', intervalo_minutos: 30, activo: true },
                            { id: 24, establecimiento_id: 4, dia_semana: 5, hora_apertura: '08:00', hora_cierre: '17:00', intervalo_minutos: 30, activo: true },
                            { id: 25, establecimiento_id: 4, dia_semana: 6, hora_apertura: '09:00', hora_cierre: '13:00', intervalo_minutos: 30, activo: true }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('usuarios')) {
                    return {
                        rows: [
                            { 
                                id: 1, 
                                email: 'admin@demo.weekly', 
                                password_hash: '$2b$10$FPuiZ88vpb307B6Pl467s.ir/aNT7tRYcXPtHwSMowlMYD9pZUc0i', // password: "password"
                                nombre: 'Admin Demo', 
                                rol: 'admin', 
                                activo: true 
                            },
                            { 
                                id: 2, 
                                email: 'admin@peluqueria.weekly', 
                                password_hash: '$2b$10$FPuiZ88vpb307B6Pl467s.ir/aNT7tRYcXPtHwSMowlMYD9pZUc0i', // password: "password"
                                nombre: 'Admin Peluquería', 
                                rol: 'admin', 
                                activo: true 
                            },
                            { 
                                id: 3, 
                                email: 'supervisor@peluqueria.weekly', 
                                password_hash: '$2b$10$FPuiZ88vpb307B6Pl467s.ir/aNT7tRYcXPtHwSMowlMYD9pZUc0i', // password: "password"
                                nombre: 'Supervisor Peluquería', 
                                rol: 'supervisor', 
                                activo: true 
                            },
                            { 
                                id: 4, 
                                email: 'admin@academia.weekly', 
                                password_hash: '$2b$10$FPuiZ88vpb307B6Pl467s.ir/aNT7tRYcXPtHwSMowlMYD9pZUc0i', // password: "password"
                                nombre: 'Admin Academia', 
                                rol: 'admin', 
                                activo: true 
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('reservas')) {
                    return {
                        rows: [
                            { 
                                id: 1, 
                                fecha_hora_inicio: new Date().toISOString(), 
                                fecha_hora_fin: new Date(Date.now() + 3600000).toISOString(),
                                cliente_nombre: 'Ana López',
                                establecimiento_nombre: 'Peluquería Bella Vista',
                                colaborador_nombre: 'María González',
                                servicio_descripcion: 'Corte y peinado',
                                estado: 'confirmada',
                                precio: 25.00
                            },
                            { 
                                id: 2, 
                                fecha_hora_inicio: new Date(Date.now() + 86400000).toISOString(), 
                                fecha_hora_fin: new Date(Date.now() + 86400000 + 3600000).toISOString(),
                                cliente_nombre: 'Carlos Ruiz',
                                establecimiento_nombre: 'Academia Refuerzo Plus',
                                colaborador_nombre: 'Prof. Juan Pérez',
                                servicio_descripcion: 'Clase de matemáticas',
                                estado: 'confirmada',
                                precio: 30.00
                            },
                            { 
                                id: 3, 
                                fecha_hora_inicio: new Date(Date.now() + 172800000).toISOString(), 
                                fecha_hora_fin: new Date(Date.now() + 172800000 + 3600000).toISOString(),
                                cliente_nombre: 'María Fernández',
                                establecimiento_nombre: 'Veterinaria Mascotas Felices',
                                colaborador_nombre: 'Dr. Carlos Veterinario',
                                servicio_descripcion: 'Consulta general',
                                estado: 'confirmada',
                                precio: 40.00
                            }
                        ]
                    };
                }
                
                // Simulaciones para tablas antiguas (compatibilidad con frontend)
                if (sql.includes('SELECT') && sql.includes('cursos')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'Corte de Cabello',
                                descripcion: 'Corte profesional para damas y caballeros',
                                precio: 25.00,
                                duracion_minutos: 60
                            },
                            {
                                id: 2,
                                nombre: 'Coloración',
                                descripcion: 'Tintura y mechas profesionales',
                                precio: 45.00,
                                duracion_minutos: 120
                            },
                            {
                                id: 3,
                                nombre: 'Tratamiento Capilar',
                                descripcion: 'Hidratación y nutrición del cabello',
                                precio: 35.00,
                                duracion_minutos: 90
                            },
                            {
                                id: 4,
                                nombre: 'Matemáticas',
                                descripcion: 'Clases de matemáticas nivel secundaria',
                                precio: 30.00,
                                duracion_minutos: 60
                            },
                            {
                                id: 5,
                                nombre: 'Física',
                                descripcion: 'Clases de física nivel secundaria',
                                precio: 30.00,
                                duracion_minutos: 60
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('profesores')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'María González',
                                email: 'maria@peluqueria.com',
                                especialidad: 'Estilista Senior',
                                telefono: '+51 987 111 111'
                            },
                            {
                                id: 2,
                                nombre: 'Carlos Mendoza',
                                email: 'carlos@peluqueria.com',
                                especialidad: 'Colorista',
                                telefono: '+51 987 222 222'
                            },
                            {
                                id: 3,
                                nombre: 'Prof. Juan Pérez',
                                email: 'juan@academia.com',
                                especialidad: 'Matemáticas',
                                telefono: '+51 987 333 333'
                            },
                            {
                                id: 4,
                                nombre: 'Prof. Ana García',
                                email: 'ana@academia.com',
                                especialidad: 'Física',
                                telefono: '+51 987 444 444'
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('alumnos')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'Ana López',
                                telefono: '+51 987 111 111',
                                dni: '12345678',
                                email: 'ana@example.com'
                            },
                            {
                                id: 2,
                                nombre: 'Carlos Ruiz',
                                telefono: '+51 987 222 222',
                                dni: '87654321',
                                email: 'carlos@example.com'
                            },
                            {
                                id: 3,
                                nombre: 'María Fernández',
                                telefono: '+51 987 333 333',
                                dni: '11223344',
                                email: 'maria@example.com'
                            },
                            {
                                id: 4,
                                nombre: 'Luis Torres',
                                telefono: '+51 987 444 444',
                                dni: '55667788',
                                email: 'luis@example.com'
                            }
                        ]
                    };
                }
                
                if (sql.includes('SELECT') && sql.includes('temas')) {
                    return {
                        rows: [
                            {
                                id: 1,
                                nombre: 'Corte Clásico',
                                curso_id: 1
                            },
                            {
                                id: 2,
                                nombre: 'Corte Moderno',
                                curso_id: 1
                            },
                            {
                                id: 3,
                                nombre: 'Mechas',
                                curso_id: 2
                            },
                            {
                                id: 4,
                                nombre: 'Tintura Completa',
                                curso_id: 2
                            },
                            {
                                id: 5,
                                nombre: 'Álgebra',
                                curso_id: 4
                            },
                            {
                                id: 6,
                                nombre: 'Geometría',
                                curso_id: 4
                            },
                            {
                                id: 7,
                                nombre: 'Mecánica',
                                curso_id: 5
                            },
                            {
                                id: 8,
                                nombre: 'Termodinámica',
                                curso_id: 5
                            }
                        ]
                    };
                }
                
                // Para INSERT, UPDATE, DELETE, simular éxito
                if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
                    return { rows: [], rowCount: 1 };
                }
                
                // Respuesta por defecto
                return { rows: [], rowCount: 0 };
            }
        };
        
        // Agregar información del tenant al request
        req.tenant = tenant;
        req.db = mockDb;
        
        // Agregar headers de respuesta
        res.set('X-Tenant', req.tenant);
        res.set('X-Tenant-Type', req.tenantType);
        res.set('X-Dev-Mode', 'true');
        
        console.log(`[DEV MODE] Tenant: ${req.tenant}, Type: ${req.tenantType}, Host: ${host}`);
        next();
        
    } catch (error) {
        console.error('Error in dev mode middleware:', error);
        res.status(500).json({
            error: 'Development mode error',
            message: 'Unable to configure development mode'
        });
    }
};

/**
 * Extrae el subdominio del host para el dominio weekly
 * Ejemplos:
 * - cliente.weekly -> "cliente"
 * - demo.weekly -> "demo" 
 * - localhost:4000 -> null (desarrollo)
 */
function extractSubdomain(host) {
    const hostWithoutPort = host.split(':')[0];
    
    // En desarrollo local, no hay subdominio
    if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
        return null;
    }
    
    // Para el dominio getdevtools.com: cliente.getdevtools.com -> "cliente", admin.getdevtools.com -> "admin"
    if (hostWithoutPort.endsWith('.getdevtools.com')) {
        const parts = hostWithoutPort.split('.');
        if (parts.length >= 2) {
            return parts[0]; // Retorna "cliente" de "cliente.getdevtools.com"
        }
    }
    
    // Para el dominio weekly: cliente.weekly -> "cliente" (desarrollo)
    if (hostWithoutPort.endsWith('.weekly')) {
        const parts = hostWithoutPort.split('.');
        if (parts.length >= 2) {
            return parts[0]; // Retorna "cliente" de "cliente.weekly"
        }
    }
    
    // Para otros dominios con subdominios
    const parts = hostWithoutPort.split('.');
    if (parts.length >= 3) {
        return parts[0];
    }
    
    return null;
}

module.exports = devModeMiddleware;
