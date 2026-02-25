/**
 * Express Application Setup
 * Configures middleware, routes, and view engine
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const requestLogger = require('./middlewares/requestLogger');

// Import domain routes
const authRoutes = require('./domains/auth/auth.routes');
const adminRoutes = require('./domains/admin/admin.routes');
const doctorRoutes = require('./domains/doctor/doctor.routes');
const patientRoutes = require('./domains/patient/patient.routes');
const notificationsRoutes = require('./domains/notifications/notifications.routes');
const siteRoutes = require('./domains/site/site.routes');

const app = express();

// ====== SECURITY ======
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(generalLimiter);

// ====== REQUEST LOGGING ======
app.use(requestLogger);

// ====== BODY PARSING ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====== VIEW ENGINE ======
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'domains'));
app.use(expressLayouts);
app.set('layout', 'shared/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ====== STATIC FILES ======
// Global public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Media files (shared across domains)
app.use('/media', express.static(path.join(__dirname, '..', 'public', 'site', 'media')));

// Font Awesome (local)
app.use('/vendor/fontawesome', express.static(path.join(__dirname, '..', 'node_modules', '@fortawesome', 'fontawesome-free')));

// Chart.js (local)
app.use('/vendor/chart.js', express.static(path.join(__dirname, '..', 'node_modules', 'chart.js')));

// Domain-specific public folders
app.use('/site', express.static(path.join(__dirname, 'domains', 'site', 'public')));
app.use('/auth', express.static(path.join(__dirname, 'domains', 'auth', 'public')));
app.use('/admin', express.static(path.join(__dirname, 'domains', 'admin', 'public')));
app.use('/doctor', express.static(path.join(__dirname, 'domains', 'doctor', 'public')));
app.use('/patient', express.static(path.join(__dirname, 'domains', 'patient', 'public')));

// Uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

// ====== GLOBAL TEMPLATE VARIABLES ======
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.user = null; // Will be set by requireAuth middleware
  next();
});

// ====== ROUTES ======
app.use('/', siteRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/patient', patientRoutes);
app.use('/notifications', notificationsRoutes);

// ====== 404 HANDLER ======
app.use((req, res) => {
  res.status(404).render('shared/error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404,
    layout: 'shared/layout',
  });
});

// ====== ERROR HANDLER ======
app.use(errorHandler);

module.exports = app;
