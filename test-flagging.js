const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const doctorService = require('./src/domains/doctor/doctor.service');

async function testFlagging() {
    console.log('🧪 Testing Critical Case Flagging...');

    try {
        // 1. Get a test doctor and patient
        const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });

        if (!doctor || !patient) {
            console.error('❌ Could not find test doctor or patient');
            return;
        }

        console.log(`Using Doctor: ${doctor.email}, Patient: ${patient.email}`);

        // 2. Create a medical record with RED MUAC status
        console.log('Creating medical record with RED MUAC status...');
        const record = await doctorService.createRecord({
            doctorId: doctor.id,
            patientId: patient.id,
            notes: 'Test record for auto-flagging',
            muacValue: 10.5,
            muacStatus: 'RED',
        });

        console.log('✅ Record created:', record.id);

        // 3. Check if a CriticalCaseFlag was created
        const flag = await prisma.criticalCaseFlag.findFirst({
            where: {
                patientId: patient.id,
                status: 'FLAGGED',
            },
        });

        if (flag) {
            console.log('✅ SUCCESS: Critical Case Flag was created!');
            console.log('Flag Details:', JSON.stringify(flag, null, 2));
        } else {
            console.error('❌ FAILURE: Critical Case Flag was NOT created');
        }

        // 4. Cleanup (optional, but let's keep it for now)
        // await prisma.criticalCaseFlag.deleteMany({ where: { patientId: patient.id } });
        // await prisma.medicalRecord.delete({ where: { id: record.id } });

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFlagging();
