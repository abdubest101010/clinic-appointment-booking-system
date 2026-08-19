const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

// Verifies the Bearer token and attaches req.user ({ id, role }).
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return error(res, 401, 'Authentication required. Provide a valid Bearer token.');
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return error(res, 401, 'Invalid or expired token.');
  }
}

// Ensures the authenticated user has one of the allowed roles.
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 403, 'You are not allowed to perform this action.');
    }
    next();
  };
}

module.exports = { authenticate, authorize };
