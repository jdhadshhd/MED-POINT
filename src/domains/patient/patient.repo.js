/**
 * Patient Repository
 * Handles patient-specific database queries
 */
const prisma = require('../../prisma');

const patientRepo = {
  /**
   * Get patient profile by user ID
   */
  async getProfileByUserId(userId) {
    return prisma.patientProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
  },

  /**
   * Update patient profile
   */
  async updateProfile(userId, data) {
    return prisma.patientProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  },

  /**
   * Get medical records for patient
   */
  async getRecords(patientId) {
    return prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: true,
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get all doctors
   */
  async getDoctors() {
    return prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctorProfile: true },
    });
  },

  /**
   * Get patient stats
   */
  async getDashboardStats(patientId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalAppointments,
      upcomingAppointments,
      totalRecords,
      openTickets,
    ] = await Promise.all([
      prisma.appointment.count({ where: { patientId } }),
      prisma.appointment.count({
        where: {
          patientId,
          dateTime: { gte: today },
          status: { in: ['WAITING', 'IN_PROGRESS'] },
        },
      }),
      prisma.medicalRecord.count({ where: { patientId } }),
      prisma.supportTicket.count({
        where: {
          userId: patientId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
    ]);

    return {
      totalAppointments,
      upcomingAppointments,
      totalRecords,
      openTickets,
    };
  },

  /**
   * Create medical file record
   */
  async createFile(data) {
    return prisma.medicalFile.create({
      data,
    });
  },

  /**
   * Get files for patient (through their records)
   */
  async getFiles(patientId) {
    return prisma.medicalFile.findMany({
      where: {
        record: { patientId },
      },
      include: {
        record: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  },
};

module.exports = patientRepo;
