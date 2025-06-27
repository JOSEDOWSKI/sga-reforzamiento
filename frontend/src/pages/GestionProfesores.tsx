import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfesores();
    }, []);

    const fetchProfesores = async () => {
        try {
            const response = await apiClient.get('/profesores');
            setProfesores(response.data.data);
            setLoading(false);
        } catch (err: any) {
            setError('Error al cargar los profesores');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim()) {
            setError('El nombre y email son obligatorios');
            return;
        }

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
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar el profesor');
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
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Cargando profesores...</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card fade-in">
                <div className="card-header">
                    <h2 className="card-title">
                        {editingId ? '✏️ Editar Profesor' : '👨‍🏫 Gestión de Profesores'}
                    </h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Profesor:</label>
                        <input
                            type="text"
                            id="nombre"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Dr. Juan Pérez"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="juan.perez@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="especialidad">Especialidad (Opcional):</label>
                        <input
                            type="text"
                            id="especialidad"
                            className="form-control"
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            placeholder="Ej: Matemáticas, Física, etc."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editingId ? '🔄 Actualizar' : '➕ Crear'}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                ❌ Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card slide-up">
                <div className="card-header">
                    <h3 className="card-title">👨‍🏫 Lista de Profesores</h3>
                </div>

                <div className="table-container">
                    <table className="table">
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
                            {profesores.map((profesor) => (
                                <tr key={profesor.id}>
                                    <td>{profesor.id}</td>
                                    <td>
                                        <strong>{profesor.nombre}</strong>
                                    </td>
                                    <td>{profesor.email}</td>
                                    <td>{profesor.especialidad || 'Sin especialidad'}</td>
                                    <td>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleEdit(profesor)}
                                            style={{ marginRight: '0.5rem' }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(profesor.id)}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GestionProfesores; 