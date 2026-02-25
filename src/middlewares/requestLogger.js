/**
 * Request Logger Middleware
 * Logs all incoming HTTP requests
 */
const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.access(req, res, duration);
  });

  next();
}

module.exports = requestLogger;
