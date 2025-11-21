// Script de diagnóstico al inicio
console.log('🚀 Iniciando Weekly Backend...');
console.log('📋 Variables de entorno críticas:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'no definido');
console.log('   PORT:', process.env.PORT || 'no definido (usará 4000)');
console.log('   DB_HOST:', process.env.DB_HOST || 'no definido');
console.log('   DB_NAME:', process.env.DB_NAME || 'no definido');
console.log('   DB_USER:', process.env.DB_USER || 'no definido');

// Envolver todo en try-catch para capturar errores de inicio
try {
  console.log('📦 Paso 1: Cargando dotenv...');
  require('dotenv').config(); // Cargar variables de entorno
  
  console.log('📦 Paso 2: Importando express...');
  const express = require('express');
  
  console.log('📦 Paso 3: Importando http...');
  const { createServer } = require('http');
  
  console.log('📦 Paso 4: Importando socket.io...');
  const { Server } = require('socket.io');
  
  console.log('📦 Paso 5: Importando middlewares...');

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
    
    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV === 'development') {
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            isAllowed = true;
        }
    }
    
    // En producción, permitir automáticamente dominios weekly.pe y getdevtools.com
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined || !process.env.NODE_ENV) {
        // Normalizar origin para comparación (sin protocolo)
        const originHost = origin ? origin.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
        
        // Permitir todos los subdominios de weekly.pe
        if (originHost && (
            originHost === 'weekly.pe' ||
            originHost.endsWith('.weekly.pe') ||
            originHost.includes('weekly.pe')
        )) {
            isAllowed = true;
        }
        // Permitir dominios getdevtools.com
        if (originHost && (originHost.includes('.getdevtools.com') || originHost.includes('getdevtools.com'))) {
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

  console.log('📦 Paso 10: Configurando rutas públicas...');
  // Rutas públicas (calendario público, sin autenticación)
  // IMPORTANTE: Estas rutas NO pasan por tenantMiddleware, son completamente públicas
  // Deben estar ANTES del tenantMiddleware para evitar conflictos
  const publicRoutes = require('./routes/publicRoutes');
  app.use('/api/public', publicRoutes);
  console.log('   ✅ Rutas públicas configuradas');

  console.log('📦 Paso 11: Configurando middleware de tenant...');
  // Middleware para detectar tenant (aplicar a todas las rutas de API EXCEPTO /api/public)
  // En modo desarrollo, usar devModeMiddleware si hay problemas con la base de datos
  if (process.env.NODE_ENV === 'development' && process.env.USE_DEV_MODE === 'true') {
    console.log('🔧 Usando modo de desarrollo (sin base de datos)');
    app.use('/api', devModeMiddleware);
  } else {
    app.use('/api', tenantMiddleware);
  }
  console.log('   ✅ Middleware de tenant configurado');

  console.log('📦 Paso 12: Configurando rutas de autenticación...');
  // Rutas de autenticación (no requieren autenticación previa)
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  
  // Rutas de autenticación global (super admin)
  const globalAuthRoutes = require('./routes/globalAuthRoutes');
  app.use('/api/global-auth', globalAuthRoutes);
  console.log('   ✅ Rutas de autenticación configuradas');

  console.log('📦 Paso 13: Configurando rutas adicionales...');
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

  const inmuebleRoutes = require('./routes/inmuebleRoutes');
  app.use('/api/inmuebles', inmuebleRoutes);

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
  console.log('   ✅ Todas las rutas configuradas');

  // Rutas de discovery de tenants (para app móvil)
  // NOTA: Estas rutas pueden sobrescribir rutas de publicRoutes si tienen el mismo path
  // Por ahora, comentamos esto para evitar conflictos con /api/public/tenants
  // const tenantDiscoveryRoutes = require('./routes/tenantDiscoveryRoutes');
  // app.use('/api/public', tenantDiscoveryRoutes);

  console.log('📦 Paso 14: Configurando rutas de salud y manejo de errores...');
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

  console.log('📦 Paso 15: Configurando handlers de señales...');
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

  console.log('📦 Paso 16: Configurando WebSocket...');
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
  console.log('   ✅ WebSocket configurado');

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  // En producción, no cerrar el proceso inmediatamente, solo loguear
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // En producción, no cerrar el proceso inmediatamente, solo loguear
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

  console.log('📦 Paso Final: Iniciando servidor...');
  // Iniciar servidor con manejo de errores
  server.listen(port, () => {
    console.log(`🚀 AgendaTe SaaS API running on port ${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${port}/health`);
    console.log(`🔌 WebSocket server running on ws://localhost:${port}`);
    console.log('✅ Backend iniciado correctamente');
  }).on('error', (error) => {
    console.error('❌ ERROR starting server:', error);
    console.error('Error stack:', error.stack);
    if (error.code === 'EADDRINUSE') {
      console.error(`⚠️  Port ${port} is already in use`);
    }
    process.exit(1);
  });

} catch (error) {
  console.error('❌❌❌ ERROR CRÍTICO AL INICIAR BACKEND ❌❌❌');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Error name:', error.name);
  if (error.code) {
    console.error('Error code:', error.code);
  }
  console.error('❌ El backend no pudo iniciar. Revisa los logs anteriores.');
  // Forzar salida con código de error para que supervisor lo detecte
  process.exit(1);
}
