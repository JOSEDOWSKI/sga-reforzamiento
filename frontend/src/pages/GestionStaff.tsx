import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useRealtimeData } from '../hooks/useRealtimeData';
import '../styles/GestionPage.css'; // Importar los estilos compartidos
import '../styles/Modal.css'; // Importar los estilos del modal

interface Staff {
    id: number;
    nombre: string;
    email: string;
    especialidad: string;
    telefono?: string;
}

interface ModalState {
    isOpen: boolean;
    editingStaff: Staff | null;
}

const GestionStaff: React.FC = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [telefono, setTelefono] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingStaff: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalEmail, setModalEmail] = useState('');
    const [modalEspecialidad, setModalEspecialidad] = useState('');
    const [modalTelefono, setModalTelefono] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Estados para el modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        staffId: null as number | null,
        staffNombre: ''
    });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/profesores'); // Usando la misma API por ahora
            setStaff(response.data.data);
            setError('');
        } catch (err: any) {
            console.error('Error al cargar staff:', err);
            setError('Error al cargar personal. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Hook para datos en tiempo real
    useRealtimeData({
        events: ['staff-created', 'staff-updated', 'staff-deleted'],
        onUpdate: fetchStaff
    });

    // Cargar staff al montar el componente
    useEffect(() => {
        fetchStaff();
    }, []);

    // Función para crear un nuevo miembro del staff
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (!email.trim()) {
            setError('El email es requerido');
            return;
        }

        try {
            setLoading(true);
            const staffData = {
                nombre: nombre.trim(),
                email: email.trim(),
                especialidad: especialidad.trim(),
                telefono: telefono.trim()
            };
            
            await apiClient.post('/profesores', staffData);
            setSuccess('Miembro del staff creado exitosamente');
            setNombre('');
            setEmail('');
            setEspecialidad('');
            setTelefono('');
            setError('');
            fetchStaff();
        } catch (err: any) {
            console.error('Error al crear miembro del staff:', err);
            setError('Error al crear miembro del staff. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const handleEdit = (staffMember: Staff) => {
        setModalState({
            isOpen: true,
            editingStaff: staffMember
        });
        setModalNombre(staffMember.nombre);
        setModalEmail(staffMember.email);
        setModalEspecialidad(staffMember.especialidad || '');
        setModalTelefono(staffMember.telefono || '');
        setModalError('');
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            editingStaff: null
        });
        setModalNombre('');
        setModalEmail('');
        setModalEspecialidad('');
        setModalTelefono('');
        setModalError('');
    };

    // Función para actualizar un miembro del staff
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!modalNombre.trim()) {
            setModalError('El nombre es requerido');
            return;
        }

        if (!modalEmail.trim()) {
            setModalError('El email es requerido');
            return;
        }

        if (!modalState.editingStaff) return;

        try {
            setLoading(true);
            const staffData = {
                nombre: modalNombre.trim(),
                email: modalEmail.trim(),
                especialidad: modalEspecialidad.trim(),
                telefono: modalTelefono.trim()
            };
            
            await apiClient.put(`/profesores/${modalState.editingStaff.id}`, staffData);
            setSuccess('Miembro del staff actualizado exitosamente');
            setError('');
            handleCloseModal();
            fetchStaff();
        } catch (err: any) {
            console.error('Error al actualizar miembro del staff:', err);
            setModalError('Error al actualizar miembro del staff. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de confirmación de eliminación
    const handleDeleteClick = (staffMember: Staff) => {
        setConfirmModal({
            isOpen: true,
            staffId: staffMember.id,
            staffNombre: staffMember.nombre
        });
    };

    // Función para cerrar el modal de confirmación
    const handleCloseConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            staffId: null,
            staffNombre: ''
        });
    };

    // Función para eliminar un miembro del staff
    const handleDelete = async () => {
        if (!confirmModal.staffId) return;

        try {
            setLoading(true);
            await apiClient.delete(`/profesores/${confirmModal.staffId}`);
            setSuccess('Miembro del staff eliminado exitosamente');
            setError('');
            handleCloseConfirmModal();
            fetchStaff();
        } catch (err: any) {
            console.error('Error al eliminar miembro del staff:', err);
            setError('Error al eliminar miembro del staff. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="form-and-list-container">
                {/* Formulario para crear miembros del staff */}
                <div className="form-section">
                    <h2>Agregar Miembro del Staff</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre Completo *</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: María González"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="maria@ejemplo.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="especialidad">Especialidad</label>
                            <input
                                type="text"
                                id="especialidad"
                                value={especialidad}
                                onChange={(e) => setEspecialidad(e.target.value)}
                                placeholder="Ej: Estilista, Masajista, Instructor"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="tel"
                                id="telefono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="987 654 321"
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Agregar Staff'}
                        </button>
                    </form>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>

                {/* Lista de staff */}
                <div className="list-section">
                    <h2>Personal Registrado</h2>
                    {loading ? (
                        <div className="loading-message">Cargando personal...</div>
                    ) : staff.length === 0 ? (
                        <div className="empty-message">No hay personal registrado</div>
                    ) : (
                        <div className="list-container">
                            {staff.map((staffMember) => (
                                <div key={staffMember.id} className="list-item">
                                    <div className="item-content">
                                        <h3 className="item-title">{staffMember.nombre}</h3>
                                        <p className="item-email">{staffMember.email}</p>
                                        {staffMember.especialidad && (
                                            <p className="item-specialty">{staffMember.especialidad}</p>
                                        )}
                                        {staffMember.telefono && (
                                            <p className="item-phone">{staffMember.telefono}</p>
                                        )}
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => handleEdit(staffMember)}
                                            className="btn-secondary"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(staffMember)}
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
                            <h3>Editar Miembro del Staff</h3>
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
                                <label htmlFor="modal-email">Email *</label>
                                <input
                                    type="email"
                                    id="modal-email"
                                    value={modalEmail}
                                    onChange={(e) => setModalEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-especialidad">Especialidad</label>
                                <input
                                    type="text"
                                    id="modal-especialidad"
                                    value={modalEspecialidad}
                                    onChange={(e) => setModalEspecialidad(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-telefono">Teléfono</label>
                                <input
                                    type="tel"
                                    id="modal-telefono"
                                    value={modalTelefono}
                                    onChange={(e) => setModalTelefono(e.target.value)}
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
                            <p>¿Estás seguro de que quieres eliminar a <strong>"{confirmModal.staffNombre}"</strong> del staff?</p>
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

export default GestionStaff;
