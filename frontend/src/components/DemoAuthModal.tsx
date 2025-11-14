import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import '../styles/Modal.css';
import './DemoAuthModal.css';

interface DemoAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DemoAuthModal: React.FC<DemoAuthModalProps> = ({ isOpen, onClose }) => {
    const [showAgain, setShowAgain] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Verificar si el usuario ya cerró el modal antes
            const hasSeenModal = localStorage.getItem('demo-auth-modal-seen') === 'true';
            if (hasSeenModal && !showAgain) {
                // Si ya lo vio y no marcó "mostrar de nuevo", no mostrar
                onClose();
            }
        }
    }, [isOpen, showAgain, onClose]);

    const handleClose = () => {
        if (!showAgain) {
            // Guardar que ya vio el modal
            localStorage.setItem('demo-auth-modal-seen', 'true');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay demo-auth-modal-overlay" onClick={handleClose}>
            <div className="modal-content demo-auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header demo-auth-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Info size={24} />
                        <h2>Modo Demo - Acceso Libre</h2>
                    </div>
                    <button className="modal-close" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body demo-auth-modal-body">
                    <div className="demo-auth-message">
                        <p className="demo-auth-main-text">
                            Estás accediendo al <strong>panel de administración en modo demo</strong>.
                        </p>
                        <p className="demo-auth-info-text">
                            En la versión real de WEEKLY, se requiere autenticación con usuario y contraseña 
                            para acceder a esta sección. El sistema garantiza la seguridad de los datos de cada negocio.
                        </p>
                        <div className="demo-auth-features">
                            <div className="demo-auth-feature-item">
                                <span className="demo-auth-check">✓</span>
                                <span>Acceso seguro con credenciales únicas</span>
                            </div>
                            <div className="demo-auth-feature-item">
                                <span className="demo-auth-check">✓</span>
                                <span>Datos protegidos por tenant</span>
                            </div>
                            <div className="demo-auth-feature-item">
                                <span className="demo-auth-check">✓</span>
                                <span>Roles y permisos personalizables</span>
                            </div>
                        </div>
                    </div>
                    <div className="demo-auth-checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={showAgain}
                                onChange={(e) => setShowAgain(e.target.checked)}
                            />
                            <span>No volver a mostrar este mensaje</span>
                        </label>
                    </div>
                </div>
                <div className="modal-footer demo-auth-modal-footer">
                    <button className="btn-primary" onClick={handleClose}>
                        Entendido, continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoAuthModal;

