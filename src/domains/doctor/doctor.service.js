/**
 * Doctor Service
 * Handles doctor business logic
 */
const doctorRepo = require('./doctor.repo');
const appointmentsService = require('../appointments/appointments.service');

const doctorService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(doctorId) {
    return doctorRepo.getDashboardStats(doctorId);
  },

  /**
   * Get doctor profile
   */
  async getProfile(userId) {
    return doctorRepo.getProfileByUserId(userId);
  },

  /**
   * Get all patients for this doctor
   */
  async getPatients(doctorId) {
    return doctorRepo.getPatients(doctorId);
  },

  /**
   * Get appointments for this doctor
   */
  async getAppointments(doctorId) {
    return appointmentsService.getByDoctor(doctorId);
  },

  /**
   * Get today's appointments
   */
  async getTodayAppointments(doctorId) {
    return appointmentsService.getTodayForDoctor(doctorId);
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, status, doctorId) {
    return appointmentsService.updateStatus(appointmentId, status, doctorId);
  },

  /**
   * Get medical records
   */
  async getRecords(doctorId) {
    return doctorRepo.getRecords(doctorId);
  },

  /**
   * Create medical record
   */
  async createRecord({ doctorId, patientId, notes, muacValue, muacStatus }) {
    return doctorRepo.createRecord({
      doctorId,
      patientId,
      notes,
      muacValue: muacValue ? parseFloat(muacValue) : null,
      muacStatus: muacStatus || null,
    });
  },
};

module.exports = doctorService;
