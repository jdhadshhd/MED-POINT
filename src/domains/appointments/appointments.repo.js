/**
 * Appointments Repository
 * Handles appointment database queries
 */
const prisma = require('../../prisma');

const appointmentsRepo = {
  /**
   * Create a new appointment
   */
  async create(data) {
    return prisma.appointment.create({
      data,
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Find appointment by ID
   */
  async findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Find appointments by patient ID
   */
  async findByPatientId(patientId) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: { doctorProfile: true },
        },
      },
      orderBy: { dateTime: 'desc' },
    });
  },

  /**
   * Find appointments by doctor ID
   */
  async findByDoctorId(doctorId) {
    return prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          include: { patientProfile: true },
        },
      },
      orderBy: { dateTime: 'desc' },
    });
  },

  /**
   * Find all appointments
   */
  async findAll() {
    return prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { dateTime: 'desc' },
    });
  },

  /**
   * Update appointment
   */
  async update(id, data) {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Delete appointment
   */
  async delete(id) {
    return prisma.appointment.delete({
      where: { id },
    });
  },

  /**
   * Count appointments by status
   */
  async countByStatus(status, filters = {}) {
    return prisma.appointment.count({
      where: {
        status,
        ...filters,
      },
    });
  },

  /**
   * Count total appointments
   */
  async count(filters = {}) {
    return prisma.appointment.count({
      where: filters,
    });
  },

  /**
   * Get today's appointments for a doctor
   */
  async getTodayForDoctor(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: {
          include: { patientProfile: true },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  },
};

module.exports = appointmentsRepo;
