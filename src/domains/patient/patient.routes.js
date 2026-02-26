/**
 * Patient Routes
 */
const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const { uploadLimiter } = require('../../middlewares/rateLimiter');

// All patient routes require authentication and PATIENT role
router.use(requireAuth);
router.use(requireRole('PATIENT'));

// Dashboard
router.get('/dashboard', patientController.showDashboard);

// Portal (full patient portal page)
router.get('/portal', patientController.showPortal);

// Appointments
router.get('/appointments', patientController.showAppointments);
router.post('/appointments', patientController.createAppointment);
router.post('/appointments/:id/cancel', patientController.cancelAppointment);

// Medical Records
router.get('/records', patientController.showRecords);

// Profile
router.get('/profile', patientController.showProfile);
router.post('/profile', patientController.updateProfile);

// Upload
router.get('/upload', patientController.showUpload);
router.post('/upload', uploadLimiter, patientController.handleUpload);

// Health Measurements
router.get('/measurements', patientController.getLatestMeasurement);
router.get('/measurements/history', patientController.getMeasurementHistory);
router.post('/measurements', patientController.saveMeasurements);

// Diet Plans
router.get('/diet-plan', patientController.getActiveDietPlan);
router.get('/diet-plan/history', patientController.getDietPlanHistory);
router.get('/diet-plan/download', patientController.downloadDietPlan);

// API - Get doctors
router.get('/api/doctors', patientController.getDoctors);

module.exports = router;
