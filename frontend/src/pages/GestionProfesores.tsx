import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

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
        try {
            const response = await apiClient.post('/profesores', { nombre, email });
            setProfesores([...profesores, response.data.data]);
            setNombre('');
            setEmail('');
            setError('');
        } catch (err) {
            setError('No se pudo crear el profesor.');
        }
    };

    return (
        <div className="page-container">
            <h1>Gestión de Profesores</h1>
            <div className="form-and-list-container">
                <div className="form-section">
                    <h2>Agregar Nuevo Profesor</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Nombre:</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit">Agregar Profesor</button>
                    </form>
                </div>
                <div className="list-section">
                    <h2>Lista de Profesores</h2>
                    {loading && <p>Cargando...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <ul>
                        {profesores.map(p => (
                            <li key={p.id}>
                                <strong>{p.nombre}</strong> ({p.email})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GestionProfesores; 