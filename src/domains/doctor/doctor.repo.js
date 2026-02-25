/**
 * Doctor Repository
 * Handles doctor-specific database queries
 */
const prisma = require('../../prisma');

const doctorRepo = {
  /**
   * Get doctor profile by user ID
   */
  async getProfileByUserId(userId) {
    return prisma.doctorProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
  },

  /**
   * Get all patients who have appointments with this doctor
   */
  async getPatients(doctorId) {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      select: {
        patient: {
          include: { patientProfile: true },
        },
      },
      distinct: ['patientId'],
    });

    return appointments.map(a => a.patient);
  },

  /**
   * Get medical records created by doctor
   */
  async getRecords(doctorId) {
    return prisma.medicalRecord.findMany({
      where: { doctorId },
      include: {
        patient: true,
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Create medical record
   */
  async createRecord(data) {
    return prisma.medicalRecord.create({
      data,
      include: {
        patient: true,
        files: true,
      },
    });
  },

  /**
   * Get stats for doctor dashboard
   */
  async getDashboardStats(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, totalPatients, totalRecords, pendingAppointments] = await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId,
          dateTime: { gte: today, lt: tomorrow },
        },
      }),
      prisma.appointment.findMany({
        where: { doctorId },
        select: { patientId: true },
        distinct: ['patientId'],
      }).then(p => p.length),
      prisma.medicalRecord.count({ where: { doctorId } }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: { in: ['WAITING', 'IN_PROGRESS'] },
        },
      }),
    ]);

    return {
      todayAppointments,
      totalPatients,
      totalRecords,
      pendingAppointments,
    };
  },
};

module.exports = doctorRepo;
