const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const SessionManager = require('./session');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.vercel.app'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
});

// Initialize session manager
const sessionManager = new SessionManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Track client IP for rate limiting
  const clientIP = socket.handshake.address;
  console.log(`Client IP: ${clientIP}`);

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

  // Handle terminal input
  socket.on('input', (data) => {
    sessionManager.sendInput(socket.id, data);
  });

  // Handle terminal resize
  socket.on('resize', ({ cols, rows }) => {
    sessionManager.resizeTerminal(socket.id, cols, rows);
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

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Terminal backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  
  // Close all sessions
  await sessionManager.destroyAllSessions();
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  // Close all sessions
  await sessionManager.destroyAllSessions();
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});