const doctorService = require('../services/doctor.service');
const { ok, created, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.listActiveDoctors();
  return ok(res, doctors, `Found ${doctors.length} doctor(s).`);
});

// Admin-only doctor registration.
const registerDoctor = asyncHandler(async (req, res) => {
  const { full_name, email, password, specialty, bio } = req.body;
  try {
    const doctor = await doctorService.createDoctor({ full_name, email, password, specialty, bio });
    return created(res, doctor, 'Doctor registered successfully.');
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return error(res, 409, 'An account with this email already exists.');
    }
    throw err;
  }
});

module.exports = { listDoctors, registerDoctor };
