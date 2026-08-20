const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');

// Doctors are users with role 'doctor' linked to a doctor profile.

// Admin-only: create a user account (role=doctor) + its doctor profile.
// Throws 'EMAIL_EXISTS' if the email is already taken.
async function createDoctor({ full_name, email, password, specialty, bio }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('EMAIL_EXISTS');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName: full_name, email, passwordHash, role: 'doctor', phone: null },
  });
  const doctor = await prisma.doctor.create({
    data: { userId: user.id, specialty, bio: bio || null, isActive: true },
  });

  return {
    doctor_id: doctor.id,
    user_id: user.id,
    full_name,
    email,
    specialty,
    bio: bio || null,
  };
}

async function listActiveDoctors() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { user: { fullName: 'asc' } },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  return doctors.map((d) => ({
    doctor_id: d.id,
    specialty: d.specialty,
    bio: d.bio,
    is_active: d.isActive,
    user_id: d.userId,
    full_name: d.user.fullName,
    email: d.user.email,
  }));
}

async function findDoctorById(doctorId) {
  const d = await prisma.doctor.findFirst({
    where: { id: doctorId, isActive: true },
    select: { id: true },
  });
  return d || null;
}

async function findDoctorByUserId(userId) {
  const d = await prisma.doctor.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  return d || null;
}

module.exports = { listActiveDoctors, findDoctorById, findDoctorByUserId, createDoctor };
