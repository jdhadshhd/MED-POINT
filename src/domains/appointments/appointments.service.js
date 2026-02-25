/**
 * Appointments Service
 * Handles appointment business logic
 */
const appointmentsRepo = require('./appointments.repo');
const notificationsService = require('../notifications/notifications.service');
const { emitToUser } = require('../../config/socket');
const logger = require('../../config/logger');

// Valid appointment statuses
const STATUSES = ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'URGENT'];

const appointmentsService = {
  /**
   * Create a new appointment
   */
  async create({ patientId, doctorId, dateTime, notes }) {
    logger.appointment('CREATE_START', { patientId, doctorId, dateTime, notes });
    
    try {
      const appointment = await appointmentsRepo.create({
        patientId,
        doctorId,
        dateTime: new Date(dateTime),
        notes,
        status: 'WAITING',
      });

      logger.appointment('CREATE_SUCCESS', { 
        appointmentId: appointment.id, 
        patientId, 
        doctorId,
        patientName: appointment.patient?.name 
      });

      // Create notification for doctor
      await notificationsService.create({
        userId: doctorId,
        type: 'APPOINTMENT_NEW',
        message: `New appointment scheduled by ${appointment.patient.name}`,
      });

      // Emit realtime notification to doctor
      emitToUser(doctorId, 'notification', {
        type: 'appointment',
        message: `New appointment from ${appointment.patient.name}`,
      });

      return appointment;
    } catch (error) {
      logger.error('Appointment creation failed', error);
      throw error;
    }
  },

  /**
   * Get appointment by ID
   */
  async getById(id) {
    return appointmentsRepo.findById(id);
  },

  /**
   * Get appointments for a patient
   */
  async getByPatient(patientId) {
    return appointmentsRepo.findByPatientId(patientId);
  },

  /**
   * Get appointments for a doctor
   */
  async getByDoctor(doctorId) {
    return appointmentsRepo.findByDoctorId(doctorId);
  },

  /**
   * Get all appointments
   */
  async getAll() {
    return appointmentsRepo.findAll();
  },

  /**
   * Update appointment status
   */
  async updateStatus(id, status, updatedBy) {
    if (!STATUSES.includes(status)) {
      throw new Error('Invalid status');
    }

    const appointment = await appointmentsRepo.update(id, { status });

    // Notify patient about status change
    await notificationsService.create({
      userId: appointment.patientId,
      type: 'APPOINTMENT_STATUS',
      message: `Your appointment status has been updated to ${status}`,
    });

    // Emit realtime notification to patient
    emitToUser(appointment.patientId, 'appointment:updated', {
      appointmentId: id,
      status,
      message: `Your appointment is now ${status}`,
    });

    return appointment;
  },

  /**
   * Update appointment details
   */
  async update(id, data) {
    return appointmentsRepo.update(id, data);
  },

  /**
   * Cancel appointment
   */
  async cancel(id, cancelledBy) {
    logger.appointment('CANCEL_START', { appointmentId: id, cancelledBy });
    
    const appointment = await appointmentsRepo.update(id, { status: 'CANCELLED' });

    logger.appointment('CANCEL_SUCCESS', { appointmentId: id, cancelledBy });

    // Determine who to notify
    const notifyUserId = cancelledBy === appointment.patientId 
      ? appointment.doctorId 
      : appointment.patientId;

    await notificationsService.create({
      userId: notifyUserId,
      type: 'APPOINTMENT_CANCELLED',
      message: 'An appointment has been cancelled',
    });

    emitToUser(notifyUserId, 'appointment:updated', {
      appointmentId: id,
      status: 'CANCELLED',
      message: 'An appointment has been cancelled',
    });

    return appointment;
  },

  /**
   * Get today's appointments for a doctor
   */
  async getTodayForDoctor(doctorId) {
    return appointmentsRepo.getTodayForDoctor(doctorId);
  },

  /**
   * Get appointment counts
   */
  async getCounts(filters = {}) {
    const [total, waiting, inProgress, completed, cancelled] = await Promise.all([
      appointmentsRepo.count(filters),
      appointmentsRepo.countByStatus('WAITING', filters),
      appointmentsRepo.countByStatus('IN_PROGRESS', filters),
      appointmentsRepo.countByStatus('COMPLETED', filters),
      appointmentsRepo.countByStatus('CANCELLED', filters),
    ]);

    return { total, waiting, inProgress, completed, cancelled };
  },
};

module.exports = appointmentsService;
