const { prisma } = require('../config/prisma');

// Appointment data access via Prisma. Results are serialized to a flat
// snake_case shape so the frontend contract is preserved.

const include = {
  patient: { select: { id: true, fullName: true } },
  doctor: { include: { user: { select: { id: true, fullName: true } } } },
};

function serialize(a) {
  return {
    id: a.id,
    appointment_at: a.appointmentAt,
    reason: a.reason,
    status: a.status,
    notes: a.notes,
    created_at: a.createdAt,
    patient_id: a.patientId,
    patient_name: a.patient ? a.patient.fullName : null,
    doctor_id: a.doctorId,
    doctor_name: a.doctor ? a.doctor.user.fullName : null,
    specialty: a.doctor ? a.doctor.specialty : null,
  };
}

async function hasConflict(doctorId, appointmentAt, excludeId = null) {
  const where = {
    doctorId,
    appointmentAt,
    status: { not: 'cancelled' },
  };
  if (excludeId) where.id = { not: excludeId };
  const found = await prisma.appointment.findFirst({ where });
  return !!found;
}

async function createAppointment({ patientId, doctorId, appointmentAt, reason }) {
  const created = await prisma.appointment.create({
    data: { patientId, doctorId, appointmentAt: new Date(appointmentAt), reason },
    include,
  });
  return serialize(created);
}

async function getAppointmentById(id) {
  const a = await prisma.appointment.findUnique({ where: { id }, include });
  return a ? serialize(a) : null;
}

async function listAppointmentsForPatient(patientId) {
  const rows = await prisma.appointment.findMany({
    where: { patientId },
    orderBy: { appointmentAt: 'desc' },
    include,
  });
  return rows.map(serialize);
}

async function listAppointmentsForDoctor(doctorId) {
  const rows = await prisma.appointment.findMany({
    where: { doctorId },
    orderBy: { appointmentAt: 'desc' },
    include,
  });
  return rows.map(serialize);
}

async function listAllAppointments() {
  const rows = await prisma.appointment.findMany({
    orderBy: { appointmentAt: 'desc' },
    include,
  });
  return rows.map(serialize);
}

async function updateStatus(id, status, notes = null) {
  await prisma.appointment.update({
    where: { id },
    data: { status, ...(notes !== null ? { notes } : {}) },
  });
  return getAppointmentById(id);
}

async function remove(id) {
  await prisma.appointment.delete({ where: { id } });
}

module.exports = {
  hasConflict,
  createAppointment,
  getAppointmentById,
  listAppointmentsForPatient,
  listAppointmentsForDoctor,
  listAllAppointments,
  updateStatus,
  remove,
};
