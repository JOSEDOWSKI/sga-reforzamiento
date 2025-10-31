import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useRealtimeData } from '../hooks/useRealtimeData';
import '../styles/GestionPage.css';
import '../styles/Modal.css';

interface Alumno {
    id: number;
    nombre: string;
    telefono: string;
    dni?: string | null;
    email?: string | null;
}

interface ModalState {
    isOpen: boolean;
    editingAlumno: Alumno | null;
}

const GestionAlumnos: React.FC = () => {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        editingAlumno: null
    });
    const [modalNombre, setModalNombre] = useState('');
    const [modalTelefono, setModalTelefono] = useState('');
    const [modalDni, setModalDni] = useState('');
    const [modalEmail, setModalEmail] = useState('');
    const [modalError, setModalError] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        alumnoId: null as number | null,
        alumnoNombre: ''
    });

    const fetchAlumnos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/alumnos');
            setAlumnos(response.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los alumnos');
        } finally {
            setLoading(false);
        }
    };

    // Configurar actualizaciones en tiempo real
    const { isConnected: _isConnected } = useRealtimeData({
        events: ['cliente-created', 'cliente-updated', 'cliente-deleted'],
        onUpdate: fetchAlumnos,
        enabled: true
    });

    useEffect(() => {
        fetchAlumnos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const camposFaltantes: string[] = [];
        if (!nombre.trim()) camposFaltantes.push('Nombre');
        if (!telefono.trim()) camposFaltantes.push('Teléfono');

        if (camposFaltantes.length > 0) {
            const mensaje = camposFaltantes.length === 1
                ? `Falta completar el campo: ${camposFaltantes[0]}`
                : `Faltan completar los siguientes campos: ${camposFaltantes.join(', ')}`;
            setError(mensaje);
            return;
        }

        setError('');
        setSuccess('');

        try {
            await apiClient.post('/alumnos', { nombre, telefono, dni: dni || null, email: email || null });
            setSuccess('Alumno creado con éxito');
            setNombre('');
            setTelefono('');
            setDni('');
            setEmail('');
            fetchAlumnos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al crear el alumno';
            setError(errorMessage);
        }
    };

    const openEditModal = (alumno: Alumno) => {
        setModalState({ isOpen: true, editingAlumno: alumno });
        setModalNombre(alumno.nombre);
        setModalTelefono(alumno.telefono);
        setModalDni(alumno.dni || '');
        setModalEmail(alumno.email || '');
        setModalError('');
    };

    const closeModal = () => {
        setModalState({ isOpen: false, editingAlumno: null });
        setModalNombre('');
        setModalTelefono('');
        setModalDni('');
        setModalEmail('');
        setModalError('');
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const camposFaltantes: string[] = [];
        if (!modalNombre.trim()) camposFaltantes.push('Nombre');
        if (!modalTelefono.trim()) camposFaltantes.push('Teléfono');

        if (camposFaltantes.length > 0) {
            const mensaje = camposFaltantes.length === 1
                ? `Falta completar el campo: ${camposFaltantes[0]}`
                : `Faltan completar los siguientes campos: ${camposFaltantes.join(', ')}`;
            setModalError(mensaje);
            return;
        }

        setModalError('');

        try {
            await apiClient.put(`/alumnos/${modalState.editingAlumno!.id}`, {
                nombre: modalNombre,
                telefono: modalTelefono,
                dni: modalDni || null,
                email: modalEmail || null
            });
            setSuccess('Alumno actualizado con éxito');
            fetchAlumnos();
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al actualizar el alumno';
            setModalError(errorMessage);
        }
    };

    const openConfirmModal = (alumno: Alumno) => {
        setConfirmModal({ isOpen: true, alumnoId: alumno.id, alumnoNombre: alumno.nombre });
    };

    const closeConfirm = () => {
        setConfirmModal({ isOpen: false, alumnoId: null, alumnoNombre: '' });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.alumnoId) {
            try {
                await apiClient.delete(`/alumnos/${confirmModal.alumnoId}`);
                setSuccess('Alumno eliminado con éxito');
                fetchAlumnos();
                closeConfirm();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError('Error al eliminar el alumno');
                closeConfirm();
            }
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Gestión de Alumnos</h1>
                <div className="loading-container">
                    <p>Cargando alumnos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Gestión de Alumnos</h1>

            {error && <div className="page-message error-message">{error}</div>}
            {success && <div className="page-message success-message">{success}</div>}

            <div className="form-and-list-container">
                <div className="form-section" id="alumno-add-form">
                    <h2>Agregar Nuevo Alumno</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="nombre-alumno">Nombre:</label>
                            <input 
                                id="nombre-alumno" 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Ej: Ana Gómez"
                                className={!nombre.trim() && error ? "field-error" : ""}
                            />
                            {!nombre.trim() && error && (
                                <span className="field-error-message">Ingrese el nombre del alumno</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono-alumno">Teléfono:</label>
                            <input 
                                id="telefono-alumno" 
                                type="tel" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)} 
                                placeholder="Ej: 912345678"
                                className={!telefono.trim() && error ? "field-error" : ""}
                            />
                            {!telefono.trim() && error && (
                                <span className="field-error-message">Ingrese el teléfono del alumno</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="dni-alumno">DNI (opcional):</label>
                            <input 
                                id="dni-alumno" 
                                type="text" 
                                value={dni} 
                                onChange={(e) => setDni(e.target.value)} 
                                placeholder="Ej: 71234565"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email-alumno">Correo (opcional):</label>
                            <input 
                                id="email-alumno" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="ana.gomez@email.com"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary" id="alumno-submit">
                                Crear Alumno
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="list-section" id="alumnos-list">
                    <h2>Lista de Alumnos</h2>
                    {alumnos.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table" id="alumnos-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Teléfono</th>
                                        <th>DNI</th>
                                        <th>Correo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnos.map(alumno => (
                                        <tr key={alumno.id}>
                                            <td>{alumno.id}</td>
                                            <td><strong>{alumno.nombre}</strong></td>
                                            <td>{alumno.telefono}</td>
                                            <td>{alumno.dni || '—'}</td>
                                            <td>{alumno.email || '—'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => openEditModal(alumno)}
                                                        title="Editar alumno"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => openConfirmModal(alumno)}
                                                        title="Eliminar alumno"
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
                        <p>No hay alumnos para mostrar.</p>
                    )}
                </div>
            </div>

            {modalState.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" id="alumno-edit-modal" role="dialog" aria-modal="true" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Alumno</h2>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleModalSubmit} className="modal-form" noValidate>
                            <div className="form-group">
                                <label htmlFor="modal-nombre-alumno">Nombre:</label>
                                <input 
                                    id="modal-nombre-alumno" 
                                    type="text" 
                                    value={modalNombre} 
                                    onChange={(e) => setModalNombre(e.target.value)} 
                                    placeholder="Ej: Ana Gómez"
                                    className={!modalNombre.trim() && modalError ? "field-error" : ""}
                                />
                                {!modalNombre.trim() && modalError && (
                                    <span className="field-error-message">Ingrese el nombre del alumno</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-telefono-alumno">Teléfono:</label>
                                <input 
                                    id="modal-telefono-alumno" 
                                    type="tel" 
                                    value={modalTelefono} 
                                    onChange={(e) => setModalTelefono(e.target.value)} 
                                    placeholder="Ej: +56 9 1234 5678"
                                    className={!modalTelefono.trim() && modalError ? "field-error" : ""}
                                />
                                {!modalTelefono.trim() && modalError && (
                                    <span className="field-error-message">Ingrese el teléfono del alumno</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-dni-alumno">DNI (opcional):</label>
                                <input 
                                    id="modal-dni-alumno" 
                                    type="text" 
                                    value={modalDni} 
                                    onChange={(e) => setModalDni(e.target.value)} 
                                    placeholder="Ej: 12.345.678-9"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-email-alumno">Correo (opcional):</label>
                                <input 
                                    id="modal-email-alumno" 
                                    type="email" 
                                    value={modalEmail} 
                                    onChange={(e) => setModalEmail(e.target.value)} 
                                    placeholder="ana.gomez@email.com"
                                />
                            </div>
                            
                            {modalError && <div className="modal-error">{modalError}</div>}
                            
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary" id="modal-alumno-submit">
                                    Actualizar Alumno
                                </button>
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmModal.isOpen && (
                <div className="confirm-modal-overlay" onClick={closeConfirm}>
                    <div className="confirm-modal-content"  id="alumno-confirm-modal"  onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-header">
                            <div className="confirm-modal-icon">⚠️</div>
                            <h3 className="confirm-modal-title">Confirmar Eliminación</h3>
                        </div>
                        <div className="confirm-modal-body">
                            <p className="confirm-modal-message">
                                ¿Estás seguro de que quieres eliminar al alumno <strong>"{confirmModal.alumnoNombre}"</strong>? 
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="confirm-modal-actions">
                            <button className="btn-danger" id="confirm-delete-alumno" onClick={handleConfirmDelete}>
                                Eliminar
                            </button>
                            <button className="btn-danger" id="cancel-delete-alumno" onClick={closeConfirm}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAlumnos;


