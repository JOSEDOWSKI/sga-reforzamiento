import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useRealtimeData } from '../hooks/useRealtimeData';
// import { useTenantLabels } from '../utils/tenantLabels'; // TODO: Usar en el futuro
import '../styles/GestionPage.css';
import '../styles/Modal.css';

interface Inmueble {
    id: number;
    nombre: string;
    descripcion?: string;
    precio?: number;
    activo: boolean;
    establecimiento_id?: number;
}

interface ModalState {
    isOpen: boolean;
    editingInmueble: Inmueble | null;
}

const GestionInmuebles: React.FC = () => {
    // const labels = useTenantLabels(); // TODO: Usar labels dinámicos en el futuro
    const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingInmueble: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalDescripcion, setModalDescripcion] = useState('');
    const [modalPrecio, setModalPrecio] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        inmuebleId: null as number | null,
        inmuebleNombre: ''
    });

    const fetchInmuebles = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/inmuebles');
            setInmuebles(response.data.data);
            setError('');
        } catch (err: any) {
            console.error('Error al cargar inmuebles:', err);
            setError('Error al cargar inmuebles. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Hook para datos en tiempo real
    useRealtimeData({
        events: ['inmueble-created', 'inmueble-updated', 'inmueble-deleted'],
        onUpdate: fetchInmuebles
    });

    // Cargar inmuebles al montar el componente
    useEffect(() => {
        fetchInmuebles();
    }, []);

    // Función para crear un nuevo inmueble
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        try {
            setLoading(true);
            const inmuebleData = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null,
                precio: precio ? parseFloat(precio) : null
            };
            
            await apiClient.post('/inmuebles', inmuebleData);
            setSuccess('Inmueble creado exitosamente');
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setError('');
            fetchInmuebles();
        } catch (err: any) {
            console.error('Error al crear inmueble:', err);
            setError('Error al crear inmueble. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const handleEdit = (inmueble: Inmueble) => {
        setModalState({
            isOpen: true,
            editingInmueble: inmueble
        });
        setModalNombre(inmueble.nombre);
        setModalDescripcion(inmueble.descripcion || '');
        setModalPrecio(inmueble.precio?.toString() || '');
        setModalError('');
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            editingInmueble: null
        });
        setModalNombre('');
        setModalDescripcion('');
        setModalPrecio('');
        setModalError('');
    };

    // Función para actualizar un inmueble
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!modalNombre.trim()) {
            setModalError('El nombre es requerido');
            return;
        }

        if (!modalState.editingInmueble) return;

        try {
            setLoading(true);
            const inmuebleData = {
                nombre: modalNombre.trim(),
                descripcion: modalDescripcion.trim() || null,
                precio: modalPrecio ? parseFloat(modalPrecio) : null
            };
            
            await apiClient.put(`/inmuebles/${modalState.editingInmueble.id}`, inmuebleData);
            setSuccess('Inmueble actualizado exitosamente');
            setError('');
            handleCloseModal();
            fetchInmuebles();
        } catch (err: any) {
            console.error('Error al actualizar inmueble:', err);
            setModalError('Error al actualizar inmueble. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de confirmación de eliminación
    const handleDeleteClick = (inmueble: Inmueble) => {
        setConfirmModal({
            isOpen: true,
            inmuebleId: inmueble.id,
            inmuebleNombre: inmueble.nombre
        });
    };

    // Función para cerrar el modal de confirmación
    const handleCloseConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            inmuebleId: null,
            inmuebleNombre: ''
        });
    };

    // Función para eliminar un inmueble
    const handleDelete = async () => {
        if (!confirmModal.inmuebleId) return;

        try {
            setLoading(true);
            await apiClient.delete(`/inmuebles/${confirmModal.inmuebleId}`);
            setSuccess('Inmueble eliminado exitosamente');
            setError('');
            handleCloseConfirmModal();
            fetchInmuebles();
        } catch (err: any) {
            console.error('Error al eliminar inmueble:', err);
            setError('Error al eliminar inmueble. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="form-and-list-container">
                {/* Formulario para crear inmuebles */}
                <div className="form-section">
                    <h2>Agregar Inmueble</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre *</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Cancha 1, Consultorio A, Sillón 3"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción</label>
                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del inmueble (opcional)"
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="precio">Precio</label>
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
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Agregar Inmueble'}
                        </button>
                    </form>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>

                {/* Lista de inmuebles */}
                <div className="list-section">
                    <h2>Inmuebles Registrados</h2>
                    {loading ? (
                        <div className="loading-message">Cargando inmuebles...</div>
                    ) : inmuebles.length === 0 ? (
                        <div className="empty-message">No hay inmuebles registrados</div>
                    ) : (
                        <div className="list-container">
                            {inmuebles.map((inmueble) => (
                                <div key={inmueble.id} className="list-item">
                                    <div className="item-content">
                                        <h3 className="item-title">{inmueble.nombre}</h3>
                                        {inmueble.descripcion && (
                                            <p className="item-description">{inmueble.descripcion}</p>
                                        )}
                                        {inmueble.precio && (
                                            <p className="item-price">💰 S/ {inmueble.precio.toFixed(2)}</p>
                                        )}
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => handleEdit(inmueble)}
                                            className="btn-secondary"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(inmueble)}
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
                            <h3>Editar Inmueble</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label htmlFor="modal-nombre">Nombre *</label>
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
                                <textarea
                                    id="modal-descripcion"
                                    value={modalDescripcion}
                                    onChange={(e) => setModalDescripcion(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-precio">Precio</label>
                                <input
                                    type="number"
                                    id="modal-precio"
                                    value={modalPrecio}
                                    onChange={(e) => setModalPrecio(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
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
                            <p>¿Estás seguro de que quieres eliminar el inmueble <strong>"{confirmModal.inmuebleNombre}"</strong>?</p>
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

export default GestionInmuebles;

