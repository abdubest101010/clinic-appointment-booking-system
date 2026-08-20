const appointmentService = require('../services/appointment.service');
const doctorService = require('../services/doctor.service');
const { ok, created, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// CREATE — only patients can book, and they always book for themselves.
const createAppointment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return error(res, 403, 'Only patients can book appointments.');
  }

  const { doctor_id, appointment_at, reason } = req.body;
  const patientId = req.user.id;
  const doctorId = Number(doctor_id);

  const doctor = await doctorService.findDoctorById(doctorId);
  if (!doctor) return error(res, 404, 'Doctor not found.');

  const conflict = await appointmentService.hasConflict(doctorId, appointment_at);
  if (conflict) return error(res, 409, 'This doctor already has an appointment at that time.');

  const appointment = await appointmentService.createAppointment({
    patientId,
    doctorId,
    appointmentAt: appointment_at,
    reason,
  });

  return created(res, appointment, 'Appointment booked successfully.');
});

// READ — patients see their own, doctors see theirs, admin sees everything.
const listAppointments = asyncHandler(async (req, res) => {
  let appointments;
  if (req.user.role === 'admin') {
    appointments = await appointmentService.listAllAppointments();
  } else if (req.user.role === 'doctor') {
    const doctor = await appointmentService.findDoctorByUserId(req.user.id);
    if (!doctor) return error(res, 404, 'Doctor profile not found.');
    appointments = await appointmentService.listAppointmentsForDoctor(doctor.id);
  } else {
    appointments = await appointmentService.listAppointmentsForPatient(req.user.id);
  }
  return ok(res, appointments, `Found ${appointments.length} appointment(s).`);
});

// UPDATE status — doctor who owns the appointment, or admin.
const updateStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = req.body;

  const appointment = await appointmentService.getAppointmentById(id);
  if (!appointment) return error(res, 404, 'Appointment not found.');

  if (req.user.role === 'doctor') {
    const doctor = await appointmentService.findDoctorByUserId(req.user.id);
    if (!doctor || doctor.id !== appointment.doctor_id) {
      return error(res, 403, 'You can only update your own appointments.');
    }
  } else if (req.user.role !== 'admin') {
    return error(res, 403, 'Not allowed.');
  }

  const updated = await appointmentService.updateStatus(id, status, notes);
  return ok(res, updated, 'Appointment updated.');
});

// CANCEL — patient owner, doctor owner, or admin.
const cancelAppointment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const appointment = await appointmentService.getAppointmentById(id);
  if (!appointment) return error(res, 404, 'Appointment not found.');

  if (req.user.role === 'patient' && appointment.patient_id !== req.user.id) {
    return error(res, 403, 'You can only cancel your own appointments.');
  }
  if (req.user.role === 'doctor') {
    const doctor = await appointmentService.findDoctorByUserId(req.user.id);
    if (!doctor || doctor.id !== appointment.doctor_id) {
      return error(res, 403, 'You can only cancel your own appointments.');
    }
  }

  const updated = await appointmentService.updateStatus(id, 'cancelled');
  return ok(res, updated, 'Appointment cancelled.');
});

// DELETE — admin only (hard delete).
const deleteAppointment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const appointment = await appointmentService.getAppointmentById(id);
  if (!appointment) return error(res, 404, 'Appointment not found.');

  await appointmentService.remove(id);
  return ok(res, { id }, 'Appointment deleted.');
});

module.exports = {
  createAppointment,
  listAppointments,
  updateStatus,
  cancelAppointment,
  deleteAppointment,
};
