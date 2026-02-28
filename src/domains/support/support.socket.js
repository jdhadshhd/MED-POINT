// src/domains/support/support.socket.js
// Handles support chat socket events for patients and admins

const { emitToRole } = require('../../config/socket');

function registerSupportSocket(io) {
  io.on('connection', (socket) => {
    // Listen for support messages from patients
    socket.on('support:message', (data) => {
      if (!socket.user) return;
      // Forward message to all admins
      emitToRole('admin', 'support:message', {
        from: {
          id: socket.user.id,
          name: socket.user.name,
          email: socket.user.email,
        },
        message: data.message,
        timestamp: new Date().toISOString(),
      });
      // Optionally, send system ack to patient
      socket.emit('support:system', { message: 'Message sent to support.' });
    });
  });
}

module.exports = registerSupportSocket;
