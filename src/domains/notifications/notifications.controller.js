/**
 * Notifications Controller
 * Handles notification HTTP requests
 */
const notificationsService = require('./notifications.service');

const notificationsController = {
  /**
   * GET /notifications - Show notifications page
   */
  async showNotifications(req, res) {
    try {
      const notifications = await notificationsService.getByUser(req.user.id);

      res.render('notifications/views/list', {
        title: 'Notifications',
        notifications,
        layout: 'shared/layout',
      });
    } catch (error) {
      console.error('[Notifications] Error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load notifications',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /notifications/unread-count - Get unread count (JSON)
   */
  async getUnreadCount(req, res) {
    try {
      if (!req.user) {
        return res.json({ count: 0 });
      }

      const count = await notificationsService.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.json({ count: 0 });
    }
  },

  /**
   * POST /notifications/:id/read - Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await notificationsService.markAsRead(id, req.user.id);

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true });
      }

      res.redirect('/notifications');
    } catch (error) {
      console.error('[Notifications] Error marking as read:', error);
      
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(500).json({ success: false, error: error.message });
      }

      res.redirect('/notifications');
    }
  },

  /**
   * POST /notifications/read-all - Mark all as read
   */
  async markAllAsRead(req, res) {
    try {
      await notificationsService.markAllAsRead(req.user.id);

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true });
      }

      res.redirect('/notifications');
    } catch (error) {
      console.error('[Notifications] Error:', error);
      
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(500).json({ success: false, error: error.message });
      }

      res.redirect('/notifications');
    }
  },
};

module.exports = notificationsController;
