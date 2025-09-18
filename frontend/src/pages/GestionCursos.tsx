import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos
import '../styles/Modal.css'; // Importar los estilos del modal

// Defino un tipo para los cursos para que TypeScript nos ayude
interface Curso {
    id: number;
    nombre: string;
    descripcion: string;
}

interface ModalState {
    isOpen: boolean;
    editingCurso: Curso | null;
}

const GestionCursos: React.FC = () => {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingCurso: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalDescripcion, setModalDescripcion] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        cursoId: null as number | null,
        cursoNombre: ''
    });

    // Función para cargar los cursos desde el backend
    const fetchCursos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/cursos');
            setCursos(response.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los cursos');
        } finally {
            setLoading(false);
        }
    };

    // useEffect se ejecuta cuando el componente se monta
    useEffect(() => {
        fetchCursos();
    }, []);

    // Función para manejar el envío del formulario de creación
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validaciones específicas por campo
        const camposFaltantes = [];
        
        if (!nombre.trim()) {
            camposFaltantes.push("Nombre del curso");
        }

        if (camposFaltantes.length > 0) {
            const mensaje = camposFaltantes.length === 1 
                ? `Falta completar el campo: ${camposFaltantes[0]}`
                : `Faltan completar los siguientes campos: ${camposFaltantes.join(", ")}`;
            setError(mensaje);
            return;
        }

        setError('');
        setSuccess('');

        try {
            await apiClient.post('/cursos', { nombre, descripcion });
            setSuccess('Curso creado con éxito');
            setNombre('');
            setDescripcion('');
            fetchCursos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al crear el curso';
            setError(errorMessage);
        }
    };

    // Funciones del modal
    const openEditModal = (curso: Curso) => {
        setModalState({
            isOpen: true,
            editingCurso: curso
        });
        setModalNombre(curso.nombre);
        setModalDescripcion(curso.descripcion);
        setModalError('');
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            editingCurso: null
        });
        setModalNombre('');
        setModalDescripcion('');
        setModalError('');
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validaciones específicas por campo
        const camposFaltantes = [];
        
        if (!modalNombre.trim()) {
            camposFaltantes.push("Nombre del curso");
        }

        if (camposFaltantes.length > 0) {
            const mensaje = camposFaltantes.length === 1 
                ? `Falta completar el campo: ${camposFaltantes[0]}`
                : `Faltan completar los siguientes campos: ${camposFaltantes.join(", ")}`;
            setModalError(mensaje);
            return;
        }

        setModalError('');

        try {
            await apiClient.put(`/cursos/${modalState.editingCurso!.id}`, { 
                nombre: modalNombre, 
                descripcion: modalDescripcion 
            });
            setSuccess('Curso actualizado con éxito');
            fetchCursos();
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al actualizar el curso';
            setModalError(errorMessage);
        }
    };

    // Funciones del modal de confirmación
    const openConfirmModal = (curso: Curso) => {
        setConfirmModal({
            isOpen: true,
            cursoId: curso.id,
            cursoNombre: curso.nombre
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            cursoId: null,
            cursoNombre: ''
        });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.cursoId) {
            try {
                await apiClient.delete(`/cursos/${confirmModal.cursoId}`);
                setSuccess('Curso eliminado con éxito');
                fetchCursos();
                closeConfirmModal();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError('Error al eliminar el curso');
                closeConfirmModal();
            }
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Gestión de Cursos</h1>
                <div className="loading-container">
                    <p>Cargando cursos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Gestión de Cursos</h1>
            
            {/* Mensajes de éxito y error */}
            {error && <div className="page-message error-message">{error}</div>}
            {success && <div className="page-message success-message">{success}</div>}
            
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Curso</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="nombre-curso">Nombre:</label>
                            <input 
                                id="nombre-curso" 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Ej: Matemáticas Avanzadas"
                                className={!nombre.trim() && error ? "field-error" : ""}
                            />
                            {!nombre.trim() && error && (
                                <span className="field-error-message">Ingrese el nombre del curso</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion-curso">Descripción:</label>
                            <textarea 
                                id="descripcion-curso" 
                                value={descripcion} 
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del curso..."
                                rows={3}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                Crear Curso
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="list-section">
                    <h2>Lista de Cursos</h2>
                    {cursos.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cursos.map(curso => (
                                        <tr key={curso.id}>
                                            <td>{curso.id}</td>
                                            <td><strong>{curso.nombre}</strong></td>
                                            <td>{curso.descripcion || 'Sin descripción'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => openEditModal(curso)}
                                                        title="Editar curso"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => openConfirmModal(curso)}
                                                        title="Eliminar curso"
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
                        <p>No hay cursos para mostrar.</p>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {modalState.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Curso</h2>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleModalSubmit} className="modal-form" noValidate>
                            <div className="form-group">
                                <label htmlFor="modal-nombre-curso">Nombre:</label>
                                <input 
                                    id="modal-nombre-curso" 
                                    type="text" 
                                    value={modalNombre} 
                                    onChange={(e) => setModalNombre(e.target.value)} 
                                    placeholder="Ej: Matemáticas Avanzadas"
                                    className={!modalNombre.trim() && modalError ? "field-error" : ""}
                                />
                                {!modalNombre.trim() && modalError && (
                                    <span className="field-error-message">Ingrese el nombre del curso</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-descripcion-curso">Descripción:</label>
                                <textarea 
                                    id="modal-descripcion-curso" 
                                    value={modalDescripcion} 
                                    onChange={(e) => setModalDescripcion(e.target.value)}
                                    placeholder="Descripción del curso..."
                                    rows={4}
                                />
                            </div>
                            
                            {modalError && <div className="modal-error">{modalError}</div>}
                            
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Actualizar Curso
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
                                ¿Estás seguro de que quieres eliminar el curso <strong>"{confirmModal.cursoNombre}"</strong>? 
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

export default GestionCursos; 