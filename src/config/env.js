/**
 * Environment Configuration
 * Centralizes all environment variables
 */
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  nodeEnv: process.env.NODE_ENV || 'development',
};
