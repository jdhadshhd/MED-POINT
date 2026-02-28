/**
 * Doctor Routes
 */
const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');

// All doctor routes require authentication and DOCTOR role
router.use(requireAuth);
router.use(requireRole('DOCTOR'));

// Dashboard
router.get('/dashboard', doctorController.showDashboard);

// Get all critical patients for this doctor (API)
router.get('/critical-patients', doctorController.getCriticalPatients);

// Flag all critical cases (send notification to each)
router.post('/flag-critical', doctorController.flagCriticalCases);

// Portal (full doctor portal page)
router.get('/portal', doctorController.showPortal);

// Patients
router.get('/patients', doctorController.showPatients);

// Appointments
router.get('/appointments', doctorController.showAppointments);
router.post('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Medical Records
router.get('/records', doctorController.showRecords);
router.post('/records', doctorController.createRecord);

// --- JSON API Endpoints ---
router.get('/api/info', doctorController.getDoctorInfoApi);
router.get('/api/stats', doctorController.getStatsApi);
router.get('/api/patients', doctorController.getPatientsApi);
router.get('/api/appointments', doctorController.getAppointmentsApi);
router.post('/api/patients', doctorController.createPatientApi);
router.post('/api/appointments', doctorController.createAppointmentApi);
router.post('/api/appointments/:id/status', doctorController.updateAppointmentStatusApi);
router.get('/api/notifications', doctorController.getNotificationsApi);
router.post('/api/notifications/read-all', doctorController.markAllNotificationsReadApi);

module.exports = router;
