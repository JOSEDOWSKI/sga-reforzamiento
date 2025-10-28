import React, { useState } from 'react';
import { Settings, Play, X } from 'lucide-react';
import TourOrchestrator from '../tour/TourOrchestrator';

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

      <style jsx>{`
        .tutorial-settings {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .tutorial-settings__button {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          transition: all 0.3s ease;
        }

        .tutorial-settings__button:hover {
          background: #0056b3;
          transform: scale(1.1);
        }

        .tutorial-settings__panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          width: 320px;
          max-height: 400px;
          overflow: hidden;
        }

        .tutorial-settings__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .tutorial-settings__header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .tutorial-settings__close {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
        }

        .tutorial-settings__close:hover {
          background: #f8f9fa;
        }

        .tutorial-settings__content {
          padding: 20px;
        }

        .tutorial-settings__option {
          margin-bottom: 20px;
        }

        .tutorial-settings__option label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
        }

        .tutorial-settings__option input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .tutorial-settings__description {
          margin: 8px 0 0 24px;
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }

        .tutorial-settings__actions {
          display: flex;
          gap: 12px;
        }

        .tutorial-settings__start {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .tutorial-settings__start:hover {
          background: #218838;
        }

        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tutorial-overlay__content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90%;
          overflow: hidden;
        }

        .tutorial-overlay__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .tutorial-overlay__header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .tutorial-overlay__close {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 8px;
          border-radius: 8px;
        }

        .tutorial-overlay__close:hover {
          background: #f8f9fa;
        }
      `}</style>
    </>
  );
};

export default TutorialSettings;
