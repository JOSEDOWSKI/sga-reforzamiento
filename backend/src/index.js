const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // Cargar variables de entorno

// Importar middlewares
const corsMiddleware = require('./middleware/corsMiddleware');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const devModeMiddleware = require('./middleware/devModeMiddleware');
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

// Handler explícito para OPTIONS requests (CORS preflight) - DEBE estar antes de tenantMiddleware
// Manejar OPTIONS para todas las rutas, especialmente /api/*
app.options('*', (req, res) => {
    const origin = req.headers.origin;
    
    // Verificar si el origin está permitido (misma lógica que corsMiddleware)
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
    let isAllowed = false;
    
    if (process.env.NODE_ENV === 'production') {
        if (origin && (origin.includes('.weekly.pe') || origin === 'https://weekly.pe' || origin === 'http://weekly.pe')) {
            isAllowed = true;
        }
        if (origin && (origin.includes('.getdevtools.com') || origin.includes('getdevtools.com'))) {
            isAllowed = true;
        }
    }
    
    if (!isAllowed && origin) {
        isAllowed = allowedOrigins.some(allowedOrigin => {
            if (!allowedOrigin) return false;
            if (allowedOrigin.startsWith('*.')) {
                const domain = allowedOrigin.substring(2);
                return origin.endsWith(domain);
            }
            return origin === allowedOrigin;
        });
    }
    
    // Si no hay origin o está permitido, responder con headers CORS
    if (!origin || isAllowed || process.env.NODE_ENV === 'development') {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // Cache preflight por 24 horas
        return res.sendStatus(200);
    }
    
    // Si no está permitido, rechazar
    res.status(403).json({ error: 'CORS policy violation' });
});

// Middleware de rate limiting (aplicar después de CORS para no romper preflights)
app.use(defaultRateLimit);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para TOON (Token-Oriented Object Notation)
const { toonParser, toonResponse } = require('./middleware/toonMiddleware');
app.use(toonParser);
app.use(toonResponse);

// Agregar helper res.toon() a todas las respuestas
app.use((req, res, next) => {
    res.toon = function(data) {
        this.setHeader('Content-Type', 'application/toon; charset=utf-8');
        const ToonParser = require('./utils/toonParser');
        const toonData = ToonParser.stringify(data);
        return this.send(toonData);
    };
    next();
});

// Middleware para detectar tenant (aplicar a todas las rutas de API)
// En modo desarrollo, usar devModeMiddleware si hay problemas con la base de datos
if (process.env.NODE_ENV === 'development' && process.env.USE_DEV_MODE === 'true') {
  console.log('🔧 Usando modo de desarrollo (sin base de datos)');
  app.use('/api', devModeMiddleware);
} else {
  app.use('/api', tenantMiddleware);
}

// Rutas de autenticación (no requieren autenticación previa)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de autenticación global (super admin)
const globalAuthRoutes = require('./routes/globalAuthRoutes');
app.use('/api/global-auth', globalAuthRoutes);

// Rutas públicas (calendario público, sin autenticación)
const publicRoutes = require('./routes/publicRoutes');
app.use('/api/public', publicRoutes);

// Robots.txt dinámico (debe estar antes de otras rutas para que funcione correctamente)
const robotsController = require('./controllers/robotsController');
app.get('/robots.txt', robotsController.getRobots.bind(robotsController));

// Rutas DEMO (acceso público solo lectura para demo.weekly.pe)
const demoRoutes = require('./routes/demoRoutes');
app.use('/api/demo', demoRoutes);

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
app.use('/api/categorias', temaDirectRoutes); // Alias para compatibilidad

// Nuevas rutas para WEEKLY
const establecimientoRoutes = require('./routes/establecimientoRoutes');
app.use('/api/establecimientos', establecimientoRoutes);
app.use('/api/servicios', establecimientoRoutes); // Alias para compatibilidad

const colaboradorRoutes = require('./routes/colaboradorRoutes');
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/staff', colaboradorRoutes); // Alias para compatibilidad

const clienteRoutes = require('./routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

const horarioRoutes = require('./routes/horarioRoutes');
app.use('/api/horarios', horarioRoutes);

// Rutas de administración del sistema SaaS
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Rutas de super administración (panel global)
const tenantRoutes = require('./routes/tenantRoutes');
app.use('/api/super-admin/tenants', tenantRoutes);

// Rutas de configuración de tenant
const tenantConfigRoutes = require('./routes/tenantConfigRoutes');
app.use('/api/tenants', tenantConfigRoutes);

// Rutas de autenticación móvil
const mobileAuthRoutes = require('./routes/mobileAuthRoutes');
app.use('/api/auth/mobile', mobileAuthRoutes);

// Rutas de discovery de tenants (para app móvil)
const tenantDiscoveryRoutes = require('./routes/tenantDiscoveryRoutes');
app.use('/api/public', tenantDiscoveryRoutes);

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
