import React, { ReactNode } from 'react';
import '../styles/GestionPage.css';

interface FormSectionProps {
    title: string;
    onSubmit: (e: React.FormEvent) => void;
    children: ReactNode;
    error?: string;
    success?: string;
    loading?: boolean;
    submitLabel?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
    title,
    onSubmit,
    children,
    error,
    success,
    loading = false,
    submitLabel = 'Crear'
}) => {
    return (
        <div className="form-section">
            <h2>{title}</h2>
            <form onSubmit={onSubmit}>
                {children}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : submitLabel}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
        </div>
    );
};

export default FormSection;

