import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos

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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    // Función para cargar los cursos desde el backend
    const fetchCursos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/cursos');
            setCursos(response.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los cursos');
        } finally {
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

        setError('');
        setSuccess('');

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
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al guardar el curso';
            setError(errorMessage);
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
                setTimeout(() => setSuccess(''), 3000);
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
            <div className="page-container">
                <h1>Gestión de Cursos</h1>
                <div className="loading-container">
                    <p>Cargando cursos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Gestión de Cursos</h1>
            
            {/* Mensajes de éxito y error */}
            {error && <div className="page-message error-message">{error}</div>}
            {success && <div className="page-message success-message">{success}</div>}
            
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>{editingId ? 'Editar Curso' : 'Agregar Nuevo Curso'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre-curso">Nombre:</label>
                            <input 
                                id="nombre-curso" 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Ej: Matemáticas Avanzadas"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion-curso">Descripción:</label>
                            <textarea 
                                id="descripcion-curso" 
                                value={descripcion} 
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del curso..."
                                rows={3}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId ? '🔄 Actualizar' : '➕ Crear Curso'}
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
                    <h2>Lista de Cursos</h2>
                    {cursos.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cursos.map(curso => (
                                        <tr key={curso.id}>
                                            <td>{curso.id}</td>
                                            <td><strong>{curso.nombre}</strong></td>
                                            <td>{curso.descripcion || 'Sin descripción'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(curso)}
                                                        title="Editar curso"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(curso.id)}
                                                        title="Eliminar curso"
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
                        <p>No hay cursos para mostrar.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionCursos; 