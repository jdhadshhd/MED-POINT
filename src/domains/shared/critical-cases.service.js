/**
 * Critical Cases Service
 * Handles business logic for flagging and unflagging critical cases
 */
const criticalCasesRepo = require('./critical-cases.repo');
const notificationsService = require('../notifications/notifications.service');

const criticalCasesService = {
    /**
     * Check if a patient should be flagged as critical based on MUAC status
     */
    async checkAndFlag(patientId, doctorId, muacStatus) {
        if (muacStatus === 'RED') {
            const activeFlag = await criticalCasesRepo.findActiveFlag(patientId);

            if (!activeFlag) {
                const flag = await criticalCasesRepo.createFlag({
                    patientId,
                    doctorId,
                    reason: 'Severe Malnutrition (MUAC < 11.5cm)',
                    auto: true,
                });

                // Notify Doctor
                await notificationsService.create({
                    userId: doctorId,
                    type: 'CRITICAL_CASE',
                    message: `Patient flag triggered: Severe Malnutrition detected.`,
                });

                // Notify Admins
                await notificationsService.createForRole('ADMIN', {
                    type: 'CRITICAL_CASE',
                    message: `New critical case flagged for patient ${patientId}.`,
                });

                return flag;
            }
        }
        return null;
    },

    /**
     * Manually resolve a critical case flag
     */
    async resolveFlag(flagId, adminOrDoctorId, reason) {
        return criticalCasesRepo.resolveFlag(flagId, reason);
    },

    /**
     * Get active critical cases for doctor
     */
    async getDoctorCriticalCases(doctorId) {
        return criticalCasesRepo.getActiveFlagsForDoctor(doctorId);
    },

    /**
     * Get all active critical cases for admin
     */
    async getAllActiveCases() {
        return criticalCasesRepo.getActiveFlags();
    }
};

module.exports = criticalCasesService;
