/**
 * Admin Repository
 * Handles admin-specific database queries
 */
const prisma = require('../../prisma');

const adminRepo = {
  /**
   * Get all users with pagination
   */
  async getUsers(options = {}) {
    const { page = 1, limit = 20, role } = options;
    const skip = (page - 1) * limit;

    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          doctorProfile: true,
          patientProfile: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
  },

  /**
   * Get user counts by role
   */
  async getUserCounts() {
    const [total, admins, doctors, patients] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.user.count({ where: { role: 'PATIENT' } }),
    ]);

    return { total, admins, doctors, patients };
  },

  /**
   * Delete user
   */
  async deleteUser(id) {
    return prisma.user.delete({ where: { id } });
  },

  /**
   * Get system stats
   */
  async getStats() {
    const [
      userCount,
      appointmentCount,
      recordCount,
      ticketCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count(),
      prisma.medicalRecord.count(),
      prisma.supportTicket.count(),
    ]);

    return {
      users: userCount,
      appointments: appointmentCount,
      records: recordCount,
      tickets: ticketCount,
    };
  },

  /**
   * Create new user
   */
  async createUser(data) {
    const { profile, ...userData } = data;
    return prisma.user.create({
      data: {
        ...userData,
        doctorProfile: userData.role === 'DOCTOR' ? { create: profile } : undefined,
        patientProfile: userData.role === 'PATIENT' ? { create: profile } : undefined,
      },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
  },

  /**
   * Update existing user
   */
  async updateUser(id, data) {
    const { profile, ...userData } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        doctorProfile: userData.role === 'DOCTOR' && profile ? { update: profile } : undefined,
        patientProfile: userData.role === 'PATIENT' && profile ? { update: profile } : undefined,
      },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
  },

  /**
   * Get pending users (requesting verification/activation)
   */
  async getPendingUsers() {
    return prisma.user.findMany({
      where: { status: 'PENDING' },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * FAQ Management
   */
  async getFAQs() {
    return prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async createFAQ(data) {
    return prisma.fAQ.create({ data });
  },

  async updateFAQ(id, data) {
    return prisma.fAQ.update({
      where: { id },
      data,
    });
  },

  async deleteFAQ(id) {
    return prisma.fAQ.delete({ where: { id } });
  },

  /**
   * Settings Management
   */
  async saveSettings(settingsArray) {
    // settingsArray: [{ key: 'site_name', value: '...' }, ...]
    const transactions = settingsArray.map(set => prisma.setting.upsert({
      where: { key: set.key },
      update: { value: JSON.stringify(set.value) },
      create: { key: set.key, value: JSON.stringify(set.value) },
    }));
    return prisma.$transaction(transactions);
  },

  async loadSettings() {
    const settings = await prisma.setting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = JSON.parse(curr.value);
      return acc;
    }, {});
  },
};

module.exports = adminRepo;
