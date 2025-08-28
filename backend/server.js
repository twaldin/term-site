const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const SecureSessionManager = require('./session');

const app = express();
const server = http.createServer(app);

// Enable trust proxy for Cloud Run (required for rate limiting)
app.set('trust proxy', true);

// Security middleware - helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // For terminal
      connectSrc: ["'self'", "wss:", "ws:"],
      imgSrc: ["'self'", "data:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 sessions per IP
  message: 'Too many sessions from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/health', limiter);
app.use('/stats', limiter);

// Stricter rate limiting for connections
const connectionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 connection attempts per IP
  message: 'Too many connection attempts, please try again later',
});

// Configure CORS for Express
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://term-site-eed0kfe1k-twaldin.vercel.app',
        'https://term-site-eed0kfe1k-twaldin.vercel.app',
        'https://term-site.vercel.app'
      ]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Configure Socket.IO with CORS and rate limiting
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://www.twald.in',
          'https://twald.in',
          process.env.FRONTEND_URL || 'https://term-site-eed0kfe1k-twaldin.vercel.app',
          'https://term-site-eed0kfe1k-twaldin.vercel.app',
          'https://term-site.vercel.app'
        ]
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'], // Prioritize polling for Cloud Run
  pingTimeout: 60000, // 60 seconds ping timeout
  pingInterval: 25000, // 25 seconds between pings
  upgradeTimeout: 30000, // 30 seconds to upgrade transport
  maxHttpBufferSize: 1e6, // 1MB max buffer
  allowEIO3: true, // Allow older Engine.IO versions for compatibility
});

// Initialize secure session manager (no Docker needed)
const sessionManager = new SecureSessionManager();

// Start periodic cleanup
sessionManager.startPeriodicCleanup();

// Track connection attempts per IP
const connectionAttempts = new Map();

// Socket.IO connection handling with security
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  console.log(`Secure client connected: ${socket.id} from IP: ${clientIP}`);

  // Track connection attempts for additional security
  const attempts = connectionAttempts.get(clientIP) || 0;
  if (attempts > 5) {
    console.warn(`Too many connections from IP: ${clientIP}`);
    socket.emit('error', 'Too many connection attempts');
    socket.disconnect();
    return;
  }
  connectionAttempts.set(clientIP, attempts + 1);

  // Clear connection attempt after 5 minutes
  setTimeout(() => {
    const currentAttempts = connectionAttempts.get(clientIP) || 0;
    if (currentAttempts > 0) {
      connectionAttempts.set(clientIP, currentAttempts - 1);
    }
  }, 5 * 60 * 1000);

  // Create secure session (no Docker containers)
  sessionManager.createSession(socket.id, socket)
    .then(() => {
      console.log(`Secure session created for ${socket.id}`);
    })
    .catch((error) => {
      console.error(`Failed to create secure session for ${socket.id}:`, error);
      socket.emit('error', 'Failed to create secure terminal session');
      socket.disconnect();
    });

  // Handle terminal input with basic validation
  socket.on('input', (data) => {
    // Basic input validation
    if (typeof data !== 'string' || data.length > 1000) {
      console.warn(`Invalid input from ${socket.id}: ${typeof data}, length: ${data?.length}`);
      return;
    }
    sessionManager.sendInput(socket.id, data);
  });

  // Handle terminal resize with validation
  socket.on('resize', (dimensions) => {
    if (!dimensions || 
        typeof dimensions.cols !== 'number' || 
        typeof dimensions.rows !== 'number' ||
        dimensions.cols < 1 || dimensions.cols > 500 ||
        dimensions.rows < 1 || dimensions.rows > 200) {
      console.warn(`Invalid resize from ${socket.id}:`, dimensions);
      return;
    }
    sessionManager.resizeTerminal(socket.id, dimensions.cols, dimensions.rows);
  });

  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Secure client disconnected: ${socket.id}, reason: ${reason}`);
    sessionManager.destroySession(socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
    sessionManager.destroySession(socket.id);
  });

  // Note: Socket.IO handles timeouts differently than raw sockets
  // Session timeout is handled by SecureSessionManager instead
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: sessionManager.getActiveSessionCount(),
    mode: 'secure',
    version: '2.0.0-secure'
  });
});

// Get session statistics (with rate limiting)
app.get('/stats', (req, res) => {
  res.json({
    activeSessions: sessionManager.getActiveSessionCount(),
    totalContainers: 0, // No containers in secure mode
    uptime: process.uptime(),
    mode: 'secure-cloud-run',
    memory: process.memoryUsage(),
    nodeVersion: process.version
  });
});

// Security info endpoint
app.get('/security', (req, res) => {
  res.json({
    mode: 'secure',
    isolation: 'gvisor',
    dockerAccess: false,
    maxSessions: sessionManager.maxSessions,
    sessionTimeout: sessionManager.sessionTimeout / 1000 / 60 + ' minutes',
    rateLimit: 'enabled'
  });
});

// Start server  
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Secure terminal backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Security: gVisor isolation enabled');
  console.log('Docker access: DISABLED');
  console.log('Mode: SECURE');
});

// Track shutdown state to prevent multiple shutdown attempts
let isShuttingDown = false;

// Graceful shutdown function
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log(`Already shutting down, ignoring ${signal}`);
    return;
  }
  
  isShuttingDown = true;
  console.log(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close all secure sessions
    await sessionManager.destroyAllSessions();
    
    // Close server
    server.close(() => {
      console.log('Secure server closed');
      process.exit(0);
    });
    
    // Force exit after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      console.log('Force exiting...');
      process.exit(1);
    }, 5000);
    
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});