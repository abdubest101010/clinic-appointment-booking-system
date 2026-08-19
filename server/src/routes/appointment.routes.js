const router = require('express').Router();
const ctrl = require('../controllers/appointment.controller');
const {
  createAppointmentValidator,
  statusValidator,
  idParamValidator,
} = require('../validators/appointment.validator');
const { handleValidationErrors } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // every appointment route requires a logged-in user

router.post('/', createAppointmentValidator, handleValidationErrors, ctrl.createAppointment);
router.get('/', ctrl.listAppointments);
router.patch('/:id/status', statusValidator, handleValidationErrors, ctrl.updateStatus);
router.patch('/:id/cancel', idParamValidator, handleValidationErrors, ctrl.cancelAppointment);
router.delete('/:id', authorize('admin'), idParamValidator, handleValidationErrors, ctrl.deleteAppointment);

module.exports = router;
