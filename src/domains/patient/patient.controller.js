/**
 * Patient Controller
 * Handles patient HTTP requests
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('../../config/env');
const patientService = require('./patient.service');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', '..', config.uploadDir);
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
    }
  },
});

const patientController = {
  /**
   * GET /patient/portal - Show full patient portal page (from HTML design)
   */
  async showPortal(req, res) {
    try {
      res.render('patient/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Patient] Portal error:', error);
      res.status(500).render('shared/error', { message: 'Failed to load portal' });
    }
  },

  /**
   * GET /patient/dashboard - Show patient dashboard
   */
  async showDashboard(req, res) {
    try {
      res.render('patient/views/dashboard', {
        layout: false,
      });
    } catch (error) {
      console.error('[Patient] Dashboard error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /patient/appointments - Show appointments
   */
  async showAppointments(req, res) {
    try {
      const appointments = await patientService.getAppointments(req.user.id);
      const doctors = await patientService.getDoctors();

      res.render('patient/views/appointments', {
        title: 'My Appointments',
        appointments,
        doctors,
        layout: 'shared/layout',
      });
    } catch (error) {
      console.error('[Patient] Appointments error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load appointments',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * POST /patient/appointments - Create appointment
   */
  async createAppointment(req, res) {
    try {
      const { doctorId, dateTime, notes } = req.body;

      if (!doctorId || !dateTime) {
        return res.redirect('/patient/appointments?error=Doctor and date are required');
      }

      await patientService.createAppointment({
        patientId: req.user.id,
        doctorId,
        dateTime,
        notes,
      });

      res.redirect('/patient/appointments?success=Appointment booked');
    } catch (error) {
      console.error('[Patient] Create appointment error:', error);
      res.redirect('/patient/appointments?error=Failed to book appointment');
    }
  },

  /**
   * POST /patient/appointments/:id/cancel - Cancel appointment
   */
  async cancelAppointment(req, res) {
    try {
      await patientService.cancelAppointment(req.params.id, req.user.id);
      res.redirect('/patient/appointments?success=Appointment cancelled');
    } catch (error) {
      console.error('[Patient] Cancel appointment error:', error);
      res.redirect('/patient/appointments?error=Failed to cancel appointment');
    }
  },

  /**
   * GET /patient/records - Show medical records
   */
  async showRecords(req, res) {
    try {
      const records = await patientService.getRecords(req.user.id);

      res.render('patient/views/records', {
        title: 'Medical Records',
        records,
        layout: 'shared/layout',
      });
    } catch (error) {
      console.error('[Patient] Records error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load records',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /patient/profile - Show profile
   */
  async showProfile(req, res) {
    try {
      const profile = await patientService.getProfile(req.user.id);

      res.render('patient/views/profile', {
        title: 'My Profile',
        profile,
        layout: 'shared/layout',
      });
    } catch (error) {
      console.error('[Patient] Profile error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load profile',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * POST /patient/profile - Update profile
   */
  async updateProfile(req, res) {
    try {
      const { phone, dateOfBirth } = req.body;

      await patientService.updateProfile(req.user.id, { phone, dateOfBirth });

      res.redirect('/patient/profile?success=Profile updated');
    } catch (error) {
      console.error('[Patient] Update profile error:', error);
      res.redirect('/patient/profile?error=Failed to update profile');
    }
  },

  /**
   * GET /patient/upload - Show upload page
   */
  async showUpload(req, res) {
    try {
      const records = await patientService.getRecords(req.user.id);
      const files = await patientService.getFiles(req.user.id);

      res.render('patient/views/upload', {
        title: 'Upload Files',
        records,
        files,
        layout: 'shared/layout',
      });
    } catch (error) {
      console.error('[Patient] Upload page error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load upload page',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * POST /patient/upload - Handle file upload
   */
  handleUpload: [
    upload.single('file'),
    async (req, res) => {
      try {
        if (!req.file) {
          // Check referer to redirect back to same page
          const referer = req.get('Referer') || '/patient/upload';
          const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
          return res.redirect(`${redirectUrl}?error=No file selected`);
        }

        const { recordId, notes } = req.body;

        // Use auto-record creation if no record selected
        await patientService.uploadFileWithAutoRecord({
          patientId: req.user.id,
          recordId: recordId || null,
          filePath: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          notes: notes || null,
        });

        // Check referer to redirect back to same page
        const referer = req.get('Referer') || '/patient/upload';
        const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
        res.redirect(`${redirectUrl}?success=File uploaded`);
      } catch (error) {
        console.error('[Patient] Upload error:', error);
        const referer = req.get('Referer') || '/patient/upload';
        const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
        res.redirect(`${redirectUrl}?error=Failed to upload file`);
      }
    },
  ],
};

module.exports = patientController;
