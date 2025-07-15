import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import './SplashScreen.css';

interface SplashScreenProps {
    onComplete: () => void;
}

const getUserTheme = () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') return theme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>(getUserTheme());
    const [isOpening, setIsOpening] = useState(false); // Para fondo transparente
    const [hideContent, setHideContent] = useState(false); // Para ocultar logo/texto/partículas

    // Referencias para GSAP
    const logoRef = useRef<SVGSVGElement>(null);
    const logoContainerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const curtainLeftRef = useRef<HTMLDivElement>(null);
    const curtainRightRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    // Detectar cambios de tema en localStorage
    useEffect(() => {
        const onStorage = () => setTheme(getUserTheme());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Animaciones GSAP
    useEffect(() => {
        gsap.set(logoRef.current, { scale: 0.3, rotation: -15, opacity: 0, transformOrigin: "center center" });
        gsap.set(textRef.current, { y: 30, opacity: 0 });
        gsap.set(loadingRef.current, { y: 20, opacity: 0 });
        gsap.set(curtainLeftRef.current, { x: 0 });
        gsap.set(curtainRightRef.current, { x: 0 });

        // Animación principal del logo
        const logoTimeline = gsap.timeline();
        logoTimeline
            .to(logoRef.current, { duration: 1.2, scale: 1, rotation: 0, opacity: 1, ease: "back.out(1.7)" })
            .to(logoRef.current, { duration: 0.8, y: -10, ease: "power2.out", yoyo: true, repeat: -1 }, "-=0.5");

        // Animación de elementos internos del SVG
        if (logoRef.current) {
            const paths = logoRef.current.querySelectorAll('path');
            const circles = logoRef.current.querySelectorAll('circle');
            gsap.set([...paths, ...circles], { opacity: 0, scale: 0, transformOrigin: "center center" });
            logoTimeline.to([...paths, ...circles], { duration: 0.6, opacity: 1, scale: 1, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.8");
            gsap.to(paths, { scale: 1.05, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut", stagger: 0.15, delay: 1.5 });
            circles.forEach((circle, i) => {
                gsap.to(circle, {
                    rotate: 360,
                    transformOrigin: '50% 50%',
                    repeat: -1,
                    duration: 2 + i,
                    ease: 'linear',
                    delay: 1.5
                });
            });
        }

        // Animación de texto y loading
        const textTimeline = gsap.timeline({ delay: 0.8 });
        textTimeline
            .to(textRef.current, { duration: 0.8, y: 0, opacity: 1, ease: "power2.out" })
            .to(loadingRef.current, { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }, "-=0.4");

        // Animación de partículas
        if (particlesRef.current) {
            const particles = particlesRef.current.children;
            gsap.set(particles, { opacity: 0, scale: 0, y: 50, rotation: 0 });
            gsap.to(particles, { duration: 1.2, opacity: 1, scale: 1, y: 0, rotation: 360, stagger: 0.15, ease: "back.out(1.7)", delay: 1.5 });
            gsap.to(particles, { duration: 8, y: -100, rotation: 720, stagger: 0.2, ease: "none", repeat: -1, delay: 2.5 });
        }

        // Efecto de brillo en el logo
        gsap.to(logoRef.current, { duration: 2, filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))", ease: "power2.inOut", yoyo: true, repeat: -1, delay: 1.5 });

        // Forzar salida a los 3 segundos
        const timer = setTimeout(() => {
            setHideContent(true); // Oculta logo/texto/partículas
            setIsOpening(true); // Cambia el fondo a transparente
            // Animar cortinas
            const curtainTimeline = gsap.timeline({
                onComplete: () => {
                    setIsVisible(false);
                    // Restaurar estilos aquí también por seguridad
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                    document.documentElement.style.height = '';
                    onComplete();
                }
            });
            curtainTimeline
                .to(curtainLeftRef.current, { duration: 1.2, x: "-100%", ease: "power2.inOut" })
                .to(curtainRightRef.current, { duration: 1.2, x: "100%", ease: "power2.inOut" }, 0);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    useEffect(() => {
        let restoreStyles: (() => void) | null = null;
        if (isVisible) {
            const originalBodyOverflow = document.body.style.overflow;
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalHtmlHeight = document.documentElement.style.height;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.height = '100vh';
            restoreStyles = () => {
                document.body.style.overflow = originalBodyOverflow;
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.documentElement.style.height = originalHtmlHeight;
            };
        }
        return () => {
            if (restoreStyles) restoreStyles();
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className={`splash-screen splash-${theme}${isOpening ? ' splash-opening' : ''}${!isVisible ? ' splash-hidden' : ''}`}>
            {/* Cortinas */}
            <div ref={curtainLeftRef} className={`curtain curtain-left curtain-${theme}`}></div>
            <div ref={curtainRightRef} className={`curtain curtain-right curtain-${theme}`}></div>
            {/* Logo y contenido */}
            {!hideContent && (
                <>
                    <div className="splash-content">
                        <div ref={logoContainerRef} className="logo-container">
                            <svg ref={logoRef} id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 108" className="promesa-logo promesa-logo-big">
                                <defs>
                                    <style>{`.cls-1{fill:#19736a;}.cls-2{fill:#123b40;}`}</style>
                                </defs>
                                <title>PROMESA LOGO V</title>
                                <path className="cls-1" d="M75,41.87H72.16a1.17,1.17,0,0,1-1.09-.77,20.82,20.82,0,0,0-7.71-9.21c-4.39-3-9.25-4.3-13.14-3.8a1.58,1.58,0,0,1-1.81-1.35l-.22-1.85a.51.51,0,0,1,.38-.56A22.66,22.66,0,0,1,66,28.24a23.25,23.25,0,0,1,9.5,13A.51.51,0,0,1,75,41.87Z"/>
                                <path className="cls-1" d="M77.5,53.87a.5.5,0,0,1,.5.62A21.39,21.39,0,0,1,72.31,64a21.21,21.21,0,0,1-9.77,5.75.51.51,0,0,1-.61-.5V65.86a1.15,1.15,0,0,1,1-1.15,12.48,12.48,0,0,0,7.21-3.78,13.11,13.11,0,0,0,3.6-6.18,1.15,1.15,0,0,1,1.13-.88Z"/>
                                <circle className="cls-1" cx="53.93" cy="70.87" r="5"/>
                                <circle className="cls-2" cx="78.93" cy="47.87" r="3"/>
                                <circle className="cls-1" cx="41.93" cy="26.87" r="3"/>
                                <path className="cls-2" d="M43.43,76.87h-1a2,2,0,0,1-2-2v-32a2,2,0,0,1,2-2h2.5a.5.5,0,0,1,.5.5v33.5A2,2,0,0,1,43.43,76.87Z"/>
                                <path className="cls-2" d="M45.93,57.47v4a.5.5,0,0,0,.43.5c3.31.44,21.75,2,26.43-12.51,1.14-3.55-2.86-4.55-3.86-1.55-1,2-4,12-22.4,9.11A.51.51,0,0,0,45.93,57.47Z"/>
                                <path className="cls-1" d="M53.93,53.87h-3a2,2,0,0,1-2-2V41.37a.5.5,0,0,1,.5-.5h3a2,2,0,0,1,2,2v10.5A.5.5,0,0,1,53.93,53.87Z"/>
                                <path className="cls-2" d="M54.93,48.87v4.36a.51.51,0,0,0,.63.49c17.23-4.25,11.23-20.85-3.63-20.85-7.76,0-11.76-.94-12,4.48a.51.51,0,0,0,.5.52H53.93C62,37.87,63.93,47.87,54.93,48.87Z"/>
                            </svg>
                        </div>
                        <div ref={textRef} className="splash-text">
                            <h1>SGA Reforzamiento</h1>
                            <p>Sistema de Gestión Académica</p>
                        </div>
                        <div ref={loadingRef} className="loading-indicator">
                            <div className="loading-dots">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        </div>
                    </div>
                    {/* Efectos de partículas adicionales */}
                    <div ref={particlesRef} className="particles">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`particle particle-${i + 1}`}></div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SplashScreen; 