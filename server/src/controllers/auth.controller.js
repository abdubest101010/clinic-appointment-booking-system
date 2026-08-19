const authService = require('../services/auth.service');
const { signToken } = require('../utils/jwt');
const { created, ok, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, role = 'patient', phone } = req.body;

  const existing = await authService.findByEmail(email);
  if (existing) {
    return error(res, 409, 'An account with this email already exists.');
  }

  const user = await authService.createUser({ full_name, email, password, role, phone });
  const token = signToken({ id: user.id, role: user.role });

  return created(res, { token, user }, 'Registration successful.');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.findByEmail(email);
  if (!user) {
    return error(res, 401, 'Invalid email or password.');
  }

  const valid = await authService.verifyPassword(password, user.password_hash);
  if (!valid) {
    return error(res, 401, 'Invalid email or password.');
  }

  const token = signToken({ id: user.id, role: user.role });
  return ok(
    res,
    {
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    },
    'Login successful.'
  );
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.findById(req.user.id);
  if (!user) return error(res, 404, 'User not found.');
  return ok(res, user);
});

module.exports = { register, login, me };
