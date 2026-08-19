const doctorService = require('../services/doctor.service');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.listActiveDoctors();
  return ok(res, doctors, `Found ${doctors.length} doctor(s).`);
});

module.exports = { listDoctors };
