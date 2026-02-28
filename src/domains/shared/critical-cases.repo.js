/**
 * Critical Cases Repository
 * Handles database operations for critical case flags
 */
const prisma = require('../../prisma');

const criticalCasesRepo = {
    /**
     * Create a new critical case flag
     */
    async createFlag({ patientId, doctorId, reason, auto = false }) {
        return prisma.criticalCaseFlag.create({
            data: {
                patientId,
                doctorId,
                reason,
                auto,
                status: 'FLAGGED',
            },
        });
    },

    /**
     * Find an active flag for a patient
     */
    async findActiveFlag(patientId) {
        return prisma.criticalCaseFlag.findFirst({
            where: {
                patientId,
                status: 'FLAGGED',
            },
        });
    },

    /**
     * Resolve (unflag) a critical case
     */
    async resolveFlag(flagId, reason) {
        return prisma.criticalCaseFlag.update({
            where: { id: flagId },
            data: {
                status: 'UNFLAGGED',
                unflaggedAt: new Date(),
                reason: reason ? `Resolved: ${reason}` : 'Resolved by system/doctor',
            },
        });
    },

    /**
     * Get all active flags
     */
    async getActiveFlags() {
        return prisma.criticalCaseFlag.findMany({
            where: { status: 'FLAGGED' },
            include: {
                patient: {
                    select: { name: true, email: true }
                },
                doctor: {
                    select: { name: true }
                },
            },
            orderBy: { flaggedAt: 'desc' },
        });
    },

    /**
     * Get active flags for a specific doctor
     */
    async getActiveFlagsForDoctor(doctorId) {
        return prisma.criticalCaseFlag.findMany({
            where: {
                doctorId,
                status: 'FLAGGED',
            },
            include: {
                patient: {
                    select: { name: true, email: true, patientProfile: true }
                },
            },
            orderBy: { flaggedAt: 'desc' },
        });
    }
};

module.exports = criticalCasesRepo;
