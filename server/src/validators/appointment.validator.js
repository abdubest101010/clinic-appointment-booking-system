const { body, param } = require('express-validator');

const createAppointmentValidator = [
  body('doctor_id').isInt({ gt: 0 }).withMessage('doctor_id must be a positive integer'),
  body('appointment_at')
    .notEmpty()
    .withMessage('Appointment date/time is required')
    .isISO8601()
    .withMessage('Use a valid ISO 8601 datetime')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Appointment time must be in the future');
      }
      return true;
    }),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason must be under 500 characters'),
];

const statusValidator = [
  param('id').isInt({ gt: 0 }).withMessage('Invalid appointment id'),
  body('status')
    .isIn(['confirmed', 'completed', 'cancelled', 'pending'])
    .withMessage('Invalid status value'),
  body('notes').optional().isString(),
];

const idParamValidator = [
  param('id').isInt({ gt: 0 }).withMessage('Invalid id'),
];

module.exports = { createAppointmentValidator, statusValidator, idParamValidator };
