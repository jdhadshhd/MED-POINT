/**
 * Tickets Service
 * Handles support ticket business logic
 */
const ticketsRepo = require('./tickets.repo');
const notificationsService = require('../notifications/notifications.service');
const { emitToRole, emitToUser } = require('../../config/socket');

// Valid ticket statuses
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const ticketsService = {
  /**
   * Create a new ticket
   */
  async create({ userId, title, description, priority = 'MEDIUM' }) {
    if (!PRIORITIES.includes(priority)) {
      throw new Error('Invalid priority');
    }

    const ticket = await ticketsRepo.create({
      userId,
      title,
      description,
      priority,
      status: 'OPEN',
    });

    // Notify all admins
    await notificationsService.createForRole('ADMIN', {
      type: 'TICKET_NEW',
      message: `New support ticket: ${title}`,
    });

    // Emit realtime notification to all admins
    emitToRole('ADMIN', 'notification', {
      type: 'ticket',
      message: `New support ticket: ${title}`,
      ticketId: ticket.id,
    });

    return ticket;
  },

  /**
   * Get ticket by ID
   */
  async getById(id) {
    return ticketsRepo.findById(id);
  },

  /**
   * Get tickets by user
   */
  async getByUser(userId) {
    return ticketsRepo.findByUserId(userId);
  },

  /**
   * Get all tickets
   */
  async getAll() {
    return ticketsRepo.findAll();
  },

  /**
   * Update ticket status
   */
  async updateStatus(id, status, updatedBy) {
    if (!STATUSES.includes(status)) {
      throw new Error('Invalid status');
    }

    const ticket = await ticketsRepo.update(id, { status });

    // Notify ticket owner
    await notificationsService.create({
      userId: ticket.userId,
      type: 'TICKET_STATUS',
      message: `Your support ticket "${ticket.title}" is now ${status}`,
    });

    emitToUser(ticket.userId, 'ticket:updated', {
      ticketId: id,
      status,
      message: `Your ticket status changed to ${status}`,
    });

    return ticket;
  },

  /**
   * Add reply to ticket
   */
  async addReply({ ticketId, senderId, message, senderRole }) {
    const ticketMessage = await ticketsRepo.addMessage({
      ticketId,
      senderId,
      message,
    });

    // Get ticket to find owner
    const ticket = await ticketsRepo.findById(ticketId);

    // If admin replies, notify ticket owner
    if (senderRole === 'ADMIN' && ticket.userId !== senderId) {
      await notificationsService.create({
        userId: ticket.userId,
        type: 'TICKET_REPLY',
        message: `New reply on your support ticket "${ticket.title}"`,
      });

      emitToUser(ticket.userId, 'ticket:updated', {
        ticketId,
        message: `New reply on your ticket "${ticket.title}"`,
      });
    } else {
      // If user replies, notify admins
      emitToRole('ADMIN', 'notification', {
        type: 'ticket',
        message: `New reply on ticket: ${ticket.title}`,
        ticketId,
      });
    }

    return ticketMessage;
  },

  /**
   * Get ticket counts
   */
  async getCounts() {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      ticketsRepo.count(),
      ticketsRepo.countByStatus('OPEN'),
      ticketsRepo.countByStatus('IN_PROGRESS'),
      ticketsRepo.countByStatus('RESOLVED'),
      ticketsRepo.countByStatus('CLOSED'),
    ]);

    return { total, open, inProgress, resolved, closed };
  },
};

module.exports = ticketsService;
