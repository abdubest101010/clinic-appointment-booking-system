const router = require('express').Router();
const { register, login, me, updateMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/auth.validator');
const { handleValidationErrors } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerValidator, handleValidationErrors, register);
router.post('/login', loginValidator, handleValidationErrors, login);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, updateProfileValidator, handleValidationErrors, updateMe);

module.exports = router;
