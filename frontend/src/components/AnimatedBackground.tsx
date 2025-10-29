import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background">
      {/* Formas geométricas flotantes */}
      <div className="floating-shapes">
        {/* Círculos */}
        <div className="shape circle circle-1"></div>
        <div className="shape circle circle-2"></div>
        <div className="shape circle circle-3"></div>
        <div className="shape circle circle-4"></div>
        
        {/* Rectángulos */}
        <div className="shape rectangle rectangle-1"></div>
        <div className="shape rectangle rectangle-2"></div>
        <div className="shape rectangle rectangle-3"></div>
        
        {/* Triángulos */}
        <div className="shape triangle triangle-1"></div>
        <div className="shape triangle triangle-2"></div>
        
        {/* Formas orgánicas */}
        <div className="shape organic organic-1"></div>
        <div className="shape organic organic-2"></div>
        <div className="shape organic organic-3"></div>
      </div>
      
      {/* Gradientes dinámicos */}
      <div className="gradient-overlay gradient-1"></div>
      <div className="gradient-overlay gradient-2"></div>
      <div className="gradient-overlay gradient-3"></div>
      
      {/* Partículas */}
      <div className="particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
