import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import GestionCursos from './pages/GestionCursos';
import GestionProfesores from './pages/GestionProfesores';
import GestionTemas from './pages/GestionTemas';
import EstadisticasPage from './pages/EstadisticasPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cursos" element={<GestionCursos />} />
            <Route path="/profesores" element={<GestionProfesores />} />
            <Route path="/temas" element={<GestionTemas />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
          </Routes>
      </div>
      </div>
    </Router>
  );
}

export default App;
