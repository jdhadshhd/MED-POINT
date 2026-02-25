/**
 * Admin Routes
 */
const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');

// All admin routes require authentication and ADMIN role
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.showDashboard);

// Portal (full admin portal page)
router.get('/portal', adminController.showPortal);

// Users
router.get('/users', adminController.showUsers);

// Reports
router.get('/reports', adminController.showReports);

// Support
router.get('/support', adminController.showSupport);
router.get('/support/:id', adminController.showTicketDetail);
router.post('/support/:id/reply', adminController.replyToTicket);
router.post('/support/:id/status', adminController.updateTicketStatus);

// Settings
router.get('/settings', adminController.showSettings);

module.exports = router;
