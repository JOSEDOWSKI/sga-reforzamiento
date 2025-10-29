import React, { useState } from 'react';
import { Settings, Play, X } from 'lucide-react';
import TourOrchestrator from '../tour/TourOrchestrator';
import './TutorialSettings.css';

interface TutorialSettingsProps {
  isTutorialEnabled: boolean;
  onToggleTutorial: () => void;
}

const TutorialSettings: React.FC<TutorialSettingsProps> = ({ 
  isTutorialEnabled, 
  onToggleTutorial 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleStartTutorial = () => {
    setShowTutorial(true);
    // Limpiar el localStorage para forzar el inicio del tutorial
    try {
      localStorage.removeItem('tour_dashboard_v1');
      localStorage.removeItem('tour_cursos_v1');
      localStorage.removeItem('tour_profesores_v1');
      localStorage.removeItem('tour_temas_v1');
      localStorage.removeItem('tour_estadisticas_v1');
      localStorage.removeItem('MASTER_ONCE');
      localStorage.removeItem('PHASE_KEY');
    } catch (error) {
      console.error('Error clearing tutorial cache:', error);
    }
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <>
      {/* Botón de configuración flotante */}
      <div className="tutorial-settings">
        <button
          className="tutorial-settings__button"
          onClick={() => setShowSettings(!showSettings)}
          title="Configuración del tutorial"
        >
          <Settings size={20} />
        </button>

        {/* Panel de configuración */}
        {showSettings && (
          <div className="tutorial-settings__panel">
            <div className="tutorial-settings__header">
              <h3>Configuración del Tutorial</h3>
              <button
                className="tutorial-settings__close"
                onClick={() => setShowSettings(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="tutorial-settings__content">
              <div className="tutorial-settings__option">
                <label>
                  <input
                    type="checkbox"
                    checked={isTutorialEnabled}
                    onChange={onToggleTutorial}
                  />
                  Habilitar tutorial automático
                </label>
                <p className="tutorial-settings__description">
                  Cuando está habilitado, el tutorial se muestra automáticamente a nuevos usuarios.
                </p>
              </div>

              <div className="tutorial-settings__actions">
                <button
                  className="tutorial-settings__start"
                  onClick={handleStartTutorial}
                >
                  <Play size={16} />
                  Iniciar Tutorial Ahora
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tutorial temporal cuando se inicia manualmente */}
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-overlay__content">
            <div className="tutorial-overlay__header">
              <h3>Tutorial Interactivo</h3>
              <button
                className="tutorial-overlay__close"
                onClick={handleCloseTutorial}
              >
                <X size={20} />
              </button>
            </div>
            <TourOrchestrator />
          </div>
        </div>
      )}
    </>
  );
};

export default TutorialSettings;
