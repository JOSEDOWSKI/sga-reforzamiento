import React, { ReactNode } from 'react';
import '../styles/Modal.css';

interface EditModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    children: ReactNode;
    error?: string;
    loading?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
}

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    title,
    onClose,
    onSubmit,
    children,
    error,
    loading = false,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar'
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <form className="modal-form" onSubmit={onSubmit}>
                    {error && <div className="modal-error">{error}</div>}
                    {children}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;

