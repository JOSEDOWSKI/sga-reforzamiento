import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import GestionCursos from './pages/GestionCursos'; // Lo vamos a re-crear
import GestionProfesores from './pages/GestionProfesores';
import GestionTemas from './pages/GestionTemas';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="content-container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cursos" element={<GestionCursos />} />
            <Route path="/profesores" element={<GestionProfesores />} />
            <Route path="/temas" element={<GestionTemas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
