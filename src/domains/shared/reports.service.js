/**
 * Reports Service
 * Handles PDF generation using pdfkit
 */
const PDFDocument = require('pdfkit');
const prisma = require('../../prisma');

const reportsService = {
    /**
     * Generate a PDF report for a patient
     */
    async generatePatientReport(res, patientId) {
        const patient = await prisma.user.findUnique({
            where: { id: patientId },
            include: {
                patientProfile: true,
                healthMeasurements: { orderBy: { createdAt: 'desc' }, take: 5 },
                recordsAsPatient: { include: { doctor: true }, orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });

        if (!patient) throw new Error('Patient not found');

        const doc = new PDFDocument({ margin: 50 });

        // Stream to response
        doc.pipe(res);

        // Header
        doc.fillColor('#1D7874').fontSize(20).text('Smart Medical Point', { align: 'center' });
        doc.fontSize(10).fillColor('#666').text('Patient Medical Summary', { align: 'center' });
        doc.moveDown();
        doc.strokeColor('#1D7874').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
        doc.moveDown(2);

        // Patient Info
        doc.fillColor('#2CA58D').fontSize(14).text('Patient Information');
        doc.moveDown(0.5);
        doc.fillColor('#333').fontSize(11);
        doc.text(`Name: ${patient.name}`);
        doc.text(`Email: ${patient.email}`);
        doc.text(`Phone: ${patient.patientProfile?.phone || 'N/A'}`);
        doc.text(`DOB: ${patient.patientProfile?.dateOfBirth ? new Date(patient.patientProfile.dateOfBirth).toLocaleDateString() : 'N/A'}`);
        doc.moveDown();

        // Latest Measurements
        if (patient.healthMeasurements.length > 0) {
            doc.fillColor('#2CA58D').fontSize(14).text('Recent Health Measurements');
            doc.moveDown(0.5);
            patient.healthMeasurements.forEach((m, i) => {
                doc.fillColor('#333').fontSize(10).text(
                    `${new Date(m.createdAt).toLocaleDateString()}: MUAC: ${m.muacValue}cm (${m.muacStatus}), Weight: ${m.weight}kg, BMI: ${m.bmi}`
                );
            });
            doc.moveDown();
        }

        // Recent Medical Records
        if (patient.recordsAsPatient.length > 0) {
            doc.fillColor('#2CA58D').fontSize(14).text('Recent Medical Records');
            doc.moveDown(0.5);
            patient.recordsAsPatient.forEach((r, i) => {
                doc.fillColor('#333').fontSize(11).text(`${new Date(r.createdAt).toLocaleDateString()} - Dr. ${r.doctor.name}`);
                doc.fontSize(10).fillColor('#666').text(`Notes: ${r.notes}`);
                doc.moveDown(0.5);
            });
        }

        // Footer
        doc.fontSize(8).fillColor('#999').text(
            `Generated on ${new Date().toLocaleString()} by Smart MediPoint Admin System`,
            50, 750, { align: 'center', width: 500 }
        );

        doc.end();
    },

    /**
     * Generate System Stats Report
     */
    async generateSystemReport(res) {
        const [userCount, appointmentCount, recordCount, criticalFlags] = await Promise.all([
            prisma.user.count(),
            prisma.appointment.count(),
            prisma.medicalRecord.count(),
            prisma.criticalCaseFlag.count({ where: { status: 'FLAGGED' } }),
        ]);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        doc.fillColor('#1D7874').fontSize(22).text('Smart MediPoint System Report', { align: 'center' });
        doc.moveDown(2);

        doc.fillColor('#333').fontSize(14).text('System Summary Statistics');
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Total Registered Users: ${userCount}`);
        doc.text(`Total Appointments Scheduled: ${appointmentCount}`);
        doc.text(`Total Medical Records: ${recordCount}`);
        doc.fillColor('#E74C3C').text(`Active Critical Cases: ${criticalFlags}`);
        doc.moveDown(2);

        // Footer
        doc.fontSize(8).fillColor('#999').text(
            `Confidential System Report - Generated on ${new Date().toLocaleString()}`,
            50, 750, { align: 'center', width: 500 }
        );

        doc.end();
    }
};

module.exports = reportsService;
