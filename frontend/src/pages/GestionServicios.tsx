import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useRealtimeData } from '../hooks/useRealtimeData';
import '../styles/GestionPage.css'; // Importar los estilos compartidos
import '../styles/Modal.css'; // Importar los estilos del modal

// Defino un tipo para los servicios para que TypeScript nos ayude
interface Servicio {
    id: number;
    nombre: string;
    descripcion: string;
    precio?: number;
    duracion_minutos?: number;
}

interface ModalState {
    isOpen: boolean;
    editingServicio: Servicio | null;
}

const GestionServicios: React.FC = () => {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [duracion, setDuracion] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingServicio: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalDescripcion, setModalDescripcion] = useState('');
    const [modalPrecio, setModalPrecio] = useState('');
    const [modalDuracion, setModalDuracion] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        servicioId: null as number | null,
        servicioNombre: ''
    });

    // Función para cargar los servicios desde el backend
    const fetchServicios = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/cursos'); // Usando la misma API por ahora
            setServicios(response.data.data);
            setError('');
        } catch (err: any) {
            console.error('Error al cargar servicios:', err);
            setError('Error al cargar servicios. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Hook para datos en tiempo real
    useRealtimeData('cursos', fetchServicios);

    // Cargar servicios al montar el componente
    useEffect(() => {
        fetchServicios();
    }, []);

    // Función para crear un nuevo servicio
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            setError('El nombre del servicio es requerido');
            return;
        }

        try {
            setLoading(true);
            const servicioData = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precio: precio ? parseFloat(precio) : null,
                duracion_minutos: duracion ? parseInt(duracion) : null
            };
            
            await apiClient.post('/cursos', servicioData);
            setSuccess('Servicio creado exitosamente');
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setDuracion('');
            setError('');
            fetchServicios();
        } catch (err: any) {
            console.error('Error al crear servicio:', err);
            setError('Error al crear servicio. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const handleEdit = (servicio: Servicio) => {
        setModalState({
            isOpen: true,
            editingServicio: servicio
        });
        setModalNombre(servicio.nombre);
        setModalDescripcion(servicio.descripcion || '');
        setModalPrecio(servicio.precio?.toString() || '');
        setModalDuracion(servicio.duracion_minutos?.toString() || '');
        setModalError('');
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            editingServicio: null
        });
        setModalNombre('');
        setModalDescripcion('');
        setModalPrecio('');
        setModalDuracion('');
        setModalError('');
    };

    // Función para actualizar un servicio
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!modalNombre.trim()) {
            setModalError('El nombre del servicio es requerido');
            return;
        }

        if (!modalState.editingServicio) return;

        try {
            setLoading(true);
            const servicioData = {
                nombre: modalNombre.trim(),
                descripcion: modalDescripcion.trim(),
                precio: modalPrecio ? parseFloat(modalPrecio) : null,
                duracion_minutos: modalDuracion ? parseInt(modalDuracion) : null
            };
            
            await apiClient.put(`/cursos/${modalState.editingServicio.id}`, servicioData);
            setSuccess('Servicio actualizado exitosamente');
            setError('');
            handleCloseModal();
            fetchServicios();
        } catch (err: any) {
            console.error('Error al actualizar servicio:', err);
            setModalError('Error al actualizar servicio. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de confirmación de eliminación
    const handleDeleteClick = (servicio: Servicio) => {
        setConfirmModal({
            isOpen: true,
            servicioId: servicio.id,
            servicioNombre: servicio.nombre
        });
    };

    // Función para cerrar el modal de confirmación
    const handleCloseConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            servicioId: null,
            servicioNombre: ''
        });
    };

    // Función para eliminar un servicio
    const handleDelete = async () => {
        if (!confirmModal.servicioId) return;

        try {
            setLoading(true);
            await apiClient.delete(`/cursos/${confirmModal.servicioId}`);
            setSuccess('Servicio eliminado exitosamente');
            setError('');
            handleCloseConfirmModal();
            fetchServicios();
        } catch (err: any) {
            console.error('Error al eliminar servicio:', err);
            setError('Error al eliminar servicio. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="form-and-list-container">
                {/* Formulario para crear servicios */}
                <div className="form-section">
                    <h2>Crear Nuevo Servicio</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre del Servicio *</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Corte de cabello, Consulta médica, Clase de yoga"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción</label>
                            <input
                                type="text"
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del servicio"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="precio">Precio (S/)</label>
                            <input
                                type="number"
                                id="precio"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="duracion">Duración (minutos)</label>
                            <input
                                type="number"
                                id="duracion"
                                value={duracion}
                                onChange={(e) => setDuracion(e.target.value)}
                                placeholder="60"
                                min="1"
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Servicio'}
                        </button>
                    </form>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>

                {/* Lista de servicios */}
                <div className="list-section">
                    <h2>Servicios Registrados</h2>
                    {loading ? (
                        <div className="loading-message">Cargando servicios...</div>
                    ) : servicios.length === 0 ? (
                        <div className="empty-message">No hay servicios registrados</div>
                    ) : (
                        <div className="list-container">
                            {servicios.map((servicio) => (
                                <div key={servicio.id} className="list-item">
                                    <div className="item-content">
                                        <h3 className="item-title">{servicio.nombre}</h3>
                                        {servicio.descripcion && (
                                            <p className="item-description">{servicio.descripcion}</p>
                                        )}
                                        <div className="item-details">
                                            {servicio.precio && (
                                                <span className="item-price">S/ {servicio.precio}</span>
                                            )}
                                            {servicio.duracion_minutos && (
                                                <span className="item-duration">{servicio.duracion_minutos} min</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => handleEdit(servicio)}
                                            className="btn-secondary"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(servicio)}
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
                            <h3>Editar Servicio</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label htmlFor="modal-nombre">Nombre del Servicio *</label>
                                <input
                                    type="text"
                                    id="modal-nombre"
                                    value={modalNombre}
                                    onChange={(e) => setModalNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-descripcion">Descripción</label>
                                <input
                                    type="text"
                                    id="modal-descripcion"
                                    value={modalDescripcion}
                                    onChange={(e) => setModalDescripcion(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-precio">Precio (S/)</label>
                                <input
                                    type="number"
                                    id="modal-precio"
                                    value={modalPrecio}
                                    onChange={(e) => setModalPrecio(e.target.value)}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-duracion">Duración (minutos)</label>
                                <input
                                    type="number"
                                    id="modal-duracion"
                                    value={modalDuracion}
                                    onChange={(e) => setModalDuracion(e.target.value)}
                                    min="1"
                                />
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
                            <p>¿Estás seguro de que quieres eliminar el servicio <strong>"{confirmModal.servicioNombre}"</strong>?</p>
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

export default GestionServicios;
