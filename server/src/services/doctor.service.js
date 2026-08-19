const { prisma } = require('../config/prisma');

// Doctors are users with role 'doctor' linked to a doctor profile.

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

module.exports = { listActiveDoctors, findDoctorById, findDoctorByUserId };
