/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
const authService = require('./auth.service');
const config = require('../../config/env');

const authController = {
  /**
   * GET /auth/login - Show login page
   */
  showLogin(req, res) {
    // Redirect if already logged in
    if (req.cookies.token) {
      try {
        const decoded = authService.verifyToken(req.cookies.token);
        return res.redirect(getRedirectPath(decoded.role));
      } catch (e) {
        res.clearCookie('token');
      }
    }

    res.render('auth/views/login', {
      layout: false,
    });
  },

  /**
   * POST /auth/login - Process login
   */
  async handleLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.render('auth/views/login', {
          layout: false,
          error: 'Email and password are required',
        });
      }

      const { user, token } = await authService.login({ email, password });

      // Set httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.cookieSecure,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });

      // Redirect based on role
      res.redirect(getRedirectPath(user.role));
    } catch (error) {
      res.render('auth/views/login', {
        layout: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /auth/register - Show registration page
   */
  showRegister(req, res) {
    res.render('auth/views/login', {
      layout: false,
    });
  },

  /**
   * POST /auth/register - Process registration
   */
  async handleRegister(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.render('auth/views/login', {
          layout: false,
          error: 'All fields are required',
        });
      }

      if (password !== confirmPassword) {
        return res.render('auth/views/login', {
          layout: false,
          error: 'Passwords do not match',
        });
      }

      if (password.length < 6) {
        return res.render('auth/views/login', {
          layout: false,
          error: 'Password must be at least 6 characters',
        });
      }

      const { user, token } = await authService.register({
        name,
        email,
        password,
        role: 'PATIENT', // Default role for self-registration
      });

      // Set httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.cookieSecure,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      res.redirect('/patient/dashboard');
    } catch (error) {
      res.render('auth/views/login', {
        layout: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /auth/forgot-password - Show forgot password page
   */
  showForgotPassword(req, res) {
    res.render('auth/views/forgot-password', {
      title: 'Forgot Password',
      message: null,
      error: null,
      layout: 'shared/layout',
    });
  },

  /**
   * POST /auth/forgot-password - Process forgot password
   */
  async handleForgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.render('auth/views/forgot-password', {
          title: 'Forgot Password',
          error: 'Email is required',
          message: null,
          layout: 'shared/layout',
        });
      }

      await authService.requestPasswordReset(email);

      res.render('auth/views/forgot-password', {
        title: 'Forgot Password',
        message: 'If an account exists with that email, you will receive password reset instructions.',
        error: null,
        layout: 'shared/layout',
      });
    } catch (error) {
      res.render('auth/views/forgot-password', {
        title: 'Forgot Password',
        error: error.message,
        message: null,
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /auth/logout - Logout user
   */
  logout(req, res) {
    res.clearCookie('token');
    res.redirect('/');
  },
};

/**
 * Get redirect path based on user role
 */
function getRedirectPath(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'PATIENT':
    default:
      return '/patient/dashboard';
  }
}

module.exports = authController;
