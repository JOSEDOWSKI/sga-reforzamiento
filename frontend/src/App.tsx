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
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cursos" element={<GestionCursos />} />
          <Route path="/profesores" element={<GestionProfesores />} />
          <Route path="/temas" element={<GestionTemas />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
