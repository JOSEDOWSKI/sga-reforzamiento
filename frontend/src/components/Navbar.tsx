import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">SGA Reforzamiento</Link>
            <div className="nav-links">
                <Link to="/">Dashboard</Link>
                <Link to="/cursos">Gestionar Cursos</Link>
                <Link to="/profesores">Gestionar Profesores</Link>
                <Link to="/temas">Gestionar Temas</Link>
            </div>
        </nav>
    );
};

export default Navbar; 