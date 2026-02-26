/**
 * Prisma Seed Script
 * Creates default users for testing
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
  const patientPasswordHash = await bcrypt.hash('patient123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medipoint.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@medipoint.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created Admin:', admin.email);

  // Create Doctor User
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@medipoint.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Johnson',
      email: 'doctor@medipoint.com',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          specialty: 'General Medicine',
          doctorCode: 'DOC001',
        },
      },
    },
  });
  console.log('✅ Created Doctor:', doctor.email);

  // Create Patient User
  const patient = await prisma.user.upsert({
    where: { email: 'patient@medipoint.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'patient@medipoint.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      patientProfile: {
        create: {
          phone: '+1234567890',
          dateOfBirth: new Date('1990-05-15'),
        },
      },
    },
  });
  console.log('✅ Created Patient:', patient.email);

  // Create a sample appointment
  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'WAITING',
      notes: 'Initial consultation',
    },
  });
  console.log('✅ Created sample appointment');

  // Create a sample medical record
  const record = await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      notes: 'Regular checkup - patient is in good health.',
      muacValue: 25.5,
      muacStatus: 'GREEN',
    },
  });
  console.log('✅ Created sample medical record');

  // Create a sample diet plan
  await prisma.dietPlan.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      title: 'High-Calorie Recovery Plan',
      description: 'Personalized nutrition plan for recovery',
      designedBy: 'Nutritionist Sara',
      items: JSON.stringify([
        '3 main meals + 2 snacks daily',
        'Fortified porridge for breakfast',
        'Peanut-based supplement daily',
        'Vitamin A & Iron supplements',
        'Increased fluid intake'
      ]),
      isActive: true,
    },
  });
  console.log('✅ Created sample diet plan');

  // Create a sample support ticket
  await prisma.supportTicket.create({
    data: {
      userId: patient.id,
      title: 'Unable to reschedule appointment',
      description: 'I need help rescheduling my appointment for next week.',
      priority: 'MEDIUM',
      status: 'OPEN',
    },
  });
  console.log('✅ Created sample support ticket');

  console.log('\n📋 Default Login Credentials:');
  console.log('================================');
  console.log('Admin:   admin@medipoint.com / admin123');
  console.log('Doctor:  doctor@medipoint.com / doctor123');
  console.log('Patient: patient@medipoint.com / patient123');
  console.log('================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
