/**
 * Patient Controller
 * Handles patient HTTP requests
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
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

      // Generate HTML content for PDF-like display
      const items = plan.itemsArray || [];
      const itemsHtml = items.map(item => `<li style="margin: 8px 0; font-size: 14px;">${item}</li>`).join('');
      const date = new Date(plan.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Diet Plan - ${plan.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { color: #28a745; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    h1 { color: #333; font-size: 28px; margin-bottom: 5px; }
    .subtitle { color: #666; font-size: 14px; }
    .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .plan-items { margin-top: 20px; }
    .plan-items h3 { color: #28a745; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    .plan-items ul { padding-left: 25px; }
    .plan-items li { margin: 12px 0; line-height: 1.6; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏥 Smart MediPoint</div>
    <h1>${plan.title}</h1>
    <p class="subtitle">Personalized Nutrition Plan</p>
  </div>

  <div class="info-box">
    <div class="info-row">
      <span class="label">Patient:</span>
      <span class="value">${req.user.name || 'Patient'}</span>
    </div>
    <div class="info-row">
      <span class="label">Designed By:</span>
      <span class="value">${plan.designedBy}</span>
    </div>
    <div class="info-row">
      <span class="label">Assigned By:</span>
      <span class="value">Dr. ${plan.doctor?.name || 'Doctor'}</span>
    </div>
    <div class="info-row">
      <span class="label">Date:</span>
      <span class="value">${date}</span>
    </div>
    ${plan.description ? `
    <div class="info-row">
      <span class="label">Description:</span>
      <span class="value">${plan.description}</span>
    </div>
    ` : ''}
  </div>

  <div class="plan-items">
    <h3>📋 Diet Plan Guidelines</h3>
    <ul>
      ${itemsHtml || '<li>No specific items defined</li>'}
    </ul>
  </div>

  <div class="footer">
    <p>Generated by Smart MediPoint Healthcare System</p>
    <p>This plan should be followed under medical supervision.</p>
    <p>Date printed: ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
      `;

      // Send as HTML that can be printed/saved as PDF by browser
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="diet-plan-${Date.now()}.html"`);
      res.send(html);
    } catch (error) {
      console.error('[Patient] Download diet plan error:', error);
      res.status(500).json({ error: 'Failed to download diet plan' });
    }
  },
};

module.exports = patientController;
