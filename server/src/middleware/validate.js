const { validationResult } = require('express-validator');

// Runs after express-validator chains. If any field is invalid we respond 422
// with a clear message instead of proceeding to the controller.
function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      details: result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { handleValidationErrors };
