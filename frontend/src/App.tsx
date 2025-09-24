import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import GestionCursos from './pages/GestionCursos';
import GestionProfesores from './pages/GestionProfesores';
import GestionTemas from './pages/GestionTemas';
import EstadisticasPage from './pages/EstadisticasPage';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import SplashReset from './components/SplashReset';
import ProtectedRoute from './components/ProtectedRoute';
import TourOrchestrator from './tour/TourOrchestrator';

import { AuthProvider } from './hooks/useAuth';
import { SplashProvider } from './contexts/SplashContext';
import { useSplashScreen } from './hooks/useSplashScreen'; 
import './App.css';

function AppContent() {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);  
  const { showSplash, isInitialized, hideSplash } = useSplashScreen();

  useEffect(() => {
    if (isNavOpen) {
      setIsNavOpen(false);
    }
    const random = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const root = document.documentElement;
    root.style.setProperty('--aurora1-x', `${random(-30, 30)}vw`);
    root.style.setProperty('--aurora1-y', `${random(-30, 30)}vh`);
    root.style.setProperty('--aurora1-r', `${random(-30, 30)}deg`);
    root.style.setProperty('--aurora2-x', `${random(-40, 40)}vw`);
    root.style.setProperty('--aurora2-y', `${random(-40, 40)}vh`);
    root.style.setProperty('--aurora2-r', `${random(-30, 30)}deg`);
  }, [location.pathname]);

  return (
    <>
      {/* SplashScreen siempre por encima */}
      {(!isInitialized || showSplash) && <SplashScreen onComplete={hideSplash} />}

      <ProtectedRoute>
        <div className={`app-container ${isNavOpen ? 'nav-open' : ''}`}>
          <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
          <Navbar isNavOpen={isNavOpen} />

          {/* Tour solo cuando ya inicializó y no está el splash */}
          {!showSplash && isInitialized && <TourOrchestrator />}

          <main className="content-container">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/cursos" element={<GestionCursos />} />
              <Route path="/profesores" element={<GestionProfesores />} />
              <Route path="/temas" element={<GestionTemas />} />
              <Route path="/estadisticas" element={<EstadisticasPage />} />
            </Routes>
          </main>

          {isNavOpen && (
            <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
          )}
          <SplashReset />
        </div>
      </ProtectedRoute>
    </>
  );
}

// -------- App principal --------
function App() {
  return (
    <Router>
      <SplashProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SplashProvider>
    </Router>
  );
}

export default App;
