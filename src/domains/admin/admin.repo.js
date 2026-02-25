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
};

module.exports = adminRepo;
