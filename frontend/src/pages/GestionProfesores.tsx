import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos

interface Profesor {
    id: number;
    nombre: string;
    email: string;
}

const GestionProfesores: React.FC = () => {
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchProfesores = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/profesores');
            setProfesores(response.data.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los profesores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfesores();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos

        try {
            await apiClient.post('/profesores', { nombre, email });
            // Recargar la lista para asegurar consistencia
            fetchProfesores();
            setNombre('');
            setEmail('');
        } catch (err: any) {
            console.error("Error al crear profesor:", err);
            const errorMessage = err.response?.data?.error || 'No se pudo crear el profesor. Revisa la consola.';
            setError(errorMessage);
        }
    };

    return (
        <div className="page-container">
            <h1>Gestión de Profesores</h1>
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Profesor</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre-profesor">Nombre:</label>
                            <input id="nombre-profesor" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email-profesor">Email:</label>
                            <input id="email-profesor" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit">Agregar Profesor</button>
                    </form>
                    {error && <p className="page-message">{error}</p>}
                </div>
                <div className="list-section">
                    <h2>Lista de Profesores</h2>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <ul>
                            {profesores.length > 0 ? profesores.map(p => (
                                <li key={p.id}>
                                    <strong>{p.nombre}</strong> ({p.email})
                                </li>
                            )) : <p>No hay profesores para mostrar.</p>}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionProfesores; 