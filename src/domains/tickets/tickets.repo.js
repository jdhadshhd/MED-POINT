/**
 * Tickets Repository
 * Handles support ticket database queries
 */
const prisma = require('../../prisma');

const ticketsRepo = {
  /**
   * Create a new ticket
   */
  async create(data) {
    return prisma.supportTicket.create({
      data,
      include: {
        user: true,
        messages: {
          include: { sender: true },
        },
      },
    });
  },

  /**
   * Find ticket by ID
   */
  async findById(id) {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  /**
   * Find tickets by user ID
   */
  async findByUserId(userId) {
    return prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Find all tickets
   */
  async findAll() {
    return prisma.supportTicket.findMany({
      include: {
        user: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Update ticket
   */
  async update(id, data) {
    return prisma.supportTicket.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  },

  /**
   * Add message to ticket
   */
  async addMessage({ ticketId, senderId, message }) {
    return prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message,
      },
      include: {
        sender: true,
      },
    });
  },

  /**
   * Count tickets by status
   */
  async countByStatus(status) {
    return prisma.supportTicket.count({
      where: { status },
    });
  },

  /**
   * Count total tickets
   */
  async count(filters = {}) {
    return prisma.supportTicket.count({
      where: filters,
    });
  },
};

module.exports = ticketsRepo;
