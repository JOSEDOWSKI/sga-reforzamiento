import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useRealtimeData } from '../hooks/useRealtimeData';
import '../styles/GestionPage.css';
import '../styles/Modal.css';

interface Cliente {
    id: number;
    nombre: string;
    telefono: string;
    dni?: string | null;
    email?: string | null;
}

interface ModalState {
    isOpen: boolean;
    editingCliente: Cliente | null;
}

const GestionClientes: React.FC = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingCliente: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalTelefono, setModalTelefono] = useState('');
    const [modalDni, setModalDni] = useState('');
    const [modalEmail, setModalEmail] = useState('');
    const [modalError, setModalError] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        clienteId: null as number | null,
        clienteNombre: ''
    });

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/alumnos'); // Usando la misma API por ahora
            setClientes(response.data.data);
            setError('');
        } catch (err: any) {
            console.error('Error al cargar clientes:', err);
            setError('Error al cargar clientes. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Hook para datos en tiempo real
    useRealtimeData('alumnos', fetchClientes);

    // Cargar clientes al montar el componente
    useEffect(() => {
        fetchClientes();
    }, []);

    // Función para crear un nuevo cliente
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (!telefono.trim()) {
            setError('El teléfono es requerido');
            return;
        }

        try {
            setLoading(true);
            const clienteData = {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                dni: dni.trim() || null,
                email: email.trim() || null
            };
            
            await apiClient.post('/alumnos', clienteData);
            setSuccess('Cliente creado exitosamente');
            setNombre('');
            setTelefono('');
            setDni('');
            setEmail('');
            setError('');
            fetchClientes();
        } catch (err: any) {
            console.error('Error al crear cliente:', err);
            setError('Error al crear cliente. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const handleEdit = (cliente: Cliente) => {
        setModalState({
            isOpen: true,
            editingCliente: cliente
        });
        setModalNombre(cliente.nombre);
        setModalTelefono(cliente.telefono);
        setModalDni(cliente.dni || '');
        setModalEmail(cliente.email || '');
        setModalError('');
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            editingCliente: null
        });
        setModalNombre('');
        setModalTelefono('');
        setModalDni('');
        setModalEmail('');
        setModalError('');
    };

    // Función para actualizar un cliente
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!modalNombre.trim()) {
            setModalError('El nombre es requerido');
            return;
        }

        if (!modalTelefono.trim()) {
            setModalError('El teléfono es requerido');
            return;
        }

        if (!modalState.editingCliente) return;

        try {
            setLoading(true);
            const clienteData = {
                nombre: modalNombre.trim(),
                telefono: modalTelefono.trim(),
                dni: modalDni.trim() || null,
                email: modalEmail.trim() || null
            };
            
            await apiClient.put(`/alumnos/${modalState.editingCliente.id}`, clienteData);
            setSuccess('Cliente actualizado exitosamente');
            setError('');
            handleCloseModal();
            fetchClientes();
        } catch (err: any) {
            console.error('Error al actualizar cliente:', err);
            setModalError('Error al actualizar cliente. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de confirmación de eliminación
    const handleDeleteClick = (cliente: Cliente) => {
        setConfirmModal({
            isOpen: true,
            clienteId: cliente.id,
            clienteNombre: cliente.nombre
        });
    };

    // Función para cerrar el modal de confirmación
    const handleCloseConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            clienteId: null,
            clienteNombre: ''
        });
    };

    // Función para eliminar un cliente
    const handleDelete = async () => {
        if (!confirmModal.clienteId) return;

        try {
            setLoading(true);
            await apiClient.delete(`/alumnos/${confirmModal.clienteId}`);
            setSuccess('Cliente eliminado exitosamente');
            setError('');
            handleCloseConfirmModal();
            fetchClientes();
        } catch (err: any) {
            console.error('Error al eliminar cliente:', err);
            setError('Error al eliminar cliente. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="form-and-list-container">
                {/* Formulario para crear clientes */}
                <div className="form-section">
                    <h2>Registrar Nuevo Cliente</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre Completo *</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono *</label>
                            <input
                                type="tel"
                                id="telefono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="987 654 321"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dni">DNI</label>
                            <input
                                type="text"
                                id="dni"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                placeholder="12345678"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="juan@ejemplo.com"
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrar Cliente'}
                        </button>
                    </form>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>

                {/* Lista de clientes */}
                <div className="list-section">
                    <h2>Clientes Registrados</h2>
                    {loading ? (
                        <div className="loading-message">Cargando clientes...</div>
                    ) : clientes.length === 0 ? (
                        <div className="empty-message">No hay clientes registrados</div>
                    ) : (
                        <div className="list-container">
                            {clientes.map((cliente) => (
                                <div key={cliente.id} className="list-item">
                                    <div className="item-content">
                                        <h3 className="item-title">{cliente.nombre}</h3>
                                        <p className="item-phone">{cliente.telefono}</p>
                                        {cliente.email && (
                                            <p className="item-email">{cliente.email}</p>
                                        )}
                                        {cliente.dni && (
                                            <p className="item-dni">DNI: {cliente.dni}</p>
                                        )}
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => handleEdit(cliente)}
                                            className="btn-secondary"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(cliente)}
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
                            <h3>Editar Cliente</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label htmlFor="modal-nombre">Nombre Completo *</label>
                                <input
                                    type="text"
                                    id="modal-nombre"
                                    value={modalNombre}
                                    onChange={(e) => setModalNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-telefono">Teléfono *</label>
                                <input
                                    type="tel"
                                    id="modal-telefono"
                                    value={modalTelefono}
                                    onChange={(e) => setModalTelefono(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-dni">DNI</label>
                                <input
                                    type="text"
                                    id="modal-dni"
                                    value={modalDni}
                                    onChange={(e) => setModalDni(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-email">Email</label>
                                <input
                                    type="email"
                                    id="modal-email"
                                    value={modalEmail}
                                    onChange={(e) => setModalEmail(e.target.value)}
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
                            <p>¿Estás seguro de que quieres eliminar al cliente <strong>"{confirmModal.clienteNombre}"</strong>?</p>
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

export default GestionClientes;
