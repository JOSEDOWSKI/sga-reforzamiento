import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

interface Curso { id: number; nombre: string; }
interface Tema { id: number; nombre: string; }

const GestionTemas: React.FC = () => {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [temas, setTemas] = useState<Tema[]>([]);
    const [nombreTema, setNombreTema] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiClient.get('/cursos')
            .then(res => setCursos(res.data.data))
            .catch(() => setError('No se pudieron cargar los cursos.'));
    }, []);

    useEffect(() => {
        if (selectedCurso) {
            setLoading(true);
            apiClient.get(`/cursos/${selectedCurso}/temas`)
                .then(res => setTemas(res.data.data))
                .catch(() => setError('Error al cargar temas.'))
                .finally(() => setLoading(false));
        } else {
            setTemas([]);
        }
    }, [selectedCurso]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCurso) {
            setError('Debes seleccionar un curso primero.');
            return;
        }
        try {
            const response = await apiClient.post(`/cursos/${selectedCurso}/temas`, { nombre: nombreTema });
            setTemas([...temas, response.data.data]);
            setNombreTema('');
            setError('');
        } catch (err) {
            setError('No se pudo crear el tema.');
        }
    };

    return (
        <div className="page-container">
            <h1>Gestión de Temas por Curso</h1>
            <label>Selecciona un curso para ver sus temas:</label>
            <select value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)}>
                <option value="">-- Cursos --</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <hr style={{ margin: '2rem 0' }} />

            {selectedCurso && (
                <div className="form-and-list-container">
                    <div className="form-section">
                        <h2>Agregar Nuevo Tema para "{cursos.find(c => c.id === parseInt(selectedCurso))?.nombre}"</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Nombre del Tema:</label>
                                <input type="text" value={nombreTema} onChange={(e) => setNombreTema(e.target.value)} required />
                            </div>
                            <button type="submit">Agregar Tema</button>
                        </form>
                    </div>
                    <div className="list-section">
                        <h2>Lista de Temas</h2>
                        {loading && <p>Cargando...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <ul>
                            {temas.map(t => (
                                <li key={t.id}>
                                    {t.nombre}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTemas; 