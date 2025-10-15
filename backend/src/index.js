const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // Cargar variables de entorno

// Importar middlewares
const corsMiddleware = require('./middleware/corsMiddleware');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const { defaultRateLimit } = require('./middleware/rateLimitMiddleware');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000;

// Trust proxy para obtener la IP real detrás de proxies (Nginx, Cloudflare)
app.set('trust proxy', true);

// Middleware para CORS (aplicar antes de cualquier otro para asegurar headers en errores)
app.use(corsMiddleware);

// Middleware de rate limiting (aplicar después de CORS para no romper preflights)
app.use(defaultRateLimit);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para detectar tenant (aplicar a todas las rutas de API)
app.use('/api', tenantMiddleware);

// Rutas de autenticación (no requieren autenticación previa)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de la API
const cursoRoutes = require('./routes/cursoRoutes');
app.use('/api/cursos', cursoRoutes);

const profesorRoutes = require('./routes/profesorRoutes');
app.use('/api/profesores', profesorRoutes);

const alumnoRoutes = require('./routes/alumnoRoutes');
app.use('/api/alumnos', alumnoRoutes);

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

// Configurar WebSocket
io.on('connection', (socket) => {
  console.log('🔌 WebSocket: Cliente conectado:', socket.id);
  
  // Unirse a una sala específica del tenant
  socket.on('join-tenant', (tenant) => {
    socket.join(tenant);
    console.log(`🏠 WebSocket: Cliente ${socket.id} se unió al tenant: ${tenant}`);
    console.log(`📊 WebSocket: Clientes en tenant ${tenant}:`, io.sockets.adapter.rooms.get(tenant)?.size || 0);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket: Cliente desconectado:', socket.id, 'razón:', reason);
  });
});

// Hacer io disponible globalmente para emitir eventos
app.set('io', io);

server.listen(port, () => {
  console.log(`🚀 AgendaTe SaaS API running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`🔌 WebSocket server running on ws://localhost:${port}`);
});
