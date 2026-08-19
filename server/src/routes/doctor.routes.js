const router = require('express').Router();
const { listDoctors } = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth');

// Public-ish: any authenticated user (patients pick a doctor) can list doctors.
router.get('/', authenticate, listDoctors);

module.exports = router;
