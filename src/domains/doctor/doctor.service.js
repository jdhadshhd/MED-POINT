/**
 * Doctor Service
 * Handles doctor business logic
 */


const doctorRepo = require('./doctor.repo');
const appointmentsService = require('../appointments/appointments.service');
const criticalCasesService = require('../shared/critical-cases.service');

const doctorService = {
  /**
   * Create new patient (from doctor)
   */
  async createPatient(data) {
    return doctorRepo.createPatient(data);
  },
  /**
   * Get all critical patients for this doctor
   */
  async getCriticalPatients(doctorId) {
    return criticalCasesService.getDoctorCriticalCases(doctorId);
  },
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
   * Create appointment (doctor-initiated)
   */
  async createAppointment({ patientId, doctorId, dateTime, notes }) {
    return appointmentsService.create({ patientId, doctorId, dateTime, notes });
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
    const record = await doctorRepo.createRecord({
      doctorId,
      patientId,
      notes,
      muacValue: muacValue ? parseFloat(muacValue) : null,
      muacStatus: muacStatus || null,
    });

    // Check for critical case
    if (muacStatus === 'RED') {
      await criticalCasesService.checkAndFlag(patientId, doctorId, muacStatus);
    }

    return record;
  }
};

module.exports = doctorService;
