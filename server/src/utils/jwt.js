const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Create a signed JWT containing the user id and role (no secrets in payload).
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
