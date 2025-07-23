import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos
import '../styles/Modal.css'; // Importar los estilos del modal

interface Tema {
    id: number;
    nombre: string;
    curso_id: number;
}

interface Curso {
    id: number;
    nombre: string;
}

interface ModalState {
    isOpen: boolean;
    editingTema: Tema | null;
}

const GestionTemas: React.FC = () => {
    const [temas, setTemas] = useState<Tema[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [nombre, setNombre] = useState('');
    const [cursoId, setCursoId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingTema: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalCursoId, setModalCursoId] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        temaId: null as number | null,
        temaNombre: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [temasResponse, cursosResponse] = await Promise.all([
                apiClient.get('/temas'),
                apiClient.get('/cursos')
            ]);
            
            setTemas(temasResponse.data.data);
            setCursos(cursosResponse.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar el envío del formulario de creación
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !cursoId) {
            setError('El nombre y curso son obligatorios');
            return;
        }

        setError('');
        setSuccess('');

        try {
            await apiClient.post('/temas', { 
                nombre, 
                curso_id: parseInt(cursoId) 
            });
            setSuccess('Tema creado con éxito');
            setNombre('');
            setCursoId('');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al crear el tema';
            setError(errorMessage);
        }
    };

    // Funciones del modal
    const openEditModal = (tema: Tema) => {
        setModalState({
            isOpen: true,
            editingTema: tema
        });
        setModalNombre(tema.nombre);
        setModalCursoId(tema.curso_id.toString());
        setModalError('');
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            editingTema: null
        });
        setModalNombre('');
        setModalCursoId('');
        setModalError('');
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalNombre.trim() || !modalCursoId) {
            setModalError('El nombre y curso son obligatorios');
            return;
        }

        setModalError('');

        try {
            await apiClient.put(`/temas/${modalState.editingTema!.id}`, { 
                nombre: modalNombre, 
                curso_id: parseInt(modalCursoId) 
            });
            setSuccess('Tema actualizado con éxito');
            fetchData();
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al actualizar el tema';
            setModalError(errorMessage);
        }
    };

    // Funciones del modal de confirmación
    const openConfirmModal = (tema: Tema) => {
        setConfirmModal({
            isOpen: true,
            temaId: tema.id,
            temaNombre: tema.nombre
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            temaId: null,
            temaNombre: ''
        });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.temaId) {
            try {
                await apiClient.delete(`/temas/${confirmModal.temaId}`);
                setSuccess('Tema eliminado con éxito');
                fetchData();
                closeConfirmModal();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError('Error al eliminar el tema');
                closeConfirmModal();
            }
        }
    };

    const getCursoNombre = (cursoId: number) => {
        const curso = cursos.find(c => c.id === cursoId);
        return curso ? curso.nombre : 'Curso no encontrado';
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Gestión de Temas</h1>
                <div className="loading-container">
                    <p>Cargando temas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Gestión de Temas</h1>
            
            {/* Mensajes de éxito y error */}
            {error && <div className="page-message error-message">{error}</div>}
            {success && <div className="page-message success-message">{success}</div>}
            
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Tema</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre-tema">Nombre del Tema:</label>
                            <input 
                                id="nombre-tema" 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Derivadas e Integrales"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="curso-tema">Curso:</label>
                            <select 
                                id="curso-tema" 
                                value={cursoId} 
                                onChange={(e) => setCursoId(e.target.value)}
                                required
                            >
                                <option value="">Selecciona un curso</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                Crear Tema
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="list-section">
                    <h2>Lista de Temas</h2>
                    {temas.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Curso</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {temas.map(tema => (
                                        <tr key={tema.id}>
                                            <td>{tema.id}</td>
                                            <td><strong>{tema.nombre}</strong></td>
                                            <td>{getCursoNombre(tema.curso_id)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => openEditModal(tema)}
                                                        title="Editar tema"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => openConfirmModal(tema)}
                                                        title="Eliminar tema"
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
                        <p>No hay temas para mostrar.</p>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {modalState.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Tema</h2>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleModalSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="modal-nombre-tema">Nombre del Tema:</label>
                                <input 
                                    id="modal-nombre-tema" 
                                    type="text" 
                                    value={modalNombre} 
                                    onChange={(e) => setModalNombre(e.target.value)}
                                    placeholder="Ej: Derivadas e Integrales"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-curso-tema">Curso:</label>
                                <select 
                                    id="modal-curso-tema" 
                                    value={modalCursoId} 
                                    onChange={(e) => setModalCursoId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona un curso</option>
                                    {cursos.map(curso => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {modalError && <div className="modal-error">{modalError}</div>}
                            
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Actualizar Tema
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
                                ¿Estás seguro de que quieres eliminar el tema <strong>"{confirmModal.temaNombre}"</strong>? 
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

export default GestionTemas; 