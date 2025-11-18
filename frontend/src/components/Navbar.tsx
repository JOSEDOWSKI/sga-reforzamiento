import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggleButton from './ThemeToggleButton';
import TourLauncher from "../pages/TourLauncher";
import ColorThemeSwitcher from './ColorThemeSwitcher';
import { useTenantLabels } from '../utils/tenantLabels';
import './Navbar.css';

interface NavbarProps {
    isNavOpen: boolean;
}

// --- Iconos SVG como componentes ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const ProfessorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const StudentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c0 .9 2.7 2 6 2s6-1.1 6-2v-5"/></svg>;
const TopicsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M8 17V9" /><path d="M13 17V5" /><path d="M18 17v-3" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const LogoPlaceholder = () => <div className="logo-placeholder"></div>

const Navbar: React.FC<NavbarProps> = ({ isNavOpen }) => {
    const labels = useTenantLabels();
    
    return (
        <nav className={`navbar ${isNavOpen ? 'is-open' : ''}`}>
            <div className="nav-header">
                <LogoPlaceholder />
                <NavLink to="/" className="nav-brand">WEEKLY</NavLink>
            </div>
            <div className="nav-links">
                <NavLink id="nav-dashboard" to="/" data-tooltip="Página principal">
                    <DashboardIcon /> Dashboard
                </NavLink>
                {labels.features.servicios && (
                    <NavLink id="nav-servicios" to="/servicios" data-tooltip={`Administrar ${labels.establecimientos.toLowerCase()}`}>
                        <CoursesIcon /> {labels.establecimientos}
                    </NavLink>
                )}
                {labels.features.colaboradores && (
                    <NavLink id="nav-staff" to="/staff" data-tooltip={`Administrar ${labels.colaboradores.toLowerCase()}`}>
                        <ProfessorsIcon /> {labels.colaboradores}
                    </NavLink>
                )}
                <NavLink id="nav-clientes" to="/clientes" data-tooltip={`Administrar ${labels.clientes.toLowerCase()}`}>
                    <StudentsIcon /> {labels.clientes}
                </NavLink>
                {labels.features.categorias && (
                    <NavLink id="nav-categorias" to="/categorias" data-tooltip="Administrar categorías">
                        <TopicsIcon /> Categorías
                    </NavLink>
                )}
                <NavLink id="nav-estadisticas" to="/estadisticas" data-tooltip="Ver estadísticas del sistema">
                    <StatsIcon /> Estadísticas
                </NavLink>
                <NavLink id="nav-configuracion" to="/configuracion" data-tooltip="Configuration">
                    <SettingsIcon /> Configuration
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