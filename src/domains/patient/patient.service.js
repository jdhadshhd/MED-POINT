/**
 * Patient Service
 * Handles patient business logic
 */
const patientRepo = require('./patient.repo');
const appointmentsService = require('../appointments/appointments.service');
const ticketsService = require('../tickets/tickets.service');

const patientService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(patientId) {
    return patientRepo.getDashboardStats(patientId);
  },

  /**
   * Get patient profile
   */
  async getProfile(userId) {
    return patientRepo.getProfileByUserId(userId);
  },

  /**
   * Update patient profile
   */
  async updateProfile(userId, data) {
    return patientRepo.updateProfile(userId, {
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    });
  },

  /**
   * Get appointments
   */
  async getAppointments(patientId) {
    return appointmentsService.getByPatient(patientId);
  },

  /**
   * Create appointment
   */
  async createAppointment({ patientId, doctorId, dateTime, notes }) {
    return appointmentsService.create({ patientId, doctorId, dateTime, notes });
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, patientId) {
    return appointmentsService.cancel(appointmentId, patientId);
  },

  /**
   * Get medical records
   */
  async getRecords(patientId) {
    return patientRepo.getRecords(patientId);
  },

  /**
   * Get all doctors for booking
   */
  async getDoctors() {
    return patientRepo.getDoctors();
  },

  /**
   * Get support tickets
   */
  async getTickets(userId) {
    return ticketsService.getByUser(userId);
  },

  /**
   * Create support ticket
   */
  async createTicket({ userId, title, description, priority }) {
    return ticketsService.create({ userId, title, description, priority });
  },

  /**
   * Save uploaded file record
   */
  async saveFileRecord({ recordId, filePath, originalName, mimeType, size }) {
    return patientRepo.createFile({
      recordId,
      filePath,
      originalName,
      mimeType,
      size,
    });
  },

  /**
   * Get uploaded files
   */
  async getFiles(patientId) {
    return patientRepo.getFiles(patientId);
  },
};

module.exports = patientService;
