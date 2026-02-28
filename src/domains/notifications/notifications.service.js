/**
 * Notifications Service
 * Handles notification business logic
 */
const notificationsRepo = require('./notifications.repo');
const { emitToUser, emitToRole } = require('../../config/socket');

const notificationsService = {
  /**
   * Create a notification for a user
   */
  async create({ userId, type, message }) {
    const notification = await notificationsRepo.create({
      userId,
      type,
      message,
    });

    // Emit real-time notification
    emitToUser(userId, 'notification', notification);

    return notification;
  },

  /**
   * Create notifications for all users with a specific role
   */
  async createForRole(role, { type, message }) {
    const users = await notificationsRepo.getUsersByRole(role);

    if (users.length === 0) return [];

    const notifications = users.map(user => ({
      userId: user.id,
      type,
      message,
    }));

    await notificationsRepo.createMany(notifications);

    // Emit real-time notification to the role room
    emitToRole(role, 'notification', { type, message });

    return notifications;
  },

  /**
   * Get notifications for a user
   */
  async getByUser(userId) {
    return notificationsRepo.findByUserId(userId);
  },

  /**
   * Get unread notifications for a user
   */
  async getUnreadByUser(userId) {
    return notificationsRepo.findUnreadByUserId(userId);
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return notificationsRepo.countUnread(userId);
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id, userId) {
    return notificationsRepo.markAsRead(id);
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    return notificationsRepo.markAllAsRead(userId);
  },
};

module.exports = notificationsService;
