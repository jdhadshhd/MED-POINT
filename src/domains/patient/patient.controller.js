/**
 * Patient Controller
 * Handles patient HTTP requests
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const config = require('../../config/env');
const patientService = require('./patient.service');
const prisma = require('../../prisma');

/**
 * Check if database is connected
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Database] Connection check failed:', error.message);
    return false;
  }
}

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
      res.render('patient/views/portal', {
        layout: false,
        user: req.user,
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
      res.render('patient/views/portal', {
        layout: false,
        user: req.user,
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
      res.render('patient/views/portal', {
        layout: false,
        user: req.user,
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
      res.render('patient/views/portal', {
        layout: false,
        user: req.user,
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
      res.render('patient/views/portal', {
        layout: false,
        user: req.user,
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
    // Wrap multer to handle errors gracefully
    (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          console.error('[Upload] Multer error:', err.message);
          const referer = req.get('Referer') || '/patient/upload';
          const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
          return res.redirect(`${redirectUrl}?error=${encodeURIComponent(err.message)}`);
        }
        next();
      });
    },
    async (req, res) => {
      try {
        // Check database connection FIRST
        const dbConnected = await checkDatabaseConnection();
        if (!dbConnected) {
          // Delete uploaded file if DB is not available
          if (req.file) {
            const filePath = path.join(__dirname, '..', '..', '..', config.uploadDir, req.file.filename);
            try {
              fs.unlinkSync(filePath);
              console.log('[Upload] Deleted file due to DB unavailable:', req.file.filename);
            } catch (unlinkError) {
              console.error('[Upload] Failed to delete file:', unlinkError);
            }
          }
          const referer = req.get('Referer') || '/patient/upload';
          const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
          return res.redirect(`${redirectUrl}?error=Database is not available. Please try again later.`);
        }

        if (!req.file) {
          // Check referer to redirect back to same page
          const referer = req.get('Referer') || '/patient/upload';
          const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
          return res.redirect(`${redirectUrl}?error=No file selected`);
        }

        const { recordId, notes } = req.body;

        // Validate record type is provided
        if (!notes || notes.trim() === '') {
          // Delete uploaded file since record type is missing
          const filePath = path.join(__dirname, '..', '..', '..', config.uploadDir, req.file.filename);
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('[Upload] Failed to delete file:', unlinkError);
          }
          const referer = req.get('Referer') || '/patient/upload';
          const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
          return res.redirect(`${redirectUrl}?error=Please select a record type`);
        }

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
        
        // Delete uploaded file if database save failed
        if (req.file) {
          const filePath = path.join(__dirname, '..', '..', '..', config.uploadDir, req.file.filename);
          try {
            fs.unlinkSync(filePath);
            console.log('[Upload] Deleted file due to DB error:', req.file.filename);
          } catch (unlinkError) {
            console.error('[Upload] Failed to delete file:', unlinkError);
          }
        }
        
        const referer = req.get('Referer') || '/patient/upload';
        const redirectUrl = referer.includes('dashboard') ? '/patient/dashboard' : '/patient/upload';
        res.redirect(`${redirectUrl}?error=Failed to upload file - database error`);
      }
    },
  ],

  /**
   * POST /patient/measurements - Save health measurements
   */
  async saveMeasurements(req, res) {
    try {
      const { weight, height, muac, notes } = req.body;

      if (!weight || !height || !muac) {
        return res.status(400).json({ error: 'Weight, height, and MUAC are required' });
      }

      const measurement = await patientService.saveHealthMeasurement({
        patientId: req.user.id,
        weight: parseFloat(weight),
        height: parseFloat(height),
        muacValue: parseFloat(muac),
        notes: notes || null,
      });

      res.json({ success: true, measurement });
    } catch (error) {
      console.error('[Patient] Save measurements error:', error);
      res.status(500).json({ error: 'Failed to save measurements' });
    }
  },

  /**
   * GET /patient/measurements - Get latest measurement
   */
  async getLatestMeasurement(req, res) {
    try {
      const measurement = await patientService.getLatestMeasurement(req.user.id);
      res.json({ measurement });
    } catch (error) {
      console.error('[Patient] Get measurement error:', error);
      res.status(500).json({ error: 'Failed to get measurements' });
    }
  },

  /**
   * GET /patient/measurements/history - Get measurement history
   */
  async getMeasurementHistory(req, res) {
    try {
      const measurements = await patientService.getMeasurementHistory(req.user.id);
      res.json({ measurements });
    } catch (error) {
      console.error('[Patient] Get measurement history error:', error);
      res.status(500).json({ error: 'Failed to get measurement history' });
    }
  },

  /**
   * GET /patient/api/doctors - Get list of doctors
   */
  async getDoctors(req, res) {
    try {
      const doctors = await patientService.getDoctors();
      res.json({ doctors });
    } catch (error) {
      console.error('[Patient] Get doctors error:', error);
      res.status(500).json({ error: 'Failed to get doctors' });
    }
  },

  // ===== DIET PLAN ENDPOINTS =====

  /**
   * GET /patient/diet-plan - Get active diet plan
   */
  async getActiveDietPlan(req, res) {
    try {
      const plan = await patientService.getActiveDietPlan(req.user.id);
      res.json({ plan });
    } catch (error) {
      console.error('[Patient] Get diet plan error:', error);
      res.status(500).json({ error: 'Failed to get diet plan' });
    }
  },

  /**
   * GET /patient/diet-plan/history - Get diet plan history
   */
  async getDietPlanHistory(req, res) {
    try {
      const plans = await patientService.getDietPlanHistory(req.user.id);
      res.json({ plans });
    } catch (error) {
      console.error('[Patient] Get diet plan history error:', error);
      res.status(500).json({ error: 'Failed to get diet plan history' });
    }
  },

  /**
   * GET /patient/diet-plan/download - Download diet plan as PDF
   */
  async downloadDietPlan(req, res) {
    try {
      const plan = await patientService.getActiveDietPlan(req.user.id);
      
      if (!plan) {
        return res.status(404).json({ error: 'No active diet plan found' });
      }

      const items = plan.itemsArray || [];
      const date = new Date(plan.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${Date.now()}.pdf"`);
      
      // Pipe PDF to response
      doc.pipe(res);

      // Header
      doc.fontSize(24).fillColor('#28a745').text('Smart MediPoint', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(20).fillColor('#333').text(plan.title, { align: 'center' });
      doc.fontSize(12).fillColor('#666').text('Personalized Nutrition Plan', { align: 'center' });
      
      // Divider line
      doc.moveDown(1);
      doc.strokeColor('#28a745').lineWidth(2)
         .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Patient Info Box
      doc.fontSize(12).fillColor('#333');
      doc.font('Helvetica-Bold').text('Patient: ', { continued: true })
         .font('Helvetica').text(req.user.name || 'Patient');
      doc.font('Helvetica-Bold').text('Designed By: ', { continued: true })
         .font('Helvetica').text(plan.designedBy);
      doc.font('Helvetica-Bold').text('Assigned By: ', { continued: true })
         .font('Helvetica').text(`Dr. ${plan.doctor?.name || 'Doctor'}`);
      doc.font('Helvetica-Bold').text('Date: ', { continued: true })
         .font('Helvetica').text(date);
      
      if (plan.description) {
        doc.font('Helvetica-Bold').text('Description: ', { continued: true })
           .font('Helvetica').text(plan.description);
      }

      doc.moveDown(1.5);

      // Diet Plan Guidelines
      doc.fontSize(16).fillColor('#28a745').font('Helvetica-Bold')
         .text('Diet Plan Guidelines');
      doc.strokeColor('#ddd').lineWidth(1)
         .moveTo(50, doc.y + 5).lineTo(300, doc.y + 5).stroke();
      doc.moveDown(1);

      // Items list
      doc.fontSize(12).fillColor('#333').font('Helvetica');
      items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`, { indent: 20 });
        doc.moveDown(0.5);
      });

      if (items.length === 0) {
        doc.text('No specific items defined', { indent: 20 });
      }

      // Footer
      doc.moveDown(2);
      doc.strokeColor('#ddd').lineWidth(1)
         .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#999')
         .text('Generated by Smart MediPoint Healthcare System', { align: 'center' })
         .text('This plan should be followed under medical supervision.', { align: 'center' })
         .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('[Patient] Download diet plan error:', error);
      res.status(500).json({ error: 'Failed to download diet plan' });
    }
  },
};

module.exports = patientController;
