import React, { useState, useEffect, useRef } from 'react';
import './ColorThemeSwitcher.css';

const THEMES = ['violet', 'blue', 'green', 'orange', 'rose'];

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(210 20% 98%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const ColorThemeSwitcher: React.FC = () => {
    const [colorTheme, setColorTheme] = useState(() => {
        return localStorage.getItem('color-theme') || 'green'; /* Verde por defecto para coincidir con app móvil */
    });
    const [isOpen, setIsOpen] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-color-theme', colorTheme);
        localStorage.setItem('color-theme', colorTheme);
    }, [colorTheme]);

    // Hook para cerrar el menú si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [switcherRef]);

    return (
        <div className="color-switcher-wrapper" ref={switcherRef}>
            <button className="settings-button" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir selector de temas" aria-expanded={isOpen}>
                <SettingsIcon />
            </button>

            {isOpen && (
                <div className="color-switcher">
                    {THEMES.map(themeName => (
                        <button
                            key={themeName}
                            className={`color-swatch ${colorTheme === themeName ? 'active' : ''}`}
                            style={{ backgroundColor: `var(--theme-color-${themeName})` }}
                            onClick={() => {
                                setColorTheme(themeName);
                                setIsOpen(false); // Cierra el menú al seleccionar
                            }}
                            aria-label={`Cambiar a tema ${themeName}`}
                        >
                            {colorTheme === themeName && <CheckIcon />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColorThemeSwitcher; 