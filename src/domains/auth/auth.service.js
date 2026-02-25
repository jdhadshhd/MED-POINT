/**
 * Auth Service
 * Handles authentication business logic
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const authRepo = require('./auth.repo');

const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password, role = 'PATIENT' }) {
    // Check if user exists
    const existingUser = await authRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await authRepo.create({
      name,
      email,
      passwordHash,
      role,
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  },

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user
    const user = await authRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  },

  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  },

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    return jwt.verify(token, config.jwtSecret);
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return authRepo.findById(id);
  },

  /**
   * Request password reset (stub)
   */
  async requestPasswordReset(email) {
    const user = await authRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    // In production: send reset email with token
    console.log(`[Auth] Password reset requested for: ${email}`);
    
    return { success: true };
  },
};

module.exports = authService;
