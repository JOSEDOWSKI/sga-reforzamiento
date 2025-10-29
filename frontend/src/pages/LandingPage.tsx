import { useState, useEffect } from "react";
import { Calendar, Clock, Users, MapPin, CheckCircle, ArrowRight, Star, Phone, Mail, Play } from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import LandingNavbar from "../components/LandingNavbar";
import AnimatedBackground from "../components/AnimatedBackground";
import "./LandingPage.css";

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
            title: "Calendario Inteligente",
            description: "Búsqueda inteligente de clientes con sugerencias automáticas y filtrado dinámico de servicios. Actualización en tiempo real con múltiples usuarios."
        },
        {
            icon: <Users className="feature-icon" />,
            title: "Gestión de Clientes",
            description: "Base de datos completa de clientes con historial de servicios y preferencias. Búsqueda rápida con autocompletado inteligente."
        },
        {
            icon: <Clock className="feature-icon" />,
            title: "Horarios Flexibles",
            description: "Configura horarios de trabajo, días libres y disponibilidad por servicio. Validación automática de conflictos de horarios."
        },
        {
            icon: <CheckCircle className="feature-icon" />,
            title: "Automatización Inteligente",
            description: "Próximamente: IA para registro automático de reservas desde mensajes y automatización con n8n para flujos de trabajo avanzados."
        }
    ];

    const testimonials = [
        {
            name: "María González",
            business: "Salón Bella Vista",
            text: "WEEKLY transformó completamente mi negocio. Ahora mis clientes pueden reservar 24/7 y nunca más tengo citas perdidas.",
            rating: 5
        },
        {
            name: "Carlos Mendoza",
            business: "Academia Refuerzo Plus",
            text: "La gestión de horarios y profesores es súper fácil. Mis alumnos siempre saben cuándo tienen clase.",
            rating: 5
        },
        {
            name: "Ana Rodríguez",
            business: "Clínica Dental Sonrisa",
            text: "El sistema de recordatorios automáticos redujo las faltas en un 80%. ¡Increíble!",
            rating: 5
        }
    ];

    return (
        <div className={`landing-page ${isVisible ? 'visible' : ''}`}>
            {/* Navigation */}
            <LandingNavbar />
            
            {/* Hero Section */}
            <section className="hero-section">
                <AnimatedBackground />
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="weekly-text">WEEKLY</span>
                            <br />
                            <span className="hero-subtitle">Tu Sistema de Agendamiento Inteligente</span>
                        </h1>
                        <p className="hero-description">
                            Simplifica la gestión de citas con búsqueda inteligente, filtrado automático y actualización en tiempo real. 
                            Próximamente integración con IA para registro automático de reservas y automatización con n8n.
                            Diseñada para peluquerías, academias, clínicas y más.
                        </p>
                        <div className="hero-buttons">
                            <button 
                                className="btn-primary"
                                onClick={() => window.location.href = 'http://demo.weekly.pe:5173'}
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
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Negocios Activos</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Citas Gestionadas</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">98%</span>
                                <span className="stat-label">Satisfacción</span>
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
                            Una plataforma inteligente con búsqueda avanzada, filtrado automático y actualización en tiempo real. 
                            Próximamente con IA para automatización completa de reservas.
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

            {/* Map Section */}
            <InteractiveMap />

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
                            Únete a cientos de negocios que ya gestionan sus citas de manera inteligente con WEEKLY
                        </p>
                        <div className="cta-buttons">
                            <button 
                                className="btn-primary large"
                                onClick={() => window.location.href = 'http://demo.weekly.pe:5173'}
                            >
                                Comenzar Gratis Ahora
                                <ArrowRight className="btn-icon" />
                            </button>
                            <button className="btn-outline">
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
                                <a href="#pricing">Precios</a>
                                <a href="#demo">Demo</a>
                            </div>
                            <div className="footer-column">
                                <h4>Soporte</h4>
                                <a href="#help">Ayuda</a>
                                <a href="#contact">Contacto</a>
                                <a href="#docs">Documentación</a>
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