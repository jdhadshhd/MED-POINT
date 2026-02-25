/**
 * Logger Utility
 * Centralized logging for the application
 */
const fs = require('fs');
const path = require('path');

// Log directory
const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log file paths
const LOG_FILES = {
  app: path.join(LOG_DIR, 'app.log'),
  error: path.join(LOG_DIR, 'error.log'),
  access: path.join(LOG_DIR, 'access.log'),
  appointments: path.join(LOG_DIR, 'appointments.log'),
};

/**
 * Format timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Write to log file
 */
function writeToFile(filePath, message) {
  const logEntry = `[${getTimestamp()}] ${message}\n`;
  
  fs.appendFile(filePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(logEntry.trim());
  }
}

const logger = {
  /**
   * General info log
   */
  info(message, data = null) {
    const logMessage = data 
      ? `[INFO] ${message} | Data: ${JSON.stringify(data)}`
      : `[INFO] ${message}`;
    writeToFile(LOG_FILES.app, logMessage);
  },

  /**
   * Warning log
   */
  warn(message, data = null) {
    const logMessage = data 
      ? `[WARN] ${message} | Data: ${JSON.stringify(data)}`
      : `[WARN] ${message}`;
    writeToFile(LOG_FILES.app, logMessage);
  },

  /**
   * Error log
   */
  error(message, error = null) {
    const errorDetails = error 
      ? `| Error: ${error.message || error} | Stack: ${error.stack || 'N/A'}`
      : '';
    const logMessage = `[ERROR] ${message} ${errorDetails}`;
    writeToFile(LOG_FILES.error, logMessage);
    writeToFile(LOG_FILES.app, logMessage);
  },

  /**
   * Access/Request log
   */
  access(req, res, duration) {
    const logMessage = `${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms | IP: ${req.ip} | User: ${req.user?.email || 'anonymous'}`;
    writeToFile(LOG_FILES.access, logMessage);
  },

  /**
   * Appointment-specific log
   */
  appointment(action, data) {
    const logMessage = `[APPOINTMENT] ${action} | ${JSON.stringify(data)}`;
    writeToFile(LOG_FILES.appointments, logMessage);
    writeToFile(LOG_FILES.app, logMessage);
  },

  /**
   * Database operation log
   */
  db(operation, table, data = null) {
    const logMessage = data
      ? `[DB] ${operation} on ${table} | Data: ${JSON.stringify(data)}`
      : `[DB] ${operation} on ${table}`;
    writeToFile(LOG_FILES.app, logMessage);
  },

  /**
   * Authentication log
   */
  auth(action, userEmail, success = true) {
    const status = success ? 'SUCCESS' : 'FAILED';
    const logMessage = `[AUTH] ${action} | User: ${userEmail} | Status: ${status}`;
    writeToFile(LOG_FILES.app, logMessage);
  },
};

module.exports = logger;
