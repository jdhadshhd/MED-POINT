/**
 * Notifications Routes
 */
const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const requireAuth = require('../../middlewares/requireAuth');

// Get unread count (no auth required for non-logged-in users)
router.get('/unread-count', (req, res, next) => {
  // Try to parse user from cookie if present
  const jwt = require('jsonwebtoken');
  const config = require('../../config/env');
  
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    }
    next();
  } catch (e) {
    req.user = null;
    next();
  }
}, notificationsController.getUnreadCount);

// Protected routes
router.use(requireAuth);

router.get('/', notificationsController.showNotifications);
router.post('/:id/read', notificationsController.markAsRead);
router.post('/read-all', notificationsController.markAllAsRead);

module.exports = router;
