import React from 'react';
import '../styles/Modal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    itemName,
    onConfirm,
    onCancel,
    loading = false,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <div className="confirm-modal-header">
                    <div className="confirm-modal-icon">
                        {type === 'danger' && '⚠️'}
                        {type === 'warning' && '⚠️'}
                        {type === 'info' && 'ℹ️'}
                    </div>
                    <h3 className="confirm-modal-title">{title}</h3>
                </div>
                <div className="confirm-modal-body">
                    <p className="confirm-modal-message">
                        {itemName ? (
                            <>
                                {message.replace('{itemName}', itemName)}
                            </>
                        ) : (
                            message
                        )}
                    </p>
                </div>
                <div className="confirm-modal-actions">
                    <button
                        onClick={onCancel}
                        className="btn-cancel"
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`btn-danger ${type === 'warning' ? 'btn-warning' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

