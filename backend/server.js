const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const SessionManager = require('./session');

const app = express();
const server = http.createServer(app);

// Production CORS origins
const PROD_ORIGINS = [
  'https://twald.in',
  'https://terminal.twald.in',
  'https://tim.waldin.net'
];

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

const allowedOrigins = process.env.NODE_ENV === 'production' ? PROD_ORIGINS : DEV_ORIGINS;

// Configure CORS for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket']
});

// Initialize session manager
const sessionManager = new SessionManager();

// Per-IP rate limiting for connections
const connectionTracker = new Map();
const MAX_CONNECTIONS_PER_IP = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  if (!connectionTracker.has(ip)) {
    connectionTracker.set(ip, []);
  }
  const timestamps = connectionTracker.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
  connectionTracker.set(ip, timestamps);

  if (timestamps.length >= MAX_CONNECTIONS_PER_IP) {
    return false;
  }
  timestamps.push(now);
  return true;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  const clientIP = socket.handshake.headers['x-real-ip'] || socket.handshake.address;
  console.log(`Client connected: ${socket.id} from ${clientIP}`);

  // Rate limit check
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for ${clientIP}`);
    socket.emit('error', 'Too many connections. Please wait a minute.');
    socket.disconnect();
    return;
  }

  // Create new terminal session
  sessionManager.createSession(socket.id, socket)
    .then(() => {
      console.log(`Session created for ${socket.id}`);
    })
    .catch((error) => {
      console.error(`Failed to create session for ${socket.id}:`, error);
      socket.emit('error', 'Failed to create terminal session');
      socket.disconnect();
    });

  // Handle terminal input with validation
  socket.on('input', (data) => {
    if (typeof data !== 'string' || data.length > 1024) {
      return;
    }
    sessionManager.sendInput(socket.id, data);
  });

  // Handle terminal resize with bounds checking
  socket.on('resize', ({ cols, rows }) => {
    const safeCols = Math.min(Math.max(Math.floor(cols) || 80, 10), 500);
    const safeRows = Math.min(Math.max(Math.floor(rows) || 24, 2), 200);
    sessionManager.resizeTerminal(socket.id, safeCols, safeRows);
  });

  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    sessionManager.destroySession(socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
    sessionManager.destroySession(socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: sessionManager.getActiveSessionCount()
  });
});

// Get session statistics
app.get('/stats', (req, res) => {
  res.json({
    activeSessions: sessionManager.getActiveSessionCount(),
    totalContainers: sessionManager.getTotalContainerCount(),
    uptime: process.uptime()
  });
});

// Periodic orphan cleanup every 60 seconds
setInterval(() => {
  sessionManager.cleanupOrphanedContainers();
}, 60 * 1000);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Terminal backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
    await sessionManager.destroyAllSessions();

    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

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
