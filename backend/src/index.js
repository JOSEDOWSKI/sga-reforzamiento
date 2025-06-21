const express = require('express');
const cors = require('cors');
require('./config/database'); // Conecta a la BD e inicializa las tablas si es necesario

const app = express();
const port = process.env.PORT || 3001;

// Middleware para CORS
// Esto permitirá peticiones desde cualquier origen. Para producción, deberías restringirlo.
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Rutas de la API
const cursoRoutes = require('./routes/cursoRoutes');
app.use('/api/cursos', cursoRoutes);

const profesorRoutes = require('./routes/profesorRoutes');
app.use('/api/profesores', profesorRoutes);

const reservaRoutes = require('./routes/reservaRoutes');
app.use('/api/reservas', reservaRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
