
/**
 * Patient Repository
 * Handles patient-specific database queries
 */
const prisma = require('../../prisma');

const patientRepo = {
  /**
   * Find user by name (for health measurement association)
   */
  async findUserByNameClean(name) {
    return prisma.user.findFirst({ where: { name } });
  },

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
   * Create a self-uploaded medical record (patient uploads without doctor)
   */
  async createSelfRecord(patientId, notes = 'Patient uploaded documents') {
    // Get any doctor to associate (system requirement)
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' },
    });

    if (!doctor) {
      throw new Error('No doctors available in the system');
    }

    return prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId: doctor.id,
        notes,
        muacStatus: null,
        muacValue: null,
      },
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

  /**
   * Create health measurement record
   */
  async createHealthMeasurement(data) {
    return prisma.healthMeasurement.create({
      data,
    });
  },

  /**
   * Get latest health measurement for patient
   */
  async getLatestMeasurement(patientId) {
    return prisma.healthMeasurement.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get all health measurements for patient (history)
   */
  async getMeasurementHistory(patientId) {
    return prisma.healthMeasurement.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ===== DIET PLAN FUNCTIONS =====

  /**
   * Get active diet plan for patient
   */
  async getActiveDietPlan(patientId) {
    return prisma.dietPlan.findFirst({
      where: { 
        patientId,
        isActive: true,
      },
      include: {
        doctor: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get all diet plans for patient (history)
   */
  async getDietPlanHistory(patientId) {
    return prisma.dietPlan.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Create a new diet plan
   */
  async createDietPlan(data) {
    // Deactivate any existing active plans for this patient
    await prisma.dietPlan.updateMany({
      where: { 
        patientId: data.patientId,
        isActive: true,
      },
      data: { isActive: false },
    });

    return prisma.dietPlan.create({
      data,
      include: {
        doctor: {
          select: { name: true }
        }
      },
    });
  },

  /**
   * Update a diet plan
   */
  async updateDietPlan(id, data) {
    return prisma.dietPlan.update({
      where: { id },
      data,
    });
  },
};

module.exports = patientRepo;
