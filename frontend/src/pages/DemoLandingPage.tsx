import { useState, useEffect, lazy, Suspense } from "react";
import { Play, ArrowRight, Calendar, Settings, UserCheck } from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import "./DemoLandingPage.css";

// Lazy load de componentes pesados
const AnimatedBackground = lazy(() => import("../components/AnimatedBackground"));

interface DemoSection {
    id: string;
    title: string;
    description: string;
    videoId: string; // ID del video de YouTube (el usuario lo proporcionará)
    buttonText: string;
    buttonLink: string;
    icon: React.ReactNode;
    color: string;
}

const DemoLandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const demoSections: DemoSection[] = [
        {
            id: "admin",
            title: "Vista de Administrador",
            description: "Gestiona tu negocio completo desde el panel de administración. Crea servicios, gestiona staff, clientes, categorías y visualiza estadísticas en tiempo real.",
            videoId: "", // El usuario proporcionará el ID del video
            buttonText: "Acceder al Panel Admin",
            buttonLink: "/dashboard",
            icon: <Settings className="demo-icon" />,
            color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
        },
        {
            id: "usuario",
            title: "Vista de Usuario Final",
            description: "Los clientes pueden agendar citas directamente desde el calendario público sin necesidad de registro. Interfaz intuitiva y fácil de usar.",
            videoId: "", // El usuario proporcionará el ID del video
            buttonText: "Probar Calendario Público",
            buttonLink: "/booking",
            icon: <Calendar className="demo-icon" />,
            color: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
        },
        {
            id: "colaborador",
            title: "Vista de Colaborador",
            description: "Los colaboradores pueden ver sus propias reservas y crear nuevas citas directamente. Vista simplificada enfocada en la gestión de citas.",
            videoId: "", // El usuario proporcionará el ID del video
            buttonText: "Acceder como Colaborador",
            buttonLink: "/calendario",
            icon: <UserCheck className="demo-icon" />,
            color: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
        }
    ];

    const getYouTubeEmbedUrl = (videoId: string): string | undefined => {
        if (!videoId) return undefined;
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <div className={`demo-landing-page ${isVisible ? 'visible' : ''}`}>
            {/* Navigation */}
            <LandingNavbar />
            
            {/* Hero Section */}
            <section className="demo-hero-section">
                <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />}>
                    <AnimatedBackground />
                </Suspense>
                <div className="demo-hero-background">
                    <div className="demo-hero-gradient"></div>
                </div>
                <div className="demo-hero-content">
                    <div className="demo-hero-text">
                        <h1 className="demo-hero-title">
                            <span className="demo-weekly-text">WEEKLY</span>
                            <br />
                            <span className="demo-hero-subtitle">Demo Interactiva</span>
                        </h1>
                        <p className="demo-hero-description">
                            Explora todas las funcionalidades de WEEKLY en acción. 
                            Descubre cómo funciona desde diferentes perspectivas: administrador, usuario final y colaborador.
                        </p>
                    </div>
                </div>
            </section>

            {/* Demo Sections */}
            <section className="demo-sections">
                <div className="container">
                    {demoSections.map((section, index) => (
                        <div key={section.id} className={`demo-section ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className="demo-section-content">
                                <div className="demo-section-text">
                                    <div className="demo-section-icon" style={{ background: section.color }}>
                                        {section.icon}
                                    </div>
                                    <h2 className="demo-section-title">{section.title}</h2>
                                    <p className="demo-section-description">{section.description}</p>
                                    <a 
                                        href={section.buttonLink} 
                                        className="demo-section-button"
                                        style={{ background: section.color }}
                                    >
                                        {section.buttonText}
                                        <ArrowRight size={20} />
                                    </a>
                                </div>
                                <div className="demo-section-video">
                                    {getYouTubeEmbedUrl(section.videoId) ? (
                                        <div className="video-wrapper">
                                            <iframe
                                                src={getYouTubeEmbedUrl(section.videoId) || ''}
                                                title={section.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="youtube-embed"
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="video-placeholder">
                                            <Play size={64} />
                                            <p>Video de demostración</p>
                                            <span className="video-note">El video se agregará aquí</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="demo-cta-section">
                <div className="container">
                    <div className="demo-cta-content">
                        <h2 className="demo-cta-title">¿Listo para comenzar?</h2>
                        <p className="demo-cta-description">
                            Prueba WEEKLY ahora mismo o contáctanos para una demostración personalizada
                        </p>
                        <div className="demo-cta-buttons">
                            <a href="/dashboard" className="demo-cta-button primary">
                                Ver Panel Admin
                                <ArrowRight size={20} />
                            </a>
                            <a href="/booking" className="demo-cta-button secondary">
                                Ver Calendario Público
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DemoLandingPage;

