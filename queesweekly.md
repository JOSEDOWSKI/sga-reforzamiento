dentidad general
Nombre del proyecto: WEEKLY
Tipo de producto: Plataforma SaaS multi-tenant para la gestión de reservas, horarios y clientes,
con marketplace integrado.
Versión actual: MVP funcional en fase final de desarrollo y validación.
Modelo de negocio: Suscripción mensual B2B (Software as a Service) con futura expansión a
marketplace y aplicación móvil.
Propósito general: Digitalizar la gestión de reservas en negocios de servicios de Latinoamérica
mediante automatización, personalización y conectividad.
2. Problema
Miles de negocios en Latinoamérica (peluquerías, clínicas, academias, canchas deportivas, etc.)
gestionan sus citas de forma manual o con herramientas genéricas no diseñadas para su realidad. Esto
genera:
Duplicidad de reservas y errores humanos.
Pérdida de tiempo y oportunidades de venta.
Falta de visibilidad y análisis de datos.
Ausencia de automatización y de presencia digital profesional.
Reservar en un negocio local sigue siendo, en muchos casos, llamar por teléfono o escribir mensajes
dispersos por WhatsApp.
3. Solución: WEEKLY
WEEKLY ofrece una plataforma integral de gestión y agendamiento que permite a cualquier negocio
crear su propio sistema en minutos, con dominio personalizado y funcionalidades adaptadas a su rubro.
3.1. Módulos principales
1. Panel administrativo del negocio (tenant)
Gestión de servicios, colaboradores, clientes y reservas.
Personalización total (etiquetas, módulos, modo de reserva).
Horarios configurables y estadísticas en tiempo real.
1
2. Calendario público para clientes
Agendamiento online sin registro.
Disponibilidad 24/7 y confirmaciones automáticas.
3. Marketplace (visión a mediano plazo)
Aplicación tipo “Rappi” donde los usuarios encuentran negocios cercanos por rubro.
Reservas geolocalizadas, categorización por tipo de servicio y futuras integraciones de descuen-
tos.
4. Funcionamiento técnico
Arquitectura: Multi-tenant con aislamiento de datos mediante tenant_id.
Backend: Node.js + TypeScript + PostgreSQL + Docker + CapRover.
Frontend: React 19 + Vite + Tailwind (SPA adaptable por tenant).
Autenticación: JWT con roles diferenciados: admin, staff, super_admin.
Infraestructura: Subdominios automáticos {negocio}.weekly.pe con SSL y DNS gestionado.
Tiempo real: Uso de Socket.io para actualización instantánea de reservas y estados.
5. Personalización avanzada por tenant
Cada negocio puede definir su propia configuración sin alterar el modelo base:
Etiquetas personalizadas: renombrar colaboradores, servicios, recursos y reservas según el rubro
(por ejemplo, “Profesores”, “Dentistas”, “Peluqueros”, “Canchas”).
Módulos activos: habilitar o deshabilitar servicios, recursos y categorías según las necesidades del
negocio.
Modo de reserva:
• Reserva por servicio.
• Reserva por recurso (cancha, consultorio, aula, sillón, etc.).
• Reserva combinada servicio + recurso.
Horarios y feriados: configuración independiente de horarios de atención y días especiales.
Dominio personalizado: subdominios del tipo {nombre}.weekly.pe.
El backend mantiene una estructura única de base de datos, compartida y filtrada por tenant_id,
lo que permite aislamiento lógico y escalabilidad horizontal.
6. Modelo de negocio
6.1. Fase inicial: SaaS B2B
Suscripción mensual por negocio (tenant):
Plan Básico: S/. 79/mes – 1 sede, hasta 2 colaboradores.
Plan Profesional: S/. 119/mes – hasta 5 colaboradores.
Plan Premium: S/. 149/mes – sin límite de colaboradores y estadísticas avanzadas + IA.
2
6.2. Fase futura: Marketplace B2C
Comisiones por transacción generada desde el marketplace.
Publicidad local para negocios destacados.
Integración con pasarelas de pago (Yape, Plin, entre otras).
Promociones y descuentos inteligentes para usuarios finales.
7. Público objetivo
7.1. Negocios B2B (tenants)
Negocios de servicios que requieren agendamiento y gestión de clientes, como:
Peluquerías y salones de belleza.
Clínicas médicas y dentales.
Academias y centros de refuerzo escolar.
Canchas deportivas y gimnasios.
Veterinarias, estudios y talleres.
7.2. Super administradores
Equipo WEEKLY encargado de:
Crear y gestionar tenants.
Administrar SSL, dominios y configuraciones globales.
Monitorear el sistema y brindar soporte técnico.
7.3. Usuarios finales
Clientes que reservan servicios mediante el calendario público o la aplicación móvil, sin necesidad
de registro complejo.
8. Ventaja competitiva
Arquitectura multi-tenant adaptable y segura.
Alto nivel de personalización por rubro y por negocio.
Aislamiento total de datos por tenant.
Marketplace integrado como motor de crecimiento y visibilidad.
Subdominios y certificados SSL automáticos.
Experiencia de usuario moderna, rápida y optimizada para dispositivos móviles.
WEEKLY no es un sistema de reservas genérico, sino un ecosistema adaptable para distintos tipos
de negocios de servicios.
3
9. Mercado objetivo
Mercado inicial (Perú): más de 500 000 negocios de servicios con potencial de digitalización de
reservas.
Expansión proyectada: Chile, Colombia, México y otros mercados de Latinoamérica.
Tendencias: digitalización acelerada postpandemia, consolidación del modelo SaaS y crecimiento
del agendamiento online como estándar para servicios.
10. Equipo fundador
José Molina – Project Manager & Full Stack Developer
Responsable de la dirección técnica, arquitectura del sistema y desarrollo del MVP.
Encargado de la definición funcional del producto y coordinación con las áreas de diseño y marketing.
Equipo de apoyo:
Especialista en marketing digital.
Diseñadora UX/UI junior.
Practicantes de TI (backend y frontend).
11. Estado actual y próximos pasos
11.1. Estado actual
MVP funcional en desarrollo: panel de negocio, reservas, personalización y multi-tenant.
Base de datos diseñada para personalización por tenant y escalabilidad.
Infraestructura preparada para despliegue automatizado con Docker y CapRover.
11.2. Próximos hitos (6 meses)
1. Validar el MVP con 10–20 negocios piloto de diferentes rubros.
2. Optimizar UX/UI a partir de feedback real.
3. Integrar analítica de uso (PostHog, Mixpanel u otra solución).
4. Lanzar una versión beta cerrada.
5. Desarrollar la primera versión de la aplicación móvil para el marketplace.
12. Objetivo de la presentación
El objetivo principal de la presentación de WEEKLY es lograr el ingreso a una incubadora
nacional para:
Acelerar la validación de mercado.
Optimizar la experiencia de usuario con acompañamiento experto.
4
Recibir mentoría en escalamiento de SaaS.
Obtener capital semilla para infraestructura y marketing inicial.
No se busca únicamente inversión, sino un acompañamiento estratégico que permita escalar WEEKLY
a nivel nacional.
13. Misión, visión e impacto esperado
Misión
Brindar a los negocios latinoamericanos una plataforma intuitiva, segura y personalizable para
gestionar sus reservas, horarios y clientes sin depender de herramientas genéricas.
Visión
Ser la plataforma líder de gestión y descubrimiento de servicios en Latinoamérica, conectando
tecnología, negocios y personas a través de la automatización.
Impacto esperado
Transformación digital real de negocios locales mediante acceso a sistemas profesionales en minutos.
Ahorro significativo de tiempo en la gestión de citas y coordinación de agenda.
Creación de un ecosistema interconectado de servicios a nivel regional.
Accesibilidad mediante precios competitivos y modelo 100 % en la nube.
Lema del producto
“Agenda lo que quieras, donde quieras. WEEKLY lo hace posible.”