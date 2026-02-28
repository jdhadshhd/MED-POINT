/**
 * Doctor Controller
 * Handles doctor HTTP requests
 */
const doctorService = require('./doctor.service');

const doctorController = {
  /**
   * GET /doctor/critical-patients - API: Get all critical patients for this doctor
   */
  async getCriticalPatients(req, res) {
    try {
      const doctorId = req.user.id;
      const criticalPatients = await doctorService.getCriticalPatients(doctorId);
      res.json({ patients: criticalPatients });
    } catch (error) {
      console.error('[Doctor] Get critical patients error:', error);
      res.status(500).json({ error: 'Failed to get critical patients' });
    }
  },

  /**
   * POST /doctor/flag-critical - API: Send notification to all critical patients
   */
  async flagCriticalCases(req, res) {
    try {
      const doctorId = req.user.id;
      const criticalPatients = await doctorService.getCriticalPatients(doctorId);
      const notificationsService = require('../notifications/notifications.service');
      // Send notification to each critical patient
      for (const patient of criticalPatients) {
        await notificationsService.create({
          userId: patient.id,
          type: 'urgent',
          message: 'يرجى التواصل مع الدكتور حالاً',
        });
      }
      res.json({ success: true, count: criticalPatients.length });
    } catch (error) {
      console.error('[Doctor] Flag critical cases error:', error);
      res.status(500).json({ error: 'Failed to flag critical cases' });
    }
  },
  /**
   * GET /doctor/portal - Show full doctor portal page (from HTML design)
   */
  async showPortal(req, res) {
    try {
      res.render('doctor/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Doctor] Portal error:', error);
      res.status(500).render('shared/error', { message: 'Failed to load portal' });
    }
  },

  /**
   * GET /doctor/dashboard - Show doctor dashboard
   */
  async showDashboard(req, res) {
    try {
      res.render('doctor/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Doctor] Dashboard error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /doctor/patients - Show patients list
   */
  async showPatients(req, res) {
    try {
      res.render('doctor/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Doctor] Patients error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load patients',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /doctor/appointments - Show appointments
   */
  async showAppointments(req, res) {
    try {
      res.render('doctor/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Doctor] Appointments error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load appointments',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * POST /doctor/appointments/:id/status - Update appointment status
   */
  async updateAppointmentStatus(req, res) {
    try {
      const { status } = req.body;
      await doctorService.updateAppointmentStatus(req.params.id, status, req.user.id);

      res.redirect('/doctor/appointments');
    } catch (error) {
      console.error('[Doctor] Status update error:', error);
      res.redirect('/doctor/appointments?error=Failed to update status');
    }
  },

  /**
   * GET /doctor/records - Show medical records
   */
  async showRecords(req, res) {
    try {
      res.render('doctor/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Doctor] Records error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load records',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * POST /doctor/records - Create medical record
   */
  async createRecord(req, res) {
    try {
      const { patientId, notes, muacValue, muacStatus } = req.body;

      if (!patientId || !notes) {
        return res.redirect('/doctor/records?error=Patient and notes are required');
      }

      await doctorService.createRecord({
        doctorId: req.user.id,
        patientId,
        notes,
        muacValue,
        muacStatus,
      });

      res.redirect('/doctor/records?success=Record created');
    } catch (error) {
      console.error('[Doctor] Create record error:', error);
      res.redirect('/doctor/records?error=Failed to create record');
    }
  },

  // ==================== JSON API Endpoints ====================

  /**
   * GET /doctor/api/info - Doctor profile info
   */
  async getDoctorInfoApi(req, res) {
    try {
      const profile = await doctorService.getProfile(req.user.id);
      res.json({
        success: true,
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        specialty: profile?.specialty || 'General',
        doctorCode: profile?.doctorCode || '',
        avatar: req.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      });
    } catch (error) {
      console.error('[DoctorAPI] getDoctorInfo error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * GET /doctor/api/stats - Dashboard statistics
   */
  async getStatsApi(req, res) {
    try {
      const stats = await doctorService.getDashboardStats(req.user.id);
      const criticalPatients = await doctorService.getCriticalPatients(req.user.id);
      res.json({
        success: true,
        appointments: stats.todayAppointments,
        critical: criticalPatients.length,
        waiting: stats.pendingAppointments,
        totalPatients: stats.totalPatients,
        totalRecords: stats.totalRecords,
      });
    } catch (error) {
      console.error('[DoctorAPI] getStats error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * GET /doctor/api/patients - All patients for this doctor
   */
  async getPatientsApi(req, res) {
    try {
      const patients = await doctorService.getPatients(req.user.id);
      const criticalPatients = await doctorService.getCriticalPatients(req.user.id);
      const criticalIds = new Set(criticalPatients.map(p => p.id));

      const mapped = patients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.patientProfile?.dateOfBirth
          ? Math.floor((Date.now() - new Date(p.patientProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        gender: 'N/A',
        phone: p.patientProfile?.phone || '',
        muac: null,
        status: criticalIds.has(p.id) ? 'critical' : 'stable',
        lastVisit: p.createdAt,
        avatar: p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      }));
      res.json({ success: true, patients: mapped });
    } catch (error) {
      console.error('[DoctorAPI] getPatients error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * GET /doctor/api/appointments - All appointments for this doctor
   */
  async getAppointmentsApi(req, res) {
    try {
      const appointments = await doctorService.getAppointments(req.user.id);
      const mapped = appointments.map(a => ({
        id: a.id,
        patientId: a.patientId,
        patientName: a.patient?.name || 'Unknown',
        date: a.dateTime ? new Date(a.dateTime).toISOString().split('T')[0] : '',
        time: a.dateTime ? new Date(a.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        type: a.notes || 'Consultation',
        urgency: a.status === 'URGENT' ? 'urgent' : 'normal',
        status: a.status?.toLowerCase() || 'waiting',
        mode: 'In-person',
      }));
      res.json({ success: true, appointments: mapped });
    } catch (error) {
      console.error('[DoctorAPI] getAppointments error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * POST /doctor/api/patients - Create new patient
   */
  async createPatientApi(req, res) {
    try {
      const patient = await doctorService.createPatient({
        name: req.body.name,
        email: req.body.email || `patient${Date.now()}@medipoint.com`,
        passwordHash: '$2b$10$placeholder', // will be reset by patient
        role: 'PATIENT',
        status: 'ACTIVE',
      });
      res.json({
        success: true,
        patient: {
          id: patient.id,
          name: patient.name,
          age: null,
          gender: req.body.gender || 'N/A',
          muac: req.body.muac || null,
          status: 'new',
          avatar: patient.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        },
      });
    } catch (error) {
      console.error('[DoctorAPI] createPatient error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * POST /doctor/api/appointments - Create appointment
   */
  async createAppointmentApi(req, res) {
    try {
      const { patientId, date, time, type } = req.body;
      // Combine date and time into a DateTime
      const dateTime = new Date(`${date}T${convertTo24h(time || '09:00 AM')}`);

      const appointment = await doctorService.createAppointment
        ? await doctorService.createAppointment({ patientId, doctorId: req.user.id, dateTime, notes: type })
        : await require('../appointments/appointments.service').create({
          patientId,
          doctorId: req.user.id,
          dateTime,
          notes: type || 'Consultation',
        });

      res.json({ success: true, appointment });
    } catch (error) {
      console.error('[DoctorAPI] createAppointment error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * POST /doctor/api/appointments/:id/status - Update appointment status (JSON)
   */
  async updateAppointmentStatusApi(req, res) {
    try {
      const { status } = req.body;
      const appointment = await doctorService.updateAppointmentStatus(req.params.id, status, req.user.id);
      res.json({ success: true, appointment });
    } catch (error) {
      console.error('[DoctorAPI] updateAppointmentStatus error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * GET /doctor/api/notifications - Get doctor notifications
   */
  async getNotificationsApi(req, res) {
    try {
      const notificationsService = require('../notifications/notifications.service');
      const notifications = await notificationsService.getByUser(req.user.id);
      const mapped = notifications.map(n => ({
        id: n.id,
        title: n.type,
        message: n.message,
        type: n.type.includes('URGENT') || n.type.includes('CRITICAL') ? 'urgent' : 'info',
        time: n.createdAt,
        read: !!n.readAt,
      }));
      res.json({ success: true, notifications: mapped });
    } catch (error) {
      console.error('[DoctorAPI] getNotifications error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * POST /doctor/api/notifications/read-all - Mark all notifications read
   */
  async markAllNotificationsReadApi(req, res) {
    try {
      const notificationsService = require('../notifications/notifications.service');
      await notificationsService.markAllAsRead(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('[DoctorAPI] markAllRead error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

// Helper: convert "09:00 AM" → "09:00"
function convertTo24h(timeStr) {
  if (!timeStr) return '09:00';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;
  let [, h, m, period] = match;
  h = parseInt(h);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

module.exports = doctorController;
