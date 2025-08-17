const express = require('express');
require('dotenv').config(); // Cargar variables de entorno

// Importar middlewares
const corsMiddleware = require('./middleware/corsMiddleware');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const { defaultRateLimit } = require('./middleware/rateLimitMiddleware');

const app = express();
const port = process.env.PORT || 4000;

// Trust proxy para obtener la IP real detrás de proxies (Nginx, Cloudflare)
app.set('trust proxy', true);

// Middleware de rate limiting (aplicar antes que otros middlewares)
app.use(defaultRateLimit);

// Middleware para CORS
app.use(corsMiddleware);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para detectar tenant (aplicar a todas las rutas de API)
app.use('/api', tenantMiddleware);

// Rutas de la API
const cursoRoutes = require('./routes/cursoRoutes');
app.use('/api/cursos', cursoRoutes);

const profesorRoutes = require('./routes/profesorRoutes');
app.use('/api/profesores', profesorRoutes);

const reservaRoutes = require('./routes/reservaRoutes');
app.use('/api/reservas', reservaRoutes);

const temaDirectRoutes = require('./routes/temaDirectRoutes');
app.use('/api/temas', temaDirectRoutes);

// Rutas de administración del sistema SaaS
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Ruta de salud del sistema
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'AgendaTe SaaS API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.message === 'Not allowed by CORS policy') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const { closeAllConnections } = require('./config/tenantDatabase');
  await closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  const { closeAllConnections } = require('./config/tenantDatabase');
  await closeAllConnections();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 AgendaTe SaaS API running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});
