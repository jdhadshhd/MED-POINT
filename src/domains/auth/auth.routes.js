/**
 * Auth Routes
 * Handles authentication endpoints
 */
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authLimiter } = require('../../middlewares/rateLimiter');

// Login
router.get('/login', authController.showLogin);
router.post('/login', authLimiter, authController.handleLogin);

// Register
router.get('/register', authController.showRegister);
router.post('/register', authLimiter, authController.handleRegister);

// Forgot Password
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authLimiter, authController.handleForgotPassword);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
