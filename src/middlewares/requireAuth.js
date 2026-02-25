/**
 * Authentication Middleware
 * Verifies JWT token from httpOnly cookie
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');

function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      // Store the original URL for redirect after login
      req.session = req.session || {};
      req.session.returnTo = req.originalUrl;
      return res.redirect('/auth/login');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    // Make user available in all views
    res.locals.user = req.user;

    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
}

module.exports = requireAuth;
