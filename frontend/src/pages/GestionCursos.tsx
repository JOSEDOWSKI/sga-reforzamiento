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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Función para cargar los cursos desde el backend
    const fetchCursos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/cursos');
            setCursos(response.data.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los cursos.');
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
        try {
            const response = await apiClient.post('/cursos', { nombre, descripcion });
            setCursos([...cursos, response.data.data]);
            setNombre('');
            setDescripcion('');
            setError('');
        } catch (err) {
            setError('No se pudo crear el curso.');
        }
    };

    return (
        <div className="page-container">
            <h1>Gestión de Cursos</h1>
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Curso</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Nombre:</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div>
                            <label>Descripción:</label>
                            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                        </div>
                        <button type="submit">Agregar Curso</button>
                    </form>
                </div>
                <div className="list-section">
                    <h2>Lista de Cursos</h2>
                    {loading && <p>Cargando...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <ul>
                        {cursos.map(curso => (
                            <li key={curso.id}>
                                <strong>{curso.nombre}</strong>: {curso.descripcion}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GestionCursos; 