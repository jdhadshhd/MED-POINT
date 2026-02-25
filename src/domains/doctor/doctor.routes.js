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

// Patients
router.get('/patients', doctorController.showPatients);

// Appointments
router.get('/appointments', doctorController.showAppointments);
router.post('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Medical Records
router.get('/records', doctorController.showRecords);
router.post('/records', doctorController.createRecord);

module.exports = router;
