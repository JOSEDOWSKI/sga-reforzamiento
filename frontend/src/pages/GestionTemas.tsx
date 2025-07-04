import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

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
      const [temasResponse, cursosResponse] = await Promise.all([
        apiClient.get('/temas'),
        apiClient.get('/cursos')
      ]);
      
      setTemas(temasResponse.data.data);
      setCursos(cursosResponse.data.data);
      setLoading(false);
    } catch (err: any) {
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cursoId) {
      setError('El nombre y curso son obligatorios');
      return;
    }

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar el tema');
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
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Cargando temas...</h2>
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
            {editingId ? '✏️ Editar Tema' : '📝 Gestión de Temas'}
          </h2>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Tema:</label>
            <input
              type="text"
              id="nombre"
              className="form-control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Derivadas e Integrales"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              className="form-control"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              required
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
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
          <h3 className="card-title">📝 Lista de Temas</h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Curso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {temas.map((tema) => (
                <tr key={tema.id}>
                  <td>{tema.id}</td>
                  <td>
                    <strong>{tema.nombre}</strong>
                  </td>
                  <td>{getCursoNombre(tema.curso_id)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(tema)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(tema.id)}
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

export default GestionTemas; 