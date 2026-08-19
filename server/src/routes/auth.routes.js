const router = require('express').Router();
const { register, login, me } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { handleValidationErrors } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerValidator, handleValidationErrors, register);
router.post('/login', loginValidator, handleValidationErrors, login);
router.get('/me', authenticate, me);

module.exports = router;
