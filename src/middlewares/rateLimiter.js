/**
 * Rate Limiting Middleware
 * Prevents brute force attacks
 */
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100, // Higher limit in dev
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip rate limiting in development
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 10, // Higher limit in dev
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
};
