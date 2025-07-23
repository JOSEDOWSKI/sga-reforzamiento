import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos
import '../styles/Modal.css'; // Importar los estilos del modal

interface Profesor {
    id: number;
    nombre: string;
    email: string;
    especialidad: string;
}

interface ModalState {
    isOpen: boolean;
    editingProfesor: Profesor | null;
}

const GestionProfesores: React.FC = () => {
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingProfesor: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalEmail, setModalEmail] = useState('');
    const [modalEspecialidad, setModalEspecialidad] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        profesorId: null as number | null,
        profesorNombre: ''
    });

    const fetchProfesores = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/profesores');
            setProfesores(response.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los profesores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfesores();
    }, []);

    // Función para manejar el envío del formulario de creación
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim()) {
            setError('El nombre y email son obligatorios');
            return;
        }

        setError('');
        setSuccess('');

        try {
            await apiClient.post('/profesores', { nombre, email, especialidad });
            setSuccess('Profesor creado con éxito');
            setNombre('');
            setEmail('');
            setEspecialidad('');
            fetchProfesores();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al crear el profesor';
            setError(errorMessage);
        }
    };

    // Funciones del modal
    const openEditModal = (profesor: Profesor) => {
        setModalState({
            isOpen: true,
            editingProfesor: profesor
        });
        setModalNombre(profesor.nombre);
        setModalEmail(profesor.email);
        setModalEspecialidad(profesor.especialidad);
        setModalError('');
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            editingProfesor: null
        });
        setModalNombre('');
        setModalEmail('');
        setModalEspecialidad('');
        setModalError('');
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalNombre.trim() || !modalEmail.trim()) {
            setModalError('El nombre y email son obligatorios');
            return;
        }

        setModalError('');

        try {
            await apiClient.put(`/profesores/${modalState.editingProfesor!.id}`, { 
                nombre: modalNombre, 
                email: modalEmail,
                especialidad: modalEspecialidad 
            });
            setSuccess('Profesor actualizado con éxito');
            fetchProfesores();
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al actualizar el profesor';
            setModalError(errorMessage);
        }
    };

    // Funciones del modal de confirmación
    const openConfirmModal = (profesor: Profesor) => {
        setConfirmModal({
            isOpen: true,
            profesorId: profesor.id,
            profesorNombre: profesor.nombre
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            profesorId: null,
            profesorNombre: ''
        });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.profesorId) {
            try {
                await apiClient.delete(`/profesores/${confirmModal.profesorId}`);
                setSuccess('Profesor eliminado con éxito');
                fetchProfesores();
                closeConfirmModal();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError('Error al eliminar el profesor');
                closeConfirmModal();
            }
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Gestión de Profesores</h1>
                <div className="loading-container">
                    <p>Cargando profesores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Gestión de Profesores</h1>
            
            {/* Mensajes de éxito y error */}
            {error && <div className="page-message error-message">{error}</div>}
            {success && <div className="page-message success-message">{success}</div>}
            
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Profesor</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre-profesor">Nombre:</label>
                            <input 
                                id="nombre-profesor" 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Ej: Dr. Juan Pérez"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email-profesor">Email:</label>
                            <input 
                                id="email-profesor" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="juan.perez@email.com"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="especialidad-profesor">Especialidad:</label>
                            <input 
                                id="especialidad-profesor" 
                                type="text" 
                                value={especialidad} 
                                onChange={(e) => setEspecialidad(e.target.value)}
                                placeholder="Ej: Matemáticas, Física, etc."
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                Crear Profesor
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="list-section">
                    <h2>Lista de Profesores</h2>
                    {profesores.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Especialidad</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profesores.map(profesor => (
                                        <tr key={profesor.id}>
                                            <td>{profesor.id}</td>
                                            <td><strong>{profesor.nombre}</strong></td>
                                            <td>{profesor.email}</td>
                                            <td>{profesor.especialidad || 'Sin especialidad'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => openEditModal(profesor)}
                                                        title="Editar profesor"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => openConfirmModal(profesor)}
                                                        title="Eliminar profesor"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No hay profesores para mostrar.</p>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {modalState.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Profesor</h2>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleModalSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="modal-nombre-profesor">Nombre:</label>
                                <input 
                                    id="modal-nombre-profesor" 
                                    type="text" 
                                    value={modalNombre} 
                                    onChange={(e) => setModalNombre(e.target.value)} 
                                    placeholder="Ej: Dr. Juan Pérez"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-email-profesor">Email:</label>
                                <input 
                                    id="modal-email-profesor" 
                                    type="email" 
                                    value={modalEmail} 
                                    onChange={(e) => setModalEmail(e.target.value)} 
                                    placeholder="juan.perez@email.com"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-especialidad-profesor">Especialidad:</label>
                                <input 
                                    id="modal-especialidad-profesor" 
                                    type="text" 
                                    value={modalEspecialidad} 
                                    onChange={(e) => setModalEspecialidad(e.target.value)}
                                    placeholder="Ej: Matemáticas, Física, etc."
                                />
                            </div>
                            
                            {modalError && <div className="modal-error">{modalError}</div>}
                            
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Actualizar Profesor
                                </button>
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            {confirmModal.isOpen && (
                <div className="confirm-modal-overlay" onClick={closeConfirmModal}>
                    <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-header">
                            <div className="confirm-modal-icon">⚠️</div>
                            <h3 className="confirm-modal-title">Confirmar Eliminación</h3>
                        </div>
                        <div className="confirm-modal-body">
                            <p className="confirm-modal-message">
                                ¿Estás seguro de que quieres eliminar al profesor <strong>"{confirmModal.profesorNombre}"</strong>? 
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="confirm-modal-actions">
                            <button 
                                className="btn-danger" 
                                onClick={handleConfirmDelete}
                            >
                                Eliminar
                            </button>
                            <button 
                                className="btn-cancel" 
                                onClick={closeConfirmModal}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionProfesores; 