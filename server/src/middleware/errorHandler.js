const { error } = require('../utils/response');

// Central error handler. Registered last in the app. Never leaks stack traces
// to clients in production.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);

  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Something went wrong.';

  return error(res, status, message);
}

// 404 fallback for unknown routes.
function notFound(req, res) {
  return error(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

module.exports = { errorHandler, notFound };
