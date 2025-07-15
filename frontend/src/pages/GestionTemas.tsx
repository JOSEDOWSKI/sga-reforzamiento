import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos

interface Tema {
    id: number;
    nombre: string;
    curso_id: number;
}

interface Curso {
    id: number;
    nombre: string;
}

const GestionTemas: React.FC = () => {
    const [temas, setTemas] = useState<Tema[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [nombre, setNombre] = useState('');
    const [cursoId, setCursoId] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [temasResponse, cursosResponse] = await Promise.all([
                apiClient.get('/temas'),
                apiClient.get('/cursos')
            ]);
            
            setTemas(temasResponse.data.data);
            setCursos(cursosResponse.data.data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !cursoId) {
            setError('El nombre y curso son obligatorios');
            return;
        }

        setError('');
        setSuccess('');

        try {
            if (editingId) {
                await apiClient.put(`/temas/${editingId}`, { 
                    nombre, 
                    curso_id: parseInt(cursoId) 
                });
                setSuccess('Tema actualizado con éxito');
            } else {
                await apiClient.post('/temas', { 
                    nombre, 
                    curso_id: parseInt(cursoId) 
                });
                setSuccess('Tema creado con éxito');
            }
            
            setNombre('');
            setCursoId('');
            setEditingId(null);
            fetchData();
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al guardar el tema';
            setError(errorMessage);
        }
    };

    const handleEdit = (tema: Tema) => {
        setNombre(tema.nombre);
        setCursoId(tema.curso_id.toString());
        setEditingId(tema.id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este tema?')) {
            try {
                await apiClient.delete(`/temas/${id}`);
                setSuccess('Tema eliminado con éxito');
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err: any) {
                setError('Error al eliminar el tema');
            }
        }
    };

    const handleCancel = () => {
        setNombre('');
        setCursoId('');
        setEditingId(null);
        setError('');
        setSuccess('');
    };

    const getCursoNombre = (cursoId: number) => {
        const curso = cursos.find(c => c.id === cursoId);
        return curso ? curso.nombre : 'Curso no encontrado';
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Gestión de Temas</h1>
                <div className="loading-container">
                    <p>Cargando temas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1>Gestión de Temas</h1>
            
            {/* Mensajes de éxito y error */}
            {error && <div className="page-message error-message">{error}</div>}
            {success && <div className="page-message success-message">{success}</div>}
            
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>{editingId ? 'Editar Tema' : 'Agregar Nuevo Tema'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre-tema">Nombre del Tema:</label>
                            <input 
                                id="nombre-tema" 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Derivadas e Integrales"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="curso-tema">Curso:</label>
                            <select 
                                id="curso-tema" 
                                value={cursoId} 
                                onChange={(e) => setCursoId(e.target.value)}
                                required
                            >
                                <option value="">Selecciona un curso</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId ? '🔄 Actualizar' : '➕ Crear Tema'}
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
                    <h2>Lista de Temas</h2>
                    {temas.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Curso</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {temas.map(tema => (
                                        <tr key={tema.id}>
                                            <td>{tema.id}</td>
                                            <td><strong>{tema.nombre}</strong></td>
                                            <td>{getCursoNombre(tema.curso_id)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(tema)}
                                                        title="Editar tema"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(tema.id)}
                                                        title="Eliminar tema"
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
                        <p>No hay temas para mostrar.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionTemas; 