/**
 * Entry Point
 * Initializes Express server, MongoDB, and Socket.io
 *
 * SERVER ARCHITECTURE (Interview-ready explanation):
 * ─────────────────────────────────────────────────
 * 1. Express app handles HTTP request/response cycle
 * 2. HTTP server wraps Express (required for Socket.io)
 * 3. Socket.io attaches to HTTP server for WebSocket upgrade
 * 4. Single port serves both REST and WebSocket traffic
 *
 * Why Socket.io can't attach directly to Express:
 * - Express is a request handler, not a server
 * - Socket.io needs the raw HTTP server to handle the
 *   WebSocket upgrade handshake (HTTP 101 Switching Protocols)
 * - The HTTP server emits 'upgrade' events that Socket.io listens for
 */
const express = require('express');
const http = require('http');
const cors = require('cors');

const config = require('./config');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');

// Step 1: Create Express application (request handler)
const app = express();

// Step 2: Create HTTP server wrapping Express
// This is the actual server that listens on a port
const server = http.createServer(app);

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/users', require('./routes/users'));

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  // Step 3: Initialize Socket.io with HTTP server
  // Socket.io will intercept WebSocket upgrade requests
  initializeSocket(server);

  // Step 4: Single listen call for both HTTP and WebSocket
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
};

startServer().catch(console.error);

module.exports = { app, server };
