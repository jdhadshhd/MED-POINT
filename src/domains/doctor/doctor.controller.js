/**
 * Doctor Controller
 * Handles doctor HTTP requests
 */
const doctorService = require('./doctor.service');

const doctorController = {
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
};

module.exports = doctorController;
