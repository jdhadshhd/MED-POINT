/**
 * Socket.io Configuration
 * Handles socket authentication and room management
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const config = require('./env');
const registerSupportSocket = require('../domains/support/support.socket');

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 * @param {http.Server} httpServer 
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      // Parse cookies from handshake headers
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication required'));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.token;

      if (!token) {
        return next(new Error('No token provided'));
      }

      // Verify JWT
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
      };

      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.id} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Join role-specific room
    socket.join(`role:${socket.user.role}`);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.id}`);
    });

    // Handle marking notifications as read
    socket.on('notification:read', async (data) => {
      // This event can be handled by the notifications service
      console.log(`[Socket] Notification read: ${data.notificationId}`);
    });
  });

  // Register support chat socket handler
  registerSupportSocket(io);

  return io;
}

/**
 * Get the Socket.io instance
 * @returns {Server}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

/**
 * Emit event to a specific user
 * @param {string} userId 
 * @param {string} event 
 * @param {any} data 
 */
function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to all users with a specific role
 * @param {string} role 
 * @param {string} event 
 * @param {any} data 
 */
function emitToRole(role, event, data) {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
};
