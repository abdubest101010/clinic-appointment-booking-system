const router = require('express').Router();
const { listDoctors, registerDoctor } = require('../controllers/doctor.controller');
const { registerDoctorValidator } = require('../validators/auth.validator');
const { handleValidationErrors } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// Any authenticated user can list doctors (patients pick one to book).
router.get('/', authenticate, listDoctors);

// Admin-only: register a new doctor (creates the login account + profile).
router.post(
  '/',
  authenticate,
  authorize('admin'),
  registerDoctorValidator,
  handleValidationErrors,
  registerDoctor
);

module.exports = router;
