import React, { useState, useEffect } from 'react';
import './ThemeToggleButton.css';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const ThemeToggleButton: React.FC = () => {
    const [theme, setTheme] = useState(() => {
        // Leemos el tema del localStorage o usamos el del sistema
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme || (prefersDark ? 'dark' : 'light');
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const buttonClasses = `theme-toggle-button ${theme === 'dark' ? 'theme-toggle-button--dark' : ''}`;

    return (
        <button onClick={toggleTheme} className={buttonClasses} aria-label={`Activar tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>
            <span className="theme-toggle-button__icon-wrapper">
                <SunIcon />
            </span>
            <span className="theme-toggle-button__icon-wrapper">
                <MoonIcon />
            </span>
            <span className="theme-toggle-button__thumb"></span>
        </button>
    );
};

export default ThemeToggleButton; 