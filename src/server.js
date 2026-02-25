/**
 * HTTP Server + Socket.io Bootstrap
 * Entry point for the application
 */
require('dotenv').config();

const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { initSocket } = require('./config/socket');
const prisma = require('./prisma');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('[Database] Connected to SQLite');

    server.listen(config.port, () => {
      console.log(`[Server] Smart MediPoint running on http://localhost:${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] Received SIGTERM');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

startServer();
