import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css'; // Importar los estilos compartidos

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

    const fetchTemasByCurso = (cursoId: string) => {
        if (cursoId) {
            setLoading(true);
            apiClient.get(`/cursos/${cursoId}/temas`)
                .then(res => setTemas(res.data.data))
                .catch(() => setError('Error al cargar temas.'))
                .finally(() => setLoading(false));
        } else {
            setTemas([]);
        }
    }

    useEffect(() => {
        fetchTemasByCurso(selectedCurso);
    }, [selectedCurso]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCurso) {
            setError('Debes seleccionar un curso primero.');
            return;
        }
        setError(''); // Limpiar error
        
        try {
            await apiClient.post(`/cursos/${selectedCurso}/temas`, { nombre: nombreTema });
            // Recargar temas para el curso seleccionado
            fetchTemasByCurso(selectedCurso);
            setNombreTema('');
        } catch (err: any) {
            console.error("Error al crear tema:", err);
            const errorMessage = err.response?.data?.error || 'No se pudo crear el tema. Revisa la consola.';
            setError(errorMessage);
        }
    };

    return (
        <div className="page-container">
            <h1>Gestión de Temas por Curso</h1>
            
            <div className="form-section" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
                <div className="form-group">
                    <label htmlFor="curso-select">Selecciona un curso para ver/agregar temas:</label>
                    <select id="curso-select" value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)}>
                        <option value="">-- Cursos --</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>

            {error && !selectedCurso && <p className="page-message">{error}</p>}

            {selectedCurso && (
                <div className="form-and-list-container">
                    <div className="form-section">
                        <h2>Agregar Tema para "{cursos.find(c => c.id === parseInt(selectedCurso))?.nombre}"</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="tema-nombre">Nombre del Tema:</label>
                                <input id="tema-nombre" type="text" value={nombreTema} onChange={(e) => setNombreTema(e.target.value)} required />
                            </div>
                            <button type="submit">Agregar Tema</button>
                        </form>
                    </div>
                    <div className="list-section">
                        <h2>Lista de Temas</h2>
                        {loading ? (
                            <p>Cargando...</p>
                        ) : (
                            <ul>
                                {temas.length > 0 ? temas.map(t => (
                                    <li key={t.id}>{t.nombre}</li>
                                )) : <p>Este curso aún no tiene temas.</p>}
                            </ul>
                        )}
                        {error && <p className="page-message">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTemas; 