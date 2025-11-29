import { useState, useEffect, lazy, Suspense } from "react";
import { Calendar, Clock, Users, CheckCircle, ArrowRight, Star, Phone, Mail } from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import "./LandingPage.css";

// Lazy load de componentes pesados para mejorar performance
const InteractiveMap = lazy(() => import("../components/InteractiveMap"));
const AnimatedBackground = lazy(() => import("../components/AnimatedBackground"));

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Siempre mostrar el mes actual
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const currentDay = currentDate.getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Generar días del mes
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Días anteriores al primer día del mes (para completar la primera semana)
    const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    const features = [
        {
            icon: <Calendar className="feature-icon" />,
            title: "Panel Administrativo Completo",
            description: "Gestiona servicios, colaboradores, clientes y reservas desde un panel intuitivo. Personalización total con etiquetas personalizadas, módulos configurables y horarios flexibles. Estadísticas en tiempo real para tomar decisiones informadas."
        },
        {
            icon: <Users className="feature-icon" />,
            title: "Calendario Público 24/7",
            description: "Tus clientes pueden agendar citas directamente desde tu calendario público sin necesidad de registro. Disponibilidad en tiempo real, confirmaciones automáticas y experiencia optimizada para dispositivos móviles."
        },
        {
            icon: <CheckCircle className="feature-icon" />,
            title: "Personalización Avanzada",
            description: "Adapta WEEKLY a tu rubro: renombra entidades (Peluqueros, Profesores, Dentistas, Canchas), activa o desactiva módulos según tus necesidades y configura el modo de reserva (por servicio, recurso o combinado)."
        },
        {
            icon: <Clock className="feature-icon" />,
            title: "Marketplace Integrado",
            description: "Aplicación móvil tipo Rappi donde los usuarios encuentran negocios cercanos por rubro. Reservas geolocalizadas, categorización por tipo de servicio y sistema de descubrimiento para aumentar tu visibilidad."
        }
    ];

    const testimonials = [
        {
            name: "María González",
            business: "Salón Bella Vista",
            text: "WEEKLY transformó completamente mi negocio. Ahora mis clientes pueden agendar citas desde el calendario público 24/7 y yo gestiono todo desde un solo panel.",
            rating: 5
        },
        {
            name: "Carlos Mendoza",
            business: "Academia Refuerzo Plus",
            text: "La gestión de servicios, profesores y alumnos es súper intuitiva. El calendario público permite que mis estudiantes reserven sus clases fácilmente.",
            rating: 5
        },
        {
            name: "Ana Rodríguez",
            business: "Clínica Dental Sonrisa",
            text: "El sistema de aliados nos da total independencia y seguridad. Cada negocio tiene su propio espacio con aislamiento total de datos.",
            rating: 5
        }
    ];

    return (
        <div className={`landing-page ${isVisible ? 'visible' : ''}`}>
            {/* Navigation */}
            <LandingNavbar />
            
            {/* Hero Section */}
            <section className="hero-section">
                <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />}>
                    <AnimatedBackground />
                </Suspense>
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="weekly-text">WEEKLY</span>
                            <br />
                            <span className="hero-subtitle">Agenda lo que quieras, donde quieras</span>
                        </h1>
                        <p className="hero-description">
                            Plataforma SaaS para la gestión de reservas, horarios y clientes con marketplace integrado estilo Rappi. 
                            Digitaliza tu negocio en minutos con dominio personalizado y funcionalidades adaptadas a tu rubro. 
                            Perfecto para peluquerías, clínicas, academias, canchas deportivas y más.
                        </p>
                        <div className="hero-buttons">
                            <button 
                                className="btn-primary"
                                onClick={() => window.location.href = 'https://demo.weekly.pe'}
                            >
                                Probar Demo Gratis
                                <ArrowRight className="btn-icon" />
                            </button>
                            <button className="btn-secondary">
                                Ver Demo en Video
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">500K+</span>
                                <span className="stat-label">Negocios en Latinoamérica</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">En la Nube</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">24/7</span>
                                <span className="stat-label">Disponible</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="calendar-preview">
                            <div className="calendar-header">
                                <div className="calendar-nav">
                                    <span>{currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}</span>
                                </div>
                            </div>
                            <div className="calendar-grid">
                                {/* Días de la semana */}
                                <div className="calendar-weekdays">
                                    <div>Dom</div>
                                    <div>Lun</div>
                                    <div>Mar</div>
                                    <div>Mié</div>
                                    <div>Jue</div>
                                    <div>Vie</div>
                                    <div>Sáb</div>
                                </div>
                                {/* Días vacíos al inicio */}
                                {emptyDays.map((_, i) => (
                                    <div key={`empty-${i}`} className="calendar-day empty"></div>
                                ))}
                                {/* Días del mes */}
                                {days.map((day) => {
                                    const isToday = day === currentDay;
                                    const hasEvent = day % 7 === 0 || day === currentDay - 3 || day === currentDay + 3;
                                    return (
                                        <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-events' : ''}`}>
                                            <span>{day}</span>
                                            {hasEvent && <div className={`event-dot ${isToday ? 'today-event' : ''}`}></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Promesa Logo con efecto de latido */}
                <div className="promesa-branding heartbeat-container">
                    <img 
                        src="/promesa-logo.png" 
                        alt="Promesa Logo" 
                        className="promesa-logo"
                    />
                    <div className="promesa-text">
                        <div className="promesa-label">Desarrollado por</div>
                        <div className="promesa-name">PROMESA</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">¿Por qué elegir WEEKLY?</h2>
                        <p className="section-description">
                            No somos un sistema de reservas genérico. WEEKLY es un ecosistema adaptable diseñado específicamente 
                            para distintos tipos de negocios de servicios en Latinoamérica. Cada negocio tiene su propia base de datos 
                            independiente, dominio personalizado y certificado SSL automático.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon-container">
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Planes y Precios</h2>
                        <p className="section-description">
                            Elige el plan que mejor se adapte a tu negocio. Todos los planes incluyen dominio personalizado, 
                            certificado SSL automático y soporte técnico.
                        </p>
                    </div>
                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3 className="pricing-name">Plan Básico</h3>
                                <div className="pricing-price">
                                    <span className="price-amount">S/. 79</span>
                                    <span className="price-period">/mes</span>
                                </div>
                            </div>
                            <ul className="pricing-features">
                                <li>✅ 1 sede</li>
                                <li>✅ Hasta 2 colaboradores</li>
                                <li>✅ Calendario público</li>
                                <li>✅ Panel administrativo completo</li>
                                <li>✅ Personalización básica</li>
                                <li>✅ Soporte por email</li>
                            </ul>
                            <button className="btn-primary" onClick={() => window.location.href = '/demo'}>
                                Comenzar Ahora
                                <ArrowRight className="btn-icon" />
                            </button>
                        </div>
                        <div className="pricing-card featured">
                            <div className="pricing-badge">Más Popular</div>
                            <div className="pricing-header">
                                <h3 className="pricing-name">Plan Profesional</h3>
                                <div className="pricing-price">
                                    <span className="price-amount">S/. 119</span>
                                    <span className="price-period">/mes</span>
                                </div>
                            </div>
                            <ul className="pricing-features">
                                <li>✅ Múltiples sedes</li>
                                <li>✅ Hasta 5 colaboradores</li>
                                <li>✅ Calendario público</li>
                                <li>✅ Panel administrativo completo</li>
                                <li>✅ Personalización avanzada</li>
                                <li>✅ Estadísticas detalladas</li>
                                <li>✅ Soporte prioritario</li>
                            </ul>
                            <button className="btn-primary" onClick={() => window.location.href = '/demo'}>
                                Comenzar Ahora
                                <ArrowRight className="btn-icon" />
                            </button>
                        </div>
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3 className="pricing-name">Plan Premium</h3>
                                <div className="pricing-price">
                                    <span className="price-amount">S/. 149</span>
                                    <span className="price-period">/mes</span>
                                </div>
                            </div>
                            <ul className="pricing-features">
                                <li>✅ Sedes ilimitadas</li>
                                <li>✅ Colaboradores ilimitados</li>
                                <li>✅ Calendario público</li>
                                <li>✅ Panel administrativo completo</li>
                                <li>✅ Personalización total</li>
                                <li>✅ Estadísticas avanzadas + IA</li>
                                <li>✅ Marketplace integrado</li>
                                <li>✅ Soporte 24/7</li>
                            </ul>
                            <button className="btn-primary" onClick={() => window.location.href = '/demo'}>
                                Comenzar Ahora
                                <ArrowRight className="btn-icon" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section - Lazy loaded para mejor performance */}
            <Suspense fallback={
                <section className="map-section">
                    <div className="container">
                        <div className="map-container">
                            <div className="map-placeholder">
                                <h3>Cargando mapa...</h3>
                            </div>
                        </div>
                    </div>
                </section>
            }>
                <InteractiveMap />
            </Suspense>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Lo que dicen nuestros clientes</h2>
                        <p className="section-description">
                            Historias reales de negocios que transformaron su gestión con WEEKLY
                        </p>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-rating">
                                    {Array.from({ length: testimonial.rating }, (_, i) => (
                                        <Star key={i} className="star-icon" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <strong>{testimonial.name}</strong>
                                    <span>{testimonial.business}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">¿Listo para transformar tu negocio?</h2>
                        <p className="cta-description">
                            Únete a miles de negocios en Latinoamérica que ya digitalizaron su gestión de reservas con WEEKLY. 
                            Crea tu sistema en minutos, con dominio personalizado y funcionalidades adaptadas a tu rubro.
                        </p>
                        <div className="cta-buttons">
                            <button 
                                className="btn-primary large"
                                onClick={() => window.location.href = '/demo'}
                            >
                                Comenzar Gratis Ahora
                                <ArrowRight className="btn-icon" />
                            </button>
                            <button 
                                className="btn-outline"
                                onClick={() => {
                                    const contactSection = document.getElementById('contact');
                                    if (contactSection) {
                                        contactSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                Contactar Ventas
                            </button>
                        </div>
                        <div className="cta-contact">
                            <div className="contact-item">
                                <Phone className="contact-icon" />
                                <span>+51 987 654 321</span>
                            </div>
                            <div className="contact-item">
                                <Mail className="contact-icon" />
                                <span>info@weekly.pe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Contáctanos</h2>
                        <p className="section-description">
                            ¿Tienes preguntas? Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo.
                        </p>
                    </div>
                    <div className="contact-grid">
                        <div className="contact-info">
                            <div className="contact-card">
                                <Mail className="contact-card-icon" />
                                <h3>Email</h3>
                                <p>Escríbenos a cualquier hora</p>
                                <a href="mailto:info@weekly.pe">info@weekly.pe</a>
                            </div>
                            <div className="contact-card">
                                <Phone className="contact-card-icon" />
                                <h3>Teléfono</h3>
                                <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
                                <a href="tel:+51987654321">+51 987 654 321</a>
                            </div>
                            <div className="contact-card">
                                <Mail className="contact-card-icon" />
                                <h3>Soporte</h3>
                                <p>Asistencia técnica disponible</p>
                                <a href="mailto:soporte@weekly.pe">soporte@weekly.pe</a>
                            </div>
                        </div>
                        <div className="contact-form-container">
                            <form 
                                className="contact-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const subject = formData.get('subject') as string;
                                    const message = formData.get('message') as string;
                                    window.location.href = `mailto:info@weekly.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\n---\nEnviado desde weekly.pe')}`;
                                }}
                            >
                                <div className="form-group">
                                    <label htmlFor="contact-name">Nombre</label>
                                    <input type="text" id="contact-name" name="name" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-email">Email</label>
                                    <input type="email" id="contact-email" name="email" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-subject">Asunto</label>
                                    <input type="text" id="contact-subject" name="subject" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-message">Mensaje</label>
                                    <textarea id="contact-message" name="message" rows={6} required></textarea>
                                </div>
                                <button type="submit" className="btn-primary">
                                    Enviar Mensaje
                                    <ArrowRight className="btn-icon" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Acerca de WEEKLY</h2>
                        <p className="section-description">
                            Plataforma SaaS para la gestión de reservas, horarios y clientes con marketplace integrado estilo Rappi.
                        </p>
                    </div>
                    <div className="about-content">
                        <div className="about-text">
                            <h3>Nuestra Misión</h3>
                            <p>
                                Brindar a los negocios latinoamericanos una plataforma intuitiva, segura y personalizable para 
                                gestionar sus reservas, horarios y clientes sin depender de herramientas genéricas. Transformamos 
                                la gestión de citas mediante automatización, personalización y conectividad.
                            </p>
                            <h3>Nuestra Visión</h3>
                            <p>
                                Ser la plataforma líder de gestión y descubrimiento de servicios en Latinoamérica, conectando 
                                tecnología, negocios y personas a través de la automatización. Crear un ecosistema interconectado 
                                de servicios a nivel regional.
                            </p>
                            <h3>Ventajas Competitivas</h3>
                            <ul className="about-features">
                                <li>✅ Arquitectura de aliados adaptable y segura con aislamiento total de datos</li>
                                <li>✅ Alto nivel de personalización por rubro y por negocio sin cambiar el modelo base</li>
                                <li>✅ Subdominios y certificados SSL automáticos para cada negocio</li>
                                <li>✅ Marketplace integrado como motor de crecimiento y visibilidad</li>
                                <li>✅ Experiencia de usuario moderna, rápida y optimizada para móviles</li>
                                <li>✅ Actualización en tiempo real con Socket.io para reservas y estados</li>
                                <li>✅ Accesibilidad mediante precios competitivos y modelo 100% en la nube</li>
                            </ul>
                            <h3>Público Objetivo</h3>
                            <p>
                                WEEKLY está diseñado para negocios de servicios que requieren agendamiento y gestión de clientes: 
                                peluquerías y salones de belleza, clínicas médicas y dentales, academias y centros de refuerzo escolar, 
                                canchas deportivas y gimnasios, veterinarias, estudios y talleres.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="privacy-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Política de Privacidad</h2>
                        <p className="section-description">
                            Respetamos tu privacidad y protegemos tus datos personales.
                        </p>
                    </div>
                    <div className="privacy-content">
                        <div className="privacy-item">
                            <h3>1. Información que Recopilamos</h3>
                            <p>
                                Recopilamos información que nos proporcionas directamente, incluyendo nombre, 
                                dirección de correo electrónico, número de teléfono y dirección física cuando 
                                creas una cuenta o utilizas nuestros servicios.
                            </p>
                        </div>
                        <div className="privacy-item">
                            <h3>2. Uso de la Información</h3>
                            <p>
                                Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros 
                                servicios, procesar transacciones, enviar notificaciones y comunicarnos contigo.
                            </p>
                        </div>
                        <div className="privacy-item">
                            <h3>3. Protección de Datos</h3>
                            <p>
                                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
                                tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
                            </p>
                        </div>
                        <div className="privacy-item">
                            <h3>4. Compartir Información</h3>
                            <p>
                                No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto 
                                cuando sea necesario para proporcionar nuestros servicios o cuando sea requerido por ley.
                            </p>
                        </div>
                        <div className="privacy-item">
                            <h3>5. Tus Derechos</h3>
                            <p>
                                Tienes derecho a acceder, corregir, eliminar o transferir tus datos personales en 
                                cualquier momento. Puedes ejercer estos derechos contactándonos a través de 
                                <a href="mailto:privacidad@weekly.pe"> privacidad@weekly.pe</a>.
                            </p>
                        </div>
                        <div className="privacy-item">
                            <h3>6. Cookies y Tecnologías Similares</h3>
                            <p>
                                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar 
                                el uso del sitio y personalizar contenido. Puedes gestionar las preferencias de 
                                cookies en tu navegador.
                            </p>
                        </div>
                        <div className="privacy-item">
                            <h3>7. Cambios a esta Política</h3>
                            <p>
                                Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. 
                                Te notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web.
                            </p>
                        </div>
                        <div className="privacy-contact">
                            <p><strong>Última actualización:</strong> Noviembre 2024</p>
                            <p>Para preguntas sobre esta política, contacta a: <a href="mailto:privacidad@weekly.pe">privacidad@weekly.pe</a></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Terms Section */}
            <section id="terms" className="terms-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Términos y Condiciones</h2>
                        <p className="section-description">
                            Al usar WEEKLY, aceptas estos términos y condiciones de uso.
                        </p>
                    </div>
                    <div className="terms-content">
                        <div className="terms-item">
                            <h3>1. Aceptación de los Términos</h3>
                            <p>
                                Al acceder y utilizar WEEKLY, aceptas cumplir con estos términos y condiciones. 
                                Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>2. Descripción del Servicio</h3>
                            <p>
                                WEEKLY es una plataforma SaaS que proporciona herramientas para la gestión de reservas, 
                                citas y calendarios. Proporcionamos acceso a nuestro software a través de una suscripción mensual o anual.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>3. Cuentas de Usuario</h3>
                            <p>
                                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Debes notificarnos 
                                inmediatamente de cualquier uso no autorizado de tu cuenta. Eres responsable de todas las 
                                actividades que ocurran bajo tu cuenta.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>4. Uso Aceptable</h3>
                            <p>
                                No debes usar nuestros servicios para ningún propósito ilegal o no autorizado. No debes intentar 
                                acceder a ningún servicio por ningún otro medio que no sea la interfaz proporcionada. No debes 
                                interferir o interrumpir la integridad o el rendimiento de nuestros servicios.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>5. Propiedad Intelectual</h3>
                            <p>
                                Todos los derechos de propiedad intelectual relacionados con WEEKLY, incluyendo pero no limitado 
                                a software, diseño, logotipos y contenido, son propiedad de WEEKLY o sus licenciantes.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>6. Facturación y Pagos</h3>
                            <p>
                                Los servicios se facturan de acuerdo con el plan seleccionado. Todos los precios están en soles 
                                peruanos (PEN) a menos que se indique lo contrario. Los pagos no son reembolsables excepto 
                                según lo especificado en nuestro política de reembolso.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>7. Cancelación y Terminación</h3>
                            <p>
                                Puedes cancelar tu suscripción en cualquier momento. Podemos suspender o terminar tu cuenta si 
                                violas estos términos o si no realizas el pago de la suscripción.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>8. Limitación de Responsabilidad</h3>
                            <p>
                                WEEKLY se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables por 
                                ningún daño indirecto, incidental, especial o consecuente derivado del uso de nuestros servicios.
                            </p>
                        </div>
                        <div className="terms-item">
                            <h3>9. Modificaciones a los Términos</h3>
                            <p>
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán 
                                en vigor al publicarlos en nuestro sitio web. El uso continuado del servicio después de los cambios 
                                constituye tu aceptación de los nuevos términos.
                            </p>
                        </div>
                        <div className="terms-contact">
                            <p><strong>Última actualización:</strong> Noviembre 2024</p>
                            <p>Para preguntas sobre estos términos, contacta a: <a href="mailto:legal@weekly.pe">legal@weekly.pe</a></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-section">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3>WEEKLY</h3>
                            <p>Sistema de agendamiento inteligente para tu negocio</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Producto</h4>
                                <a href="#features">Características</a>
                                <a href="https://demo.weekly.pe">Demo Interactiva</a>
                                <a href="#map">Ubicaciones</a>
                            </div>
                            <div className="footer-column">
                                <h4>Soporte</h4>
                                <a href="mailto:info@weekly.pe">Contacto</a>
                                <a href="https://demo.weekly.pe">Probar Demo</a>
                                <a href="https://panel.weekly.pe">Panel Admin</a>
                            </div>
                            <div className="footer-column">
                                <h4>Empresa</h4>
                                <a href="#about">Acerca de</a>
                                <a href="#privacy">Privacidad</a>
                                <a href="#terms">Términos</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 WEEKLY. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;