// Este script es para poblar la base de datos con datos de ejemplo.
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sga_reforzamiento',
    password: 'postgres',
    port: 5432,
});

const cursos = [
    { nombre: 'Cálculo I', descripcion: 'Curso introductorio de cálculo diferencial.' },
    { nombre: 'Física General', descripcion: 'Principios de mecánica clásica y termodinámica.' },
    { nombre: 'Química Orgánica', descripcion: 'Estudio de los compuestos basados en carbono.' },
    { nombre: 'Álgebra Lineal', descripcion: 'Vectores, matrices y espacios vectoriales.' },
];

const profesores = [
    { nombre: 'Dr. Alan Turing', email: 'alan.turing@example.com' },
    { nombre: 'Dra. Ada Lovelace', email: 'ada.lovelace@example.com' },
    { nombre: 'Dr. Isaac Newton', email: 'isaac.newton@example.com' },
    { nombre: 'Dra. Marie Curie', email: 'marie.curie@example.com' },
];

const temas = {
    'Cálculo I': ['Límites y Continuidad', 'Derivadas', 'Aplicaciones de la Derivada', 'Integrales Indefinidas'],
    'Física General': ['Cinemática', 'Leyes de Newton', 'Trabajo y Energía', 'Termodinámica Básica'],
    'Química Orgánica': ['Alcanos y Cicloalcanos', 'Alquenos y Alquinos', 'Compuestos Aromáticos', 'Alcoholes y Éteres'],
    'Álgebra Lineal': ['Sistemas de Ecuaciones Lineales', 'Matrices y Determinantes', 'Espacios Vectoriales', 'Valores y Vectores Propios'],
};

const seed = async () => {
    try {
        console.log('Iniciando el proceso de seeding...');
        const client = await pool.connect();

        // Limpiar tablas para evitar duplicados
        await client.query('TRUNCATE TABLE temas, profesores, cursos, reservas RESTART IDENTITY CASCADE;');
        console.log('Tablas limpiadas.');

        // Insertar Cursos y guardar sus IDs
        const cursosInsertados = [];
        for (const curso of cursos) {
            const res = await client.query('INSERT INTO cursos (nombre, descripcion) VALUES ($1, $2) RETURNING id, nombre', [curso.nombre, curso.descripcion]);
            cursosInsertados.push(res.rows[0]);
        }
        console.log('Cursos insertados.');

        // Insertar Profesores
        for (const prof of profesores) {
            await client.query('INSERT INTO profesores (nombre, email) VALUES ($1, $2)', [prof.nombre, prof.email]);
        }
        console.log('Profesores insertados.');

        // Insertar Temas
        for (const cursoInsertado of cursosInsertados) {
            const temasDelCurso = temas[cursoInsertado.nombre];
            if (temasDelCurso) {
                for (const temaNombre of temasDelCurso) {
                    await client.query('INSERT INTO temas (nombre, curso_id) VALUES ($1, $2)', [temaNombre, cursoInsertado.id]);
                }
            }
        }
        console.log('Temas insertados.');

        console.log('¡Seeding completado exitosamente!');
        client.release();
    } catch (err) {
        console.error('Error durante el seeding:', err);
    } finally {
        await pool.end();
    }
};

seed(); 