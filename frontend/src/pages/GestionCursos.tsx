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
        setError(''); // Limpiar errores previos

        try {
            const response = await apiClient.post('/cursos', { nombre, descripcion });
            // Usar la función de fetch para asegurar que la lista está sincronizada
            fetchCursos(); 
            setNombre('');
            setDescripcion('');
        } catch (err: any) {
            console.error("Error al crear curso:", err); // Log completo en consola
            // Extraer y mostrar el mensaje de error del backend si existe
            const errorMessage = err.response?.data?.error || 'No se pudo crear el curso. Revisa la consola para más detalles.';
            setError(errorMessage);
        }
    };

    return (
        <div className="page-container">
            <h1>Gestión de Cursos</h1>
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Curso</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre-curso">Nombre:</label>
                            <input id="nombre-curso" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion-curso">Descripción:</label>
                            <input id="descripcion-curso" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                        </div>
                        <button type="submit">Agregar Curso</button>
                    </form>
                    {error && <p className="page-message">{error}</p>}
                </div>
                <div className="list-section">
                    <h2>Lista de Cursos</h2>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <ul>
                            {cursos.length > 0 ? cursos.map(curso => (
                                <li key={curso.id}>
                                    <strong>{curso.nombre}</strong>: {curso.descripcion}
                                </li>
                            )) : <p>No hay cursos para mostrar.</p>}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionCursos; 