/**
 * Database Seed Script
 * Populates the database with realistic sample data
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.criticalCaseFlag.deleteMany();
  await prisma.healthMeasurement.deleteMany();
  await prisma.medicalFile.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.dietPlan.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  // ==================== USERS ====================
  console.log('👤 Creating users...');

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@medipoint.com',
      passwordHash: hash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const doctor1 = await prisma.user.create({
    data: {
      name: 'Dr. Ahmed Abu Dabbous',
      email: 'ahmed@medipoint.com',
      passwordHash: hash,
      role: 'DOCTOR',
      status: 'ACTIVE',
    },
  });

  const doctor2 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah@medipoint.com',
      passwordHash: hash,
      role: 'DOCTOR',
      status: 'ACTIVE',
    },
  });

  const patient1 = await prisma.user.create({
    data: {
      name: 'Dareen Sharief',
      email: 'dareen@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      name: 'Sara Mansour',
      email: 'sara@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const patient3 = await prisma.user.create({
    data: {
      name: 'Mohammed Hassan',
      email: 'mohammed@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const patient4 = await prisma.user.create({
    data: {
      name: 'Fatima Ahmed',
      email: 'fatima@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const patient5 = await prisma.user.create({
    data: {
      name: 'Ali Mahmoud',
      email: 'ali@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const patient6 = await prisma.user.create({
    data: {
      name: 'Layla Ibrahim',
      email: 'layla@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const patient7 = await prisma.user.create({
    data: {
      name: 'Omar Khalil',
      email: 'omar@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });

  const pendingDoctor = await prisma.user.create({
    data: {
      name: 'Dr. Nour Hamed',
      email: 'nour@medipoint.com',
      passwordHash: hash,
      role: 'DOCTOR',
      status: 'PENDING',
    },
  });

  const pendingPatient = await prisma.user.create({
    data: {
      name: 'Rami Saleh',
      email: 'rami@patient.com',
      passwordHash: hash,
      role: 'PATIENT',
      status: 'PENDING',
    },
  });

  console.log(`   ✅ Created ${11} users (1 admin, 3 doctors, 7 patients, 2 pending)`);

  // ==================== DOCTOR PROFILES ====================
  console.log('🩺 Creating doctor profiles...');

  await prisma.doctorProfile.createMany({
    data: [
      { userId: doctor1.id, specialty: 'General Practitioner', doctorCode: 'DOC001' },
      { userId: doctor2.id, specialty: 'Nutritionist', doctorCode: 'DOC002' },
      { userId: pendingDoctor.id, specialty: 'Pediatrician', doctorCode: 'DOC003' },
    ],
  });

  // ==================== PATIENT PROFILES ====================
  console.log('🏥 Creating patient profiles...');

  await prisma.patientProfile.createMany({
    data: [
      { userId: patient1.id, phone: '0591234567', dateOfBirth: new Date('1997-05-15') },
      { userId: patient2.id, phone: '0597654321', dateOfBirth: new Date('1993-08-22') },
      { userId: patient3.id, phone: '0591112233', dateOfBirth: new Date('1980-01-10') },
      { userId: patient4.id, phone: '0594445566', dateOfBirth: new Date('1990-11-30') },
      { userId: patient5.id, phone: '0597778899', dateOfBirth: new Date('1996-03-25') },
      { userId: patient6.id, phone: '0592223344', dateOfBirth: new Date('1988-07-14') },
      { userId: patient7.id, phone: '0595556677', dateOfBirth: new Date('2000-12-01') },
    ],
  });

  // ==================== APPOINTMENTS ====================
  console.log('📅 Creating appointments...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await Promise.all([
    // Today's appointments for doctor1
    prisma.appointment.create({
      data: {
        patientId: patient1.id, doctorId: doctor1.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        status: 'WAITING', notes: 'General Consultation',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient2.id, doctorId: doctor1.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        status: 'WAITING', notes: 'Nutrition Review',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient3.id, doctorId: doctor1.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
        status: 'URGENT', notes: 'Emergency Checkup',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient5.id, doctorId: doctor1.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        status: 'WAITING', notes: 'Initial Assessment',
      },
    }),
    // Past appointments
    prisma.appointment.create({
      data: {
        patientId: patient1.id, doctorId: doctor1.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 10, 0),
        status: 'COMPLETED', notes: 'Follow-up',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient4.id, doctorId: doctor1.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 30),
        status: 'COMPLETED', notes: 'Nutritional Assessment',
      },
    }),
    // Today's appointments for doctor2
    prisma.appointment.create({
      data: {
        patientId: patient6.id, doctorId: doctor2.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
        status: 'WAITING', notes: 'Nutrition Consultation',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient7.id, doctorId: doctor2.id,
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        status: 'WAITING', notes: 'Diet Plan Review',
      },
    }),
  ]);

  console.log(`   ✅ Created ${appointments.length} appointments`);

  // ==================== MEDICAL RECORDS ====================
  console.log('📋 Creating medical records...');

  const records = await Promise.all([
    prisma.medicalRecord.create({
      data: {
        patientId: patient1.id, doctorId: doctor1.id,
        notes: 'Patient shows signs of acute malnutrition. MUAC measurement critical at 10.8cm. Prescribed iron supplements and vitamin D.',
        muacValue: 10.8, muacStatus: 'RED',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patient2.id, doctorId: doctor1.id,
        notes: 'Follow-up after nutritional therapy. MUAC improved to 12.8cm. Continue current treatment plan.',
        muacValue: 12.8, muacStatus: 'YELLOW',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patient3.id, doctorId: doctor1.id,
        notes: 'Severe malnutrition with anemia. MUAC at 11.2cm. Started on iron and vitamin B12.',
        muacValue: 11.2, muacStatus: 'RED',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patient4.id, doctorId: doctor1.id,
        notes: 'Nutritional deficit noted. MUAC at 14.0cm, in yellow zone. Dietary counseling provided.',
        muacValue: 14.0, muacStatus: 'YELLOW',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patient5.id, doctorId: doctor1.id,
        notes: 'New patient intake. MUAC at 15.2cm, healthy range. General screening completed.',
        muacValue: 15.2, muacStatus: 'GREEN',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        patientId: patient6.id, doctorId: doctor2.id,
        notes: 'Initial consultation. Patient recovering from illness. MUAC at 13.5cm.',
        muacValue: 13.5, muacStatus: 'YELLOW',
      },
    }),
  ]);

  console.log(`   ✅ Created ${records.length} medical records`);

  // ==================== CRITICAL CASE FLAGS ====================
  console.log('🚨 Creating critical case flags...');

  await prisma.criticalCaseFlag.createMany({
    data: [
      { patientId: patient1.id, doctorId: doctor1.id, reason: 'MUAC critical at 10.8cm', status: 'FLAGGED', auto: true },
      { patientId: patient3.id, doctorId: doctor1.id, reason: 'Severe malnutrition - MUAC 11.2cm', status: 'FLAGGED', auto: true },
    ],
  });

  // ==================== HEALTH MEASUREMENTS ====================
  console.log('📊 Creating health measurements...');

  await prisma.healthMeasurement.createMany({
    data: [
      { patientId: patient1.id, weight: 45.5, height: 165, muacValue: 10.8, muacStatus: 'RED', bmi: 16.7, notes: 'Critical - needs immediate intervention' },
      { patientId: patient2.id, weight: 58.0, height: 170, muacValue: 12.8, muacStatus: 'YELLOW', bmi: 20.1, notes: 'Improving' },
      { patientId: patient3.id, weight: 60.0, height: 175, muacValue: 11.2, muacStatus: 'RED', bmi: 19.6, notes: 'Critical case' },
      { patientId: patient4.id, weight: 48.0, height: 160, muacValue: 14.0, muacStatus: 'YELLOW', bmi: 18.8, notes: 'Under observation' },
      { patientId: patient5.id, weight: 70.0, height: 180, muacValue: 15.2, muacStatus: 'GREEN', bmi: 21.6, notes: 'Healthy' },
      { patientId: patient6.id, weight: 55.0, height: 163, muacValue: 13.5, muacStatus: 'YELLOW', bmi: 20.7, notes: 'Recovering' },
      { patientId: patient7.id, weight: 65.0, height: 172, muacValue: 14.8, muacStatus: 'GREEN', bmi: 22.0, notes: 'Normal range' },
    ],
  });

  // ==================== DIET PLANS ====================
  console.log('🥗 Creating diet plans...');

  await prisma.dietPlan.createMany({
    data: [
      {
        patientId: patient1.id, doctorId: doctor1.id,
        title: 'High-Calorie Recovery Plan',
        description: 'Designed for nutritional recovery from severe malnutrition',
        designedBy: 'Dr. Ahmed Abu Dabbous',
        items: JSON.stringify([
          { meal: 'Breakfast', items: 'Eggs, bread, cheese, milk', calories: 500 },
          { meal: 'Lunch', items: 'Rice, chicken, vegetables, yogurt', calories: 700 },
          { meal: 'Dinner', items: 'Lentil soup, bread, salad', calories: 500 },
          { meal: 'Snacks', items: 'Nuts, dates, protein shake', calories: 400 },
        ]),
        isActive: true,
      },
      {
        patientId: patient3.id, doctorId: doctor1.id,
        title: 'Iron-Rich Recovery Plan',
        description: 'Focus on iron-rich foods for anemia recovery',
        designedBy: 'Dr. Ahmed Abu Dabbous',
        items: JSON.stringify([
          { meal: 'Breakfast', items: 'Spinach omelette, orange juice', calories: 450 },
          { meal: 'Lunch', items: 'Red meat, lentils, green salad', calories: 650 },
          { meal: 'Dinner', items: 'Fish, brown rice, cooked vegetables', calories: 550 },
        ]),
        isActive: true,
      },
    ],
  });

  // ==================== SUPPORT TICKETS ====================
  console.log('🎫 Creating support tickets...');

  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: patient1.id, title: 'Cannot access my medical records',
      description: 'I am unable to view my medical records from last month. The page shows a loading error.',
      priority: 'HIGH', status: 'OPEN',
    },
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      userId: patient2.id, title: 'Appointment rescheduling request',
      description: 'I need to reschedule my appointment from March 20 to March 25 due to personal reasons.',
      priority: 'MEDIUM', status: 'IN_PROGRESS',
    },
  });

  const ticket3 = await prisma.supportTicket.create({
    data: {
      userId: doctor1.id, title: 'Patient data export not working',
      description: 'The export function for patient data returns an empty file.',
      priority: 'LOW', status: 'RESOLVED',
    },
  });

  // Ticket messages
  await prisma.ticketMessage.createMany({
    data: [
      { ticketId: ticket2.id, senderId: patient2.id, message: 'Please reschedule my appointment to March 25th.' },
      { ticketId: ticket2.id, senderId: admin.id, message: 'Sure, I have rescheduled your appointment. Check your notifications.' },
      { ticketId: ticket3.id, senderId: doctor1.id, message: 'Export button gives empty CSV.' },
      { ticketId: ticket3.id, senderId: admin.id, message: 'This has been fixed in the latest update. Please try again.' },
    ],
  });

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating notifications...');

  await prisma.notification.createMany({
    data: [
      { userId: doctor1.id, type: 'APPOINTMENT_NEW', message: 'New appointment scheduled by Dareen Sharief' },
      { userId: doctor1.id, type: 'CRITICAL_CASE', message: 'Critical MUAC detected for patient Dareen Sharief (10.8cm)' },
      { userId: doctor1.id, type: 'APPOINTMENT_NEW', message: 'New appointment scheduled by Mohammed Hassan' },
      { userId: doctor1.id, type: 'CRITICAL_CASE', message: 'Critical MUAC detected for patient Mohammed Hassan (11.2cm)' },
      { userId: doctor1.id, type: 'APPOINTMENT_NEW', message: 'New appointment scheduled by Ali Mahmoud' },
      { userId: doctor2.id, type: 'APPOINTMENT_NEW', message: 'New appointment scheduled by Layla Ibrahim' },
      { userId: doctor2.id, type: 'APPOINTMENT_NEW', message: 'New appointment scheduled by Omar Khalil' },
      { userId: patient1.id, type: 'APPOINTMENT_STATUS', message: 'Your appointment has been confirmed' },
      { userId: patient2.id, type: 'APPOINTMENT_STATUS', message: 'Your appointment has been rescheduled' },
      { userId: admin.id, type: 'TICKET_NEW', message: 'New support ticket: Cannot access my medical records' },
      { userId: admin.id, type: 'TICKET_NEW', message: 'New support ticket: Appointment rescheduling request' },
    ],
  });

  // ==================== FAQs ====================
  console.log('❓ Creating FAQs...');

  await prisma.fAQ.createMany({
    data: [
      { question: 'How do I book an appointment?', answer: 'Go to the Appointments page from your dashboard and click "New Appointment". Select your preferred doctor, date, and time.', category: 'Appointments' },
      { question: 'What is MUAC?', answer: 'MUAC (Mid-Upper Arm Circumference) is a measurement used to assess nutritional status. Green (>13.5cm) means healthy, Yellow (12.5-13.5cm) means moderate risk, Red (<12.5cm) means severe malnutrition.', category: 'Medical' },
      { question: 'How can I view my medical records?', answer: 'Navigate to the Medical Records section in your patient dashboard. All records from your consultations will be displayed there.', category: 'Records' },
      { question: 'Can I change my password?', answer: 'Yes, go to Settings from your dashboard and click on "Change Password". Enter your current password and then your new password.', category: 'Account' },
      { question: 'How do I contact support?', answer: 'You can create a support ticket from the Support page. Our team typically responds within 24 hours.', category: 'Support' },
      { question: 'Is my data secure?', answer: 'Yes, all data is encrypted and stored securely. We follow industry-standard security practices to protect your information.', category: 'Security' },
    ],
  });

  // ==================== SETTINGS ====================
  console.log('⚙️  Creating settings...');

  await prisma.setting.createMany({
    data: [
      { key: 'siteName', value: JSON.stringify('Smart MediPoint') },
      { key: 'emailNotifications', value: JSON.stringify(true) },
      { key: 'autoApproveDoctors', value: JSON.stringify(false) },
      { key: 'maintenanceMode', value: JSON.stringify(false) },
      { key: 'themeColor', value: JSON.stringify('#1D7874') },
      { key: 'itemsPerPage', value: JSON.stringify(10) },
    ],
  });

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Database seeded successfully!\n');
  console.log('📋 Summary:');
  console.log('   Users:              11 (1 admin, 3 doctors, 7 patients)');
  console.log('   Doctor profiles:     3');
  console.log('   Patient profiles:    7');
  console.log('   Appointments:        8 (4 today, 2 past, 2 for dr2)');
  console.log('   Medical records:     6');
  console.log('   Critical flags:      2');
  console.log('   Health measurements: 7');
  console.log('   Diet plans:          2');
  console.log('   Support tickets:     3');
  console.log('   Ticket messages:     4');
  console.log('   Notifications:      11');
  console.log('   FAQs:                6');
  console.log('   Settings:            6');
  console.log('\n🔑 Login credentials (all passwords: password123):');
  console.log('   Admin:   admin@medipoint.com');
  console.log('   Doctor:  ahmed@medipoint.com (DOC001)');
  console.log('   Doctor:  sarah@medipoint.com (DOC002)');
  console.log('   Patient: dareen@patient.com');
  console.log('   Patient: sara@patient.com');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
