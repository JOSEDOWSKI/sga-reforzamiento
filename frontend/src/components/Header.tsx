import React from 'react';
import './Header.css';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
    isNavOpen: boolean;
}

const LogoPlaceholder = () => <div className="logo-placeholder"></div>;

const Header: React.FC<HeaderProps> = ({ onMenuClick, isNavOpen }) => {
    return (
        <header className="mobile-header">
            <div className="mobile-header__left">
                 <NavLink to="/" className="nav-brand">
                    <LogoPlaceholder />
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