/**
 * Notifications Repository
 * Handles notification database queries
 */
const prisma = require('../../prisma');

const notificationsRepo = {
  /**
   * Create a notification
   */
  async create(data) {
    return prisma.notification.create({
      data,
    });
  },

  /**
   * Create multiple notifications
   */
  async createMany(notifications) {
    return prisma.notification.createMany({
      data: notifications,
    });
  },

  /**
   * Find notifications by user ID
   */
  async findByUserId(userId, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * Find unread notifications by user ID
   */
  async findUnreadByUserId(userId) {
    return prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Count unread notifications
   */
  async countUnread(userId) {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  },

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    return prisma.user.findMany({
      where: { role },
      select: { id: true },
    });
  },
};

module.exports = notificationsRepo;
