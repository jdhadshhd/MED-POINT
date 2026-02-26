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
   * Upload file with auto-created record if needed
   */
  async uploadFileWithAutoRecord({ patientId, recordId, filePath, originalName, mimeType, size, notes }) {
    let targetRecordId = recordId;

    // If no record specified, create one automatically
    if (!targetRecordId) {
      const autoRecord = await patientRepo.createSelfRecord(
        patientId, 
        notes || `Patient uploaded: ${originalName}`
      );
      targetRecordId = autoRecord.id;
    }

    return patientRepo.createFile({
      recordId: targetRecordId,
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

  /**
   * Calculate MUAC status based on value
   * RED: < 11.5 cm (severe malnutrition)
   * YELLOW: 11.5 - 12.5 cm (moderate malnutrition)
   * GREEN: > 12.5 cm (normal)
   */
  calculateMuacStatus(muacValue) {
    if (muacValue < 11.5) return 'RED';
    if (muacValue <= 12.5) return 'YELLOW';
    return 'GREEN';
  },

  /**
   * Calculate BMI
   */
  calculateBmi(weight, heightCm) {
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  },

  /**
   * Save health measurement
   */
  async saveHealthMeasurement({ patientId, weight, height, muacValue, notes }) {
    const bmi = this.calculateBmi(weight, height);
    const muacStatus = this.calculateMuacStatus(muacValue);

    return patientRepo.createHealthMeasurement({
      patientId,
      weight: parseFloat(weight),
      height: parseFloat(height),
      muacValue: parseFloat(muacValue),
      muacStatus,
      bmi,
      notes: notes || null,
    });
  },

  /**
   * Get latest health measurement
   */
  async getLatestMeasurement(patientId) {
    return patientRepo.getLatestMeasurement(patientId);
  },

  /**
   * Get measurement history
   */
  async getMeasurementHistory(patientId) {
    return patientRepo.getMeasurementHistory(patientId);
  },

  // ===== DIET PLAN FUNCTIONS =====

  /**
   * Get active diet plan for patient
   */
  async getActiveDietPlan(patientId) {
    const plan = await patientRepo.getActiveDietPlan(patientId);
    if (plan) {
      // Parse items JSON string to array
      plan.itemsArray = JSON.parse(plan.items || '[]');
    }
    return plan;
  },

  /**
   * Get diet plan history
   */
  async getDietPlanHistory(patientId) {
    const plans = await patientRepo.getDietPlanHistory(patientId);
    return plans.map(plan => ({
      ...plan,
      itemsArray: JSON.parse(plan.items || '[]'),
    }));
  },

  /**
   * Create a new diet plan (usually by doctor)
   */
  async createDietPlan({ patientId, doctorId, title, description, designedBy, items }) {
    // Convert items array to JSON string for storage
    const itemsJson = JSON.stringify(items);

    return patientRepo.createDietPlan({
      patientId,
      doctorId,
      title,
      description,
      designedBy,
      items: itemsJson,
    });
  },

  /**
   * Generate PDF content for diet plan
   */
  generateDietPlanPdf(plan) {
    const items = JSON.parse(plan.items || '[]');
    
    return {
      title: plan.title,
      designedBy: plan.designedBy,
      description: plan.description,
      items,
      createdAt: plan.createdAt,
      patientName: plan.patient?.name || 'Patient',
    };
  },
};

module.exports = patientService;
