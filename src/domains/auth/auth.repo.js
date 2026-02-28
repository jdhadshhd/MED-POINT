/**
 * Auth Repository
 * Handles user database queries
 */
const prisma = require('../../prisma.js');

const authRepo = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
  },

  /**
   * Create a new user
   */
  async create(data) {
    const createData = {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || 'PATIENT',
    };

    // Add profile based on role
    if (data.role === 'DOCTOR' && data.specialty) {
      createData.doctorProfile = {
        create: {
          specialty: data.specialty,
          doctorCode: data.doctorCode,
        },
      };
    } else if (data.role === 'PATIENT' || !data.role) {
      createData.patientProfile = {
        create: {
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
        },
      };
    }

    return prisma.user.create({
      data: createData,
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
  },

  /**
   * Update user password
   */
  async updatePassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },
};

module.exports = authRepo;
