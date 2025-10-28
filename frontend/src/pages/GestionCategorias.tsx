import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useRealtimeData } from '../hooks/useRealtimeData';
import '../styles/GestionPage.css'; // Importar los estilos compartidos
import '../styles/Modal.css'; // Importar los estilos del modal
import './DashboardPage.css'; // Importar los estilos del dashboard para los dropdowns

interface Categoria {
    id: number;
    nombre: string;
    servicio_id: number;
}

interface Servicio {
    id: number;
    nombre: string;
}

interface ModalState {
    isOpen: boolean;
    editingCategoria: Categoria | null;
}

const GestionCategorias: React.FC = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [nombre, setNombre] = useState('');
    const [servicioId, setServicioId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingCategoria: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalServicioId, setModalServicioId] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        categoriaId: null as number | null,
        categoriaNombre: ''
    });

    // Estados para dropdowns personalizados
    const [showServicioDropdown, setShowServicioDropdown] = useState(false);
    const [showModalServicioDropdown, setShowModalServicioDropdown] = useState(false);

    // Función para cargar categorías y servicios
    const fetchData = async () => {
        try {
            setLoading(true);
            const [temasRes, cursosRes] = await Promise.all([
                apiClient.get('/temas'),
                apiClient.get('/cursos')
            ]);
            setCategorias(temasRes.data.data);
            setServicios(cursosRes.data.data);
            setError('');
        } catch (err: any) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar categorías y servicios. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Hook para datos en tiempo real
    useRealtimeData('temas', fetchData);

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Función para crear una nueva categoría
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            setError('El nombre de la categoría es requerido');
            return;
        }

        if (!servicioId) {
            setError('Debes seleccionar un servicio');
            return;
        }

        try {
            setLoading(true);
            const categoriaData = {
                nombre: nombre.trim(),
                curso_id: parseInt(servicioId) // Usando la misma API por ahora
            };
            
            await apiClient.post('/temas', categoriaData);
            setSuccess('Categoría creada exitosamente');
            setNombre('');
            setServicioId('');
            setError('');
            fetchData();
        } catch (err: any) {
            console.error('Error al crear categoría:', err);
            setError('Error al crear categoría. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const handleEdit = (categoria: Categoria) => {
        setModalState({
            isOpen: true,
            editingCategoria: categoria
        });
        setModalNombre(categoria.nombre);
        setModalServicioId(categoria.servicio_id.toString());
        setModalError('');
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            editingCategoria: null
        });
        setModalNombre('');
        setModalServicioId('');
        setModalError('');
    };

    // Función para actualizar una categoría
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!modalNombre.trim()) {
            setModalError('El nombre de la categoría es requerido');
            return;
        }

        if (!modalServicioId) {
            setModalError('Debes seleccionar un servicio');
            return;
        }

        if (!modalState.editingCategoria) return;

        try {
            setLoading(true);
            const categoriaData = {
                nombre: modalNombre.trim(),
                curso_id: parseInt(modalServicioId) // Usando la misma API por ahora
            };
            
            await apiClient.put(`/temas/${modalState.editingCategoria.id}`, categoriaData);
            setSuccess('Categoría actualizada exitosamente');
            setError('');
            handleCloseModal();
            fetchData();
        } catch (err: any) {
            console.error('Error al actualizar categoría:', err);
            setModalError('Error al actualizar categoría. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de confirmación de eliminación
    const handleDeleteClick = (categoria: Categoria) => {
        setConfirmModal({
            isOpen: true,
            categoriaId: categoria.id,
            categoriaNombre: categoria.nombre
        });
    };

    // Función para cerrar el modal de confirmación
    const handleCloseConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            categoriaId: null,
            categoriaNombre: ''
        });
    };

    // Función para eliminar una categoría
    const handleDelete = async () => {
        if (!confirmModal.categoriaId) return;

        try {
            setLoading(true);
            await apiClient.delete(`/temas/${confirmModal.categoriaId}`);
            setSuccess('Categoría eliminada exitosamente');
            setError('');
            handleCloseConfirmModal();
            fetchData();
        } catch (err: any) {
            console.error('Error al eliminar categoría:', err);
            setError('Error al eliminar categoría. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener el nombre del servicio por ID
    const getServicioNombre = (servicioId: number) => {
        const servicio = servicios.find(s => s.id === servicioId);
        return servicio ? servicio.nombre : 'Servicio no encontrado';
    };

    return (
        <div className="page-container">
            <div className="form-and-list-container">
                {/* Formulario para crear categorías */}
                <div className="form-section">
                    <h2>Crear Nueva Categoría</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre de la Categoría *</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Corte, Color, Tratamiento"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="servicio">Servicio *</label>
                            <div className="custom-dropdown">
                                <button
                                    type="button"
                                    className="dropdown-trigger"
                                    onClick={() => setShowServicioDropdown(!showServicioDropdown)}
                                >
                                    {servicioId ? getServicioNombre(parseInt(servicioId)) : 'Seleccionar servicio'}
                                </button>
                                {showServicioDropdown && (
                                    <div className="dropdown-menu">
                                        {servicios.map((servicio) => (
                                            <button
                                                key={servicio.id}
                                                type="button"
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setServicioId(servicio.id.toString());
                                                    setShowServicioDropdown(false);
                                                }}
                                            >
                                                {servicio.nombre}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Categoría'}
                        </button>
                    </form>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>

                {/* Lista de categorías */}
                <div className="list-section">
                    <h2>Categorías Registradas</h2>
                    {loading ? (
                        <div className="loading-message">Cargando categorías...</div>
                    ) : categorias.length === 0 ? (
                        <div className="empty-message">No hay categorías registradas</div>
                    ) : (
                        <div className="list-container">
                            {categorias.map((categoria) => (
                                <div key={categoria.id} className="list-item">
                                    <div className="item-content">
                                        <h3 className="item-title">{categoria.nombre}</h3>
                                        <p className="item-service">
                                            Servicio: {getServicioNombre(categoria.servicio_id)}
                                        </p>
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => handleEdit(categoria)}
                                            className="btn-secondary"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(categoria)}
                                            className="btn-danger"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de edición */}
            {modalState.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Editar Categoría</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label htmlFor="modal-nombre">Nombre de la Categoría *</label>
                                <input
                                    type="text"
                                    id="modal-nombre"
                                    value={modalNombre}
                                    onChange={(e) => setModalNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-servicio">Servicio *</label>
                                <div className="custom-dropdown">
                                    <button
                                        type="button"
                                        className="dropdown-trigger"
                                        onClick={() => setShowModalServicioDropdown(!showModalServicioDropdown)}
                                    >
                                        {modalServicioId ? getServicioNombre(parseInt(modalServicioId)) : 'Seleccionar servicio'}
                                    </button>
                                    {showModalServicioDropdown && (
                                        <div className="dropdown-menu">
                                            {servicios.map((servicio) => (
                                                <button
                                                    key={servicio.id}
                                                    type="button"
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setModalServicioId(servicio.id.toString());
                                                        setShowModalServicioDropdown(false);
                                                    }}
                                                >
                                                    {servicio.nombre}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {modalError && <div className="error-message">{modalError}</div>}
                            <div className="modal-actions">
                                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Actualizando...' : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Confirmar Eliminación</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseConfirmModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que quieres eliminar la categoría <strong>"{confirmModal.categoriaNombre}"</strong>?</p>
                            <p className="warning-text">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleCloseConfirmModal} className="btn-secondary">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} className="btn-danger" disabled={loading}>
                                {loading ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCategorias;
