import React from 'react';
import './Header.css';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
    isNavOpen: boolean;
}

const PromesaLogo = () => (
    <svg 
        id="Capa_1" 
        data-name="Capa 1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 119 108"
        className="promesa-logo-small"
    >
        <defs>
            <style>
                {`.cls-1{fill:#19736a;}.cls-2{fill:#123b40;}`}
            </style>
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
);

const Header: React.FC<HeaderProps> = ({ onMenuClick, isNavOpen }) => {
    return (
        <header className="mobile-header">
            <div className="mobile-header__left">
                 <NavLink to="/" className="nav-brand">
                    <PromesaLogo />
                    <span>SGA Reforzamiento</span>
                </NavLink>
            </div>
            <button 
                className={`hamburger-button ${isNavOpen ? 'is-active' : ''}`} 
                onClick={onMenuClick}
                aria-label="Abrir menú"
            >
                <span className="hamburger-box">
                    <span className="hamburger-inner"></span>
                </span>
            </button>
        </header>
    );
};

export default Header; 