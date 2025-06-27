import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

// Defino un tipo para los cursos para que TypeScript nos ayude
interface Curso {
    id: number;
    nombre: string;
    descripcion: string;
}

const GestionCursos: React.FC = () => {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Función para cargar los cursos desde el backend
    const fetchCursos = async () => {
        try {
            const response = await apiClient.get('/cursos');
            setCursos(response.data.data);
            setLoading(false);
        } catch (err: any) {
            setError('Error al cargar los cursos');
            setLoading(false);
        }
    };

    // useEffect se ejecuta cuando el componente se monta
    useEffect(() => {
        fetchCursos();
    }, []);

    // Función para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError('El nombre del curso es obligatorio');
            return;
        }

        try {
            if (editingId) {
                await apiClient.put(`/cursos/${editingId}`, { nombre, descripcion });
                setSuccess('Curso actualizado con éxito');
            } else {
                await apiClient.post('/cursos', { nombre, descripcion });
                setSuccess('Curso creado con éxito');
            }
            
            setNombre('');
            setDescripcion('');
            setEditingId(null);
            fetchCursos();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar el curso');
        }
    };

    const handleEdit = (curso: Curso) => {
        setNombre(curso.nombre);
        setDescripcion(curso.descripcion);
        setEditingId(curso.id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
            try {
                await apiClient.delete(`/cursos/${id}`);
                setSuccess('Curso eliminado con éxito');
                fetchCursos();
            } catch (err: any) {
                setError('Error al eliminar el curso');
            }
        }
    };

    const handleCancel = () => {
        setNombre('');
        setDescripcion('');
        setEditingId(null);
        setError('');
        setSuccess('');
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Cargando cursos...</h2>
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
                        {editingId ? '✏️ Editar Curso' : '📖 Gestión de Cursos'}
                    </h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Curso:</label>
                        <input
                            type="text"
                            id="nombre"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Matemáticas Avanzadas"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción (Opcional):</label>
                        <textarea
                            id="descripcion"
                            className="form-control"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción del curso..."
                            rows={3}
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
                    <h3 className="card-title">📚 Lista de Cursos</h3>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.map((curso) => (
                                <tr key={curso.id}>
                                    <td>{curso.id}</td>
                                    <td>
                                        <strong>{curso.nombre}</strong>
                                    </td>
                                    <td>{curso.descripcion || 'Sin descripción'}</td>
                                    <td>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleEdit(curso)}
                                            style={{ marginRight: '0.5rem' }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(curso.id)}
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

export default GestionCursos; 