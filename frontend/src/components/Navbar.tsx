import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggleButton from './ThemeToggleButton';
import TourLauncher from "../pages/TourLauncher";
import ColorThemeSwitcher from './ColorThemeSwitcher';
import './Navbar.css';

interface NavbarProps {
    isNavOpen: boolean;
}

// --- Iconos SVG como componentes ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const ProfessorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const TopicsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M8 17V9" /><path d="M13 17V5" /><path d="M18 17v-3" /></svg>;
const LogoPlaceholder = () => <div className="logo-placeholder"></div>

const Navbar: React.FC<NavbarProps> = ({ isNavOpen }) => {
    return (
        <nav className={`navbar ${isNavOpen ? 'is-open' : ''}`}>
            <div className="nav-header">
                <LogoPlaceholder />
                <NavLink to="/" className="nav-brand">SGA Reforzamiento</NavLink>
            </div>
            <div className="nav-links">
                <NavLink id="nav-dashboard" to="/" data-tooltip="Página principal">
                    <DashboardIcon /> Dashboard
                </NavLink>
                <NavLink  id="nav-cursos" to="/cursos" data-tooltip="Administrar cursos">
                    <CoursesIcon /> Cursos
                </NavLink>
                <NavLink  id="nav-profesores" to="/profesores" data-tooltip="Administrar profesores">
                    <ProfessorsIcon /> Profesores
                </NavLink>
                <NavLink id="nav-temas" to="/temas" data-tooltip="Administrar temas">
                    <TopicsIcon /> Temas
                </NavLink>
                <NavLink id="nav-estadisticas" to="/estadisticas" data-tooltip="Ver estadísticas del sistema">
                    <StatsIcon /> Estadísticas
                </NavLink>
            </div>
            <div className="nav-footer">
                <ThemeToggleButton />
                <ColorThemeSwitcher />
                <TourLauncher floating phase="dashboard" />
            </div>
        </nav>
    );
};

export default Navbar; 