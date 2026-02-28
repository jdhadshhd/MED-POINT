/**
 * Admin Service
 * Handles admin business logic
 */
const adminRepo = require('./admin.repo');
const prisma = require('../../prisma');
const ticketsService = require('../tickets/tickets.service');
const appointmentsService = require('../appointments/appointments.service');

const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [systemStats, userCounts, ticketCounts, appointmentCounts] = await Promise.all([
      adminRepo.getStats(),
      adminRepo.getUserCounts(),
      ticketsService.getCounts(),
      appointmentsService.getCounts(),
    ]);

    return {
      ...systemStats,
      totalPatients: userCounts.patients,
      totalDoctors: userCounts.doctors,
      pendingRequests: await prisma.user.count({ where: { status: 'PENDING' } }),
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
   * Create a support ticket (admin-initiated)
   */
  async createTicket(data) {
    return ticketsService.create(data);
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

  /**
   * Create user with password hashing
   */
  async createUser(data) {
    const bcrypt = require('bcrypt');

    // Extract phone for PatientProfile
    const phone = data.phone;
    delete data.phone;

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    // Prepare create data
    const createData = { ...data };
    if (data.role === 'PATIENT') {
      createData.profile = { phone };
    } else if (data.role === 'DOCTOR') {
      createData.profile = { specialty: 'General', doctorCode: 'DOC-' + Date.now().toString().slice(-4) };
    }

    return adminRepo.createUser(createData);
  },

  /**
   * Update user
   */
  async updateUser(id, data) {
    const bcrypt = require('bcrypt');

    // Extract phone
    const phone = data.phone;
    delete data.phone;

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    const updateData = { ...data };
    if (data.role === 'PATIENT') {
      updateData.profile = { phone };
    }

    return adminRepo.updateUser(id, updateData);
  },

  /**
   * Get pending requests
   */
  async getPendingRequests() {
    return adminRepo.getPendingUsers();
  },

  /**
   * Approve user request
   */
  async approveRequest(id) {
    return adminRepo.updateUser(id, { status: 'ACTIVE' });
  },

  /**
   * FAQ Management
   */
  async getFAQs() {
    return adminRepo.getFAQs();
  },

  async createFAQ(data) {
    return adminRepo.createFAQ(data);
  },

  async updateFAQ(id, data) {
    return adminRepo.updateFAQ(id, data);
  },

  async deleteFAQ(id) {
    return adminRepo.deleteFAQ(id);
  },

  /**
   * Settings Management
   */
  async saveSettings(settingsObj) {
    const settingsArray = Object.keys(settingsObj).map(key => ({
      key,
      value: settingsObj[key],
    }));
    return adminRepo.saveSettings(settingsArray);
  },

  async loadSettings() {
    return adminRepo.loadSettings();
  },
};

module.exports = adminService;
