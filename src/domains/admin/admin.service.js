/**
 * Admin Service
 * Handles admin business logic
 */
const adminRepo = require('./admin.repo');
const ticketsService = require('../tickets/tickets.service');
const appointmentsService = require('../appointments/appointments.service');

const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [systemStats, ticketCounts, appointmentCounts] = await Promise.all([
      adminRepo.getStats(),
      ticketsService.getCounts(),
      appointmentsService.getCounts(),
    ]);

    return {
      ...systemStats,
      ticketsOpen: ticketCounts.open,
      appointmentsToday: appointmentCounts.waiting,
    };
  },

  /**
   * Get all users
   */
  async getUsers(options) {
    return adminRepo.getUsers(options);
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return adminRepo.getUserById(id);
  },

  /**
   * Get user counts
   */
  async getUserCounts() {
    return adminRepo.getUserCounts();
  },

  /**
   * Delete user
   */
  async deleteUser(id) {
    return adminRepo.deleteUser(id);
  },

  /**
   * Get all support tickets
   */
  async getAllTickets() {
    return ticketsService.getAll();
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(id) {
    return ticketsService.getById(id);
  },

  /**
   * Update ticket status
   */
  async updateTicketStatus(id, status, adminId) {
    return ticketsService.updateStatus(id, status, adminId);
  },

  /**
   * Reply to ticket
   */
  async replyToTicket({ ticketId, adminId, message }) {
    return ticketsService.addReply({
      ticketId,
      senderId: adminId,
      message,
      senderRole: 'ADMIN',
    });
  },
};

module.exports = adminService;
