import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos

interface Profesor {
    id: number;
    nombre: string;
    email: string;
    especialidad: string;
}

const GestionProfesores: React.FC = () => {
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim()) {
            setError('El nombre y email son obligatorios');
            return;
        }

        setError('');
        setSuccess('');

        try {
            if (editingId) {
                await apiClient.put(`/profesores/${editingId}`, { nombre, email, especialidad });
                setSuccess('Profesor actualizado con éxito');
            } else {
                await apiClient.post('/profesores', { nombre, email, especialidad });
                setSuccess('Profesor creado con éxito');
            }
            
            setNombre('');
            setEmail('');
            setEspecialidad('');
            setEditingId(null);
            fetchProfesores();
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al guardar el profesor';
            setError(errorMessage);
        }
    };

    const handleEdit = (profesor: Profesor) => {
        setNombre(profesor.nombre);
        setEmail(profesor.email);
        setEspecialidad(profesor.especialidad);
        setEditingId(profesor.id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
            try {
                await apiClient.delete(`/profesores/${id}`);
                setSuccess('Profesor eliminado con éxito');
                fetchProfesores();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError('Error al eliminar el profesor');
            }
        }
    };

    const handleCancel = () => {
        setNombre('');
        setEmail('');
        setEspecialidad('');
        setEditingId(null);
        setError('');
        setSuccess('');
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
                    <h2>{editingId ? 'Editar Profesor' : 'Agregar Nuevo Profesor'}</h2>
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
                                {editingId ? '🔄 Actualizar' : '➕ Crear Profesor'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={handleCancel}>
                                    ❌ Cancelar
                                </button>
                            )}
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
                                                        onClick={() => handleEdit(profesor)}
                                                        title="Editar profesor"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(profesor.id)}
                                                        title="Eliminar profesor"
                                                    >
                                                        🗑️ Eliminar
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
        </div>
    );
};

export default GestionProfesores; 