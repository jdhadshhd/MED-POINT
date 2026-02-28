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
router.get('/reports/system/download', adminController.downloadSystemReport);
router.get('/reports/patient/:id/download', adminController.downloadPatientReport);

// Support
router.get('/support', adminController.showSupport);
router.get('/support/:id', adminController.showTicketDetail);
router.post('/support/:id/reply', adminController.replyToTicket);
router.post('/support/:id/status', adminController.updateTicketStatus);

// Settings
router.get('/settings', adminController.showSettings);

// --- API Endpoints ---
router.get('/api/stats', adminController.getDashboardStatsApi);

// IMPORTANT: Specific routes MUST come before parameterized routes
// e.g. /api/users/export must be before /api/users/:id
router.get('/api/users/export', adminController.exportUsersApi);   // ← MUST be first
router.get('/api/users', adminController.getUsersApi);
router.post('/api/users', adminController.createUserApi);
router.put('/api/users/:id', adminController.updateUserApi);
router.delete('/api/users/:id', adminController.deleteUserApi);

router.get('/api/requests', adminController.getPendingRequestsApi);
router.post('/api/requests/:id/approve', adminController.approveRequestApi);

router.get('/api/tickets', adminController.getTicketsApi);
// Ticket-specific actions before parameterized routes
router.post('/api/tickets', adminController.createTicketApi);          // ← NEW: create ticket
router.post('/api/tickets/:id/reply', adminController.replyToTicketApi);
router.post('/api/tickets/:id/status', adminController.updateTicketStatusApi);

router.get('/api/faqs', adminController.getFAQsApi);
router.post('/api/faqs', adminController.createFAQApi);
router.put('/api/faqs/:id', adminController.updateFAQApi);
router.delete('/api/faqs/:id', adminController.deleteFAQApi);

router.post('/api/settings', adminController.saveSettingsApi);
router.get('/api/settings', adminController.loadSettingsApi);

module.exports = router;
